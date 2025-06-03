"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@/app/types";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BannerSwiper from "@/app/components/BannerSwiper";
import Popular from "@/app/components/Popular";
import NewPost from "@/app/components/NewPost";
import RecipeoftheWeek from "@/app/components/RecipeoftheWeek";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(",") || [];
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      const currentUser = data?.session?.user;
  
      if (error) {
        console.error("Auth error:", error);
        return;
      }
  
      if (!currentUser) {
        // Guest — allow access
        return;
      }
  
      if (adminIds.includes(currentUser.id)) {
        // ❌ Admin user — sign out + redirect to login
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }
  
      // ✅ Normal user — fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("user_name, email, image_url")
        .eq("user_id", currentUser.id)
        .single();
  
      if (profileError) {
        console.warn("No profile found:", profileError);
        return;
      }
  
      setUser({
        user_id: currentUser.id,
        user_name: profileData.user_name || "User",
        email: profileData.email || "",
        image_url: profileData.image_url || null,
      });
    };
  
    checkUser();
  }, [router]);
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar user={user} />
      <div className="w-full">
        <BannerSwiper />
      </div>
      <main className="container mx-auto px-4 py-6">
        <section>
          <NewPost />
        </section>
        <section className="mt-8 mb-4">
          <RecipeoftheWeek />
        </section>
        <section>
          <Popular />
        </section>
      </main>
      <Footer />
    </main>
  );
}
