"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  MenuIcon as RestaurantMenu,
  ActivityIcon as Event,
  TypeIcon as CategoryIcon,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type Category = {
  category_id: string;
  category_name: string;
  image: string;
};

type Occasion = {
  occasion_id: string;
  name: string;
  occasion_image: string;
};

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      { count: userCount },
      { count: recipeCount },
      { count: eventCount },
      { count: categoryCount },
    ] = await Promise.all([
      supabase.from("users").select("*", { head: true, count: "exact" }),
      supabase.from("recipe").select("*", { head: true, count: "exact" }),
      supabase.from("event").select("*", { head: true, count: "exact" }),
      supabase.from("category").select("*", { head: true, count: "exact" }),
    ]);

    return {
      userCount: userCount ?? 0,
      recipeCount: recipeCount ?? 0,
      eventCount: eventCount ?? 0,
      categoryCount: categoryCount ?? 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      userCount: 0,
      recipeCount: 0,
      eventCount: 0,
      categoryCount: 0,
    };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("category").select("*");
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getOccasions(): Promise<Occasion[]> {
  try {
    const { data, error } = await supabase.from("occasion").select("*");
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching occasions:", error);
    return [];
  }
}

type DashboardStats = {
  userCount: number;
  recipeCount: number;
  eventCount: number;
  categoryCount: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    recipeCount: 0,
    eventCount: 0,
    categoryCount: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserIdFromCookies = () => {
      if (typeof document === "undefined") {
        return null;
      }
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((cookie) => cookie.startsWith("user="));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
          return user.id;
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          return null;
        }
      }
      return null;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedUserId = getUserIdFromCookies();
        if (fetchedUserId) {
          setUserId(fetchedUserId);
        }
        const [fetchedStats, fetchedCategories, fetchedOccasions] =
          await Promise.all([
            getDashboardStats(),
            getCategories(),
            getOccasions(),
          ]);
        setStats(fetchedStats);
        setCategories(fetchedCategories);
        setOccasions(fetchedOccasions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Loading Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preparing your culinary insights...
          </p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-6xl">🔒</div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You need to be authorized to view this dashboard
          </p>
        </div>
      </div>
    );
  }

  const handleStatClick = (label: string) => {
    switch (label) {
      case "Users":
        router.push(`/admin/${userId}/users`);
        break;
      case "Recipes":
        router.push(`/admin/${userId}/recipes`);
        break;
      case "Events":
        router.push(`/admin/${userId}/events`);
        break;
      case "Categories":
        router.push(`/admin/${userId}/categories`);
        break;
      default:
        console.warn(`No route defined for ${label}`);
    }
  };

  const statIcons = {
    Users: User,
    Recipes: RestaurantMenu,
    Events: Event,
    Categories: CategoryIcon,
  };

  const statColors = {
    Users: "from-blue-500 to-blue-600",
    Recipes: "from-green-500 to-green-600",
    Events: "from-purple-500 to-purple-600",
    Categories: "from-orange-500 to-orange-600",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.main
      className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 py-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Greeting Banner */}
      <motion.section
        className="relative mb-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 sm:p-8 md:p-12 h-[250px] sm:h-[300px] md:h-[350px] flex flex-col justify-center text-white shadow-2xl overflow-hidden"
        variants={itemVariants}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center mb-4"
          >
            <Sparkles className="w-8 h-8 mr-3 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold">Hello, Admin! 👋</h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl"
          >
            Welcome to your culinary command center! Manage your cookbook empire
            with style and efficiency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={`/admin/${userId}/events`}
              className="group bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Event
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/admin/${userId}/events`}
              className="group bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/30 hover:bg-white/30 flex items-center"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Analytics
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Dashboard Stats */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard Overview
          </h2>
        </div>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Users", count: stats.userCount },
            { label: "Recipes", count: stats.recipeCount },
            { label: "Events", count: stats.eventCount },
            { label: "Categories", count: stats.categoryCount },
          ].map(({ label, count }) => {
            const Icon = statIcons[label as keyof typeof statIcons];
            const colorClass = statColors[label as keyof typeof statColors];

            return (
              <motion.div
                key={label}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 overflow-hidden"
                onClick={() => handleStatClick(label)}
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div
                      className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}
                    >
                      {Icon && <Icon className="h-5 w-5 sm:h-6 sm-w-6" />}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    {label}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {count.toLocaleString()}
                  </p>

                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Click to manage →
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Enhanced Categories & Occasions Sections */}
      <div className="mt-8">
        {/* Recipe Categories */}
<motion.section
  className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6"
  variants={itemVariants}
>
  <div className="flex items-center justify-between mb-4 sm:mb-6">
    <div className="flex items-center">
      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
        <RestaurantMenu className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
      Categories
      </h2>
    </div>

    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
        {categories.length} items
      </span>

      <Link
        href={`/admin/${userId}/categories`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium group-hover:underline"
      >
        View All
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </div>

  {/* Make Category Scrollable on Smaller Screens */}
  <div className="overflow-x-auto pb-4 -mx-4 px-4">
    <div className="flex space-x-4 scrollbar-hide w-max">
      {categories.length > 0 ? (
        categories.map((category) => (
          <motion.div
            key={category.category_id}
            className="group bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.03 }}
          >
            {/* Category Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full overflow-hidden shadow-lg">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.category_name}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Category Name */}
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-1 truncate w-full">
              {category.category_name}
            </h3>
          </motion.div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center w-full py-8 sm:py-12 text-gray-500 dark:text-gray-400">
          <RestaurantMenu className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 opacity-50" />
          <p className="text-center">No categories available yet.</p>
        </div>
      )}
    </div>
  </div>
</motion.section>


       {/* Occasions */}
<motion.section
  className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
  variants={itemVariants}
>
  <div className="flex items-center justify-between mb-4 sm:mb-6">
    <div className="flex items-center">
      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
        <Event className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
      Occasions
      </h2>
    </div>

    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
        {occasions.length} items
      </span>
      <Link
        href={`/admin/${userId}/occasions`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium group-hover:underline"
      >
        View All
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </div>

  {/* Make Occasions Scrollable on Smaller Screens */}
  <div className="overflow-x-auto pb-4 -mx-4 px-4">
    <div className="flex space-x-4 scrollbar-hide w-max">
      {occasions.length > 0 ? (
        occasions.map((occasion) => (
          <motion.div
            key={occasion.occasion_id}
            className="group bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.03 }}
          >
            {/* Occasion Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full overflow-hidden shadow-lg">
              <Image
                src={occasion.occasion_image || "/placeholder.svg"}
                alt={occasion.name}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-300 group-hover:scale-105 rounded-full"
              />
            </div>

            {/* Occasion Name */}
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-1 truncate w-full">
              {occasion.name}
            </h3>
          </motion.div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center w-full py-8 sm:py-12 text-gray-500 dark:text-gray-400">
          <Event className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 opacity-50" />
          <p className="text-center">No occasions available yet.</p>
        </div>
      )}
    </div>
  </div>
</motion.section>

      </div>
    </motion.main>
  );
}