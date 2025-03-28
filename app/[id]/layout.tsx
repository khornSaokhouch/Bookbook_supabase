"use client";

import React, { ReactNode, useEffect, useState } from "react";
import SidebarNav from "../components/SidebarNav";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js"; // Supabase client

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          user_id: data.user.id,
          user_name: data.user.user_metadata?.full_name || "User",
          email: data.user.email || "",
          image_url: data.user.user_metadata?.avatar_url || null,
        });
      } else {
        console.error("User not found:", error);
        router.push("/login"); // Redirect if user not authenticated
      }
    };

    fetchUser();
  }, [router]);

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
          <SidebarNav user={user}  />
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
