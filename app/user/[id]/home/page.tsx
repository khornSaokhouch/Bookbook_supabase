"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";  // Make sure this is correctly configured

export default function HomePage() {
  const [user, setUser] = useState<any>(null); // Store user data from cookies
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const router = useRouter();

  const fetchImageUrl = async (userId: string) => {
    try {
      // Assuming user profile images are stored in a bucket named "image-user"
      const filePath = `${userId}-profile.jpg`;  // Dynamically build the file path for the user

      // Generate the signed URL from the "image-user" bucket
      const { data, error } = await supabase.storage
        .from("image-user")  // Correct bucket name "image-user"
        .createSignedUrl(filePath, 60);  // 60 seconds expiration for the signed URL

      if (error) {
        console.error("Error generating signed URL:", error);
        return "/default-avatar.png"; // Fallback image if error occurs
      }

      return data?.signedUrl || "/default-avatar.png"; // Return the signed URL or fallback image
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return "/default-avatar.png"; // Fallback image if error occurs
    }
  };

  useEffect(() => {
    const userCookie = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("user="));
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        setUser(userData);

        // If the user has an image, fetch the signed URL
        if (userData.image) {
          fetchImageUrl(userData.user_id).then((imageUrl) => {
            setUser({ ...userData, image: imageUrl });
          });
        }

        if (userData.role === "Admin") {
          router.push(`/admin/${userData.user_id}/dashboard`);
        }
      } catch (error) {
        console.error("Error parsing user cookie:", error);
        setUser(null);
      }
    } else {
      router.push("/login");
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    document.cookie = "user=; path=/; max-age=0";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      {user ? (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome, {user.name || user.email}!
          </h1>

          <div className="flex justify-center mb-6">
            <img
              src={user.image || "/default-avatar.png"} // Show user image or default
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-2 border-gray-300"
            />
          </div>

          <p className="text-center text-gray-600 text-lg">
            You're logged in as <strong>{user.email}</strong>.
          </p>

          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none transition"
            >
              Log Out
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">User data not found or invalid cookie. Please log in again.</div>
      )}
    </div>
  );
}
