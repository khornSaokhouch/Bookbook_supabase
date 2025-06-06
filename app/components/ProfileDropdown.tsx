"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleLogoutConfirm = () => {
    const fakeEvent = {
      preventDefault: () => {},
    } as React.MouseEvent<HTMLButtonElement>;
    onLogoutClick(fakeEvent);
    setIsOpen(false);
    setShowLogoutConfirmation(false);
  };

  const handleCloseLogoutConfirmation = () => {
    setShowLogoutConfirmation(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {adminImageUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-700">
            <Image
              src={adminImageUrl || "/placeholder.svg"}
              alt="Admin Avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 flex items-center justify-center ring-2 ring-purple-200 dark:ring-purple-700 shadow-lg">
            <span className="text-lg font-medium text-white">{initials}</span>
          </div>
        )}
        <span className="font-medium dark:text-white hidden sm:block">
          {adminName || "Loading..."}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <div className="flex items-center space-x-3">
                {adminImageUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={adminImageUrl || "/placeholder.svg"}
                      alt="Admin Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 flex items-center justify-center shadow-md">
                    <span className="text-sm font-medium text-white">
                      {initials}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {adminName || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href={`/admin/${id}/profile`}
                onClick={handleLinkClick}
                className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex items-center space-x-3 group"
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">View Profile</span>
              </Link>
              <Link
                href={`/admin/${id}/edit-profile`}
                onClick={handleLinkClick}
                className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center space-x-3 group"
              >
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-medium">Edit Profile</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setShowLogoutConfirmation(true);
                }}
                className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationLogout
        isOpen={showLogoutConfirmation}
        onClose={handleCloseLogoutConfirmation}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </div>
  );
};

export default ProfileDropdown;
