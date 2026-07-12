import { useState, useEffect } from 'react';
import { getAdminChatHistory } from '../../services/api';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const AdminChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Pagination and Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [senderFilter, setSenderFilter] = useState('');
  const [receiverFilter, setReceiverFilter] = useState('');

  const fetchChats = async (p = 1) => {
    setIsLoading(true);
    try {
      const params = { page: p, limit: 50 };
      if (senderFilter) params.sender = senderFilter;
      if (receiverFilter) params.receiver = receiverFilter;

      const res = await getAdminChatHistory(params);
      const data = res.data.data;
      setChats(data.chats);
      setPage(data.page);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load chat history.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchChats(1);
  };

  const clearFilters = () => {
    setSenderFilter('');
    setReceiverFilter('');
    setPage(1);
    // fetchChats is called in next render or we can call directly but with empty values
    setTimeout(() => {
      fetchChats(1);
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat Monitor</h1>
        <p className="text-sm text-gray-500 mt-1">View platform-wide chat history</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender User ID</label>
            <input
              type="text"
              placeholder="e.g. 64a1b2c3d4..."
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver User ID</label>
            <input
              type="text"
              placeholder="e.g. 64a1b2c3d4..."
              value={receiverFilter}
              onChange={(e) => setReceiverFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
            <Button type="submit">
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Sender</th>
                  <th className="px-6 py-4 font-medium">Receiver</th>
                  <th className="px-6 py-4 font-medium w-1/2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {chats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No chat messages found.
                    </td>
                  </tr>
                ) : (
                  chats.map((chat) => (
                    <tr key={chat._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(chat.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 block truncate max-w-[120px]" title={chat.senderId?.username}>
                          {chat.senderId?.username || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono block mt-0.5">
                          {chat.senderId?._id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 block truncate max-w-[120px]" title={chat.receiverId?.username}>
                          {chat.receiverId?.username || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono block mt-0.5">
                          {chat.receiverId?._id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800 break-words line-clamp-3" title={chat.message}>
                          {chat.message}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
                className="py-1.5 px-3 text-sm"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage(p => p + 1)}
                className="py-1.5 px-3 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminChatsPage;
