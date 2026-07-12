import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, LogOut, User, Phone, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { searchUsers, getRecentConversations } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import useDebounce from '../hooks/useDebounce';
import { ROUTES, SOCKET_EVENTS } from '../constants';

/**
 * DashboardPage
 * Main screen: recent conversations, search, online users, profile shortcut.
 * Per 09_UI_UX_SPECIFICATION.md — Dashboard
 * Per 11_USER_FLOW.md — Dashboard Flow
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [searchError, setSearchError] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Load recent conversations on mount
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

  // Search on debounced query
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
          setSearchError('No user found.');
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">PrivateConnect</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="View profile"
          >
            <Avatar username={user?.username} size="sm" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.username}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-lg mx-auto h-full flex flex-col">
          {/* Search */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                aria-hidden="true"
              />
              <input
                id="user-search"
                type="search"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                aria-label="Search for users"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Search Results */}
            {searchQuery.trim() && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-2">
                  Search Results
                </p>
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : displayUsers.length > 0 ? (
                  <ul className="space-y-1" role="list">
                    {displayUsers.map((u) => (
                      <li key={u._id}>
                        <button
                          onClick={() => openChat(u._id)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left"
                        >
                          <Avatar
                            username={u.username}
                            size="md"
                            online={isUserOnline(u._id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {u.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isUserOnline(u._id) ? (
                                <span className="text-green-600">● Online</span>
                              ) : (
                                'Offline'
                              )}
                            </p>
                          </div>
                          <MessageCircle className="w-4 h-4 text-gray-300" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !isSearching && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">{searchError || 'No user found.'}</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Recent Conversations */}
            {showConversations && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-2">
                  Recent Conversations
                </p>
                {isLoadingConversations ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : conversations.length > 0 ? (
                  <ul className="space-y-1" role="list">
                    {conversations.map((conv) => {
                      const partner = conv.lastMessage;
                      return (
                        <li key={conv._id}>
                          <button
                            onClick={() => openChat(conv._id)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left"
                          >
                            <Avatar
                              username={conv._id}
                              size="md"
                              online={isUserOnline(conv._id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {conv._id}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {partner?.lastMessage?.message || ''}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-16">
                    <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-400">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Search for a user to start chatting.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
