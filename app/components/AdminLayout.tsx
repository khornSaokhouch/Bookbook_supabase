"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const menuItems = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/users", label: "Users", icon: "people" },
    { href: "/admin/recipes", label: "Recipes", icon: "restaurant_menu" },
    { href: "/admin/events", label: "Events", icon: "event" },
  ];

  const getUserIdFromCookies = () => {
    if (typeof document === 'undefined') {
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

  const getAdminProfile = async (userId: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name, image_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching admin profile:", error);
      } else {
        setAdminName(data?.user_name || "Admin");
        setAdminImageUrl(data?.image_url || null);
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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md w-full md:w-64 fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out md:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <Image src="/logo.png" alt="CookBook Logo" width={90} height={90} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden focus:outline-none"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            {menuItems.map(({ href, label, icon }) => (
              <li key={href}>
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
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <Image
              src={adminImageUrl || "/default-avatar.png"}
              alt="Admin Avatar"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="font-medium">{adminName || "Loading..."}</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;