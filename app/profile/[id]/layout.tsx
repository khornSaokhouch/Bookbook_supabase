// src/app/profile/layout.tsx

"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar"; // Adjust path if needed
import Footer from "../../components/Footer"; // Adjust path if needed
import SidebarNav from "../../components/SidebarNav"; // Adjust path if needed
import { Menu } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

type User = {
  user_id: string;
  user_name: string;
  email: string;
  image_url?: string | null;
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          return;
        }
        if (user) {
          const { data, error: userError } = await supabase
            .from("users")
            .select("user_id, user_name, email, about_me, image_url")
            .eq("user_id", user.id)
            .single();

          if (userError) {
            console.error("Error fetching user:", userError);
            return;
          }
          setUserData(data);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchUser();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <Navbar user={userData} />
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
          className={`w-64 bg-white shadow-md p-4 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "transform-none" : "transform -translate-x-full"
          } md:block`}
        >
          <SidebarNav />
        </aside>

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
}