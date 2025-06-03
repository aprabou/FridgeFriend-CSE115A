// src/components/Layout/Navbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircleIcon, MenuIcon } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useProfile } from "../../contexts/useProfile";

export interface NavbarProps {
  unreadCount: number;
  onNotificationClick: () => void;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showUserMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Brand + Mobile Menu Button */}
        <div className="flex items-center">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            <MenuIcon size={24} />
          </button>
          <div className="flex items-center">
            <Link
              to="/inventory"
              className="text-green-500 text-xl font-semibold mr-1"
            >
              Fridge
            </Link>
            <Link
              to="/inventory"
              className="text-blue-500 text-xl font-semibold"
            >
              Friend
            </Link>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/inventory" className="px-3 py-2">
            My Fridge
          </Link>
          <Link to="/recipes" className="px-3 py-2">
            Recipes
          </Link>
          <Link to="/settings" className="px-3 py-2">
            Settings
          </Link>
          <Link to="/invitations" className="px-3 py-2">
            Invitations
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center focus:outline-none"
              onClick={() => setShowUserMenu((prev) => !prev)}
            >
              <UserCircleIcon
                size={28}
                className="text-gray-500 hover:text-gray-700"
              />
              <span className="hidden md:block ml-2 text-sm text-gray-700">
                {profile?.name}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </Link>
                <Link
                  to="/invitations"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Invitations
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Links Toggle */}
      {showMobileMenu && (
        <nav className="lg:hidden px-4 pt-2 pb-4 space-y-1">
          <Link to="/inventory" className="block px-3 py-2">
            My Fridge
          </Link>
          <Link to="/recipes" className="block px-3 py-2">
            Recipes
          </Link>
          <Link to="/settings" className="block px-3 py-2">
            Settings
          </Link>
          <Link to="/invitations" className="block px-3 py-2">
            Invitations
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
