"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SidebarNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false); // State for logout popup

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    router.push("/"); // Redirect to login page
  };

  // Define menu items based on user authentication
  const menuItems = userId
    ? [
        { href: `/${userId}/profile`, label: "Profile", icon: <HomeIcon /> },
        { href: `/${userId}/edit-profile`, label: "Edit Profile", icon: <EditIcon /> },
        { href: `/${userId}/my-recipes`, label: "My Recipes", icon: <WorkIcon /> },
        { href: `/${userId}/reset-password`, label: "Reset Password", icon: <LockIcon /> },
        { href: `/${userId}/save-recipe`, label: "Saved Recipes", icon: <BookmarkIcon /> },
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
          {userId && (
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
