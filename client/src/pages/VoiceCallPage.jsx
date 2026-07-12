import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Mic, MicOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { startCall, endCall } from '../services/api';
import Avatar from '../components/Avatar';
import { SOCKET_EVENTS, ICE_SERVERS, CALL_TYPE } from '../constants';

/**
 * VoiceCallPage
 * WebRTC Voice Call — per 08_WEBRTC_SPECIFICATION.md
 * Socket.io for signaling only. Media is peer-to-peer.
 */
const VoiceCallPage = () => {
  const { userId: partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emit, on } = useSocket();

  const [callStatus, setCallStatus] = useState('calling'); // calling | ringing | connected | ended
  const [isMuted, setIsMuted] = useState(false);
  const [callId, setCallId] = useState(null);
  const [partnerUsername, setPartnerUsername] = useState(partnerId);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);

  const cleanupCall = useCallback(async (status = 'ended') => {
    // Stop timer
    clearInterval(callTimerRef.current);

    // Stop local stream
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    // Close peer connection
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    // Update call record
    if (callId) {
      try {
        const duration = callDuration;
        await endCall(callId, status);
      } catch {}
    }
  }, [callId, callDuration]);

  const handleEndCall = useCallback(async () => {
    emit(SOCKET_EVENTS.CALL_ENDED, { receiverId: partnerId, callId });
    await cleanupCall('ended');
    navigate(-1);
  }, [emit, partnerId, callId, cleanupCall, navigate]);

  useEffect(() => {
    let callRecord = null;

    const initiateCall = async () => {
      try {
        // 1. Record call start
        const res = await startCall(partnerId, CALL_TYPE.VOICE);
        callRecord = res.data.data.call;
        setCallId(callRecord._id);

        // 2. Get local audio stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;

        // 3. Create RTCPeerConnection with STUN
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerConnectionRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // ICE candidate handler
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            emit(SOCKET_EVENTS.ICE_CANDIDATE, { receiverId: partnerId, candidate });
          }
        };

        // Remote audio
        pc.ontrack = ({ streams }) => {
          const audio = new Audio();
          audio.srcObject = streams[0];
          audio.play().catch(() => {});
          setCallStatus('connected');

          // Start timer
          callTimerRef.current = setInterval(() => {
            setCallDuration((d) => d + 1);
          }, 1000);
        };

        // 4. Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 5. Signal the receiver
        emit(SOCKET_EVENTS.CALL_USER, {
          receiverId: partnerId,
          callType: CALL_TYPE.VOICE,
          callId: callRecord._id,
          offer,
        });

        setCallStatus('ringing');
      } catch (err) {
        console.error('Call failed:', err);
        setCallStatus('ended');
        navigate(-1);
      }
    };

    initiateCall();

    // Socket listeners
    const removeAccepted = on(SOCKET_EVENTS.CALL_ACCEPTED, async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
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
  }, [partnerId, emit, on, navigate, cleanupCall]);

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((m) => !m);
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statusLabel = {
    calling: 'Calling...',
    ringing: 'Ringing...',
    connected: formatDuration(callDuration),
    ended: 'Call ended',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6">
        <Avatar username={partnerUsername} size="xl" />

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">{partnerUsername}</h2>
          <p className="text-gray-400 mt-1 text-sm">{statusLabel[callStatus]}</p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg"
            aria-label="End call"
          >
            <PhoneOff size={26} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallPage;
