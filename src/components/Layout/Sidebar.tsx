//Defines a React component that renders a styled sidebar with navigation links and icons for different sections of the application
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PackageIcon, CookingPotIcon, SettingsIcon } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <HomeIcon size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <PackageIcon size={20} /> },
    { name: 'Recipes', path: '/recipes', icon: <CookingPotIcon size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];
  
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-green-500 text-2xl font-bold">Fridge</span>
        <span className="text-blue-500 text-2xl font-bold">Friend</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm font-medium ${
                    isActive
                      ? 'text-green-500 bg-green-50'
                      : 'text-gray-600 hover:text-green-500 hover:bg-gray-50'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-green-700 mb-1">Storage Tip</h4>
          <p className="text-xs text-green-600">
            Keep your herbs fresh longer by wrapping them in a damp paper towel before refrigerating.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;