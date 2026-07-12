import { useState } from 'react';
import { Download, FileText, Archive, Maximize2, X, File } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceMessagePlayer from './VoiceMessagePlayer';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const MediaMessage = ({ message, isMine, socketUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Ensure the URL is absolute
  const rawUrl = message.fileUrl || '';
  const url = rawUrl.startsWith('http') ? rawUrl : `${socketUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

  const { messageType, mimeType = '', originalName, fileSize } = message;

  if (isError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border",
        isMine ? "bg-blue-700/30 border-blue-500/30 text-white" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
      )}>
        <File size={24} className="mb-2 opacity-50" />
        <p className="text-sm">Media unavailable</p>
        <a href={url} download={originalName} className="text-xs mt-1 underline opacity-80 hover:opacity-100">
          Download anyway
        </a>
      </div>
    );
  }

  // IMAGE
  if (messageType === 'image' || mimeType.startsWith('image/')) {
    return (
      <>
        <div className="relative group overflow-hidden rounded-xl">
          <img 
            src={url} 
            alt={originalName} 
            onError={() => setIsError(true)}
            onClick={() => setIsModalOpen(true)}
            className="max-w-full h-auto max-h-[300px] object-cover bg-black/10 dark:bg-white/5 cursor-pointer transition-transform hover:scale-[1.02]" 
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white backdrop-blur-sm"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <a 
              href={url} 
              download={originalName}
              target="_blank" 
              rel="noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white backdrop-blur-sm"
              title="Download"
            >
              <Download size={16} />
            </a>
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
              onClick={() => setIsModalOpen(false)}
            >
              <button 
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
              
              <a 
                href={url} 
                download={originalName}
                target="_blank" 
                rel="noreferrer" 
                className="absolute top-4 right-16 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Download"
              >
                <Download size={24} />
              </a>

              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={url} 
                alt={originalName} 
                className="max-w-full max-h-full object-contain rounded-md"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // VIDEO
  if (messageType === 'video' || mimeType.startsWith('video/')) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black/10 dark:bg-white/5">
        <video 
          src={url} 
          controls 
          onError={() => setIsError(true)}
          className="max-w-full max-h-[300px] w-full object-contain" 
        />
      </div>
    );
  }

  // AUDIO
  if (messageType === 'audio' || mimeType.startsWith('audio/')) {
    return (
      <div className="mt-1 mb-1">
        <VoiceMessagePlayer src={url} duration={message.duration} isMine={isMine} />
      </div>
    );
  }

  // DOCUMENTS / PDF / ZIP / UNKNOWN
  const isZip = messageType === 'zip' || mimeType.includes('zip') || mimeType.includes('rar');
  const isPdf = mimeType.includes('pdf');
  const isOffice = mimeType.includes('document') || mimeType.includes('msword') || mimeType.includes('excel') || mimeType.includes('powerpoint');
  
  let Icon = FileText;
  if (isZip) Icon = Archive;
  else if (isPdf) Icon = FileText; // Could be a specific PDF icon if available

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border mb-1",
      isMine ? "bg-blue-700/30 border-blue-500/30 text-white" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
    )}>
      <div className={cn(
        "p-2 rounded-lg flex-shrink-0", 
        isMine ? "bg-blue-600" : "bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
      )}>
        <Icon size={24} />
      </div>
      
      <div className="flex-1 min-w-0 overflow-hidden pr-2">
        <p className="text-sm font-medium truncate" title={originalName}>{originalName}</p>
        <p className={cn("text-xs", isMine ? "text-blue-200" : "text-slate-500 dark:text-slate-400")}>
          {isPdf ? 'PDF Document' : isOffice ? 'Office Document' : isZip ? 'Archive' : 'File'} • {formatBytes(fileSize)}
        </p>
      </div>
      
      <a 
        href={url} 
        download={originalName} 
        target="_blank" 
        rel="noreferrer"
        className={cn(
          "p-2 rounded-full transition-colors flex-shrink-0", 
          isMine ? "text-white hover:bg-white/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
        )}
      >
        <Download size={18} />
      </a>
    </div>
  );
};

export default MediaMessage;
