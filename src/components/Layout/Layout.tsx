import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NotificationCenter from '../Notifications/NotificationCenter';
import { useNotifications } from '../../contexts/NotificationContext';

const Layout: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          unreadCount={unreadCount} 
          onNotificationClick={() => setShowNotifications(!showNotifications)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowNotifications(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;