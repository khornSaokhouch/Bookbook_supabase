"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// import { logout } from "@/app/actions/actions";

// Import Material UI Icons
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LogoutIcon from "@mui/icons-material/Logout";

const SidebarNav = () => {
  const pathname = usePathname(); // Get current route

  const menuItems = [
    { href: "/profile", label: "Home", icon: <HomeIcon /> },
    { href: "/edit-profile", label: "Edit Profile", icon: <EditIcon /> },
    { href: "/profile/my-recipes", label: "My Recipes", icon: <WorkIcon /> },
    { href: "/profile/reset-password", label: "Reset Password", icon: <LockIcon /> },
    { href: "/profile/save-recipe", label: "Save", icon: <BookmarkIcon /> },
  ];

  //   const handleLogout = useCallback(async () => {
  //     await logout();
  //   }, []);

  return (
    <nav className="mt-4 md:mt-8"> {/* Adjust top margin responsively */}
      <ul className="space-y-2 md:space-y-4"> {/* Adjust vertical spacing responsively */}
        {menuItems.map(({ href, label, icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-md lg:rounded-lg transition-colors duration-200 ${
                pathname === href
                  ? "bg-blue-600 text-white"
                  : "text-black-700 hover:bg-white dark:text-black-300 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2 md:mr-3">{icon}</span> {/* Adjust icon spacing */}
              <span className="text-sm md:text-base">{label}</span> {/* Adjust font size */}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;