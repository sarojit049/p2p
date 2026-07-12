import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { SOCKET_EVENTS } from '../constants';

const CallContext = createContext();

export const useCall = () => {
  return useContext(CallContext);
};

export const CallProvider = ({ children }) => {
  const { on, emit } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, callerUsername, callType, callId, offer }

  useEffect(() => {
    if (!on) return;

    const handleIncomingCall = (data) => {
      // Don't show incoming call if we are already in a call route
      if (location.pathname.startsWith('/call/') || location.pathname.startsWith('/video-call/')) {
        // Automatically reject if busy (MVP logic)
        emit(SOCKET_EVENTS.USER_BUSY, { callerId: data.callerId, callId: data.callId });
        return;
      }
      setIncomingCall(data);
    };

    const handleCallEnded = (data) => {
      if (incomingCall && incomingCall.callId === data.callId) {
        setIncomingCall(null);
      }
    };

    const handleCallRejected = (data) => {
       if (incomingCall && incomingCall.callId === data.callId) {
         setIncomingCall(null);
       }
    };

    const removeIncomingCall = on(SOCKET_EVENTS.INCOMING_CALL, handleIncomingCall);
    const removeCallEnded = on(SOCKET_EVENTS.CALL_ENDED, handleCallEnded);
    const removeCallRejected = on(SOCKET_EVENTS.CALL_REJECTED, handleCallRejected);

    return () => {
      removeIncomingCall?.();
      removeCallEnded?.();
      removeCallRejected?.();
    };
  }, [on, emit, incomingCall, location.pathname]);

  const acceptCall = useCallback(() => {
    if (!incomingCall) return;
    const { callerId, callType } = incomingCall;
    
    // We pass the incoming state via navigation state so the Call page knows to answer
    if (callType === 'voice') {
      navigate(`/call/${callerId}`, { state: { incomingCall } });
    } else if (callType === 'video') {
      navigate(`/video-call/${callerId}`, { state: { incomingCall } });
    }
    setIncomingCall(null);
  }, [incomingCall, navigate]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    emit(SOCKET_EVENTS.CALL_REJECTED, { 
      callerId: incomingCall.callerId, 
      callId: incomingCall.callId 
    });
    setIncomingCall(null);
  }, [incomingCall, emit]);

  return (
    <CallContext.Provider value={{ incomingCall, acceptCall, rejectCall }}>
      {children}
    </CallContext.Provider>
  );
};
