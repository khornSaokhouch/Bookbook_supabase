"use client"; // Mark this as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";
import dynamic from "next/dynamic"; // Import dynamic for SSR control
import Image from "next/image"; // ✅ at the top

// Dynamically import ProfileImageModal with no SSR
const ProfileImageModal = dynamic(
  () => import("../../../components/ProfileImageModal"),
  { ssr: false }
);

type UserProfile = {
  user_id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string | null;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      delayChildren: 0.3,
      staggerChildren: 0.2,
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
    },
  },
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const router = useRouter();
  const bucketName = "image-user"; // Explicit bucket name

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

        setUser(data as UserProfile);
      } catch (err: unknown) {
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

  // Function to generate public image URL
  const generatePublicUrl = (path: string | null | undefined) => {
    if (!path) return "/default-avatar.png";
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${path}`;
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="mt-4 text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!user) {
    return <div className="text-red-500 text-center">User not found.</div>;
  }

  const imageUrl = generatePublicUrl(user.image_url);

  return (
    <motion.div
      className="container mx-auto py-10 px-6 sm:px-12 lg:px-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-center">
        <motion.div
          className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-8 space-y-8">
            <div className="flex items-center space-x-6">
              {/* Profile Image with Modal */}
              <div className="relative">
                <Image
                  src={imageUrl}
                  alt="Profile Image"
                  width={128} // or whatever size you want
                  height={128}
                  className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg object-cover cursor-pointer"
                  onClick={toggleModal}
                />
              </div>

              <div className="flex-1">
                <motion.h1
                  className="text-3xl font-bold text-gray-800 dark:text-gray-100"
                  variants={itemVariants}
                >
                  {user.user_name}
                </motion.h1>
                <motion.p
                  className="text-gray-600 dark:text-gray-300"
                  variants={itemVariants}
                >
                  {user.email}
                </motion.p>
              </div>
            </div>

            <motion.div className="mt-8" variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                About Me
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {user.about_me || "No information available."}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Profile Image Modal */}
      {isModalOpen && (
        <ProfileImageModal
          imageUrl={imageUrl}
          onClose={toggleModal} // Close the modal on click outside or close button
        />
      )}
    </motion.div>
  );
}
