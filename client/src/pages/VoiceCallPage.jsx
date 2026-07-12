import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { startCall, endCall } from '../services/api';
import Avatar from '../components/Avatar';
import { SOCKET_EVENTS, ICE_SERVERS, CALL_TYPE } from '../constants';

const VoiceCallPage = () => {
  const { userId: partnerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingCallData = location.state?.incomingCall || null; // Passed from CallContext

  const { user } = useAuth();
  const { emit, on } = useSocket();

  const [callStatus, setCallStatus] = useState(incomingCallData ? 'connecting' : 'calling'); 
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callId, setCallId] = useState(incomingCallData?.callId || null);
  const [partnerUsername, setPartnerUsername] = useState(incomingCallData?.callerUsername || 'User');
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callTimerRef = useRef(null);

  const cleanupCall = useCallback(async (status = 'ended') => {
    clearInterval(callTimerRef.current);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    if (callId && !incomingCallData) {
      try {
        await endCall(callId, status);
      } catch {}
    }
  }, [callId, incomingCallData]);

  const handleEndCall = useCallback(async () => {
    emit(SOCKET_EVENTS.CALL_ENDED, { receiverId: partnerId, callId });
    await cleanupCall('ended');
    navigate(-1);
  }, [emit, partnerId, callId, cleanupCall, navigate]);

  useEffect(() => {
    let callRecord = null;
    const isReceiver = !!incomingCallData;

    const setupCall = async () => {
      try {
        // 1. Get local audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;

        // 2. Setup RTCPeerConnection
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerConnectionRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            emit(SOCKET_EVENTS.ICE_CANDIDATE, { receiverId: partnerId, candidate });
          }
        };

        pc.ontrack = ({ streams }) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = streams[0];
            remoteAudioRef.current.play().catch(() => {});
          }
          setCallStatus('connected');
          callTimerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
        };

        if (isReceiver) {
          // RECEIVER: Set remote offer and answer
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          emit(SOCKET_EVENTS.CALL_ACCEPTED, { 
            callerId: partnerId, 
            offer: answer, // Wait, socketManager maps "offer" to answer or handles it. The spec says "callerId, answer". Wait, let's look at socketManager.js carefully.
            // In socketManager.js: socket.on('call_accepted', ({ callerId, offer, callId }) 
            // the receiver emits `call_accepted` containing `offer`. 
            // Wait, standard WebRTC is answer. socketManager is passing `offer`! I'll send it as `offer` since the backend expects it.
            offer: answer, 
            callId: incomingCallData.callId 
          });
        } else {
          // CALLER: Start call logic
          const res = await startCall(partnerId, CALL_TYPE.VOICE);
          callRecord = res.data.data.call;
          setCallId(callRecord._id);

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          emit(SOCKET_EVENTS.CALL_USER, {
            receiverId: partnerId,
            callType: CALL_TYPE.VOICE,
            callId: callRecord._id,
            offer,
          });
          setCallStatus('ringing');
        }
      } catch (err) {
        console.error('Call setup failed:', err);
        setCallStatus('failed');
        setTimeout(() => navigate(-1), 2000);
      }
    };

    setupCall();

    // Socket listeners
    const removeAccepted = on(SOCKET_EVENTS.CALL_ACCEPTED, async ({ offer }) => {
      // Caller receives the answer from receiver (in the 'offer' payload field due to socketManager design)
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      }
    });

    const removeRejected = on(SOCKET_EVENTS.CALL_REJECTED, async () => {
      setCallStatus('ended');
      await cleanupCall('rejected');
      navigate(-1);
    });

    const removeEnded = on(SOCKET_EVENTS.CALL_ENDED, async () => {
      setCallStatus('ended');
      await cleanupCall('ended');
      navigate(-1);
    });

    const removeIce = on(SOCKET_EVENTS.ICE_CANDIDATE, async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    });

    return () => {
      removeAccepted?.();
      removeRejected?.();
      removeEnded?.();
      removeIce?.();
      cleanupCall('ended');
    };
  }, [partnerId, incomingCallData, emit, on, navigate, cleanupCall]);

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => { track.enabled = !track.enabled; });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = async () => {
    if (remoteAudioRef.current && typeof remoteAudioRef.current.setSinkId === 'function') {
      try {
        // 'default' is usually standard speaker, this depends on browser API mapping.
        // If not supported, we just toggle state for UI.
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        if (audioOutputs.length > 1) {
           await remoteAudioRef.current.setSinkId(isSpeaker ? audioOutputs[0].deviceId : audioOutputs[1].deviceId);
        }
      } catch (err) {
        console.warn("setSinkId not supported or allowed", err);
      }
    }
    setIsSpeaker(!isSpeaker);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statusLabel = {
    calling: 'Calling...',
    ringing: 'Ringing...',
    connecting: 'Connecting...',
    connected: formatDuration(callDuration),
    ended: 'Call ended',
    failed: 'Call failed',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 relative">
      <audio ref={remoteAudioRef} autoPlay />
      
      <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-sm">
        <div className="relative">
          <Avatar username={partnerUsername} size="xl" className="w-32 h-32 text-4xl shadow-2xl border-4 border-slate-700" />
          {callStatus === 'connected' && (
            <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white tracking-wide">{partnerUsername}</h2>
          <p className="text-slate-400 mt-2 text-lg tracking-widest uppercase font-semibold">
            {statusLabel[callStatus]}
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-8 mt-12 bg-slate-800/50 backdrop-blur-md py-6 px-8 rounded-[3rem] border border-slate-700/50 shadow-2xl">
          <button
            onClick={toggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isSpeaker ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            aria-label="Speaker"
          >
            {isSpeaker ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>

          <button
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            aria-label="End call"
          >
            <PhoneOff size={28} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallPage;
