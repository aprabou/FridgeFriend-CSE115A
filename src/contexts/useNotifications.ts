// Defines a custom React hook, useNotifications
// That gives access to the NotificationContext for managing notification-related functionality
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export const useNotifications = () => {
  return useContext(NotificationContext);
};
