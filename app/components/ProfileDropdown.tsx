"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import ConfirmationLogout from "./ConfirmationLogout";

export interface ProfileDropdownProps {
  adminImageUrl: string | null;
  adminName: string | null;
  adminEmail: string | null;
  onLogoutClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  id: string;
  initials: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  adminImageUrl,
  adminName,
  onLogoutClick,
  id,
  initials,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // ✅ Changed to zero-argument function for modal compatibility
  const handleLogoutConfirm = () => {
    // Safely simulate or handle logout logic without relying on a native MouseEvent
    const fakeEvent = { preventDefault: () => {} } as React.MouseEvent<HTMLButtonElement>;
    onLogoutClick(fakeEvent);
    setIsOpen(false);
    setShowLogoutConfirmation(false);
  };

  const handleCloseLogoutConfirmation = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 focus:outline-none"
      >
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
        <span className="font-medium dark:text-white">{adminName || "Loading..."}</span>
        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/${id}/profile`}
            className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <Link
            href={`/admin/${id}/edit-profile`}
            className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              setShowLogoutConfirmation(true);
            }}
            className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </motion.div>
      )}

      <ConfirmationLogout
        isOpen={showLogoutConfirmation}
        onClose={handleCloseLogoutConfirmation}
        onConfirm={handleLogoutConfirm} // ✅ Now matches expected signature
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </div>
  );
};

export default ProfileDropdown;
