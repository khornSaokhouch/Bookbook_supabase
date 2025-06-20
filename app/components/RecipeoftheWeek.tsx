"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import RecipeCard from "@/app/components/recipe-card";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import type { User } from "@/app/types";

type Recipe = {
  recipe_id: number;
  recipe_name: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  prep_time: string;
  cook_time: string;
  totalTime: string;
  note: string;
  image_recipe: { image_url: string }[];
};

// Review Type - aligned with RecipeCard expectations
type Review = {
  review_id: number;
  recipe_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

export default function NewPostPage() {
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeOfTheWeek, setRecipeOfTheWeek] = useState<Recipe[] | null>(null); //Two Items

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

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name, email, image_url")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return {
        user_id: userId,
        user_name: data?.user_name || "User",
        email: data?.email || "",
        image_url: data?.image_url || "/default-avatar.png",
      };
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          const profile = await fetchUserProfile(sessionUser.id);
          setUser(profile);

          const { data: savedData, error: savedError } = await supabase
            .from("saved_recipes")
            .select("recipe_id")
            .eq("user_id", sessionUser.id);

          if (savedError) throw savedError;

          const savedRecipeIds = savedData
            ? savedData.map((item) => Number(item.recipe_id))
            : [];
          setSavedRecipes(savedRecipeIds);
        }

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
          .order("created_at", { ascending: false })
          .limit(2); //fetch limit 2

        if (recipesError) throw recipesError;

        const transformedRecipes = (recipesData || []).map((recipe) => ({
          ...recipe,
          totalTime: "",
          description: recipe.description || "No description available",
          ingredients: recipe.ingredients || "No ingredients provided",
          instructions: recipe.instructions || "No instructions provided",
          note: recipe.note || "No additional notes",
          prep_time: recipe.prep_time || "0:00:00",
          cook_time: recipe.cook_time || "0:00:00",
        }));

        setNewRecipes(transformedRecipes as Recipe[]);
         if (transformedRecipes.length > 0) {
          setRecipeOfTheWeek(transformedRecipes as Recipe[]);
        }

        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("review_id, recipe_id, user_id, comment, rating, created_at");

        if (reviewsError) throw reviewsError;

        setReviews(reviewsData as Review[]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Failed to load data: ${err.message}`);
          console.error("Error fetching data:", err);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [fetchUserProfile]);

  const handleSaveRecipe = async (recipeId: number) => {
    if (!user) {
      console.warn("User not logged in. Cannot save recipe.");
      return;
    }
    try {
      const isCurrentlySaved = savedRecipes.includes(recipeId);

      if (isCurrentlySaved) {
        const { error: deleteError } = await supabase
          .from("saved_recipes")
          .delete()
          .eq("user_id", user.user_id)
          .eq("recipe_id", recipeId);

        if (deleteError) throw deleteError;

        setSavedRecipes(savedRecipes.filter((id) => id !== recipeId));
      } else {
        const { error: insertError } = await supabase
          .from("saved_recipes")
          .insert([{ user_id: user.user_id, recipe_id: recipeId }]);

        if (insertError) throw insertError;

        setSavedRecipes([...savedRecipes, recipeId]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error saving recipe: ${err.message}`);
        console.error("Error saving recipe:", err);
      } else {
        setError("An unknown error occurred while saving the recipe.");
      }
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

  return (
    <div>
      <section className="mb-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Recipe of the Week
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Handpicked just for you! 👨‍🍳
          </p>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full inline-block">
            {newRecipes.length} fresh recipes just added
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(2)].map((_, i) => (
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
        ) : recipeOfTheWeek && recipeOfTheWeek.length >= 2 ? (
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {recipeOfTheWeek.map((recipe, index) => (
              <RecipeCard
                key={recipe.recipe_id}
                recipe={recipe}
                reviews={reviews}
                user={user}
                savedRecipes={savedRecipes}
                onSaveRecipe={handleSaveRecipe}
                parseTime={parseTime}
                formatTime={formatTime}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Not enough recipes yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                We need at least two recipes to show this layout!
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}