import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { searchUsers, getRecentConversations } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import useDebounce from '../hooks/useDebounce';
import { ROUTES } from '../constants';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage = ({ isSidebar = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const { theme, setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [searchError, setSearchError] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await getRecentConversations();
        setConversations(res.data.data.conversations || []);
      } catch {
        // Non-critical
      } finally {
        setIsLoadingConversations(false);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const res = await searchUsers(debouncedSearch);
        setSearchResults(res.data.data.users || []);
        if ((res.data.data.users || []).length === 0) {
          setSearchError('No users found matching your search.');
        }
      } catch {
        setSearchError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const openChat = useCallback(
    (userId) => {
      navigate(ROUTES.CHAT.replace(':userId', userId));
    },
    [navigate]
  );

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const displayUsers = searchQuery.trim() ? searchResults : [];
  const showConversations = !searchQuery.trim();

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Top Header & Search */}
      <div className="px-4 pt-5 pb-3 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-sm">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-lg tracking-tight">Chats</span>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
            aria-label="Search for users"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Main List Area */}
      <main className="flex-1 overflow-y-auto px-2 pb-4 scroll-smooth">
        <AnimatePresence mode="wait">
          {/* Search Results */}
          {searchQuery.trim() && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-2 px-3">
                Search Results
              </p>
              {isSearching ? (
                <div className="space-y-2 px-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-center py-2">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayUsers.length > 0 ? (
                <ul className="space-y-0.5" role="list">
                  {displayUsers.map((u) => (
                    <li key={u._id}>
                      <button
                        onClick={() => openChat(u._id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                      >
                        <Avatar username={u.username} size="md" online={isUserOnline(u._id)} />
                        <div className="flex-1 min-w-0 border-b border-transparent group-hover:border-transparent">
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-[15px] truncate">
                            {u.username}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {isUserOnline(u._id) ? <span className="text-blue-500">Online</span> : 'Offline'}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                !isSearching && (
                  <EmptyState 
                    icon={User} 
                    title="No Users Found" 
                    description={searchError || 'Try a different username.'} 
                    className="min-h-[200px]"
                  />
                )
              )}
            </motion.div>
          )}

          {/* Recent Conversations */}
          {showConversations && (
            <motion.div
              key="conversations"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {isLoadingConversations ? (
                <div className="space-y-2 px-2 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 items-center py-2">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                <ul className="space-y-0.5" role="list">
                  {conversations.map((conv) => {
                    const partner = conv.lastMessage; // Needs proper mapping in real app
                    const partnerId = conv._id;
                    return (
                      <li key={partnerId}>
                        <button
                          onClick={() => openChat(partnerId)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                        >
                          <Avatar username={partnerId} size="md" online={isUserOnline(partnerId)} />
                          <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800/50 pb-2 pt-1 group-hover:border-transparent">
                            <div className="flex justify-between items-center mb-0.5">
                              <p className="font-medium text-slate-900 dark:text-slate-100 text-[15px] truncate">
                                {partnerId}
                              </p>
                              {/* Placeholder for timestamp */}
                              <span className="text-xs text-slate-400">12:30</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-4">
                              {partner?.message || 'Started a conversation'}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState 
                  title="No chats yet" 
                  description="Search for a user above to start chatting." 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Profile Footer */}
      <footer className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
        <button
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity text-left min-w-0"
        >
          <Avatar username={user?.username} size="sm" online={true} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">My Profile</p>
          </div>
        </button>
        
        {/* Theme Toggle & Logout */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
