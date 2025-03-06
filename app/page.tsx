"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient"; // Adjust path as needed


// types/user.ts
export interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string;
}

interface HomeProps {}

export default function Home({}: HomeProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: session, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ Error fetching session:", sessionError.message);
          setError("Failed to fetch session.");
          return;
        }

        const userId = session?.session?.user?.id;
        if (!userId) {
          console.warn("⚠️ No user logged in.");
          setError("No user logged in.");
          return;
        }

        // Fetch user profile
        const profile = await getUserById(userId);
        if (profile) {
          setUserProfile(profile);
        } else {
          setError("User profile not found.");
        }
      } catch (error) {
        console.error("❌ Unexpected error:", error);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {userProfile ? (
        <div>
          <h1>Welcome, {userProfile.user_name}!</h1>
          <p>About me: {userProfile.about_me}</p>
          <p>Email: {userProfile.email}</p>
          {userProfile.image_url && (
            <img
              src={userProfile.image_url}
              alt="Profile Picture"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
              loading="lazy"
            />
          )}
        </div>
      ) : (
        <p>No profile information available.</p>
      )}
    </div>
  );
}

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  console.log("🔍 Fetching user data for ID:", userId);

  const { data, error } = await supabase
    .from("users")
    .select("user_id, user_name, email, about_me, image_url")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("❌ Error fetching user:", error.message);
    return null;
  }

  if (!data) {
    console.log("⚠️ User not found for ID:", userId);
    return null;
  }

  if (data.image_url) {
    try {
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("profile_images") // Ensure correct bucket name
        .createSignedUrl(data.image_url, 60);

      if (urlError) {
        console.error("❌ Error generating signed URL:", urlError.message);
      } else if (signedUrlData?.signedUrl) {
        data.image_url = signedUrlData.signedUrl;
      }
    } catch (signedUrlError) {
      console.error("❌ Error generating signed URL:", signedUrlError);
    }
  }

  console.log("✅ User fetched:", data);
  return data as UserProfile;
};
