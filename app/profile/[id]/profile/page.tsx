"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Mail,
  Heart,
  Camera,
  Edit3,
  Calendar,
  Star,
  Sparkles,
  Coffee,
} from "lucide-react";

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
  created_at: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
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

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    rotate: [-1, 1, -1],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const bucketName = "image-user";
  const [recipeCount, setRecipeCount] = useState<number>(0);
  const [savedRecipeCount, setSavedRecipeCount] = useState<number>(0);

  const getRecipeCount = async (userId: string) => {
    const { count, error } = await supabase
      .from("recipe") // your table name is `recipe`
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId); // filter by user_id (uuid)

    if (error) {
      console.error("Error fetching recipe count:", error);
      return 0;
    }
    return count ?? 0;
  };

  const getSavedRecipeCount = async (userId: string) => {
    const { count, error } = await supabase
      .from("saved_recipes") // your saved_recipes table
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId); // filter by user_id

    if (error) {
      console.error("Error fetching saved recipes count:", error);
      return 0;
    }

    return count ?? 0;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // Fetch user profile
      const { data, error: userError } = await supabase
        .from("users")
        .select("user_id, user_name, email, about_me, image_url, created_at")
        .eq("user_id", userId)
        .single();

      if (userError || !data) {
        setError("User not found");
        setLoading(false);
        return;
      }

      setUser(data as UserProfile);

      // Fetch counts
      const recipeCount = await getRecipeCount(userId);
      setRecipeCount(recipeCount);

      const savedCount = await getSavedRecipeCount(userId);
      setSavedRecipeCount(savedCount);

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const generatePublicUrl = (path: string | null | undefined) => {
    if (!path) return "/default-avatar.png";
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${path}`;
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Loading your amazing profile...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ✨ Getting everything ready for you
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900/20 flex items-center justify-center">
        <motion.div
          className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200 dark:border-red-800 max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Oops!
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            User not found
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = generatePublicUrl(user.image_url);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 py-8 px-4 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[15%] left-[10%] w-32 h-32 bg-violet-200/30 dark:bg-violet-700/10 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-pink-200/30 dark:bg-pink-700/10 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute top-[60%] left-[5%] w-24 h-24 bg-indigo-200/30 dark:bg-indigo-700/10 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-violet-200 dark:border-violet-700 mb-4">
            <Sparkles className="h-4 w-4 text-violet-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Profile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome back! 👋
          </h1>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          variants={itemVariants}
        >
          {/* Profile Header with Gradient */}
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 p-8 pb-20 relative">
            <div className="absolute top-4 right-4">
              <motion.button
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  router.push(`/profile/${user.user_id}/edit-profile`)
                }
              >
                <Edit3 className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt="Profile Image"
                    width={120}
                    height={120}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover cursor-pointer"
                    onClick={toggleModal}
                  />
                  <motion.button
                    className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleModal}
                  >
                    <Camera className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              </div>

              <div className="flex-1 text-white">
                <motion.h2
                  className="text-2xl sm:text-3xl font-bold mb-2 flex items-center"
                  variants={itemVariants}
                >
                  {user.user_name}
                  <Star className="h-5 w-5 text-yellow-300 ml-2" />
                </motion.h2>
                <motion.div
                  className="flex items-center text-white/80 mb-3"
                  variants={itemVariants}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </motion.div>
                <motion.div
                  className="flex items-center space-x-4 text-sm text-white/70"
                  variants={itemVariants}
                >
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(user.created_at).toLocaleDateString("en-GB")}
                  </div>

                  {/* <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Worldwide
                  </div> */}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 -mt-12 relative">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <Heart className="h-5 w-5 text-pink-500 mr-2" />
                  About Me
                </h3>
              </div>

              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 p-6 rounded-xl border border-violet-100 dark:border-violet-800/50">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {user.about_me || (
                    <span className="text-gray-500 dark:text-gray-400 italic">
                      ✨ Share something interesting about yourself! Click the
                      edit button to add your story.
                    </span>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
              variants={itemVariants}
            >
              <motion.div
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800"
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg mr-3">
                    <Coffee className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recipes Created
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {recipeCount}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800"
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                    <Heart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Recipes Saved
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {savedRecipeCount}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* <motion.div
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800"
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Average Rating
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      4.8
                    </p>
                  </div>
                </div>
              </motion.div> */}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Profile Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProfileImageModal imageUrl={imageUrl} onClose={toggleModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
