//Entry point of the React application, where it initializes the React app by rendering the App component 
//inside the AuthProvider context and wraps it with React.StrictMode for development checks
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
