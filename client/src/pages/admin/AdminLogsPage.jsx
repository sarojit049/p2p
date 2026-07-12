import { useState, useEffect } from 'react';
import { getAdminLogs } from '../../services/api';
import { FileText } from 'lucide-react';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminLogs(p, 50);
      const data = res.data.data;
      setLogs(data.logs);
      setPage(data.page);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load system logs.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor system activity and admin actions</p>
        </div>
        <Button onClick={() => fetchLogs(1)} variant="secondary" className="gap-2">
          Refresh Logs
        </Button>
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
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Admin User</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium">No logs found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {log.adminId?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.description}
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
                onClick={() => setPage((p) => p - 1)}
                className="py-1.5 px-3 text-sm"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
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

export default AdminLogsPage;
