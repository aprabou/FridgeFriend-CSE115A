import React from 'react';
import { XIcon, CheckIcon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  const getNotificationTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>
      
      {notifications.length > 0 ? (
        <>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
            <button 
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={clearNotifications}
            >
              Clear all
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b border-gray-100 ${!notification.read ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`w-full rounded-md border p-3 ${getNotificationTypeStyles(notification.type)}`}>
                    <div className="flex justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <CheckIcon size={16} />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{notification.message}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;