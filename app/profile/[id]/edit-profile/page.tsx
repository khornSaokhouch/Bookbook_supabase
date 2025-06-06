"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const aboutMeRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;

        const { data, error } = await supabase
          .from("users")
          .select("user_id, user_name, email, about_me, image_url")
          .eq("user_id", userId)
          .single();

        if (error) {
          setError("Failed to load user data.");
        } else {
          const fetchedUser: UserType = {
            id: data.user_id,
            user_name: data.user_name,
            email: data.email,
            about_me: data.about_me,
            image_url: data.image_url || null,
          };
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error("Error during fetchUserData:", error);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const validFileTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!validFileTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, GIF).");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size must be less than 5MB.");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameRef.current?.value || !emailRef.current?.value) {
      setError("Name and Email are required!");
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    setError(null);

    let imagePath: string | null = null;

    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("image-user")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          setError("Failed to upload image.");
          setLoading(false);
          setIsModalOpen(false);
          return;
        }

        imagePath = filePath;
      } catch (uploadError: unknown) {
        console.error("Error during image upload:", uploadError);
        setError("Failed to upload image.");
        setLoading(false);
        setIsModalOpen(false);
        return;
      }
    }

    const updatedUser = {
      user_name: nameRef.current?.value,
      email: emailRef.current?.value,
      about_me: aboutMeRef.current?.value,
      ...(imagePath ? { image_url: imagePath } : {}),
    };

    try {
      const result = await updateUser(user?.id || "", updatedUser);

      if (result.success) {
        setSuccessMessage(result.message ?? "Profile updated successfully");
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
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
    setError(null);
  };

  const generateImageUrl = (path: string | null) => {
    if (!path) return "/default-avatar.png";
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-user/${path}`;
  };

  if (loading && !user) {
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

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-800 dark:text-green-300 font-medium">
                    {successMessage}
                  </span>
                </div>
                <button
                  onClick={handleCloseAlert}
                  className="text-green-600 hover:text-green-800 text-xl font-semibold"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-800 dark:text-red-300 font-medium">
                    {error}
                  </span>
                </div>
                <button
                  onClick={handleCloseAlert}
                  className="text-red-600 hover:text-red-800 text-xl font-semibold"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!user ? (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              User not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The user profile could not be loaded.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            variants={itemVariants}
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 p-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    <img
                      src={previewUrl || generateImageUrl(user?.image_url ?? null)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-violet-600 p-1.5 rounded-full">
                    <Camera className="h-3 w-3 text-white" />
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
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    required
                    defaultValue={user?.email || ""}
                    placeholder="Enter your email address"
                  />
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
                  disabled={loading}
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
