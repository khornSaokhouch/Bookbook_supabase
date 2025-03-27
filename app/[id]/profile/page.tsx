"use client"; // Ensures this is client-side only

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import ProfileImageModal from "../../components/ProfileImageModal"; // Import the modal

type UserProfile = {
  user_id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.warn("No session found. Redirecting to login.");
          router.push("/login");
          return;
        }

        const userId = session.user.id;

        // Improved error handling: Fetch the user and check for errors simultaneously.
        const { data, error: userError } = await supabase
          .from("users")
          .select("user_id, user_name, email, about_me, image_url")
          .eq("user_id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
          throw userError;
        }

        if (!data) {
          console.warn("User not found.");
          throw new Error("User profile not found.");
        }

        // **IMPORTANT:** Use the direct storage URL instead of attempting to get a signed URL.
        setUser(data as UserProfile); // Set user directly after fetching.
      } catch (err: unknown) {
        // Use "unknown" for the error type
        if (err instanceof Error) {
          console.error("Error fetching user:", err.message);
          setError("There was an error loading your profile.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="mt-4">Loading your profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // User data is not found
  if (!user) {
    return <div className="text-red-500 text-center">User not found.</div>;
  }

  // Success state
  const imageUrl = user.image_url
    ? supabase.storage.from("image-user").getPublicUrl(user.image_url).data
        .publicUrl
    : "/default-avatar.png";

  return (
    <div className="container mx-auto px-10 py-10">
      <div className="flex justify-center space-x-8">
        <div className="w-3/4 bg-white rounded-lg shadow-lg flex flex-col p-6">
          <div className="flex items-center">
            {/* Pass the imageUrl to the modal component */}
            <ProfileImageModal imageUrl={imageUrl} />
            <div className="ml-4">
              <h1 className="text-2xl font-bold">{user.user_name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-6">About Me</h2>
          <p className="mt-2">{user.about_me || "No information available."}</p>
        </div>
      </div>
    </div>
  );
}
