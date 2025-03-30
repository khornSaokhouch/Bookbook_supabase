"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { parseCookies } from "nookies"; // Handle cookies
import { useRouter } from "next/navigation";

// Define the User type
interface User {
  user_id: string;
  user_name: string;
  email?: string;
  image_url?: string;
}

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [user, setUser] = useState<User | null>(null); // Use the User type here
  const [isLoading, setIsLoading] = useState(true); // Prevents flashing content
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const userCookie = cookies.user ? JSON.parse(cookies.user) : null;

    if (!userCookie) {
      return;
    }

    setUser(userCookie); // Assuming userCookie fits the User structure
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header>
        <Navbar user={user} />
      </header>

      <main aria-label="Main Content" className="flex-1 p-6">
        {children}
      </main>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;
