import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export const useNotifications = () => {
  return useContext(NotificationContext);
};
