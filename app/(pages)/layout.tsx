"use client";

import React, { ReactNode, useEffect, useState, useCallback } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabaseClient"; // Ensure correct import path
import { User } from "@/app/types"; // Import shared User type

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Prevents flashing content

  /** Fetch user profile data (user_name and image_url) by user_id */
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name, email, image_url")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return {
        user_id: userId,
        user_name: data?.user_name || "User",
        email: data?.email || "",
        image_url: data?.image_url || "/default-avatar.png", // Fallback to default image
      };
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          const profile = await fetchUserProfile(sessionUser.id);
          setUser(profile);
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
      } finally {
        setIsLoading(false); // Allow unauthenticated users to view the page
      }
    };

    fetchUser();
  }, [fetchUserProfile]);

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
