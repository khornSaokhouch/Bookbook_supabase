"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChefHat, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import RecipeCard from "@/app/components/recipe-card";
import type { User } from "@/app/types";

// Transform the data types to match RecipeCard expectations
type Recipe = {
  recipe_id: number;
  recipe_name: string;
  cook_time: string;
  image_recipe: { image_url: string }[];
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  totalTime: string;
  prep_time: string;
  note: string;
  average_rating: number;
  review_count: number;
};

type Review = {
  review_id: number;
  recipe_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

const PopularPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for time parsing and formatting
  const parseTime = (value: string | number) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.includes(":")) {
      const [h, m, s] = value.split(":").map(Number);
      return h * 60 + m + Math.round(s / 60);
    }
    return Number.parseInt(value) || 0;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        const { data, error } = await supabase
          .from("users")
          .select("user_name, email, image_url")
          .eq("user_id", sessionUser.id)
          .single();

        if (!error && data) {
          setUser({
            user_id: sessionUser.id,
            user_name: data.user_name || "User",
            email: data.email || "",
            image_url: data.image_url || "/default-avatar.png",
          });

          // Fetch saved recipes for logged-in users
          const { data: savedData } = await supabase
            .from("saved_recipes")
            .select("recipe_id")
            .eq("user_id", sessionUser.id);

          setSavedRecipes(savedData?.map((item) => item.recipe_id) || []);
        }
      }

      // First, get all reviews to identify which recipes have ratings
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("review_id, recipe_id, user_id, comment, rating, created_at");

      if (reviewsError) throw reviewsError;

      setReviews(reviewsData as Review[]);

      // Calculate average ratings and review counts for each recipe
      const ratingStats = (reviewsData || []).reduce((acc, review) => {
        const recipeId = review.recipe_id;
        if (!acc[recipeId]) {
          acc[recipeId] = { totalRating: 0, count: 0 };
        }
        acc[recipeId].totalRating += review.rating;
        acc[recipeId].count += 1;
        return acc;
      }, {} as Record<number, { totalRating: number; count: number }>);

      // Get only recipe IDs that have reviews
      const recipeIdsWithReviews = Object.keys(ratingStats).map(Number);

      if (recipeIdsWithReviews.length === 0) {
        // No recipes have reviews yet
        setRecipes([]);
        return;
      }

      // Fetch only recipes that have reviews
      const { data: recipesData, error: recipesError } = await supabase
        .from("recipe")
        .select(
          `
          recipe_id,
          recipe_name,
          description,
          ingredients,
          instructions,
          created_at,
          prep_time,
          cook_time,
          note,
          image_recipe ( image_url )
        `
        )
        .in("recipe_id", recipeIdsWithReviews);

      if (recipesError) throw recipesError;

      // Transform and sort recipes by average rating (only recipes with reviews)
      const transformedRecipes = (recipesData || [])
        .map((recipe) => {
          const stats = ratingStats[recipe.recipe_id];
          const averageRating = stats.totalRating / stats.count;
          const reviewCount = stats.count;

          return {
            ...recipe,
            totalTime: "", // Will be calculated by RecipeCard
            description:
              recipe.description ||
              "A delicious and popular recipe loved by many!",
            ingredients: recipe.ingredients || "Fresh ingredients",
            instructions: recipe.instructions || "Easy to follow instructions",
            note: recipe.note || "Enjoy this amazing recipe!",
            prep_time: recipe.prep_time || "0:00:00",
            cook_time: recipe.cook_time || "0:00:00",
            average_rating: averageRating,
            review_count: reviewCount,
          };
        })
        .sort((a, b) => {
          // Primary sort: by average rating (highest first)
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating;
          }
          // Secondary sort: by number of reviews (most reviewed first)
          if (b.review_count !== a.review_count) {
            return b.review_count - a.review_count;
          }
          // Tertiary sort: by creation date (newest first)
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        })
        .slice(0, 12); // Show top 12 popular recipes

      setRecipes(transformedRecipes as Recipe[]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to load data: ${err.message}`);
      } else {
        setError("An unexpected error occurred.");
      }
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveRecipe = async (recipeId: number) => {
    if (!user) return;
    if (savedRecipes.includes(recipeId)) return;

    try {
      const { error } = await supabase.from("saved_recipes").insert([
        {
          user_id: user.user_id,
          recipe_id: recipeId,
        },
      ]);

      if (error) throw new Error(error.message);

      setSavedRecipes([...savedRecipes, recipeId]);
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Calculate statistics for display (only for recipes with reviews)
  const totalReviews = reviews.length;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
  const topRatedRecipes = recipes.filter(
    (recipe) => recipe.average_rating >= 4.5
  );
  const minRating =
    recipes.length > 0 ? Math.min(...recipes.map((r) => r.average_rating)) : 0;
  const maxRating =
    recipes.length > 0 ? Math.max(...recipes.map((r) => r.average_rating)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-12 w-12 text-orange-500 mr-3" />
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Popular Recipes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the highest-rated recipes by our amazing cooking community!
            🔥👨‍🍳
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Only showing recipes with user ratings and reviews
          </p>

          {/* Statistics */}
          {recipes.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 dark:border-orange-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {recipes.length} rated recipes
                </span>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ⭐ {averageRating.toFixed(1)} avg rating
                </span>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🏆 {topRatedRecipes.length} top-rated (4.5+)
                </span>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  💬 {totalReviews} total reviews
                </span>
              </div>
              {recipes.length > 0 && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    📊 {minRating.toFixed(1)} - {maxRating.toFixed(1)} rating
                    range
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
              <ChefHat className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-16 w-16 text-gray-400 mr-2" />
                <ChefHat className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No rated recipes yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Be the first to rate and review recipes to see them appear here!
                ⭐
              </p>
              <div className="text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
                Popular recipes will show here once users start rating them
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Recipe Highlight */}
            {recipes.length > 0 && recipes[0].average_rating >= 4.5 && (
              <motion.div
                className="mb-8 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    🏆 Highest Rated Recipe
                  </span>
                  <Star className="h-6 w-6 text-yellow-500 ml-2" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {recipes[0].recipe_name}
                  </h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      ⭐ {recipes[0].average_rating.toFixed(1)} average rating
                    </span>
                    <span>•</span>
                    <span>{recipes[0].review_count} reviews</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recipe Grid */}
            <motion.div
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.recipe_id}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Ranking Badge for top 3 */}
                  {/* {index < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      #{index + 1}
                    </div>
                  )} */}

                  {/* Rating Badge - Always show since all recipes have ratings */}
                  {/* <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    {recipe.average_rating.toFixed(1)}
                  </div> */}

                  <RecipeCard
                    recipe={recipe}
                    reviews={reviews}
                    user={user}
                    savedRecipes={savedRecipes}
                    onSaveRecipe={handleSaveRecipe}
                    parseTime={parseTime}
                    formatTime={formatTime}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default PopularPage;
