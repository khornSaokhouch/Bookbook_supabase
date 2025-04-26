"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Ensure correct import path
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { User } from "@/app/types"; // Import shared User type

interface SidebarNavProps {
  user: User | null; // Accept user as a prop
}

const SidebarNav = ({ user }: SidebarNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false); // State for logout popup

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirect to home page
  };

  // Define menu items based on user authentication
  const menuItems = user
    ? [
        { href: `/profile/${user.user_id}/profile`, label: "Profile", icon: <HomeIcon /> },
        { href: `/profile/${user.user_id}/edit-profile`, label: "Edit Profile", icon: <EditIcon /> },
        { href: `/profile/${user.user_id}/my-recipes`, label: "My Recipes", icon: <WorkIcon /> },
        { href: `/profile/${user.user_id}/reset-password`, label: "Reset Password", icon: <LockIcon /> },
        { href: `/profile/${user.user_id}/save-recipe`, label: "Saved Recipes", icon: <BookmarkIcon /> },
      ]
    : [];

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, type: "spring", stiffness: 100 } },
  };

  return (
    <>
      <nav className="mt-4 md:mt-8">
        <ul className="space-y-2 md:space-y-4">
          {menuItems.map(({ href, label, icon }, index) => (
            <motion.li key={href} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: index * 0.1 }}>
              <Link
                href={href}
                className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-md lg:rounded-lg transition-colors duration-300 ease-in-out transform hover:scale-105 ${
                  pathname === href
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
                    : "text-black hover:bg-gray-200 hover:text-black dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
                style={{ boxShadow: pathname === href ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none" }}
              >
                <span className="mr-2 md:mr-3">{icon}</span>
                <span className="text-sm md:text-base font-medium">{label}</span>
              </Link>
            </motion.li>
          ))}

          {/* Logout Button with Popup */}
          {user && (
            <motion.li variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: menuItems.length * 0.1 }}>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="w-full flex items-center px-4 md:px-6 py-2 md:py-3 rounded-md lg:rounded-lg text-black hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <span className="mr-2 md:mr-3">
                  <ExitToAppIcon />
                </span>
                <span className="text-sm md:text-base font-medium">Logout</span>
              </button>
            </motion.li>
          )}
        </ul>
      </nav>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to log out?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SidebarNav;
