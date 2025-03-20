// app/user/layout.tsx

"use client"

import React, { ReactNode, useState } from "react";
import SidebarNav from "../../components/SidebarNav";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Menu } from 'lucide-react'; //Or whatever Icon Library is in use

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <header> {/* Use <header> semantic tag */}
        <Header />
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

        {/* Sidebar */}
        <aside
          aria-label="Navigation Sidebar"
          className={`w-64 bg-white shadow-md p-4 ${
            isSidebarOpen ? "block" : "hidden"
          } md:block`} /* Use isSidebarOpen */
        >
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main aria-label="Main Content" className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto"> {/* Push the footer to the bottom */}
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;