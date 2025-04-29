"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import StarRating from "../../../components/StarRating";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/app/types";

type Recipe = {
  recipe_id: number;
  recipe_name: string;
  prep_time: string;
  cook_time: string;
  description: string | null;
  image_recipe: { image_url: string }[];
};

type Review = {
  recipe_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

export default function CategoryPage() {
  const { category_id } = useParams();
  const parsedCategoryId = parseInt(category_id as string, 10);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(parsedCategoryId)) {
      setError("Invalid category ID.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Auth session
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          setUser({
            user_id: sessionUser.id,
            user_name: "",
            email: "",
            image_url: "",
          });

          // Saved recipes
          const { data: savedData } = await supabase
            .from("saved_recipes")
            .select("recipe_id")
            .eq("user_id", sessionUser.id);
          setSavedRecipes(savedData?.map((r) => r.recipe_id) || []);
        }

        // Recipes for category, include image_recipe table
        const { data: recipeData, error: recipeError } = await supabase
          .from("recipe")
          .select(`
            recipe_id,
            recipe_name,
            prep_time,
            cook_time,
            description,
            image_recipe ( image_url )
          `)
          .eq("category_id", parsedCategoryId);

        if (recipeError) throw recipeError;
        setRecipes(recipeData as Recipe[]);

        // Reviews
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*");
        setReviews(reviewData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parsedCategoryId]);

  const handleSave = async (recipeId: number) => {
    if (!user || savedRecipes.includes(recipeId)) return;

    const { error } = await supabase.from("saved_recipes").insert([
      { user_id: user.user_id, recipe_id: recipeId },
    ]);

    if (!error) setSavedRecipes((prev) => [...prev, recipeId]);
  };

  const formatInterval = (interval: string) => {
    const match = interval.match(/(\d+):(\d+):\d+/);
    if (!match) return interval;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return `${hours ? `${hours}h ` : ""}${minutes}m`;
  };

  return (
    <motion.main
      className="container mx-auto px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-white">
        Recipes in Category #{parsedCategoryId}
      </h1>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-gray-400">No recipes found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => {
            const userReview = reviews.find(
              (r) => r.recipe_id === recipe.recipe_id && r.user_id === user?.user_id
            );

            return (
              <motion.div
                key={recipe.recipe_id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg flex flex-col"
                whileHover={{ scale: 1.03 }}
              >
                <Link href={`/${recipe.recipe_id}/detailspage`} className="block h-full">
                  <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={
                        recipe.image_recipe?.[0]?.image_url ||
                        "/default-recipe.jpg"
                      }
                      alt={recipe.recipe_name}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recipe.recipe_name}
                    </h3>
                    {user && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSave(recipe.recipe_id);
                        }}
                        className={`p-2 rounded-full ${
                          savedRecipes.includes(recipe.recipe_id)
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600"
                        }`}
                        aria-label="Save recipe"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prep: {formatInterval(recipe.prep_time)} | Cook:{" "}
                    {formatInterval(recipe.cook_time)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {recipe.description}
                  </p>
                </Link>

                <div className="mt-auto pt-3">
                  <StarRating
                    recipeId={recipe.recipe_id}
                    reviews={reviews.filter((r) => r.recipe_id === recipe.recipe_id)}
                  />
                  {userReview ? (
                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                      <strong>Your review:</strong> {userReview.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">No review yet.</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.main>
  );
}
