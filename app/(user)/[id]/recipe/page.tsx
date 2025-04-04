"use client"

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import BannerSwiper from "../../../components/BannerSwiper";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import StarRating from "../../../components/StarRating"; // Import StarRating component
import Link from "next/link";
import Image from "next/image";
import { User } from "@/app/types";

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

type Review = {
  review_id: number;
  recipe_id: number;
  user_id: string; // Assuming user_id is a string. If it's a number, change accordingly.
  comment: string;
  rating: number;
  created_at: string; // Or Date, if you want to work with a Date object
};

const AllRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]); // Reviews state

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase.from("recipe").select("*");
      console.log("Fetched Recipes:", data); // Debug the fetched recipes
      if (error) console.error("Error fetching recipes:", error);
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

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

            const { data: savedData } = await supabase
              .from("saved_recipes")
              .select("recipe_id")
              .eq("user_id", sessionUser.id);

            setSavedRecipes(savedData?.map((item) => item.recipe_id) || []);
          }
        }

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

        // Fetch all reviews for the recipes
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("review_id, recipe_id, user_id, comment, rating, created_at");

        if (reviewsError) throw reviewsError;

        setReviews(reviewsData as Review[]); // Set reviews using the Review type
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
          <h2 className="text-3xl font-bold text-center mb-8">All Recipes</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
                const imageUrl =
                  recipe.image_recipe[0]?.image_url || "/default-recipe.jpg";
                const userReviews = reviews.filter(
                  (review) => review.recipe_id === recipe.recipe_id
                );

                // Get the latest comment from the logged-in user
                const latestUserReview = userReviews
                  .filter((review) => review.user_id === user?.user_id) // Filter by user
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )[0];

                return (
                  <motion.div
                    key={recipe.recipe_id}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col"
                    variants={recipeCardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                  >
                    <Link
                      href={`/${recipe.recipe_id}/detailspage`}
                      className="block"
                    >
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
                        <h3 className="text-lg font-semibold">
                          {recipe.recipe_name}
                        </h3>
                        {user && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleSaveRecipe(recipe.recipe_id);
                            }}
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
                      <p className="text-sm text-gray-600 mt-1">
                        Cook Time: {recipe.cook_time}
                      </p>
                    </Link>

                    <div className="mt-3">
                      {/* Add Rating */}
                      <StarRating
                        recipeId={recipe.recipe_id}
                        reviews={userReviews}
                      />

                      {/* Show latest user comment if exists */}
                      {latestUserReview ? (
                        <div className="mt-2 text-sm text-gray-700">
                          <strong>Your comment:</strong>{" "}
                          {latestUserReview.comment}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">
                          No comment yet.
                        </p>
                      )}
                    </div>
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
