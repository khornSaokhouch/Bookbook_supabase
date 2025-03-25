"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmationModal from "../../../components/ConfirmationModal";

// Function to fetch user data by ID
export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, user_name, email, about_me, image_url")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  if (data?.image_url) {
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("profileuser")
      .createSignedUrl(data.image_url, 60);

    if (urlError) {
      console.warn("Failed to generate signed URL:", urlError.message);
    } else if (signedUrlData?.signedUrl) {
      data.image_url = signedUrlData.signedUrl;
    }
  }

  return data;
};

// Function to update the user
const updateUser = async (userId: string, updatedUser: any) => {
  const { data, error } = await supabase
    .from("users")
    .update(updatedUser)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error updating user:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, message: "Profile updated successfully" };
};

const EditProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Added success message state
  const router = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const aboutMeRef = useRef<HTMLTextAreaElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);

  const userId = "6";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fetchedUser = await getUserById(userId);
        setUser(fetchedUser);
      } catch (error) {
        setError("Error fetching user data");
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameRef.current?.value || !emailRef.current?.value) {
      alert("Name and Email are required!");
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    setError(null);

    const updatedUser = {
      user_name: nameRef.current?.value,
      email: emailRef.current?.value,
      about_me: aboutMeRef.current?.value,
      image_url: imageUrlRef.current?.value,
    };

    try {
      const result = await updateUser(userId, updatedUser);

      if (result.success) {
        setSuccessMessage(result.message); // Set success message
        setUser({ ...user, ...updatedUser });
      } else {
        setError(result.error || "An error occurred while updating profile.");
      }
    } catch (error) {
      setError("An error occurred while updating profile.");
      console.error(error);
    }

    setLoading(false);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseAlert = () => {
    setSuccessMessage(null); // Close success alert
  };

  if (!user) {
    return (
        <div className="container mx-auto px-10 py-10">
          <h1 className="text-3xl font-bold mb-6 ml-[100px]">Loading...</h1>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-10 py-10">
        <h1 className="text-3xl font-bold mb-6 ml-[100px]">Edit Profile</h1>
        
        {/* Success Alert */}
        {successMessage && (
          <div className="flex justify-between items-center bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">
            <span>{successMessage}</span>
            <button onClick={handleCloseAlert} className="text-xl font-semibold">&times;</button>
          </div>
        )}

        <div className="flex justify-center space-x-8">
          <div className="w-3/4 bg-white rounded-lg shadow-lg flex flex-col p-6">
            <div className="flex items-center p-6">
              <img
                src={user?.image_url || "/default-profile.png"}
                alt="User Avatar"
                className="rounded-full border-4 border-blue-500 w-24 h-24 object-cover shadow-md"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{user?.user_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-4 px-6">Edit Profile</h2>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              {error && <div className="text-red-500 mb-4">{error}</div>}

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  ref={nameRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue={user?.user_name || ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  ref={emailRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue={user?.email || ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">About Me</label>
                <textarea
                  ref={aboutMeRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                  rows={4}
                  defaultValue={user?.about_me || ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Profile Image URL</label>
                <input
                  type="text"
                  ref={imageUrlRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL"
                  defaultValue={user?.image_url || ""}
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition duration-200"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmUpdate}
        />
      </div>
  );
};

export default EditProfile;
