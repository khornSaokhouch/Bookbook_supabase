"use client";

import type React from "react";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import CategoryIcon from "@mui/icons-material/Category";

interface AdminSidebarProps {
  userId: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isLayoutReady: boolean;
  onLogoutClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AdminSidebar = ({
  userId,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  isLayoutReady,
  onLogoutClick,
}: AdminSidebarProps) => {
  const pathname = usePathname();

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const menuItems = userId
    ? [
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
          id: "categories",
          href: `/admin/${userId}/categories`,
          label: "Categories",
          icon: <CategoryIcon />,
        },
        {
          id: "occasions",
          href: `/admin/${userId}/occasions`,
          label: "Occasions",
          icon: <CategoryIcon />,
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
          onClick: onLogoutClick,
        },
      ]
    : [];

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

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

  return (
    <motion.aside
      className={`bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg h-screen z-40 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        sidebarCollapsed ? "w-20" : "w-64"
      } fixed md:relative md:translate-x-0 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
      variants={sidebarVariants}
    >
      {/* Logo and Toggle Section */}
      <div className="relative">
        {/* Logo Container */}
        <div
          className={`flex items-center justify-center py-6 ${
            sidebarCollapsed ? "px-2" : "px-4"
          }`}
        >
          <Link href="/" className="flex items-center justify-center relative">
            <div
              className={`transition-all duration-300 ${
                sidebarCollapsed ? "scale-75" : ""
              }`}
            >
              <Image
                src="/logo.png"
                alt="CookBook Logo"
                width={90}
                height={90}
                className="transition-all duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Toggle Button - Positioned Absolutely */}
        <button
          onClick={toggleSidebarCollapse}
          className="absolute top-6 right-2 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 hidden md:flex items-center justify-center"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
              sidebarCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 md:hidden"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4 border-b border-gray-200 dark:border-gray-700"></div>

      {/* Navigation */}
      <nav className="px-2 flex-1 overflow-hidden">
        <ul className="space-y-1 overflow-y-auto h-full">
          {menuItems.map(({ id, href, label, icon, onClick }) => (
            <motion.li
              key={id || label}
              variants={menuItemVariants}
              initial="hidden"
              animate={isLayoutReady ? "visible" : "hidden"}
            >
              {href ? (
                <Link
                  href={href}
                  className={`flex items-center px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${
                    pathname === href
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  } ${sidebarCollapsed ? "md:justify-center md:px-2" : ""}`}
                  title={sidebarCollapsed ? label : ""}
                >
                  <div
                    className={`flex items-center justify-center ${
                      typeof icon === "string"
                        ? "w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm"
                        : ""
                    }`}
                  >
                    {typeof icon === "string" ? (
                      <span
                        className={`material-icons text-blue-600 dark:text-blue-400 ${
                          sidebarCollapsed ? "text-xl" : "text-lg"
                        }`}
                      >
                        {icon}
                      </span>
                    ) : (
                      <div className="text-blue-600 dark:text-blue-400">
                        {icon}
                      </div>
                    )}
                  </div>
                  <span
                    className={`ml-3 font-medium transition-opacity duration-200 ${
                      sidebarCollapsed
                        ? "md:hidden md:opacity-0"
                        : "opacity-100"
                    }`}
                  >
                    {label}
                  </span>
                  {pathname === href && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={onClick}
                  className={`flex items-center w-full px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-gray-700 dark:text-gray-300 text-left ${
                    sidebarCollapsed ? "md:justify-center md:px-2" : ""
                  }`}
                  title={sidebarCollapsed ? label : ""}
                >
                  <div
                    className={`flex items-center justify-center ${
                      typeof icon === "string"
                        ? "w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm"
                        : ""
                    }`}
                  >
                    {typeof icon === "string" ? (
                      <span
                        className={`material-icons text-blue-600 dark:text-blue-400 ${
                          sidebarCollapsed ? "text-xl" : "text-lg"
                        }`}
                      >
                        {icon}
                      </span>
                    ) : (
                      <div className="text-blue-600 dark:text-blue-400">
                        {icon}
                      </div>
                    )}
                  </div>
                  <span
                    className={`ml-3 font-medium transition-opacity duration-200 ${
                      sidebarCollapsed
                        ? "md:hidden md:opacity-0"
                        : "opacity-100"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )}
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.aside>
  );
};

export default AdminSidebar;
