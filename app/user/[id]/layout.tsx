"use client";

import React, { ReactNode, useEffect, useState } from "react";
import SidebarNav from "../../components/SidebarNav";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Menu } from "lucide-react";
import { parseCookies } from "nookies"; // For managing cookies
import { useRouter } from "next/navigation";  // To handle redirects

type User = {
  user_id: string;
  user_name: string;
  email: string;
  image_url?: string | null;
};

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data from cookies or session
    const cookies = parseCookies();
    const userCookie = cookies.user ? JSON.parse(cookies.user) : null;

    if (userCookie) {
      setUser(userCookie);
    } else {
      // Redirect to login if user is not found in cookies
      router.push("/login");
    }
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <header>
        <Navbar user={user} />
      </header>

      <div className="flex flex-1">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden bg-blue-500 text-white p-2 rounded-md focus:outline-none"
        >
          <Menu className="h-6 w-6" />
          Toggle Sidebar
        </button>

        {/* Sidebar (Mobile/Tablet version) */}
        <div
          className={`md:block fixed inset-0 bg-black bg-opacity-50 z-50 transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={toggleSidebar}
        >
          {/* Optional Sidebar content for mobile view */}
          <SidebarNav />
        </div>

        {/* Main Content */}
        <main aria-label="Main Content" className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;
