// app/admin/[id]/profile/edit/page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react"; // Added useCallback for consistency
import { supabase } from "@/app/lib/supabaseClient"; // Adjust path as per your project structure
import Image from "next/image";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  Save,
  Sparkles,
  Heart,
  Edit3,
  ImageIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/app/context/AlertContext"; // <--- NEW: Import useAlert

interface SupabaseUser {
  id: string;
  email: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    rotate: [-1, 1, -1],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function EditProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const { showAlert } = useAlert(); // <--- NEW: Initialize useAlert

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch current authenticated user
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user && !error) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? "unknown@example.com",
        });
      }
    }
    getUser();
  }, []);

  // Fetch user profile data when user is available
  const fetchProfile = useCallback(async () => {
    if (!user) return; // Only fetch if user is authenticated

    setLoading(true);
    // Removed setError(null) here because useAlert will handle transient messages

    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("user_name, about_me, image_url")
        .eq("user_id", user.id) // Use authenticated user's ID
        .single();

      if (!fetchError && data) {
        setName(data.user_name || "");
        setAboutMe(data.about_me || "");
        if (data.image_url) {
          const { data: publicData } = supabase.storage
            .from("image-user")
            .getPublicUrl(data.image_url);
          setPreview(publicData.publicUrl);
        } else {
          setPreview(null);
        }
      } else if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        showAlert('error'); // <--- NEW: Use showAlert for errors
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      showAlert('error'); // <--- NEW: Use showAlert for unexpected errors
    } finally {
      setLoading(false);
    }
  }, [user, showAlert]); // Dependency array: re-run if user or showAlert changes

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Depend on the memoized fetchProfile function

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      // No need to clear local error state if useAlert manages global alerts
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      // No need to clear local error state
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("image-user")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    // Removed setError(null) here

    try {
      let avatar_url: string | null = null;
      if (image) {
        avatar_url = await uploadAvatar(image);
      }

      const updates = {
        user_id: user.id,
        user_name: name,
        email: user.email,
        about_me: aboutMe,
        ...(avatar_url && { image_url: avatar_url }),
      };

      const { error: updateError } = await supabase.from("users").upsert(updates);
      if (updateError) {
        console.error("Error updating profile:", updateError);
        showAlert('error'); // <--- NEW: Use showAlert for update errors
      } else {
        setShowConfirmation(true); // <-- Keep ConfirmationModal for success message
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Unexpected error:", err);
        showAlert('error'); // <--- NEW: Use showAlert for general errors
      } else {
        console.error("Unknown error:", err);
        showAlert('error'); // <--- NEW: Use showAlert for unknown errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    showAlert('Edit Profile Success'); // <--- NEW: Show success alert after modal closes
    router.push(`/admin/${id}/profile`); // Redirect after modal closes, using the ID from useParams
  };

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl shadow-xl">
          <User className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Please log in to edit your profile ✨
          </p>
        </div>
      </div>
    );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating background elements */}
      <motion.div
        className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 right-10 w-12 h-12 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full opacity-20"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
      />

      <div className="container max-w-4xl mx-auto py-10 px-4 relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-full shadow-lg">
              <Edit3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Edit Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Let is make your profile shine even brighter! ✨
          </p>
        </motion.div>

        <motion.div
          className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          variants={itemVariants}
        >
          {/* Removed the local error message display as useAlert will handle it globally */}
          {/* Removed the local success message display as ConfirmationModal and useAlert handle it */}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Profile Picture Section */}
            <motion.div variants={itemVariants}>
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-500" />
                Your Amazing Photo
              </label>
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="relative">
                  {preview ? (
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt="Preview"
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                          unoptimized={preview.startsWith("blob:")}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-32 h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 rounded-full flex items-center justify-center border-4 border-purple-200 dark:border-purple-700 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <User className="h-12 w-12 text-white" />
                    </motion.div>
                  )}
                </div>

                <div
                  className={`flex-1 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                    isDragOver
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <ImageIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Drag & drop your photo here, or{" "}
                    <label className="text-purple-500 hover:text-purple-600 cursor-pointer font-medium underline">
                      browse files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-purple-500" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.email || ''} // Handle potential null user
                  disabled
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed text-lg"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your email is verified and secure 🔒
              </p>
            </motion.div>

            {/* Name Field */}
            <motion.div variants={itemVariants}>
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-500" />
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="What should we call you?"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
              </div>
            </motion.div>

            {/* About Me Field */}
            <motion.div variants={itemVariants}>
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pink-500" />
                About Me
              </label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={5}
                placeholder="Tell the world your amazing story! What makes you unique? What are your passions? ✨"
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg resize-none"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Share what makes you awesome! This helps others connect with you 💫
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-6">
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving your awesomeness...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                    <Sparkles className="h-5 w-5 ml-2" />
                  </div>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleCloseConfirmation} // Here, onConfirm also triggers the close and redirect
        title="🎉 Profile Updated!"
        message="Your profile looks absolutely amazing! All changes have been saved successfully. You'll be redirected shortly to view your updated profile."
      />
    </motion.div>
  );
}