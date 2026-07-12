import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Send, Check, CheckCheck, Smile, Paperclip, Mic, X, FileText, Archive, Download, Image as ImageIcon, Music, Film, File } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { getConversation, sendMessage, uploadMedia } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { ROUTES, SOCKET_EVENTS, CALL_TYPE } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { SOCKET_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import MediaMessage from '../components/MediaMessage';
import Toast from '../components/Toast';
import { cn } from '../lib/utils';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const ChatPage = () => {
  const { userId: partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emit, on, isUserOnline } = useSocket();
  const { theme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Media Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const res = await getConversation(partnerId);
        const msgs = res.data.data.messages || [];
        setMessages(msgs);
        if (msgs.length > 0) {
          const partner = msgs.find(
            (m) => m.senderId?._id !== user._id && m.senderId !== user._id
          );
          if (partner?.senderId) {
            setPartnerUsername(
              typeof partner.senderId === 'object'
                ? partner.senderId.username
                : ''
            );
          }
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [partnerId, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleNewMessage = ({ message }) => {
      if (
        message.senderId?._id === partnerId ||
        message.senderId === partnerId ||
        message.senderId?._id === user._id || 
        message.senderId === user._id
      ) {
        setMessages((prev) => {
          // Avoid duplicates (if sender gets same message from their own socket event)
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleTypingStart = ({ senderId }) => {
      if (senderId === partnerId) setIsTyping(true);
    };

    const handleTypingStop = ({ senderId }) => {
      if (senderId === partnerId) setIsTyping(false);
    };

    const removeNewMessage = on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    const removeTypingStart = on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    const removeTypingStop = on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      removeNewMessage?.();
      removeTypingStart?.();
      removeTypingStop?.();
    };
  }, [partnerId, user._id, on]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    emit(SOCKET_EVENTS.TYPING_START, { receiverId: partnerId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit(SOCKET_EVENTS.TYPING_STOP, { receiverId: partnerId });
    }, 1500);
  };

  const handleEmojiClick = (emojiObj) => {
    setNewMessage((prev) => prev + emojiObj.emoji);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Drag and Drop Logic
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...droppedFiles]);
      e.dataTransfer.clearData();
    }
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Could not start recording:", err);
      alert("Microphone permission denied or unavailable.");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      audioChunksRef.current = [];
      setRecordingTime(0);
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const currentDuration = recordingTime;
      mediaRecorderRef.current.onstop = async () => {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to File object
        const audioFile = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Send via uploadMedia
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('files', audioFile);
          formData.append('duration', currentDuration);

          await uploadMedia(partnerId, formData, (progressEvent) => {
             // can track progress if needed
          });
        } catch (err) {
          console.error("Voice message upload failed", err);
        } finally {
          setIsUploading(false);
        }
      };
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
  };
  // -----------------------------

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      setShowEmojiPicker(false);
      emit(SOCKET_EVENTS.TYPING_STOP, { receiverId: partnerId });

      try {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        await uploadMedia(partnerId, formData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });
        
        setSelectedFiles([]);
      } catch (err) {
        setToast({ type: 'error', message: 'File upload failed.' });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }

    if (trimmed && !isSending) {
      setIsSending(true);
      setNewMessage('');
      setShowEmojiPicker(false);
      emit(SOCKET_EVENTS.TYPING_STOP, { receiverId: partnerId });

      try {
        const res = await sendMessage(partnerId, trimmed);
        const savedMessage = res.data.data.message;
        setMessages((prev) => {
          if (prev.some(m => m._id === savedMessage._id)) return prev;
          return [...prev, savedMessage];
        });
      } catch (err) {
        setNewMessage(trimmed); 
        setToast({ type: 'error', message: err.response?.data?.message || 'Failed to send message.' });
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const startCall = (type) => {
    navigate(`/${type}-call/${partnerId}`);
  };

  const partnerOnline = isUserOnline(partnerId);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (msg, isMine) => {
    if (msg.messageType === 'text') {
      return <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>;
    }
    
    // Everything else delegates to MediaMessage
    return <MediaMessage message={msg} isMine={isMine} socketUrl={SOCKET_URL} />;
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <ImageIcon size={20} />;
    if (file.type.startsWith('video/')) return <Film size={20} />;
    if (file.type.startsWith('audio/')) return <Music size={20} />;
    if (file.name.endsWith('.zip')) return <Archive size={20} />;
    return <File size={20} />;
  };

  return (
    <div 
      className="flex flex-col flex-1 bg-slate-100 dark:bg-slate-950/50 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-blue-600/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-2xl m-4 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Download size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Drop files here</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center">Support for images, videos, audio, documents, and archives</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4 shadow-sm z-10 sticky top-0">
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="md:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 -ml-1"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={22} />
        </button>

        <Avatar username={partnerUsername || partnerId} size="md" online={partnerOnline} />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] truncate">
            {partnerUsername || partnerId}
          </p>
          <div className="h-4 flex items-center">
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.span
                  key="typing"
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="text-xs text-blue-600 font-medium tracking-wide"
                >
                  typing...
                </motion.span>
              ) : partnerOnline ? (
                <motion.span
                  key="online"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-green-600"
                >
                  Online
                </motion.span>
              ) : (
                <motion.span
                  key="offline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-500"
                >
                  Offline
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Call buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/call/${partnerId}`)}
            className="p-2.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Start voice call"
          >
            <Phone size={19} />
          </button>
          <button
            onClick={() => navigate(`/video-call/${partnerId}`)}
            className="p-2.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Start video call"
          >
            <Video size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth" role="log" aria-label="Chat messages" aria-live="polite">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState 
            title="No messages yet" 
            description="Say hello or drag a file to start the conversation! 👋"
          />
        ) : (
          <ul className="space-y-2.5 max-w-4xl mx-auto" role="list">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isMine =
                  msg.senderId?._id === user._id ||
                  msg.senderId === user._id;
                
                // Logic to determine bubble rounding based on sequence
                const prevMsg = messages[idx - 1];
                const nextMsg = messages[idx + 1];
                const isPrevMine = prevMsg && (prevMsg.senderId?._id === user._id || prevMsg.senderId === user._id);
                const isNextMine = nextMsg && (nextMsg.senderId?._id === user._id || nextMsg.senderId === user._id);

                const isFirstInSequence = !prevMsg || isPrevMine !== isMine;
                const isLastInSequence = !nextMsg || isNextMine !== isMine;

                // Do not apply sequence rounding to pure media (looks better as rounded squares)
                const isMediaBubble = msg.messageType !== 'text';
                
                let roundedClass = 'rounded-2xl';
                if (!isMediaBubble) {
                  if (isMine) {
                    if (isFirstInSequence && !isLastInSequence) roundedClass = 'rounded-l-2xl rounded-tr-2xl rounded-br-sm';
                    else if (!isFirstInSequence && !isLastInSequence) roundedClass = 'rounded-l-2xl rounded-r-sm';
                    else if (!isFirstInSequence && isLastInSequence) roundedClass = 'rounded-l-2xl rounded-br-2xl rounded-tr-sm';
                    else roundedClass = 'rounded-2xl rounded-br-sm'; // Standalone
                  } else {
                    if (isFirstInSequence && !isLastInSequence) roundedClass = 'rounded-r-2xl rounded-tl-2xl rounded-bl-sm';
                    else if (!isFirstInSequence && !isLastInSequence) roundedClass = 'rounded-r-2xl rounded-l-sm';
                    else if (!isFirstInSequence && isLastInSequence) roundedClass = 'rounded-r-2xl rounded-bl-2xl rounded-tl-sm';
                    else roundedClass = 'rounded-2xl rounded-bl-sm'; // Standalone
                  }
                }

                return (
                  <motion.li
                    key={msg._id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] lg:max-w-md px-4 pt-2.5 pb-2 text-[15px] break-words relative shadow-sm",
                        roundedClass,
                        isMediaBubble && "p-2", // Less padding for media
                        isMine 
                          ? "bg-blue-600 text-white" 
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-transparent dark:border-slate-700"
                      )}
                    >
                      {renderMessageContent(msg, isMine)}
                      
                      <div className={cn("flex items-center justify-end gap-1 mt-1 -mb-1 float-right clear-both", isMediaBubble && "mr-2")}>
                        <span className={cn(
                          "text-[10px] uppercase font-medium",
                          isMine ? "text-blue-200" : "text-slate-400"
                        )}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMine && (
                          msg.isRead ? (
                            <CheckCheck size={14} className="text-blue-200" />
                          ) : (
                            <Check size={14} className="text-blue-200" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Message Input Area */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 relative z-20">
        
        {/* Emoji Picker Popover */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              ref={pickerRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-[calc(100%+10px)] left-4 z-50 shadow-xl rounded-2xl overflow-hidden"
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                theme={theme === 'dark' ? 'dark' : 'light'}
                lazyLoadEmojis={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Files Preview Tray */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto mb-3"
            >
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative group shrink-0 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <button 
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                    
                    <div className="w-10 h-10 shrink-0 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-blue-500 shadow-sm">
                      {getFileIcon(file)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {isUploading && (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-blue-600 transition-all duration-300"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto"
          role="form"
          aria-label="Send message"
        >
          {isRecording ? (
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between px-4 py-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 font-medium font-mono">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button 
                type="button" 
                onClick={cancelRecording}
                className="text-slate-500 hover:text-red-500 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl flex items-end transition-colors focus-within:ring-2 focus-within:ring-blue-500/50">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
              aria-label="Add emoji"
            >
              <Smile size={22} />
            </button>
            
            <textarea
              id="message-input"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={selectedFiles.length > 0 ? "Add a message (optional)..." : "Type a message..."}
              rows={1}
              maxLength={5000}
              className="flex-1 max-h-32 min-h-[44px] py-3 bg-transparent text-sm resize-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
              aria-label="Message input"
            />

            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
          </div>
          )}

          {isRecording ? (
            <motion.button
              key="send-audio"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="button"
              onClick={stopAndSendRecording}
              className="w-12 h-[44px] bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm shrink-0"
            >
              <Send size={18} className="ml-1" />
            </motion.button>
          ) : newMessage.trim() || selectedFiles.length > 0 ? (
            <motion.button
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="submit"
              disabled={isSending || isUploading}
              className="w-12 h-[44px] bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm shrink-0"
              aria-label="Send message"
            >
              {isUploading ? <Loader size="sm" className="text-white border-white border-t-transparent" /> : <Send size={18} className="ml-1" />}
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="button"
              onClick={startRecording}
              className="w-12 h-[44px] bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm shrink-0"
              aria-label="Voice message"
              title="Record Voice Message"
            >
              <Mic size={20} />
            </motion.button>
          )}
        </form>
      </footer>
      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default ChatPage;
