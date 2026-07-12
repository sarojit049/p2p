import { Settings } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Platform configuration and administrative preferences</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Settings are read-only</h2>
        <p className="text-gray-500 max-w-md">
          Platform configurations (such as Admin credentials, JWT secrets, and Database URIs) are managed securely via environment variables and cannot be modified from the UI.
        </p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
