"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import Navbar from "@/app/components/Navbar"; // Ensure correct import path
import Footer from "@/app/components/Footer"; // Ensure correct import path
import BannerSwiper from "@/app/components/BannerSwiper"; // Ensure correct import path
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { Heart } from "lucide-react"; // Import necessary icons

// Recipe Type
type Recipe = {
  recipe_id: string;
  recipe_name: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  prep_time: string; // String in "X mins"
  cook_time: string; // String in "X mins"
  image_recipe: { image_url: string }[];
};

type UserProfile = {
  user_id: string;
  user_name: string;
  email: string;
  image_url: string | null;
};


// Review Type
type Review = {
  review_id: string;
  recipe_id: string;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

const constructImageUrl = (path: string | null) => {
  if (!path) return "/default-image.jpg"; // Fallback to a default image
  if (path.startsWith("http://") || path.startsWith("https://")) return path; // Already a valid URL
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`; // Construct full URL
};

export default function Home() {
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        image_url: data?.image_url || null,
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

        // Fetch user session
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          const profile = await fetchUserProfile(sessionUser.id);
          setUser(profile);

          // Fetch saved recipes for logged-in users
          const { data: savedData, error: savedError } = await supabase
            .from("saved_recipes")
            .select("recipe_id")
            .eq("user_id", sessionUser.id);

          if (savedError) throw savedError;

          const savedRecipeIds = savedData
            ? savedData.map((item) => item.recipe_id.toString())
            : [];
          setSavedRecipes(savedRecipeIds);
        }

        // Fetch New Recipes with Images
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipe")
          .select(
            `recipe_id, recipe_name, description, ingredients, instructions, created_at, prep_time, cook_time, image_recipe ( image_url )`
          )
          .order("created_at", { ascending: false })
          .limit(8);

        if (recipesError) throw recipesError;

        setNewRecipes(recipesData as Recipe[]);

        // Fetch All Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*");

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

  const handleSaveRecipe = async (recipeId: string) => {
    if (!user) {
      console.warn("User not logged in. Cannot save recipe.");
      return;
    }
    try {
      // Check if the recipe is already saved
      const isCurrentlySaved = savedRecipes.includes(recipeId);
  
      if (isCurrentlySaved) {
        // If the recipe is already saved, unsave it
        const { error: deleteError } = await supabase
          .from("saved_recipes")
          .delete()
          .eq("user_id", user.user_id)
          .eq("recipe_id", recipeId); // Ensure recipe_id is a string
  
        if (deleteError) throw deleteError;
  
        // Update the state by removing the saved recipe ID
        setSavedRecipes(savedRecipes.filter((id) => id !== recipeId));
      } else {
        // If the recipe is not saved, save it
        const { error: insertError } = await supabase
          .from("saved_recipes")
          .insert([{ user_id: user.user_id, recipe_id: recipeId }]);
  
        if (insertError) throw insertError;
  
        // Update the state by adding the saved recipe ID
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

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  const parseTime = (value: string | number) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.includes(":")) {
      const [h, m, s] = value.split(":").map(Number);
      return h * 60 + m + Math.round(s / 60);
    }
    return parseInt(value) || 0;
  };

  // Format time nicely
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h` : ""}${mins > 0 ? `${mins}mns` : ""}`;
  };

  return (
    <div>
      <Navbar user={user} />

      <div className="m-auto py-5">
        <BannerSwiper />
      </div>

      <main className="container mx-auto p-6">
        {/* Display New Posts */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-4">New Posts</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="flex justify-center items-center m-auto h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                <p className="mt-4 text-xl">Loading recipes...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : newRecipes.length === 0 ? (
              <p className="text-center text-gray-500">No new recipes available.</p>
            ) : (
              newRecipes.map((recipe) => {
                const imageUrl = constructImageUrl(recipe.image_recipe[0]?.image_url);

                // Filter reviews and sort them by most recent (created_at)
                const recipeReviews = reviews
                  .filter((review) => review.recipe_id === recipe.recipe_id) // Make sure recipe_id is the same type
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by most recent

                const latestUserReview = recipeReviews.length > 0 ? recipeReviews[0] : null; // Get the latest review

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
                              handleSaveRecipe(recipe.recipe_id); // Pass the correct recipe_id
                            }}
                            className={`p-2 rounded-full ${savedRecipes.includes(recipe.recipe_id)
                              ? "bg-red-500 text-white" // Saved state
                              : "bg-gray-200"}`} // Unsaved state
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Total Time: {formatTime(totalTime)}</p>
                    </Link>

                    <div className="mt-3">
                      {/* Show latest user comment if exists */}
                      {latestUserReview ? (
                        <div className="mt-2 text-sm text-gray-700">
                          <strong>Latest Comment:</strong> {latestUserReview.comment}
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
