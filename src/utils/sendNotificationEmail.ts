// src/utils/sendExpiringNotification.ts
import {
  emailjs,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
} from "../lib/emailjsClient";

interface NotificationPayload {
  to_email: Array<string>;
  user_name: string;
  message: string; // e.g. "Milk (expires today), Eggs (expired 1 day ago)"
  title: string;
}

export function sendNotificationEmail(payload: NotificationPayload) {
  const templateParams = {
    to_email: payload.to_email,
    user_name: payload.user_name,
    message: payload.message,
    title: payload.title,
  };

  return emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(
      (response: { status: number; text: string }) => {
        console.log(
          "[EmailJS] Sent notification:",
          response.status,
          response.text
        );
      },
      (error: unknown) => {
        console.error("[EmailJS] Failed to send notification:", error);
      }
    );
}
