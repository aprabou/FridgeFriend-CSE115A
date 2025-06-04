import React, {
  createContext,
  useState,
  useContext,
  PropsWithChildren,
} from "react";
import { supabase } from "../lib/supabaseClient"; // Adjust the import path for your Supabase client
import { useAuth } from "./useAuth"; // ✅ updated import
import { sendNotificationEmail } from "../utils/sendNotificationEmail"; // Adjust the import path for your email service

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "createdAt">
  ) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(
        data.map((notification) => ({
          ...notification,
          createdAt: new Date(notification.created_at),
        }))
      );
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new notification to the backend
  const addNotification = async (
    notification: Omit<Notification, "id" | "read" | "createdAt">
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            ...notification,
            user_id: user.id,
          },
        ])
        .select();

      if (error) throw error;

      if (!data || data.length === 0)
        throw new Error("No notification data returned");
      const newNotification: Notification = data[0];

      // 3) Immediately send an email to the user
      // Check user's notification preferences before sending email
      const { data: preferences, error: prefError } = await supabase
        .from("profiles")
        .select("email_notifications")
        .eq("id", user.id)
        .single();

      if (prefError) {
        console.error("Error checking notification preferences:", prefError);
        return;
      }

      if (!preferences?.email_notifications) {
        console.log("User has disabled email notifications");
        return;
      }
      await sendNotificationEmail({
        to_email: user.email!,
        user_name: user.email!.split("@")[0],
        title: newNotification.title,
        message: newNotification.message,
      });

      // Refetch notifications after adding
      await fetchNotifications();
    } catch (err) {
      console.error("Error adding notification:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
