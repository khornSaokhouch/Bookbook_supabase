"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Import framer-motion
import {
  User,
  ChefHat as RestaurantMenu,
  CalendarDays as Event,
  ListChecks as CategoryIcon,
} from "lucide-react";

type DashboardStats = {
  userCount: number;
  recipeCount: number;
  eventCount: number;
  categoryCount: number;
};

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

// Fetch dashboard stats
async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [{ count: userCount }, { count: recipeCount }, { count: eventCount }, { count: categoryCount }] =
      await Promise.all([
        supabase.from("users").select("*", { head: true, count: "exact" }),
        supabase.from("recipe").select("*", { head: true, count: "exact" }),
        supabase.from("event").select("*", { head: true, count: "exact" }),
        supabase.from("category").select("*", { head: true, count: "exact" }),
      ]);

    return { userCount, recipeCount, eventCount, categoryCount };
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

// Fetch categories & occasions
async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("category").select();
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getOccasions(): Promise<Occasion[]> {
  try {
    const { data, error } = await supabase.from("occasion").select();
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching occasions:", error);
    return [];
  }
}

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
      const userCookie = cookies.find((cookie) =>
        cookie.startsWith("user=")
      );
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
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    ); // Improved loading indicator
  }

  if (!userId) {
    return <div className="text-center p-4">Not authorized</div>;
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Greeting Banner */}
      <motion.section
        className="mb-8 bg-cover bg-center rounded-lg  md:p-8 h-[350px] flex flex-col justify-center text-white shadow-md"
        style={{ backgroundImage: "url('/banner.png')" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
      >
        <h1 className="text-3xl text-black md:text-4xl font-semibold mb-2 px-12 text-shadow-md">
          Hello, Admin
        </h1>
        <p className="mb-4 text-black px-12 text-shadow-md">
          Empower your culinary world! Manage users, recipes, events and
          categories.
        </p>
        <div className="flex flex-wrap gap-4 px-12">
          <Link
            href={`/admin/${userId}/post-event`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
          >
            + Post Events
          </Link>
          <Link
            href={`/admin/${userId}/events`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Check Events
          </Link>
        </div>
      </motion.section>

{/* Dashboard Stats */}
<section className="mb-8">
  <h2 className="text-2xl text-white font-semibold mb-4">Dashboard Stats</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { label: "Users", count: stats.userCount },
      { label: "Recipes", count: stats.recipeCount },
      { label: "Events", count: stats.eventCount },
      { label: "Categories", count: stats.categoryCount },
    ].map(({ label, count }) => {
      const Icon = statIcons[label as keyof typeof statIcons];

      return (
        <motion.div
          key={label}
          className="p-4 rounded-lg text-center hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white border shadow"
          onClick={() => handleStatClick(label)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-blue-500 mb-2">{Icon && <Icon className="h-8 w-8" />}</div>
          <h3 className="text-lg font-medium">{label}</h3>
          <p className="text-3xl font-bold">{count}</p>
        </motion.div>
      );
    })}
  </div>
</section>

      {/* Recipe Categories & Occasions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recipe Categories */}
        <motion.section
          className="bg-white p-4 md:p-6 rounded-lg shadow"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Recipe Categories
          </h2>
          <div className="flex flex-nowrap overflow-x-auto">
            {categories.length > 0 ? (
              categories.map((category) => (
                <motion.div
                  key={category.category_id}
                  className="bg-gray-100 rounded-lg p-4 text-center shadow-md min-w-[150px] mx-2 last:mr-0 hover:shadow-lg transition-shadow duration-200 flex-shrink-0"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={category.image}
                    alt={category.category_name}
                    width={80}
                    height={80}
                    className="mx-auto mb-2 rounded-full object-cover"
                  />
                  <h3 className="font-medium text-sm md:text-base">
                    {category.category_name}
                  </h3>
                  <Link
                    href={`/recipes/category/${category.category_id}`}
                    className="text-blue-600 hover:underline text-xs md:text-sm"
                  >
                    View All
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-600">
                No categories available.
              </p>
            )}
          </div>
        </motion.section>

        {/* Occasions */}
        <motion.section
          className="bg-white p-4 md:p-6 rounded-lg shadow"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Occasions</h2>
          <div className="flex flex-nowrap overflow-x-auto">
            {occasions.length > 0 ? (
              occasions.map((occasion) => (
                <motion.div
                  key={occasion.occasion_id}
                  className="bg-gray-100 rounded-lg p-4 text-center shadow-md min-w-[150px] mx-2 last:mr-0 hover:shadow-lg transition-shadow duration-200 flex-shrink-0"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={occasion.occasion_image}
                    alt={occasion.name}
                    width={80}
                    height={80}
                    className="mx-auto mb-2 rounded-full object-cover"
                  />
                  <h3 className="font-medium text-sm md:text-base">
                    {occasion.name}
                  </h3>
                  <Link
                    href={`/recipes/occasion/${occasion.occasion_id}`}
                    className="text-blue-600 hover:underline text-xs md:text-sm"
                  >
                    View All
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-600">No occasions available.</p>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}