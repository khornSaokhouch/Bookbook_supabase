"use client";

import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient"; // Import supabase client

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
console.log("Session data:", session);

        if (!session?.user) {
          console.warn("No user session found.");
          // Handle the case where there's no user session
          setLoading(false);
          return;
        }

        // Fetch the user's profile from the 'users' table
        const { data, error } = await supabase
          .from("users")
          .select("user_name, image_url")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          setError("Failed to load user profile.");
        } else if (data) {
          setUserName(data.user_name);
          setUserImageUrl(data.image_url);
        } else {
          console.warn("User profile not found.");
        }
      } catch (err: any) {
        console.error("Unexpected error fetching user profile:", err);
        setError("An unexpected error occurred while loading user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-md">
        <Header userName={userName} userImageUrl={userImageUrl} loading={loading} />
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        {children}
      </main>

      <footer className="bg-gray-100 py-4 mt-8">
        <Footer />
      </footer>
    </div>
  );
};

export default UserLayout;