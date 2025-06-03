"use client";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@/app/types";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BannerSwiper from "@/app/components/BannerSwiper";
import Popular from "@/app/components/Popular";
import NewPost from "@/app/components/NewPost";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

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
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(profile);
        } else {
          console.warn("Logged-in user has no profile data.");
        }
      } else {
        // No user logged in — that's fine
        setUser(null);
      }
    };

    fetchUser();
  }, [fetchUserProfile]);

  return (
<main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <Navbar user={user} />
  <div className="w-full ">
    <BannerSwiper />
  </div>
  <main className="container mx-auto px-4 py-6">
    <section>
      <NewPost />
    </section>
    <section>
      <Popular />
    </section>
  </main>
  <Footer />
</main>

  );
}
