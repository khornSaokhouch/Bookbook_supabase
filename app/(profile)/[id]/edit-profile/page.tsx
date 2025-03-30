"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  id: string; // Ensure ID is a string (UUID)
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string | null;
};

// Function to fetch user data by ID (no changes needed here)
export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, user_name, email, about_me, image_url")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  if (!data) {
    console.warn("User not found with ID:", userId);
    return null; // Or handle the case where the user doesn't exist
  }

  // Map the database response to your User type
  const user: User = {
    id: data.user_id,
    user_name: data.user_name,
    email: data.email,
    about_me: data.about_me,
    image_url: data.image_url || null, // Handle null image_url
  };

  return user;
};

// Function to update the user (no changes needed here)
const updateUser = async (userId: string, updatedUser: Partial<User>) => {
  const { error } = await supabase
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const aboutMeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error
  
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
  
        if (authError || !authUser) {
          console.error(
            "Error getting authenticated user:",
            authError?.message
          );
          setError("Not authenticated. Please log in.");
          return;
        }
  
        const fetchedUser = await getUserById(authUser.id); // Await the result
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          setError("User profile not found.");
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error("Error during fetchUserData:", e.message);
          setError("Failed to load user data.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [router]); // Dependency on router
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

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
  
    let imagePath: string | null = null;
  
    if (selectedFile) {
      // 1. Upload the image
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`; // Ensure unique filename
        const filePath = `avatars/${fileName}`; // Path within Supabase Storage
  
        const { error: uploadError } = await supabase.storage
          .from("image-user") // Use the correct bucket name!
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false, // Set to true to overwrite existing files
          });
  
        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          setError("Failed to upload image.");
          setLoading(false);
          setIsModalOpen(false);
          return;
        }
  
        imagePath = filePath; // Set the image path to the Supabase storage path
      } catch (uploadError: Error) {
        console.error("Error during image upload:", uploadError.message);
        setError("Failed to upload image.");
        setLoading(false);
        setIsModalOpen(false);
        return;
      }
    }
  
    // Prepare the data to be sent.
    const updatedUser = {
      user_name: nameRef.current?.value,
      email: emailRef.current?.value,
      about_me: aboutMeRef.current?.value,
      ...(imagePath ? { image_url: imagePath } : {}), // Only update if there's a new image path
    };
  
    try {
      const result = await updateUser(user.id, updatedUser); // Use user.id (UUID) instead of userId
  
      if (result.success) {
        setSuccessMessage(result.message);
        const updatedProfile = await getUserById(user.id);
        if (updatedProfile) {
          setUser(updatedProfile);
        } else {
          console.warn("Could not reload profile after update.");
          setError("Profile updated, but could not reload.");
        }
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
    setSuccessMessage(null);
  };

  const pageTransitions = {
    initial: { opacity: 0, x: -30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 30, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const profileCardTransitions = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
    },
  };

  const avatarTransitions = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.4 },
    },
  };

  const formElementTransitions = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.6,
      },
    },
  };

  const formFieldTransitions = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const buttonTransitions = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="container mx-auto px-10 py-10"
      variants={pageTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.h1
        className="text-3xl font-bold mb-6 ml-[100px]"
        variants={formElementTransitions}
      >
        Edit Profile
      </motion.h1>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="flex justify-between items-center bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6"
            variants={formElementTransitions}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <span>{successMessage}</span>
            <button
              onClick={handleCloseAlert}
              className="text-xl font-semibold"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center items-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : !user ? (
        <h1 className="text-3xl font-bold mb-6 ml-[100px]">User not found</h1>
      ) : (
        <motion.div
          className="flex justify-center space-x-8"
          variants={profileCardTransitions}
        >
          <div className="w-3/4 bg-white rounded-lg shadow-lg flex flex-col p-6">
            <div className="flex items-center p-6">
            <motion.img
    src={
      user?.image_url
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-user/${user.image_url}`
        : "/default-avatar.png"
    }
    alt="User Avatar"
    className="w-24 h-24 rounded-full mr-6"
    variants={avatarTransitions}
  />
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{user?.user_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-4 px-6">Edit Profile</h2>

            <motion.form
              onSubmit={handleSubmit}
              className="px-6 py-6 space-y-4"
              variants={formElementTransitions}
            >
              {error && <div className="text-red-500 mb-4">{error}</div>}

              <motion.div className="mb-4" variants={formFieldTransitions}>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  ref={nameRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue={user?.user_name || ""}
                />
              </motion.div>

              <motion.div className="mb-4" variants={formFieldTransitions}>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  ref={emailRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue={user?.email || ""}
                />
              </motion.div>

              <motion.div className="mb-4" variants={formFieldTransitions}>
                <label className="block text-sm font-semibold mb-2">
                  About Me
                </label>
                <textarea
                  ref={aboutMeRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                  rows={4}
                  defaultValue={user?.about_me || ""}
                />
              </motion.div>

              <motion.div className="mb-4" variants={formFieldTransitions}>
                <label className="block text-sm font-semibold mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && <span>Selected: {selectedFile.name}</span>}
              </motion.div>

              <motion.div
                className="flex justify-end mt-4"
                variants={formFieldTransitions}
              >
                <motion.button
                  type="submit"
                  className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition duration-200"
                  disabled={loading}
                  variants={buttonTransitions}
                  whileHover="whileHover"
                  whileTap="whileTap"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </motion.button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmUpdate}
      />
    </motion.div>
  );
};

export default EditProfile;
