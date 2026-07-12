import { useState, useEffect } from 'react';
import { getAdminUsers, blockUser, unblockUser, deleteUser, getAdminUser } from '../../services/api';
import { UserX, UserCheck, Trash2, Eye, X } from 'lucide-react';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchUsers = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminUsers(p);
      const data = res.data.data;
      setUsers(data.users);
      setPage(data.page);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load users.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleBlock = async (userId) => {
    try {
      await blockUser(userId);
      setToast({ type: 'success', message: 'User blocked.' });
      fetchUsers(page);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to block user.' });
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      setToast({ type: 'success', message: 'User unblocked.' });
      fetchUsers(page);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to unblock user.' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) {
      return;
    }
    try {
      await deleteUser(userId);
      setToast({ type: 'success', message: 'User deleted.' });
      fetchUsers(page);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete user.' });
    }
  };

  const handleViewProfile = async (userId) => {
    setIsProfileModalOpen(true);
    setIsLoadingProfile(true);
    setSelectedUser(null);
    try {
      const res = await getAdminUser(userId);
      setSelectedUser(res.data.data.user);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load user profile.' });
      setIsProfileModalOpen(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform users</p>
        </div>
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
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Last Seen</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : user.status === 'blocked'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.lastSeen).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleBlock(user._id)}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                              title="Block User"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblock(user._id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Unblock User"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleViewProfile(user._id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
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

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoadingProfile ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : selectedUser ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {selectedUser.profileImage ? (
                      <img src={selectedUser.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold uppercase">
                        {selectedUser.username.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{selectedUser.username}</h4>
                      <span className="text-sm text-gray-500 font-mono mt-1 block">ID: {selectedUser._id}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{selectedUser.status}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{selectedUser.role}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Seen</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(selectedUser.lastSeen).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Secret Code Info</p>
                    {selectedUser.secretCodeId ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Code ID:</span> <span className="font-mono text-xs text-gray-500">{selectedUser.secretCodeId._id}</span>
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Generated:</span> {new Date(selectedUser.secretCodeId.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No secret code attached.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">User data not available.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <Button variant="secondary" onClick={() => setIsProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminUsersPage;
