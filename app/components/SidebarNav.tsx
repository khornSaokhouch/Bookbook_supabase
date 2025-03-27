"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { motion } from "framer-motion"; // Import framer-motion

type User = {
  user_id: string;
};

const SidebarNav = ({ user }: { user: User | null }) => {
  const pathname = usePathname(); // Get current route

  const menuItems = user
    ? [
        { href: `/${user.user_id}/profile`, label: "Home", icon: <HomeIcon /> },
        { href: `/${user.user_id}/edit-profile`, label: "Edit Profile", icon: <EditIcon /> },
        { href: `/${user.user_id}/profile/my-recipes`, label: "My Recipes", icon: <WorkIcon /> },
        { href: `/${user.user_id}/profile/reset-password`, label: "Reset Password", icon: <LockIcon /> },
        { href: `/${user.user_id}/profile/save-recipe`, label: "Saved Recipes", icon: <BookmarkIcon /> }, // Changed Label
      ]
    : [];

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, type: "spring", stiffness: 100 },
    },
  };

  return (
    <nav className="mt-4 md:mt-8">
      <ul className="space-y-2 md:space-y-4">
        {menuItems.map(({ href, label, icon }, index) => (
          <motion.li
            key={href}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={href}
              className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-md lg:rounded-lg transition-colors duration-300 ease-in-out transform hover:scale-105 ${
                pathname === href
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
                  : "text-black hover:bg-gray-200 hover:text-black  dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
              style={{
                boxShadow: pathname === href ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
              }}
            >
              <span className="mr-2 md:mr-3">{icon}</span>
              <span className="text-sm md:text-base font-medium">{label}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;