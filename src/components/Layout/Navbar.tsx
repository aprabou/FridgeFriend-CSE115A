import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserCircleIcon, MenuIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  unreadCount: number;
  onNotificationClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ unreadCount, onNotificationClick }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <MenuIcon size={24} />
          </button>
          <div className="flex items-center">
            <span className="text-green-500 text-xl font-semibold">Fridge</span>
            <span className="text-blue-500 text-xl font-semibold">Friend</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="relative p-1 text-gray-500 hover:text-gray-700 rounded-full"
            onClick={onNotificationClick}
          >
            <BellIcon size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserCircleIcon size={28} className="text-gray-500 hover:text-gray-700" />
              <span className="hidden md:block ml-2 text-sm text-gray-700">
                {user?.email?.split('@')[0]}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile Settings
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Household
                </a>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;