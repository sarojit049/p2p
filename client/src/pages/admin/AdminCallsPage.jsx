import { useState, useEffect } from 'react';
import { getAdminCallHistory } from '../../services/api';
import { Phone, Video, PhoneOff, PhoneCall } from 'lucide-react';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const AdminCallsPage = () => {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCalls = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminCallHistory(p);
      const data = res.data.data;
      setCalls(data.calls);
      setPage(data.page);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load call history.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls(page);
  }, [page]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><PhoneCall size={12} /> Completed</span>;
      case 'missed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><PhoneOff size={12} /> Missed</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><PhoneOff size={12} /> Rejected</span>;
      case 'ongoing':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Phone size={12} /> Ongoing</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
        <p className="text-sm text-gray-500 mt-1">View platform-wide voice and video call history</p>
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
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Caller</th>
                  <th className="px-6 py-4 font-medium">Receiver</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No calls found.
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(call.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          {call.callType === 'video' ? <Video size={16} className="text-blue-500" /> : <Phone size={16} className="text-green-500" />}
                          <span className="capitalize font-medium">{call.callType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 block truncate max-w-[120px]" title={call.callerId?.username}>
                          {call.callerId?.username || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 block truncate max-w-[120px]" title={call.receiverId?.username}>
                          {call.receiverId?.username || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(call.status)}
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

export default AdminCallsPage;
