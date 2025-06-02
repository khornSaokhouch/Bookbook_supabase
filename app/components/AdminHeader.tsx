"use client";

import type React from "react";

import Image from "next/image";
import { Menu } from "lucide-react";

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
}

const AdminHeader = ({
  onMobileMenuClick,
  searchTerm,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  isSearchFocused,
  adminName,
  adminImageUrl,
  adminEmail,
}: AdminHeaderProps) => {
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

      {/* Profile */}
      <div className="flex items-center space-x-3">
        {adminImageUrl ? (
          <Image
            src={adminImageUrl || "/placeholder.svg"}
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
  );
};

export default AdminHeader;
