"use client";

import React, { ReactNode, useEffect, useState } from "react";
import SidebarNav from "../components/SidebarNav";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Menu } from "lucide-react";
import { parseCookies } from "nookies"; // For managing cookies
import { useRouter } from "next/navigation"; // To handle redirects

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
    try {
      const cookies = parseCookies();
      const userCookie = cookies.user ? JSON.parse(cookies.user) : null;

      if (userCookie) {
        setUser(userCookie);
      } else {
        router.push("/login"); // Redirect if user not found
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
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
        </button>

        {/* Sidebar with user prop */}
        <div className="px-20">
        <SidebarNav user={user} />
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
