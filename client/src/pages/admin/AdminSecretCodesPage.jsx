import { useState, useEffect } from 'react';
import { getAdminSecretCodes, generateSecretCode, revokeSecretCode } from '../../services/api';
import { Key, Plus, Copy, Check, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const AdminSecretCodesPage = () => {
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newCode, setNewCode] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  const [visibleCodes, setVisibleCodes] = useState({}); // { id: boolean }

  const fetchCodes = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminSecretCodes(p);
      const data = res.data.data;
      setCodes(data.codes);
      setPage(data.page);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load secret codes.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes(page);
  }, [page]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNewCode(null);
    try {
      const res = await generateSecretCode();
      setNewCode(res.data.data.secretCode);
      setToast({ type: 'success', message: 'New Secret Code generated.' });
      fetchCodes(1); // Reload first page to show new code
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to generate code.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (id, text) => {
    if (!text || text === 'LEGACY_CODE') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      // ignore
    }
  };

  const toggleVisibility = (id) => {
    setVisibleCodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this secret code?')) return;
    try {
      await revokeSecretCode(id);
      setToast({ type: 'success', message: 'Secret code revoked.' });
      fetchCodes(page);
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to revoke code.' });
    }
  };

  const handleRegenerate = async (id) => {
    if (!window.confirm('Are you sure you want to regenerate? The old code will be deleted.')) return;
    try {
      // Delete old code
      await revokeSecretCode(id);
      // Generate new one
      const res = await generateSecretCode();
      setNewCode(res.data.data.secretCode);
      setToast({ type: 'success', message: 'Code regenerated successfully.' });
      fetchCodes(1);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to regenerate code.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full bg-slate-50 min-h-screen">
      <div className="px-8 py-6 mb-2 flex justify-between items-center bg-white shadow-sm rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="text-blue-600" />
            Secret Codes
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage platform access codes (WhatsApp Business style)</p>
        </div>
        <Button onClick={handleGenerate} isLoading={isGenerating} className="gap-2 shadow-sm rounded-lg">
          <Plus size={18} />
          Generate New Code
        </Button>
      </div>

      {newCode && (
        <div className="mx-8 mb-6 bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-semibold text-green-900">Code Generated Successfully</h3>
            <p className="text-sm text-green-700">Share this code with the user.</p>
          </div>
          <div className="flex items-center gap-3">
            <code className="px-4 py-2 bg-white text-green-900 font-mono text-lg rounded-lg shadow-sm border border-green-100">
              {newCode}
            </code>
            <button
              onClick={() => copyToClipboard('new', newCode)}
              className="p-2.5 bg-white text-green-600 rounded-lg shadow-sm border border-green-100 hover:bg-green-100 transition-colors"
            >
              {copiedStates['new'] ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 mx-8 mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Secret Code</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned User</th>
                  <th className="px-6 py-4 font-semibold">Created At</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No secret codes found.
                    </td>
                  </tr>
                ) : (
                  codes.map((code) => {
                    const isVisible = visibleCodes[code._id];
                    const isLegacy = code.plainCode === 'LEGACY_CODE' || !code.plainCode;
                    
                    return (
                      <tr key={code._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <code className="font-mono bg-slate-100 px-3 py-1 rounded text-slate-700 font-medium min-w-[120px] text-center">
                              {isVisible ? (isLegacy ? 'Legacy Code' : code.plainCode) : '••••••••••••'}
                            </code>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => toggleVisibility(code._id)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title={isVisible ? "Hide Code" : "Show Code"}
                              >
                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              {!isLegacy && (
                                <button
                                  onClick={() => copyToClipboard(code._id, code.plainCode)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Copy Code"
                                >
                                  {copiedStates[code._id] ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              code.isUsed
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {code.isUsed ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {code.assignedUser ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                {code.assignedUser.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800">
                                {code.assignedUser.username}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(code.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!code.isUsed && (
                              <>
                                <button
                                  onClick={() => handleRegenerate(code._id)}
                                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                                  title="Regenerate Code"
                                >
                                  <RefreshCw size={14} />
                                  Regenerate
                                </button>
                                <button
                                  onClick={() => handleRevoke(code._id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                                  title="Delete Code"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
                className="py-1.5 px-4 text-sm bg-white"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="py-1.5 px-4 text-sm bg-white"
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

export default AdminSecretCodesPage;
