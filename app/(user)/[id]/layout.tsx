"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { parseCookies } from "nookies"; // Handle cookies
import { useRouter } from "next/navigation";  

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
  const [isLoading, setIsLoading] = useState(true); // Prevents flashing content
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const userCookie = cookies.user ? JSON.parse(cookies.user) : null;

    // Redirect to login if user_id is missing or invalid
    if (!userCookie) {
      return;
    }

    // Set user if authenticated
    setUser(userCookie);
    setIsLoading(false);
  }, [router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <header>
        <Navbar user={user} />
      </header>

      {/* Main Content */}
      <main aria-label="Main Content" className="flex-1 p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;
