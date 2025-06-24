// app/your-path/EditProfile.tsx
"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { motion } from "framer-motion";
import {
  Mail,
  Save,
  ArrowLeft,
  Upload,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAlert } from "@/app/context/AlertContext";

type UserType = {
  id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string | null;
};

const updateUser = async (userId: string, updatedUser: Partial<UserType>) => {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const EditProfile = ({ params }: { params: Promise<{ id: string }> }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const aboutMeRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    // Reset loading state when component mounts or params change (e.g., navigating back)
    setLoading(false);
    const fetchUserData = async () => {
      setLoading(true); // Set loading true for data fetch
      try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;

        const { data, error } = await supabase
          .from("users")
          .select("user_id, user_name, email, about_me, image_url")
          .eq("user_id", userId)
          .single();

        if (error) {
          showAlert("Failed to load user data.", "error");
        } else {
          const fetchedUser: UserType = {
            id: data.user_id,
            user_name: data.user_name,
            email: data.email,
            about_me: data.about_me,
            image_url: data.image_url || null,
          };
          setUser(fetchedUser);
          // Set initial preview URL if user has an image
          if (fetchedUser.image_url) {
            setPreviewUrl(generateImageUrl(fetchedUser.image_url));
          }
        }
      } catch (error: unknown) {
        console.error("Error during fetchUserData:", error);
        let errorMessage = "Failed to load user data.";
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMessage += `: ${error}`;
        }
        showAlert(errorMessage, "error");
      } finally {
        setLoading(false); // Ensure loading is false after data fetch attempt
      }
    };

    fetchUserData();
  }, [params, showAlert]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const validFileTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!validFileTypes.includes(file.type)) {
        showAlert("Please upload a valid image file (JPEG, PNG, GIF).", "error");
        setSelectedFile(null); // Clear selected file if invalid
        setPreviewUrl(generateImageUrl(user?.image_url ?? null)); // Revert preview to current user image
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showAlert("File size must be less than 5MB.", "error");
        setSelectedFile(null); // Clear selected file if invalid
        setPreviewUrl(generateImageUrl(user?.image_url ?? null)); // Revert preview to current user image
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameRef.current?.value || !emailRef.current?.value) {
      showAlert("Name and Email are required!", "error");
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true); // Start loading for the update process

    let imagePath: string | null = null;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("image-user")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false, // Set to true if you want to replace existing files easily
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          showAlert("Failed to upload image.", "error");
          // Do not proceed with profile update if image upload fails
          setLoading(false);
          setIsModalOpen(false);
          return;
        }
        imagePath = filePath;

        // If a new image is uploaded, we might want to remove the old one
        // This is a more advanced step and requires knowing the old path.
        // For simplicity, we'll just update the image_url in the user table.
      }

      const updatedUser = {
        user_name: nameRef.current?.value,
        email: emailRef.current?.value,
        about_me: aboutMeRef.current?.value,
        ...(imagePath ? { image_url: imagePath } : {}), // Only add image_url if a new image was uploaded
      };

      const result = await updateUser(user?.id || "", updatedUser);

      if (result.success) {
        showAlert(result.message ?? "Profile updated successfully", "success");
        // Update local user state with new image URL immediately for preview consistency
        if (imagePath && user) {
            setUser(prevUser => ({
                ...(prevUser as UserType), // Cast prevUser to UserType for safe spreading
                image_url: imagePath,
            }));
            // Also update previewUrl directly if you want it to reflect the *new* uploaded image
            setPreviewUrl(generateImageUrl(imagePath));
        }

        router.push(`/profile/${user?.id}/profile`); // Navigate immediately
      } else {
        showAlert(result.error || "An error occurred while updating profile.", "error");
      }
    } catch (error: unknown) {
      console.error("Error during profile update or image upload:", error); // Consolidated error log
      let errorMessage = "An unexpected error occurred during profile update.";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
      setIsModalOpen(false); // Always close modal
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const generateImageUrl = (path: string | null) => {
    if (!path) return "/default-avatar.png";
    // Ensure this matches your Supabase storage URL structure
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-user/${path}`;
  };

  if (loading && !user) { // This check should only apply to initial data fetch loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Loading your profile...
          </p>
        </motion.div>
      </div>
    );
  }

  // If user data could not be loaded, display a "not found" message
  if (!user && !loading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 py-8 px-4 sm:px-6 flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-violet-200 dark:border-violet-700 mb-4 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Back
            </span>
          </button>
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            User not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The user profile could not be loaded or does not exist.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 py-8 px-4 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-violet-200 dark:border-violet-700 mb-4 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Back
            </span>
          </button>

          <div className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-violet-200 dark:border-violet-700 mb-4">
            <Sparkles className="h-4 w-4 text-violet-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Edit Profile
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Update Your Profile ✨
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Make your profile shine and tell your story!
          </p>
        </motion.div>

        {/* This `user` check is now redundant because it's handled above */}
        {user && ( // Only render the form if user data is available
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            variants={itemVariants}
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 p-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    <Image
                      src={
                        previewUrl || generateImageUrl(user?.image_url ?? null)
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                      priority // Consider adding priority for profile images
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{user?.user_name}</h2>
                  <p className="text-white/80 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center px-4 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-xl hover:border-violet-400 dark:hover:border-violet-600 transition-all duration-200 cursor-pointer">
                        <Upload className="h-5 w-5 text-violet-500 mr-3" />
                        <span className="text-violet-700 dark:text-violet-300 font-medium">
                          {selectedFile
                            ? selectedFile.name
                            : "Choose new image"}
                        </span>
                      </div>
                    </div>
                    {selectedFile && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Image selected
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Name Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    ref={nameRef}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    required
                    defaultValue={user?.user_name || ""}
                    placeholder="Enter your full name"
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    ref={emailRef}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-not-allowed focus:outline-none transition-all duration-200"
                    required
                    defaultValue={user?.email || ""}
                    placeholder="Enter your email address"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed.
                  </p>
                </motion.div>

                {/* About Me Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    About Me
                  </label>
                  <textarea
                    ref={aboutMeRef}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself, your cooking journey, favorite cuisines..."
                    rows={4}
                    defaultValue={user?.about_me || ""}
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading} // Button disabled when loading
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Updating Profile...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Save className="h-5 w-5 mr-3" />
                      Update Profile
                    </div>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmUpdate}
        title="Confirm Profile Update"
        message="Are you sure you want to update your profile with these changes?"
      />
    </motion.div>
  );
};

export default EditProfile;