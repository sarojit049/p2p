import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, PhoneOff } from 'lucide-react';
import { useCall } from '../context/CallContext';
import Avatar from './Avatar';

const IncomingCallPopup = () => {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 min-w-[320px]"
        >
          <div className="relative">
            <Avatar username={incomingCall.callerUsername} size="lg" />
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
              {incomingCall.callType === 'video' ? (
                <Video size={12} className="text-white" />
              ) : (
                <Phone size={12} className="text-white" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {incomingCall.callerUsername}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Incoming {incomingCall.callType} call...
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={rejectCall}
              className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Reject call"
            >
              <PhoneOff size={18} />
            </button>
            <button
              onClick={acceptCall}
              className="w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Accept call"
            >
              {incomingCall.callType === 'video' ? <Video size={18} /> : <Phone size={18} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallPopup;
