// src/components/Layout/Navbar.tsx
//Defines and exports a React component that renders a navigation bar for the application
//Manages user interactions like toggling menus and handles user logout via the useAuth context
//Provides navigation functionality using react-router-dom
"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BellIcon, UserCircleIcon, MenuIcon } from "lucide-react"
import { useAuth } from "../../contexts/useAuth"
import { useProfile } from "../../contexts/useProfile"
import { useNotification } from "../../contexts/NotificationContext"


export interface NavbarProps {
  unreadCount: number
  onNotificationClick: () => void
  children?: React.ReactNode
}

const Navbar: React.FC<NavbarProps> = () => {

  const { signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { notifications, unreadCount } = useNotification()

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showUserMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  const toggleNotificationTab = () => {
    setIsNotificationOpen((prev) => !prev)
  }

  return (
    <header className="bg-gray-800 border-gray-700 border-b sticky top-0 z-30 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Brand + Mobile Menu Button */}
        <div className="flex items-center">
          <button
            className="lg:hidden text-gray-400 hover:text-emerald-400 hover:bg-emerald-600/10 mr-4 p-2 rounded-md transition-colors"
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            <MenuIcon size={20} />
          </button>
          <div className="flex items-center">
            <Link
              to="/inventory"
              className="text-emerald-400  text-xl font-semibold transition-colors"
            >
              Fridge
            </Link>
            <Link to="/inventory" className="text-blue-400  text-xl font-semibold transition-colors">
              Friend
            </Link>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-2">
          <Link
            to="/inventory"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            My Fridge
          </Link>
          <Link
            to="/recipes"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            Recipes
          </Link>
          <Link
            to="/settings"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            Settings
          </Link>
          <Link
            to="/invitations"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            Invitations
          </Link>
        </div>

        {/* Notification & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Notification Button */}
          <button
            className="relative p-2 text-gray-400 hover:text-white hover:bg-emerald-600 rounded-md transition-colors"
            onClick={toggleNotificationTab}
          >
            <BellIcon size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Pop-Up Tab */}
          {isNotificationOpen && (
            <div className="absolute right-4 top-16 w-80 bg-gray-800 border-gray-700 border shadow-lg rounded-lg p-4 z-50 transition-colors">
              <h3 className="text-lg font-bold mb-3 text-gray-100">Notifications</h3>
              {notifications.length > 0 ? (
                <ul className="space-y-2">
                  {notifications.map((notification) => (
                    <li key={notification.id} className="p-2 rounded-md bg-gray-700 text-gray-200 text-sm">
                      {notification.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No new notifications</p>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-emerald-600 transition-colors focus:outline-none"
              onClick={() => setShowUserMenu((prev) => !prev)}
            >
              <UserCircleIcon size={24} />
              <span className="hidden md:block text-sm font-medium text-gray-300">{profile?.name || "User"}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border-gray-700 border rounded-md shadow-lg py-1 z-20 transition-colors">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
                >
                  Profile Settings
                </Link>
                <Link
                  to="/invitations"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
                >
                  Invitations
                </Link>
                <hr className="my-1 border-gray-700" />
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-red-600 transition-colors"
                  onClick={() => {
                    setShowUserMenu(false)
                    handleLogout()
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
        <nav className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-gray-800 border-gray-700 border-t transition-colors">
          <Link
            to="/inventory"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            My Fridge
          </Link>
          <Link
            to="/recipes"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            Recipes
          </Link>
          <Link
            to="/settings"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            Settings
          </Link>
          <Link
            to="/invitations"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-600 transition-colors"
            onClick={() => setShowMobileMenu(false)}
          >
            Invitations
          </Link>
        </nav>
      )}
    </header>
  )
}

export default Navbar
