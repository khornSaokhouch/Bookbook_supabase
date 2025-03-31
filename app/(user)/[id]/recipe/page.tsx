"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import BannerSwiper from "../../../components/BannerSwiper";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import StarRating from "../../../components/StarRating"; // Create this component
import CommentSection from "../../../components/CommentSection"; // Create this component
import Link from "next/link";
import Image from "next/image"; // Import next/image
import { User } from "@/app/types"; // Import shared User type

// Define Recipe type
type Recipe = {
  recipe_id: number;
  recipe_name: string;
  cook_time: string;
  image_recipe: { image_url: string }[];
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  prep_time: string;
  note: string;
};

// Define Review type
type Review = {
  review_id: number;
  recipe_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

const AllRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]); // Store recipe IDs
  const [user, setUser] = useState<User | null>(null); // Store user object

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user session
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
            const { data: savedData, error: savedError } = await supabase
              .from("saved_recipes")
              .select("recipe_id")
              .eq("user_id", sessionUser.id);

            if (savedError) throw savedError;

            const savedRecipeIds = savedData
              ? savedData.map((item) => item.recipe_id)
              : [];
            setSavedRecipes(savedRecipeIds);
          }
        }

        // Fetch all recipes
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipe")
          .select(`
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
          `);

        if (recipesError) throw recipesError;

        setRecipes(recipesData as Recipe[]);

        // Fetch all reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("review_id, recipe_id, user_id, comment, rating, created_at");

        if (reviewsError) throw reviewsError;

        setReviews(reviewsData as Review[]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Error fetching data: ${err.message}`);
        } else {
          setError("An unexpected error occurred.");
        }
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleSaveRecipe = async (recipeId: number) => {
    if (!user) {
      console.warn("User not logged in. Cannot save recipe.");
      return;
    }

    if (savedRecipes.includes(recipeId)) {
      console.log("Recipe already saved!");
      return;
    }

    try {
      const { error } = await supabase.from("saved_recipes").insert([
        {
          user_id: user.user_id,
          recipe_id: recipeId,
        },
      ]);

      if (error) throw new Error(error.message);

      setSavedRecipes([...savedRecipes, recipeId]);
      console.log("Recipe saved successfully!");
    } catch (err: unknown) {
      console.error("Error saving recipe:", err);
    }
  };

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.03 },
  };

  return (
    <div>
      <div className="m-auto py-5">
        <BannerSwiper />
      </div>
      <main className="container mx-auto p-6">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-4">All Recipes</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="flex justify-center items-center m-auto h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                <p className="mt-4 text-xl">Loading recipes...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : recipes.length === 0 ? (
              <p className="text-center text-gray-500">No recipes available.</p>
            ) : (
              recipes.map((recipe) => {
                const imageUrl = recipe.image_recipe[0]?.image_url || "";
                const recipeReviews = reviews.filter(
                  (review) => review.recipe_id === recipe.recipe_id
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
                    <Link href={`/${recipe.recipe_id}/detailspage`} className="block">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={recipe.recipe_name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-lg"
                          priority
                        />
                      ) : (
                        <p className="text-center text-gray-400">No image available</p>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <h3 className="text-xl font-semibold">{recipe.recipe_name}</h3>
                        {user && (
                          <button
                            onClick={() => handleSaveRecipe(recipe.recipe_id)}
                            className={`p-2 rounded-full ${
                              savedRecipes.includes(recipe.recipe_id)
                                ? "bg-red-500 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">Cooking Time: {recipe.cook_time}</p>
                    </Link>

                    <div className="flex items-center mt-2">
                      <StarRating recipeId={recipe.recipe_id} reviews={recipeReviews} />
                    </div>

                    <CommentSection recipeId={recipe.recipe_id} reviews={recipeReviews} />
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AllRecipesPage;
