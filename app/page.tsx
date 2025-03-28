"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BannerSwiper from "./components/BannerSwiper";
import { motion } from "framer-motion";
import { Heart } from "lucide-react"; // Import heart icon

// Recipe Type
type Recipe = {
  recipe_id: string;
  recipe_name: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  prep_time: string;
  cook_time: string;
  image_recipe: { image_url: string }[];
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

export default function Home() {
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]); // Store recipe_id strings
  const [userId, setUserId] = useState<string | null>(null); // Store user ID

  useEffect(() => {
    const fetchRecipesAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          return; // Don't redirect, just don't fetch data if not logged in
        }
        setUserId(user.id); // Set user ID

        // Fetch New Recipes with Images
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
            image_recipe ( image_url )
          `
          )
          .order("created_at", { ascending: false })
          .limit(4);

        if (recipesError) throw recipesError;

        setNewRecipes(recipesData as Recipe[]);

        // Fetch All Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*");

        if (reviewsError) throw reviewsError;

        setReviews(reviewsData as Review[]);

        // Fetch Saved Recipe IDs for the user
        const { data: savedData, error: savedError } = await supabase
          .from("saved_recipes")
          .select("recipe_id")
          .eq("user_id", user.id);

        if (savedError) throw savedError;

        // Extract just the recipe_id values
        const savedRecipeIds = savedData ? savedData.map((item) => item.recipe_id.toString()) : [];
        setSavedRecipes(savedRecipeIds);

      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesAndReviews();
  }, []);

  const handleSaveRecipe = async (recipeId: string) => {
    if (!userId) {
      console.warn("User not logged in. Cannot save recipe.");
      return;
    }
    try {
      const isCurrentlySaved = savedRecipes.includes(recipeId);

      if (isCurrentlySaved) {
        // Unsave the recipe
        const { error: deleteError } = await supabase
          .from("saved_recipes")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", parseInt(recipeId));

        if (deleteError) throw deleteError;
        setSavedRecipes(savedRecipes.filter((id) => id !== recipeId));
      } else {
        // Save the recipe
        const { error: insertError } = await supabase
          .from("saved_recipes")
          .insert([{ user_id: userId, recipe_id: parseInt(recipeId) }]);

        if (insertError) throw insertError;
        setSavedRecipes([...savedRecipes, recipeId]);
      }
    } catch (err: any) {
      setError(`Error saving recipe: ${err.message}`);
      console.error("Error saving recipe:", err);
    }
  };

  const handleRating = (rating: number) => {
    // Implement rating submission logic here
    console.log("Rating submitted: ", rating);
  };

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  return (
    <div>
      <Navbar />

      <div className="m-auto py-5">
        <BannerSwiper />
      </div>

      <main className="container mx-auto p-6">
        {/* Display New Posts */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-4">
            New Posts
          </h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                <p className="mt-4 text-xl">Loading recipes...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : newRecipes.length === 0 ? (
              <p className="text-center text-gray-500">No new recipes available.</p>
            ) : (
              newRecipes.map((recipe) => {
                const imageUrl = recipe.image_recipe[0]?.image_url || "";
                const recipeReviews = reviews.filter(
                  (review) => review.recipe_id === recipe.recipe_id.toString()
                );

                return (
                  <motion.div
                    key={recipe.recipe_id}
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                    variants={recipeCardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={recipe.recipe_name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <p className="text-center text-gray-400">
                        No image available
                      </p>
                    )}

                    {/* Title and Save Button */}
                    <div className="flex justify-between items-center mt-2">
                      <h3 className="text-xl font-semibold">{recipe.recipe_name}</h3>
                      <button
                        onClick={() => handleSaveRecipe(recipe.recipe_id)}
                        className={`p-2 rounded-full ${savedRecipes.includes(recipe.recipe_id) ? "bg-red-500 text-white" : "bg-gray-200"
                          }`}
                      >
                        <Heart className="h-5 w-5" />  {/* Heart Icon */}
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Cooking Time: {recipe.cook_time}
                    </p>

                    {/* Rating Component */}
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">★</span>
                      {recipeReviews.length > 0 ? (
                        <span className="ml-2">
                          {recipeReviews.reduce((acc, review) => acc + review.rating, 0) /
                            recipeReviews.length}{" "}
                          / 5
                        </span>
                      ) : (
                        <span className="ml-2">No ratings yet</span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold">Reviews:</h4>
                      {recipeReviews.length > 0 ? (
                        recipeReviews.map((review) => (
                          <div
                            key={review.review_id}
                            className="border-t border-gray-200 pt-2 mt-2"
                          >
                            <p className="font-semibold">{review.user_id}</p>
                            <p>{review.comment}</p>
                            <p>Rating: {review.rating} ★</p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No reviews yet. Be the first to review!</p>
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