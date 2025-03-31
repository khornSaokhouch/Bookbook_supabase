"use client";

import React, { ReactNode, useEffect, useState, useCallback } from "react";
import SidebarNav from "../../components/SidebarNav";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient"; // Supabase client
import { User } from "@/app/types"; // Import shared User type

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

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
        image_url: data?.image_url || null,
      };
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      } else {
        console.error("User not found:", error);
        router.push("/login"); // Redirect if user not authenticated
      }
    };

    fetchUser();
  }, [router, fetchUserProfile]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header>
        <Navbar user={user} />
      </header>

      <div className="flex flex-1">
        {/* Sidebar Toggle Button for Mobile */}
        <button
          className="absolute top-4 left-4 md:hidden p-2 shadow-md rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 p-10 py-20 shadow-md transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:w-72`}
        >
          <SidebarNav user={user} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:p-10">{children}</main>
      </div>

      {/* Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;
