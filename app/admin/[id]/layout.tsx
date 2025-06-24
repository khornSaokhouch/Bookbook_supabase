// app/admin/AdminLayout.tsx
"use client"; // This is correct for your AdminLayout

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient"; // Assuming relative path is correct
import { motion } from "framer-motion";
import AdminSidebar from "@/app/components/AdminSlideBa"; // Assuming correct alias
import AdminHeader from "../../components/AdminHeader"; // Assuming relative path is correct
import { Noto_Sans_Khmer } from "next/font/google";

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "700"],
});

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const getUserIdFromCookies = useCallback(() => {
    if (typeof document === "undefined") {
      return;
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
  }, []);

  const getAdminProfile = useCallback(async (userId: string | null) => {
    if (!userId) {
      console.log("getAdminProfile: No userId available yet.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name, image_url, email")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching admin profile:", error);
      } else {
        setAdminName(data?.user_name || "Admin");
        setAdminImageUrl(data?.image_url || null);
        setAdminEmail(data?.email || null);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    getUserIdFromCookies();
  }, [getUserIdFromCookies]);

  useEffect(() => {
    if (!isMounted || !userId) return;
    setIsLoading(true);
    getAdminProfile(userId)
      .then(() => setIsLoading(false))
      .catch((err) => {
        console.error("Error fetching admin profile:", err);
        setIsLoading(false);
      });
  }, [isMounted, userId, getAdminProfile]);

  useEffect(() => {
    if (isMounted && userId && adminName) {
      const timer = setTimeout(() => {
        setIsLayoutReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted, userId, adminName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds timeout for loading
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleMobileMenuClick = () => {
    setSidebarOpen(true);
  };

  const layoutVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
  };

  // If you want to show a global loading spinner/skeleton for the admin layout,
  // ensure this logic correctly covers the initial data fetching
  if (!isMounted || isLoading) { // Keep isLoading here to show spinner until data is fetched
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      className={`h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden transition-colors duration-300 ${notoSansKhmer.className}`}
      variants={layoutVariants}
      initial="hidden"
      animate={isLayoutReady ? "visible" : "hidden"}
    >
      {/* Sidebar Component */}
      <AdminSidebar
        userId={userId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isLayoutReady={isLayoutReady}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <AdminHeader
          onMobileMenuClick={handleMobileMenuClick}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          isSearchFocused={isSearchFocused}
          adminName={adminName}
          adminImageUrl={adminImageUrl}
          adminEmail={adminEmail}
          onLogoutClick={() => {
            supabase.auth.signOut().then(() => {
              document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.href = "/login";
            });
          }}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isLayoutReady={isLayoutReady}
          userId={userId}
        />

        {/* Content Area */}
        <motion.main
          className="flex-1 overflow-y-auto p-6"
          variants={contentVariants}
        >
          {/* Welcome Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    សូមស្វាគមន៍ {adminName || "Admin"} 👋
                  </h1>
                  <p className="text-blue-100">
                    ត្រៀមដើម្បីគ្រប់គ្រងសៀវភៅចំអិនម្ហូបរបស់អ្នក។ មកចាប់ផ្តើមបង្កើតអ្វីឆ្ងាញ់ៗថ្ងៃនេះ។
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🍳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>{children}</div> {/* This is where your admin pages will render */}
        </motion.main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" // Added bg-black for clearer overlay
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default AdminLayout;