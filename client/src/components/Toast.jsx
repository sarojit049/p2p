import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Component
 * Lightweight notification. Auto-dismisses after duration.
 * Per 09_UI_UX_SPECIFICATION.md section 13
 */
const Toast = ({ id, message, type = 'info', duration = 4000, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(id), 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const types = {
    success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon_color: 'text-green-500' },
    error:   { icon: XCircle,     bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-800',   icon_color: 'text-red-500' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-500' },
    info:    { icon: Info,        bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-800',  icon_color: 'text-blue-500' },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm w-full
        ${config.bg} ${config.border} ${config.text}
        ${isExiting ? 'opacity-0 translate-y-1 transition-all duration-200' : 'animate-fade-in'}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon_color}`} aria-hidden="true" />
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={() => { setIsExiting(true); setTimeout(() => onDismiss(id), 200); }}
        className="text-current opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, onDismiss }) => (
  <div
    aria-live="polite"
    className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    style={{ maxWidth: '24rem' }}
  >
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
    ))}
  </div>
);

export default Toast;
