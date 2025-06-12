// src/emailjs.ts
// Initializes the EmailJS client with a user ID from environment variables 
// Exports the EmailJS instance along with predefined service and template IDs for sending emails
import emailjs from "emailjs-com";

const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID!; // or NEXT_PUBLIC_... if Next.js
const EMAILJS_SERVICE_ID = "service_jc8fn1k"; // ← replace with your Service ID
const EMAILJS_TEMPLATE_ID = "template_axuyazd"; // ← replace with your Template ID

emailjs.init(EMAILJS_USER_ID);

export { emailjs, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID };
