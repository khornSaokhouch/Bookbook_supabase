"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import ConfirmationModal from "../../../components/ConfirmationModal"; // Import ConfirmationModal
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface SupabaseUser {
  id: string;
  email: string;
}

export default function EditProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user && !error) {
        setUser({ id: data.user.id, email: data.user.email ?? "unknown@example.com" });
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("users")
          .select("user_name, about_me, image_url")
          .eq("user_id", user?.id) // Add null check for user
          .single();

        if (!error && data) {
          setName(data.user_name || "");
          setAboutMe(data.about_me || "");
          if (data.image_url) {
            const { data: publicData } = supabase.storage
              .from("image-user")
              .getPublicUrl(data.image_url);
            setPreview(publicData.publicUrl);
          }
        } else if (error) {
          console.error("Error fetching profile:", error);
          setError(`Error fetching profile: ${error.message}`);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
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
    setError(null);

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

      const { error } = await supabase.from("users").upsert(updates);
      if (error) {
        console.error("Error updating profile:", error);
        setError(`Failed to update profile: ${error.message}`);
      } else {
        setShowConfirmation(true); // Show success message
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Unexpected error:", err);
        setError(`Error: ${err.message}`);
      } else {
        console.error("Unknown error:", err);
        setError("An unknown error occurred.");
      }
    }

    setLoading(false);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
  };

  if (!user) return <p className="text-center mt-10 text-gray-600 dark:text-gray-400">Please log in to edit your profile.</p>;

  return (
    <motion.div
      className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white"
        variants={formVariants}
      >
        Edit Profile
      </motion.h1>

      {error && (
        <motion.div
          className="bg-red-100 text-red-600 p-3 rounded-md mb-4 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </motion.div>
      )}

      <motion.form onSubmit={handleSubmit} className="space-y-5" variants={formVariants}>
        {/* Email (Read-only) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
          <input
            type="text"
            value={user.email}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* About Me */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">About Me</label>
          <textarea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholder="Tell us something about yourself..."
          />
        </div>

        {/* Image Preview and Upload */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Profile Picture</label>
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={96}
              height={96}
              className="rounded-full object-cover mb-2"
              unoptimized={preview.startsWith("blob:")}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mb-2 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300">No image</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </motion.form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleCloseConfirmation} // If you have a confirm action, pass it here
        title="Profile Updated!"
        message="Your profile has been updated successfully."
      />
    </motion.div>
  );
}