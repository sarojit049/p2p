import { Outlet, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import DashboardPage from '../pages/DashboardPage';
import { ROUTES } from '../constants';

const UserLayout = () => {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat/');

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar - hidden on mobile if in chat view */}
      <div 
        className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex-shrink-0 bg-white ${
          isChatRoute ? 'hidden md:flex' : 'flex'
        } flex-col`}
      >
        {/* Render Dashboard as Sidebar */}
        <DashboardPage isSidebar={true} />
      </div>

      {/* Main Content - hidden on mobile if not in chat view */}
      <div className={`flex-1 ${!isChatRoute ? 'hidden md:flex' : 'flex'} flex-col bg-[#f0f2f5]`}>
        {isChatRoute ? (
          <Outlet />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 border-l border-gray-200 shadow-inner">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">PrivateConnect Web</h2>
            <p className="text-sm text-gray-500 mt-2">Select a conversation or start a new chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLayout;
