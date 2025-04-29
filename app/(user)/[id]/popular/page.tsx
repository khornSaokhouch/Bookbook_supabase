"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import StarRating from "../../../components/StarRating";

// --- Types ---
type RecipeImage = { image_url: string };
type BaseRecipe = {
  recipe_id: number;
  recipe_name: string;
  prep_time: string | null;
  cook_time: string | null;
  image_recipe: RecipeImage[] | null;
};
type Review = {
  review_id: number;
  recipe_id: number;
  user_id: string;
  comment: string | null;
  rating: number | null;
  created_at: string;
};
type User = { id: string }; // Supabase returns `id` instead of `user_id` directly

// --- Helpers ---
const parseTime = (time: string | null | undefined): number => {
  if (!time) return 0;
  if (time.includes(":")) {
    const [h, m, s] = time.split(":").map(Number);
    return h * 60 + m + Math.round(s / 60);
  }
  return parseInt(time) || 0;
};

const formatTime = (minutes: number): string => {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}mns` : ""}`;
};

const recipeCardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.03 },
};

// --- Component ---
const PopularPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<BaseRecipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();
      const currentUser = session.data.session?.user ?? null;
      if (currentUser) {
        setUser({ id: currentUser.id });
      }

      const [{ data: recipeData, error: recipeError }, { data: reviewData, error: reviewError }] = await Promise.all([
        supabase.from("recipe").select("recipe_id, recipe_name, prep_time, cook_time, image_recipe(image_url)"),
        supabase.from("reviews").select("*"),
      ]);

      if (recipeError) throw recipeError;
      if (reviewError) throw reviewError;

      setRecipes(recipeData || []);
      setReviews(reviewData || []);

      if (currentUser) {
        const { data: savedData, error: savedError } = await supabase
          .from("saved_recipes")
          .select("recipe_id")
          .eq("user_id", currentUser.id);

        if (savedError) throw savedError;
        setSavedRecipes(savedData?.map((s) => s.recipe_id) || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to load data: ${err.message}`);
      } else {
        setError("An unexpected error occurred.");
      }
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
      const { error } = await supabase
        .from("saved_recipes")
        .insert([{ user_id: user.id, recipe_id: recipeId }]);

      if (error) throw new Error(error.message);

      setSavedRecipes([...savedRecipes, recipeId]);
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  return (
    <div>
      <main className="container mx-auto py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Popular Recipes</h2>

        {loading ? (
          <div className="flex justify-center items-center flex-col">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            <p className="mt-4 text-xl">Loading recipes...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {recipes.length === 0 ? (
              <p className="text-center text-gray-500">No recipes available.</p>
            ) : (
              recipes.map((recipe) => {
                const imageUrl = recipe.image_recipe?.[0]?.image_url || "/default-recipe.jpg";
                
                // Get the latest review for this recipe
                const recipeReviews = reviews.filter((review) => review.recipe_id === recipe.recipe_id);
                const latestRecipeReview = recipeReviews
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]; // Sort to get the latest review

                const totalTime = parseTime(recipe.prep_time) + parseTime(recipe.cook_time);

                return (
                  <motion.div
                    key={recipe.recipe_id}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col"
                    variants={recipeCardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                  >
                    <Link href={`/${recipe.recipe_id}/detailspage`} className="block">
                      <Image
                        src={imageUrl}
                        alt={recipe.recipe_name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                        priority
                        unoptimized
                      />
                      <div className="flex justify-between items-center mt-3">
                        <h3 className="text-lg font-semibold">{recipe.recipe_name}</h3>
                        {user && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleSaveRecipe(recipe.recipe_id);
                            }}
                            className={`p-2 rounded-full ${
                              savedRecipes.includes(recipe.recipe_id) ? "bg-red-500 text-white" : "bg-gray-200"
                            }`}
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Total Time: {formatTime(totalTime)}
                      </p>
                    </Link>

                    <div className="mt-3">
                      <StarRating recipeId={recipe.recipe_id} reviews={recipeReviews} />

                      {latestRecipeReview ? (
                        <div className="mt-2 text-sm text-gray-700">
                          <strong>Latest comment:</strong> {latestRecipeReview.comment}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No comment yet.</p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PopularPage;
