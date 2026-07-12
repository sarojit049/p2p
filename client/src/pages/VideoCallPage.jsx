import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { startCall, endCall } from '../services/api';
import Avatar from '../components/Avatar';
import { SOCKET_EVENTS, ICE_SERVERS, CALL_TYPE } from '../constants';

const VideoCallPage = () => {
  const { userId: partnerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingCallData = location.state?.incomingCall || null;

  const { user } = useAuth();
  const { emit, on } = useSocket();

  const [callStatus, setCallStatus] = useState(incomingCallData ? 'connecting' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [callId, setCallId] = useState(incomingCallData?.callId || null);
  const [partnerUsername] = useState(incomingCallData?.callerUsername || 'User');
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const cleanupCall = useCallback(async (status = 'ended') => {
    clearInterval(callTimerRef.current);
    
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    
    if (callId && !incomingCallData) {
      try { await endCall(callId, status); } catch {}
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peerConnectionRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            emit(SOCKET_EVENTS.ICE_CANDIDATE, { receiverId: partnerId, candidate });
          }
        };

        pc.ontrack = ({ streams }) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = streams[0];
          }
          setCallStatus('connected');
          callTimerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
        };

        if (isReceiver) {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          emit(SOCKET_EVENTS.CALL_ACCEPTED, { 
            callerId: partnerId, 
            offer: answer,
            callId: incomingCallData.callId 
          });
        } else {
          const res = await startCall(partnerId, CALL_TYPE.VIDEO);
          callRecord = res.data.data.call;
          setCallId(callRecord._id);

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          emit(SOCKET_EVENTS.CALL_USER, {
            receiverId: partnerId,
            callType: CALL_TYPE.VIDEO,
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

    const removeAccepted = on(SOCKET_EVENTS.CALL_ACCEPTED, async ({ offer }) => {
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

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((track) => { track.enabled = !track.enabled; });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen sharing failed", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnectionRef.current?.getSenders().find((s) => s.track?.kind === 'video');
    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack);
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    
    setIsScreenSharing(false);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex flex-col">
      {/* Remote Video (Fullscreen Background) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${callStatus === 'connected' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Waiting / Connecting State Overlay */}
      {callStatus !== 'connected' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10">
          <Avatar username={partnerUsername} size="xl" className="w-32 h-32 text-4xl shadow-2xl border-4 border-slate-700 mb-6" />
          <h2 className="text-3xl font-semibold text-white tracking-wide">{partnerUsername}</h2>
          <p className="text-slate-400 mt-2 text-lg tracking-widest uppercase font-semibold">
            {callStatus}...
          </p>
        </div>
      )}

      {/* Header Info */}
      <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/70 to-transparent z-20 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-white text-xl font-medium drop-shadow-md">{partnerUsername}</h2>
          <p className="text-slate-300 text-sm font-mono drop-shadow-md">
            {callStatus === 'connected' ? formatDuration(callDuration) : callStatus}
          </p>
        </div>
      </div>

      {/* Local Video (Picture in Picture) */}
      <div className="absolute top-6 right-6 z-30 w-32 h-48 sm:w-48 sm:h-64 md:w-64 md:h-80 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 transition-all cursor-move">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'} ${isScreenSharing ? '' : '-scale-x-100'}`}
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
             <Avatar username={user?.username} size="lg" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 sm:gap-6 bg-black/40 backdrop-blur-xl py-4 px-6 sm:px-8 rounded-full border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={toggleMute}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
            isScreenSharing ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <MonitorUp size={22} />
        </button>

        <button
          onClick={handleEndCall}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] ml-2"
          title="End call"
        >
          <PhoneOff size={26} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;
