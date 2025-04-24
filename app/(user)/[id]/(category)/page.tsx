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
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

const CategoryRecipesPage = () => {
  const params = useParams();
  const categoryId = parseInt(params.category_id as string, 10);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          // Fetch user data
          const { data, error } = await supabase
            .from("users")
            .select("user_name, email, image_url")
            .eq("user_id", sessionUser.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
          } else {
            setUser({
              user_id: sessionUser.id,
              user_name: data?.user_name || "User",
              email: data?.email || "",
              image_url: data?.image_url || "/default-avatar.png",
            });
          }

          // Fetch saved recipes
          const { data: savedData, error: savedError } = await supabase
            .from("saved_recipes")
            .select("recipe_id")
            .eq("user_id", sessionUser.id);

          if (savedError) {
            console.error("Error fetching saved recipes:", savedError);
          } else {
            setSavedRecipes(savedData?.map((item) => item.recipe_id) || []);
          }
        }

        // Fetch recipes by category ID
        if (!isNaN(categoryId)) {
          const { data: recipeData, error: recipeError } = await supabase
            .from("recipe")
            .select(
              `
                recipe_id,
                recipe_name,
                cook_time,
                prep_time,
                description,
                ingredients,
                instructions,
                note,
                created_at,
                image_recipe ( image_url )
              `
            )
            .eq("category_id", categoryId);

          if (recipeError) {
            console.error("Error fetching recipes:", recipeError);
            setError("Failed to load recipes. Please try again.");
          } else {
            setRecipes(recipeData as Recipe[]);
          }
        } else {
          setError("Invalid category ID.");
          setRecipes([]); // Clear any existing recipes
        }


        // Fetch all reviews for all recipes
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*");

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError);
          setError("Failed to load reviews. Please try again.");
        } else {
          setReviews(reviewsData as Review[]);
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [categoryId]);

  const handleSaveRecipe = async (recipeId: number) => {
    if (!user || savedRecipes.includes(recipeId)) return;

    try {
      const { error } = await supabase.from("saved_recipes").insert([
        {
          user_id: user.user_id,
          recipe_id: recipeId,
        },
      ]);

      if (error) {
        console.error("Error saving recipe:", error);
      } else {
        setSavedRecipes((prev) => [...prev, recipeId]);
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } },
    hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } },
  };

  return (
    <motion.main
      className="container mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6, delayChildren: 0.2, staggerChildren: 0.1 } }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-3xl font-bold text-center mb-6 text-white dark:text-white">
        Recipes in Category #{categoryId}
      </h2>

      {loading ? (
        <p className="text-center text-lg text-white dark:text-white">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-500">No recipes found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => {
            const userReviews = reviews.filter(
              (r) => r.recipe_id === recipe.recipe_id
            );
            const latestReview = userReviews
              .filter((r) => r.user_id === user?.user_id)
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

            return (
              <motion.div
                key={recipe.recipe_id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
                variants={recipeCardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Link href={`/${recipe.recipe_id}/detailspage`} className="block h-full">
                  <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={
                        recipe.image_recipe && recipe.image_recipe[0]?.image_url
                          ? recipe.image_recipe[0].image_url
                          : "/default-recipe.jpg"
                      }
                      alt={recipe.recipe_name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
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
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                        aria-label={savedRecipes.includes(recipe.recipe_id) ? "Unsave recipe" : "Save recipe"}
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cook Time: {recipe.cook_time} | Prep Time: {recipe.prep_time}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                    {recipe.description}
                  </p>
                </Link>

                <div className="mt-auto pt-4">
                  <StarRating
                    recipeId={recipe.recipe_id}
                    reviews={userReviews}
                  />
                  {latestReview ? (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <strong>Your comment:</strong> {latestReview.comment}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                      No comment yet.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.main>
  );
};

export default CategoryRecipesPage;