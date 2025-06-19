"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Edit3,
  Camera,
  Heart,
  Sparkles,
  Shield,
  Calendar,
  Globe,
  Award,
  Settings,
  MapPin,
  Briefcase,
  Link,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { useParams, useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function ProfileAdminPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const [createdAt, setCreatedAt] = useState(null);

  // Get authenticated user
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

  // Fetch profile data from 'users' table
  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("users")
          .select("user_name, about_me, image_url, created_at")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setName(data.user_name || "");
          setAboutMe(data.about_me || "");
          setCreatedAt(data.created_at || null);
          if (data.image_url) {
            const { data: publicData } = supabase.storage
              .from("image-user")
              .getPublicUrl(data.image_url);
            setPreview(publicData.publicUrl);
          } else {
            setPreview(null);
          }
        } else {
          console.error("Error fetching profile:", error);
          setError(
            `Oops! We couldn't load your profile right now. Let's try again! 😊`
          );
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(
          "Something unexpected happened. Don't worry, we'll get this sorted out!"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Loading your awesome profile... ✨
          </p>
        </motion.div>
      </div>
    );
  }

  const handleEditClick = () => {
    if (!id) return; // or fallback
    router.push(`/admin/${id}/edit-profile`);
  };

  const formattedCreatedAt = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : "Unknown";

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 py-8 px-4 sm:px-6 flex justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[10%] left-[5%] w-64 h-64 bg-violet-200/30 dark:bg-violet-700/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-indigo-200/30 dark:bg-indigo-700/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
      </div>

      <div className="container max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        {/* Header with welcome message */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700 mb-3">
            Admin Dashboard
          </span>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Manage your profile and account settings from this personalized
            dashboard
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="text-red-600 text-center mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 py-4 px-6 rounded-xl max-w-md mx-auto"
          >
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">😔</span>
            </div>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-white dark:bg-gray-800 text-red-600 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {!loading && !error && user && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
          >
            {/* Profile Card */}
            <Card className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 border-0 shadow-lg rounded-2xl overflow-hidden lg:col-span-1">
              <CardHeader className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white p-6 pb-16 relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                  <motion.button
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Account Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                  {/* <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </span> */}
                </div>
              </CardHeader>

              <CardContent className="px-6 pt-0 -mt-12">
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    {preview ? (
                      <motion.div
                        className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <img
                          src={preview || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 via-pink-400 to-indigo-500 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <User className="h-10 w-10 text-white" />
                      </motion.div>
                    )}
                    {/* <motion.button
                      className="absolute bottom-0 right-0 bg-violet-500 hover:bg-violet-600 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Update profile picture"
                    >
                      <Camera className="h-4 w-4" />
                    </motion.button> */}
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                    {name || "Admin User"}
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </h2>

                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    {user.email}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-6 w-full"
                    onClick={handleEditClick}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-2" /> Edit Profile
                  </Button>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 text-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-emerald-500 mr-2" />
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Member Since
                            </p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {formattedCreatedAt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Location
                          </p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            Worldwide
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Area */}
            <Card className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 border-0 shadow-lg rounded-2xl overflow-hidden lg:col-span-2">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-pink-500" />
                      About Me
                    </h3>
                    {/* <motion.button
                      className="text-violet-500 hover:text-violet-600 p-1.5 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit about me"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </motion.button> */}
                  </div>
                  <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 p-5 rounded-xl border border-violet-100 dark:border-violet-800/50">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {aboutMe ||
                        "✨ This is where your personal bio will appear. Tell the world about yourself, your expertise, and what makes you unique!\n\nClick the edit button to add your story."}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-4">
                    <Briefcase className="h-4 w-4 mr-2 text-violet-500" />
                    Professional Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-violet-100 dark:bg-violet-900/20 p-2 rounded-md mr-3">
                          <MapPin className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Location
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            San Francisco, CA
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-md mr-3">
                          <Briefcase className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Occupation
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Product Manager
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-pink-100 dark:bg-pink-900/20 p-2 rounded-md mr-3">
                          <Link className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Website
                          </h4>
                          <p className="text-sm text-violet-500 dark:text-violet-400">
                            example.com
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-md mr-3">
                          <MessageSquare className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Languages
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            English, Spanish
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
