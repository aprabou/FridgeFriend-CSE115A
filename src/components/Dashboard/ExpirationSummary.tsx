// Defines and exports a React component that displays a summary of food items nearing expiration
// It uses the useInventory context to access inventory data and has logic to send notification emails for expiring items
import React, { useEffect, useState } from "react";
import { AlarmClockIcon } from "lucide-react";
import { useInventory } from "../../contexts/useInventory";
import { FoodItem } from "../../contexts/InventoryContext";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";
import { sendExpiringNotification } from "../../utils/sendNotificationEmail";

const ExpirationSummary: React.FC = () => {
  const { items } = useInventory();

  // 1) State to hold the logged-in user’s email & name
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // 2) State to guard against sending multiple emails
  const [hasSentEmail, setHasSentEmail] = useState(false);

  // 3) Load the Supabase Auth user on mount, and then (optionally) fetch profile
  useEffect(() => {
    const fetchUserInfo = async () => {
      // Depending on your supabase-js version, you can do:
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser();
      //
      // OR in older versions:
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn("[ExpirationSummary] No user is logged in.");
        return;
      }

      // 3a) We always have user.email from Supabase Auth
      setUserEmail(user.email ?? null);

      // 3b) If you stored the user’s “full name” in a separate table (e.g. "profiles"):
      //     (Otherwise, if you saved full_name in user_metadata, you can do:
      //       setUserName((user.user_metadata as any)?.full_name || '');
      //     and skip the next query.)
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[ExpirationSummary] Error fetching profile:", error);
        // Fallback to some default if needed:
        setUserName(user.email!.split("@")[0]);
      } else {
        setUserName(profile.full_name);
      }
    };

    fetchUserInfo();
  }, []);

  // 4) Categorize items exactly as before
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const categorizeItems = () => {
    const expired: FoodItem[] = [];
    const expiringToday: FoodItem[] = [];
    const thisWeek: FoodItem[] = [];
    const later: FoodItem[] = [];

    items.forEach((item) => {
      const expDate = new Date(item.expiration);

      if (expDate < today && expDate.toDateString() !== today.toDateString()) {
        expired.push(item);
      } else if (expDate.toDateString() === today.toDateString()) {
        expiringToday.push(item);
      } else if (expDate > today && expDate <= endOfWeek) {
        thisWeek.push(item);
      } else {
        later.push(item);
      }
    });

    return { expired, expiringToday, thisWeek, later };
  };

  const { expired, expiringToday, thisWeek, later } = categorizeItems();

  const sortByExpiration = (a: FoodItem, b: FoodItem) =>
    new Date(a.expiration).getTime() - new Date(b.expiration).getTime();

  // 5) Once userEmail/userName are known, and we have expired/expiringToday > 0, send one email
  useEffect(() => {
    // Only run if:
    //  • We have pulled in userEmail from Supabase
    //  • There is at least one expired or expiringToday item
    //  • We haven’t already sent an email in this session
    if (
      userEmail &&
      userName &&
      !hasSentEmail &&
      (expired.length > 0 || expiringToday.length > 0)
    ) {
      // Build a short comma‐separated list for the email body
      const buildItemList = (arr: FoodItem[], label: string) =>
        arr.map((item) => `${item.name} (${label})`).join(", ");

      const expiredList = buildItemList(expired, "expired");
      const expiringList = buildItemList(expiringToday, "expires today");
      const fullItemList = [expiredList, expiringList]
        .filter(Boolean)
        .join(", ");

      // days_warning: 0 if something expires today, else -1 if only expired items
      const daysWarning = expiringToday.length > 0 ? 0 : -1;

      sendExpiringNotification({
        to_email: userEmail,
        user_name: userName,
        item_list: fullItemList,
        days_warning: daysWarning,
      });

      setHasSentEmail(true);
    }
  }, [expired, expiringToday, userEmail, userName, hasSentEmail]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-blue-500 text-white flex items-center">
        <AlarmClockIcon size={20} className="mr-2" />
        <h2 className="text-lg font-semibold">Expiration Summary</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <h3 className="text-red-700 font-medium">Expired</h3>
            <p className="text-2xl font-bold text-red-800">{expired.length}</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <h3 className="text-amber-700 font-medium">Expiring Today</h3>
            <p className="text-2xl font-bold text-amber-800">
              {expiringToday.length}
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h3 className="text-blue-700 font-medium">This Week</h3>
            <p className="text-2xl font-bold text-blue-800">
              {thisWeek.length}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <h3 className="text-green-700 font-medium">Later</h3>
            <p className="text-2xl font-bold text-green-800">{later.length}</p>
          </div>
        </div>

        {expired.length > 0 || expiringToday.length > 0 ? (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Attention Needed</h3>
            <ul className="space-y-2">
              {[...expired, ...expiringToday]
                .sort(sortByExpiration)
                .slice(0, 5)
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center p-2 rounded bg-gray-50"
                  >
                    <span className="font-medium text-gray-800">
                      {item.name}
                    </span>
                    <span
                      className={`text-sm ${
                        new Date(item.expiration) < today
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {new Date(item.expiration) < today
                        ? "Expired"
                        : "Expires today"}
                    </span>
                  </li>
                ))}
            </ul>

            <div className="mt-4 text-center">
              <Link
                to="/inventory"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all items →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">No items need immediate attention</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpirationSummary;
