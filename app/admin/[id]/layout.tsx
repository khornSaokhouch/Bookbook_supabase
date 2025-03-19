"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null); // Add email state
  const [userId, setUserId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/"); // Redirect to the home page after logout
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally display an error message to the user
    }
  };

  const menuItems = userId
  ? [
    { id: "home", href: "/", label: "Home", icon: "home" },
    { id: "dashboard", href: `/admin/${userId}/dashboard`, label: "Dashboard", icon: "dashboard" },
    { id: "users", href: `/admin/${userId}/users`, label: "Users", icon: "people" },
    { id: "recipes", href: `/admin/${userId}/recipes`, label: "Recipes", icon: "restaurant_menu" },
    { id: "events", href: `/admin/${userId}/events`, label: "Events", icon: "event" },
    { id: "logout", href: "/", label: "Logout", icon: "logout", onClick: handleLogout }, // Added logout item
  ]
  : []; // If no user ID, menu is empty

  const getUserIdFromCookies = () => {
    if (typeof document === "undefined") {
      return; // Exit if document is not available (SSR)
    }
    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find((cookie) => cookie.startsWith("user="));
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        setUserId(user.id);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  };

  const getAdminProfile = async (userId: string | null) => {
    // Accept potentially null userId
    if (!userId) {
      console.log("getAdminProfile: No userId available yet.");
      return; // Exit if no userId
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name, image_url, email") // Select email as well
        .eq("user_id", userId) // Use user_id
        .single();

      if (error) {
        console.error("Error fetching admin profile:", error);
      } else {
        console.log("getAdminProfile: Data fetched:", data);
        setAdminName(data?.user_name || "Admin");
        setAdminImageUrl(data?.image_url || null);
        setAdminEmail(data?.email || null); // Set the email state here!
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    getUserIdFromCookies();
  }, []);

  useEffect(() => {
    if (userId) {
      getAdminProfile(userId);
    }
  }, [userId]);

  const getInitials = (email: string | null, name: string | null) => {
    if (name) {
      const parts = name.split(" ");
      return parts.map((part) => part.charAt(0).toUpperCase()).join("");
    }
    if (!email) return ""; // Fallback if no email
    const username = email.split("@")[0]; // Get the part before the @
    const firstLetter = username.charAt(0).toUpperCase();
    return firstLetter; // Or first two letters, etc.
  };

  if (!isMounted) {
    return null;
  }
  const initials = getInitials(adminEmail, adminName);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md w-full md:w-64 fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out md:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <Image src="/logo.png" alt="CookBook Logo" width={90} height={90} />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden focus:outline-none"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <nav className="mt-8">
        <ul className="space-y-2">
            {menuItems.map(({ id, href, label, icon, onClick }) => (
              <li key={id || label}>
                {href ? (
                  <Link
                    href={href}
                    className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 transition-colors duration-200 ${
                      pathname === href
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="mr-3 material-icons">{icon}</span>
                    {label}
                  </Link>
                ) : (
                  <button
                    onClick={onClick}
                    className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 transition-colors duration-200 text-gray-700 w-full text-left`}
                  >
                    <span className="mr-3 material-icons">{icon}</span>
                    {label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white shadow-sm">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden focus:outline-none"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="relative mx-5">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10" 
          />
          <img
            src="https://img.icons8.com/ios7/512/search.png"
            alt="search icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            width="20"
            height="20"
          />
        </div>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            {adminImageUrl ? (
              <Image
                src={adminImageUrl}
                alt="Admin Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-700">
                  {initials}
                </span>
              </div>
            )}
            <span className="font-medium">{adminName || "Loading..."}</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;