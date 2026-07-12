import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { getConversation, sendMessage } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import { ROUTES, SOCKET_EVENTS, CALL_TYPE } from '../constants';

/**
 * ChatPage
 * Real-time one-to-one chat.
 * Per 09_UI_UX_SPECIFICATION.md — Chat Window
 * Per 07_SOCKET_IO_SPECIFICATION.md — Messaging Events
 */
const ChatPage = () => {
  const { userId: partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emit, on, off, isUserOnline } = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation history
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
        // Silent fail — empty conversation
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [partnerId, user._id]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = ({ message }) => {
      if (
        message.senderId?._id === partnerId ||
        message.senderId === partnerId
      ) {
        setMessages((prev) => [...prev, message]);
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
  }, [partnerId, on]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Typing indicator
    emit(SOCKET_EVENTS.TYPING_START, { receiverId: partnerId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit(SOCKET_EVENTS.TYPING_STOP, { receiverId: partnerId });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setNewMessage('');
    emit(SOCKET_EVENTS.TYPING_STOP, { receiverId: partnerId });

    try {
      const res = await sendMessage(partnerId, trimmed);
      const savedMessage = res.data.data.message;
      setMessages((prev) => [...prev, savedMessage]);
    } catch {
      setNewMessage(trimmed); // Restore on error
    } finally {
      setIsSending(false);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>

        <Avatar username={partnerUsername || partnerId} size="md" online={partnerOnline} />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {partnerUsername || 'Loading...'}
          </p>
          <p className="text-xs text-gray-500">
            {isTyping ? (
              <span className="text-blue-600">typing...</span>
            ) : partnerOnline ? (
              <span className="text-green-600">Online</span>
            ) : (
              'Offline'
            )}
          </p>
        </div>

        {/* Call buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => startCall(CALL_TYPE.VOICE)}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Start voice call"
          >
            <Phone size={18} />
          </button>
          <button
            onClick={() => startCall(CALL_TYPE.VIDEO)}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Start video call"
          >
            <Video size={18} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-label="Chat messages" aria-live="polite">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <ul className="space-y-2 max-w-lg mx-auto" role="list">
            {messages.map((msg) => {
              const isMine =
                msg.senderId?._id === user._id ||
                msg.senderId === user._id;
              return (
                <li
                  key={msg._id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2.5 text-sm break-words
                      ${isMine ? 'msg-sent' : 'msg-received'}
                    `}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input */}
      <footer className="bg-white border-t border-gray-100 px-4 py-3">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-lg mx-auto"
          role="form"
          aria-label="Send message"
        >
          <textarea
            id="message-input"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            maxLength={5000}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            aria-label="Message input"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
