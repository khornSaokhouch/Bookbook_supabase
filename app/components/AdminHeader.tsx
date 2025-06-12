"use client";

import React from "react";
import Image from "next/image";
import { Menu, Bell } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import ProfileDropdown from "./ProfileDropdown";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AdminHeaderProps {
  onMobileMenuClick: () => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  isSearchFocused: boolean;
  adminName: string | null;
  adminImageUrl: string | null;
  adminEmail: string | null;
  onLogoutClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  sidebarCollapsed: boolean;
  userId: string | null;
  notifications?: Notification[];
  unreadCount?: number;
  onNotificationsClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMobileMenuClick,
  searchTerm,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  isSearchFocused,
  adminName,
  adminImageUrl,
  adminEmail,
  onLogoutClick,
  sidebarCollapsed,
  userId,
  notifications = [],
  unreadCount = 0,
  onNotificationsClick = () => {},
}) => {
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

  const { id } = useParams() as { id?: string | string[] };
  const normalizedId = Array.isArray(id) ? id[0] : id ?? null;

  const getPublicUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("image-user").getPublicUrl(path);
    return data.publicUrl;
  };

  const imageUrl = getPublicUrl(adminImageUrl);
  const initials = getInitials(adminEmail, adminName);

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuClick}
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
          onChange={onSearchChange}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          className={`border rounded-md px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            isSearchFocused
              ? "shadow-md"
              : "border-gray-300 dark:border-gray-200"
          }`}
        />
        <Image
          src="https://img.icons8.com/ios7/512/search.png"
          alt="search icon"
          width={20}
          height={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200"
        />
      </div>

      {/* Notifications and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        {normalizedId && (
          <ProfileDropdown
            adminImageUrl={imageUrl}
            adminName={adminName}
            adminEmail={adminEmail}
            onLogoutClick={onLogoutClick}
            id={normalizedId}
            initials={initials}
          />
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
