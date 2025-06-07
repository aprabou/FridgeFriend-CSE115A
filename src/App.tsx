import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import { ProfileProvider } from "./contexts/useProfile";
import { InventoryProvider } from "./contexts/InventoryContext";
import Navbar from "./components/Layout/Navbar";
import Settings from "./pages/Settings";
import Invitations from "./pages/Invitations";
import Inventory from "./pages/Inventory";
import Recipes from "./pages/Recipes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useScrollToTop } from "./hooks/useScrollToTop";
import "./globals.css";

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  useScrollToTop();

  return (
    <>
      {user && (
        <Navbar unreadCount={0} onNotificationClick={() => {}}>
          <Link to="/inventory" className="px-3 py-2">
            My Fridge
          </Link>
          <Link to="/recipes" className="px-3 py-2">
            Recipes
          </Link>{" "}
          {/* Recipes tab */}
          <Link to="/settings" className="px-3 py-2">
            Settings
          </Link>
          {user && (
            <Link to="/invitations" className="px-3 py-2">
              Invitations
            </Link>
          )}
        </Navbar>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {user ? (
          <>
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="*" element={<Inventory />} />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>
          <InventoryProvider>
            <AppRoutes />
          </InventoryProvider>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
