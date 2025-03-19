"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

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
  image_occasions: string;
};

// Fetch dashboard stats
async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [{ count: userCount }, { count: recipeCount }, { count: eventCount }, { count: categoryCount }] =
      await Promise.all([
        supabase.from("users").select("*", { head: true, count: "exact" }),
        supabase.from("recipe").select("*", { head: true, count: "exact" }),
        supabase.from("event").select("*", { head: true, count: "exact" }),
        supabase.from("categories").select("*", { head: true, count: "exact" }),
      ]);

    return { userCount, recipeCount, eventCount, categoryCount };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { userCount: 0, recipeCount: 0, eventCount: 0, categoryCount: 0 };
  }
}

// Fetch categories & occasions
async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select();
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getOccasions(): Promise<Occasion[]> {
  try {
    const { data, error } = await supabase.from("occasions").select();
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
    const [userId, setUserId] = useState<string | null>(null); // Add state for userId

    useEffect(() => {
        const getUserIdFromCookies = () => {
            if (typeof document === "undefined") {
                return null; // Exit if document is not available (SSR)
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
                const [fetchedStats, fetchedCategories, fetchedOccasions] = await Promise.all([
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
    return <div>Loading...</div>; // You can replace this with a spinner or skeleton loader
  }
    if (!userId) {
        return <div>Not authorized</div>
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Greeting */}
      <section
        className="mb-8 bg-cover bg-center rounded-lg p-4 md:p-8 h-[250px] flex flex-col justify-center"
        style={{ backgroundImage: "url('/banner.png')" }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold text-black mb-2">Hello, Admin</h1>
        <p className="text-black mb-4">
          Get <span className="text-orange-400 font-medium text-lg">FREE delivery</span> on every weekend.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/admin/${userId}/post-event`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            + Post Events
          </Link>
          <Link
            href={`/admin/${userId}/events`}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Check Events
          </Link>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label: "Users", count: stats.userCount }, { label: "Recipes", count: stats.recipeCount }, { label: "Events", count: stats.eventCount }, { label: "Categories", count: stats.categoryCount }].map(
            ({ label, count }) => (
              <div
                key={label}
                className="bg-white p-4 shadow rounded-lg text-center hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-medium">{label}</h3>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Recipe Categories & Occasions (Fetched from Supabase) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recipe Categories */}
        <section className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Recipe Categories</h2>
          <div className="flex flex-nowrap overflow-x-auto">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.category_id}
                  className="bg-gray-100 rounded-lg p-4 text-center shadow-md min-w-[150px] mx-2 last:mr-0 hover:shadow-lg transition-shadow duration-200"
                >
                  <Image
                    src={category.image}
                    alt={category.category_name}
                    width={80}
                    height={80}
                    className="mx-auto mb-2 rounded-full object-cover"
                  />
                  <h3 className="font-medium text-sm md:text-base">{category.category_name}</h3>
                  <Link
                    href={`/recipes/category/${category.category_id}`}
                    className="text-blue-600 hover:underline text-xs md:text-sm"
                  >
                    View All
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No categories available.</p>
            )}
          </div>
        </section>

        {/* Occasions */}
        <section className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Occasions</h2>
          <div className="flex flex-nowrap overflow-x-auto">
            {occasions.length > 0 ? (
              occasions.map((occasion) => (
                <div
                  key={occasion.occasion_id}
                  className="bg-gray-100 rounded-lg p-4 text-center shadow-md min-w-[150px] mx-2 last:mr-0 hover:shadow-lg transition-shadow duration-200"
                >
                  <Image
                    src={occasion.image_occasions}
                    alt={occasion.name}
                    width={80}
                    height={80}
                    className="mx-auto mb-2 rounded-full object-cover"
                  />
                  <h3 className="font-medium text-sm md:text-base">{occasion.name}</h3>
                  <Link
                    href={`/recipes/occasion/${occasion.occasion_id}`}
                    className="text-blue-600 hover:underline text-xs md:text-sm"
                  >
                    View All
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No occasions available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}