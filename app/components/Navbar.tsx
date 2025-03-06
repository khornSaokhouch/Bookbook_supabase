"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

interface User {
  user_id: string;
  image_url?: string;
}

interface UserProfile {
    user_id: string;
    user_name: string;
    email: string;
    about_me: string;
    image_url?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("/default-avatar.png");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State for user profile data


  // Fetch the current user and session
  useEffect(() => {
    const fetchUser = async () => {
      // Check if the user is logged in by fetching the current session
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Error fetching session:", sessionError.message);
        return;
      }

      // If the session exists and user is authenticated
      if (session?.user_id) {
        setUser({ user_id: session.user.id });
      } else {
        console.log("🚨 No active session. Please log in.");
      }
    };

    fetchUser();
  }, []);

  // Fetch the user profile data once the user ID is available
  useEffect(() => {
    if (!user?.user_id) {
      console.log("🚨 No user ID found, skipping fetch.");
      return;
      }

      console.log("🔄 Fetching profile for user:", user.user_id);

      const fetchUserData = async () => {
        try {
          const userData = await getUserById(user.user_id);
          console.log("🔍 User Data:", userData);

          if (userData) {
            setUserProfile(userData);  // Set the user profile state
          }

          if (userData?.image_url) {
            // Fetch signed URL for profile image
            const { data: signedUrlData, error: urlError } = await supabase.storage
              .from("image_url") // Replace with your storage bucket name
              .createSignedUrl(userData.image_url, 60); // 60 seconds expiry

            if (urlError) {
              console.error("❌ Error generating signed URL:", urlError.message);
              setImageUrl("/default-avatar.png"); // Fallback image
            } else if (signedUrlData?.signedUrl) {
              setImageUrl(signedUrlData.signedUrl);
            }
          } else {
            console.log("⚠️ No Profile Image Found, Using Default");
            setImageUrl("/default-avatar.png");
          }
        } catch (error) {
          console.error("❌ Error Fetching User Data:", error);
          setImageUrl("/default-avatar.png"); // Fallback in case of error
        }
      };

      fetchUserData();
    }, [user?.user_id]);

  return (
    <div>
      <nav className="shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[110px]">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/logo.png"
                  alt="CookBook Logo"
                  className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] object-contain"
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-10 text-lg">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
              <Link href="/user/recipe" className="text-gray-600 hover:text-blue-600 font-medium">Recipe</Link>
              <Link href="/user/about-us" className="text-gray-600 hover:text-blue-600 font-medium">About Us</Link>
            </div>

            {/* Right Section (Search, Add Recipe, Profile) */}
            <div className="flex items-center space-x-20">
              {/* Search Bar */}
              <input type="text" className="border border-gray-500 rounded-full pl-4 pr-10 py-3 text-sm" placeholder="Search by name" />

              {/* Add Recipe Link */}
              <Link href={"/add-recipe"} className="text-lg font-medium text-blue-600 hover:text-blue-800">
                + Add a Recipe
              </Link>

              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link href="/profile/save-recipe" className="hover:text-gray-700">
                      <span className="material-icons text-gray-600 w-5 h-5">bookmark_border</span>
                    </Link>
                      <Link href={`/profile/${user.user_id}`}>
                      <img
                        src={imageUrl || "/default-avatar.png"} // Fallback to default if no image is found
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                      />
                      </Link>
                  </>
                ) : (
                  <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg hover:bg-blue-600 transition">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="text-lg">
        <ul className="space-x-10 ml-[180px] py-4">
          <Link href="/user/event" className="text-gray-600 hover:text-blue-600 font-medium">Event</Link>
          <Link href="/user/popular" className="text-gray-600 hover:text-blue-600 font-medium">Popular</Link>
          <Link href="/soup" className="text-gray-600 hover:text-blue-600 font-medium">Soup</Link>
          <Link href="/stir-frieds" className="text-gray-600 hover:text-blue-600 font-medium">Stir Frieds</Link>
          <Link href="/occasion" className="text-gray-600 hover:text-blue-600 font-medium">Occasions</Link>
          <Link href="/drinks" className="text-gray-600 hover:text-blue-600 font-medium">Drinks</Link>
          <Link href="/dessert" className="text-gray-600 hover:text-blue-600 font-medium">Dessert</Link>
        </ul>
      </div>
    </div>
  );
}

// Function to fetch user data by user_id
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  console.log("🔍 Fetching user data for ID:", userId);

  const { data, error } = await supabase
    .from("users")
    .select("user_id, user_name, email, about_me, image_url") // Select fields you need
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

  if (data?.image_url) {
      // Generate signed URL for the profile image
      try {
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("image_url") // Replace with your bucket name
          .createSignedUrl(data.image_url, 60); // 60 seconds expiry

        if (urlError) {
          console.error("❌ Error generating signed URL:", urlError.message);
          // Consider setting a default image_url here if signed URL generation fails
        } else if (signedUrlData?.signedUrl) {
          data.image_url = signedUrlData.signedUrl;
        }
      } catch (signedUrlError) {
        console.error("❌ Error generating signed URL:", signedUrlError);
        // Handle error generating signed URL, e.g., set default image_url
      }
    }

  console.log("✅ User fetched:", data);
  return data as UserProfile;
};