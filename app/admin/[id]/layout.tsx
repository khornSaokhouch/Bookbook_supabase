"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import LogoutConfirmationModal from "../../components/LogoutConfirmationModal"; // Import the new component

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminImageUrl, setAdminImageUrl] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  const confirmLogout = useCallback(() => {
    handleLogout();
    setIsLogoutModalOpen(false);
  }, [handleLogout]);

  const openLogoutModal = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLogoutModalOpen(true);
  }, []);

  const menuItems = userId
    ? [
        { id: "home", href: "/", label: "Home", icon: "home" },
        {
          id: "dashboard",
          href: `/admin/${userId}/dashboard`,
          label: "Dashboard",
          icon: "dashboard",
        },
        {
          id: "users",
          href: `/admin/${userId}/users`,
          label: "Users",
          icon: "people",
        },
        {
          id: "recipes",
          href: `/admin/${userId}/recipes`,
          label: "Recipes",
          icon: "restaurant_menu",
        },
        {
          id: "events",
          href: `/admin/${userId}/events`,
          label: "Events",
          icon: "event",
        },
        {
          id: "logout",
          href: "/login",
          label: "Logout",
          icon: "logout",
          onClick: openLogoutModal ,
        },
      ]
    : [];

  const getUserIdFromCookies = () => {
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
  };

  const getAdminProfile = async (userId: string | null) => {
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
        console.log("getAdminProfile: Data fetched:", data);
        setAdminName(data?.user_name || "Admin");
        setAdminImageUrl(data?.image_url || null);
        setAdminEmail(data?.email || null);
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
    if (!isMounted || !userId) return;
    setIsLoading(true);
    getAdminProfile(userId)
      .then(() => setIsLoading(false))  // Set loading to false after profile is fetched.
      .catch((err) => {
        console.error("Error fetching admin profile:", err);
        setIsLoading(false);
      });
  }, [isMounted, userId]);

  useEffect(() => {
    if (isMounted && userId && adminName) {
      setTimeout(() => {
        setIsLayoutReady(true);
      }, 100);
    }
  }, [isMounted, userId, adminName]);

  useEffect(() => {
    // Simulate a loading period
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const getInitials = (email: string | null, name: string | null) => {
    if (name) {
      const parts = name.split(" ");
      return parts.map((part) => part.charAt(0).toUpperCase()).join("");
    }
    if (!email) return "";
    const username = email.split("@")[0];
    const firstLetter = username.charAt(0).toUpperCase();
    return firstLetter;
  };

  if (!isMounted) {
    return null;
  }
  const initials = getInitials(adminEmail, adminName);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
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

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
  };

  // Animation Variants for Menu Items
  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };
 if (isLoading) {
    return <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>;
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300"
      variants={layoutVariants}
      initial="hidden"
      animate={isLayoutReady ? "visible" : "hidden"}
    >
      {/* Sidebar */}
      <motion.aside
        className={`bg-white dark:bg-gray-800 shadow-md w-full md:w-64 fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out md:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        variants={sidebarVariants}
      >
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center justify-center">
            <Image src="/logo.png" alt="CookBook Logo" width={90} height={90} />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden focus:outline-none"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            {menuItems.map(({ id, href, label, icon, onClick }) => (
              <motion.li
                key={id || label}
                variants={menuItemVariants} // Apply animation variants
                initial="hidden"
                animate={isLayoutReady ? "visible" : "hidden"}
              >
                {href ? (
                  <Link
                    href={href}
                    className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      pathname === href
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="mr-3 material-icons">{icon}</span>
                    {label}
                  </Link>
                ) : (
                  <button
                    onClick={onClick}
                    className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300 w-full text-left`}
                  >
                    <span className="mr-3 material-icons">{icon}</span>
                    {label}
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden focus:outline-none"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Search Bar */}
          <div className="relative mx-5 w-full max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={`border rounded-md px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                isSearchFocused
                  ? "shadow-md"
                  : "border-gray-300 dark:border-gray-200"
              }`}
            />
            <img
              src="https://img.icons8.com/ios7/512/search.png"
              alt="search icon"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-200"
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
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {initials}
                </span>
              </div>
            )}
            <span className="font-medium dark:text-white">
              {adminName || "Loading..."}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <motion.main
          className="flex-1 overflow-x-hidden p-4"
          variants={contentVariants}
        >
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-4 transition-colors duration-300">
            {children}
          </div>
        </motion.main>
      </div>
       {/* Logout Confirmation Modal */}
       <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </motion.div>
  );
};

export default AdminLayout;