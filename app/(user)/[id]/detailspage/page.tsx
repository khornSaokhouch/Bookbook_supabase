"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiClock } from "react-icons/fi";
import { ImSpoonKnife } from "react-icons/im";
import { BsSun } from "react-icons/bs";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";
import { Badge } from "@/app/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import CommentSection from "@/app/components/CommentSection"; // Import the CommentSection

interface RecipeData {
  recipe_id: number;
  recipe_name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  image_recipe: { image_url: string }[];
  users: { user_name: string };
  reviews: Review[];
}

interface Recipe {
  recipe_id: string;
  recipe_name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  image_url: string;
  average_rating: number;
  ingredients: string;
  author: string;
  reviews: Review[];
}

interface Review {
  user_name: string;
  comment: string;
  rating: number;
}

const shapeRecipeData = (data: RecipeData[]): Recipe[] => {
  return data.map((recipe) => {
    const ratings = recipe.reviews.map((review) => review.rating);
    const averageRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      ...recipe,
      recipe_id: recipe.recipe_id.toString(),
      average_rating: averageRating,
      image_url: recipe.image_recipe?.[0]?.image_url || "/default-recipe.jpg",
      author: recipe.users?.user_name || "Unknown Author",
    };
  });
};

async function getRecipeById(recipeId: number): Promise<RecipeData | null> {
  try {
    const { data, error } = await supabase
      .from("recipe")
      .select(`*, image_recipe(image_url), users(user_name), reviews(rating, comment)`)
      .eq("recipe_id", recipeId)
      .single();

    if (error) throw error;

    if (!data) {
      console.warn("No recipe found for the ID:", recipeId);
      return null;
    }

    return data as RecipeData;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

const DetailsPage: React.FC = () => {
  const { id } = useParams();
  const recipeId = Number(id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isNaN(recipeId)) {
          setError("Invalid recipe ID. Must be a number.");
          return;
        }

        const rawRecipe = await getRecipeById(recipeId);
        if (rawRecipe) {
          const shapedRecipe = shapeRecipeData([rawRecipe])[0];
          setRecipe(shapedRecipe);
        } else {
          setError("Recipe not found.");
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const totalTime = recipe?.prep_time + recipe?.cook_time || 0;

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-400">Loading recipe...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!recipe) {
    return <p className="text-gray-600 dark:text-gray-400">No recipe found.</p>;
  }

  return (
    <motion.div
      className="container mx-auto px-8 md:px-44 py-8 dark:bg-gray-900 dark:text-white rounded-lg shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
    >
      <div className="relative">
        <Image
          src={recipe.image_url}
          alt={recipe.recipe_name}
          width={1200}
          height={600}
          unoptimized
          className="rounded-lg shadow-md object-cover w-full h-156"
        />

        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="flex items-center gap-1 bg-black/60 text-white">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{recipe.average_rating.toFixed(1)}</span>
          </Badge>
        </div>
      </div>

      <h1 className="text-4xl font-bold mt-6 text-gray-800 dark:text-gray-100">{recipe.recipe_name}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">By {recipe.author}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
        <div className="flex flex-col bg-gray-100 dark:bg-gray-700 items-center rounded-lg shadow-md p-4">
          <FiClock className="text-3xl text-red-600" />
          <h3 className="mt-2 font-semibold text-orange-600 dark:text-orange-400">Prep Time</h3>
          <p className="dark:text-gray-200">{recipe.prep_time} mins</p>
        </div>
        <div className="flex flex-col bg-gray-100 dark:bg-gray-700 items-center rounded-lg shadow-md p-4">
          <ImSpoonKnife className="text-3xl text-purple-700" />
          <h3 className="mt-2 font-semibold text-blue-600 dark:text-blue-400">Cook Time</h3>
          <p className="dark:text-gray-200">{recipe.cook_time} mins</p>
        </div>
        <div className="flex flex-col bg-gray-100 dark:bg-gray-700 items-center rounded-lg shadow-md p-4">
          <BsSun className="text-3xl text-yellow-600" />
          <h3 className="mt-2 font-semibold text-green-700 dark:text-green-400">Total Time</h3>
          <p className="dark:text-gray-200">{totalTime} mins</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Ingredients</h2>
        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
          {recipe.ingredients.split(",").map((ingredient, index) => (
            <li key={index}>{ingredient.trim()}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Instructions</h2>
        <p className="text-gray-700 dark:text-gray-300">{recipe.description}</p>
      </section>

      {/* Use CommentSection component */}
      <CommentSection
        recipeId={recipeId}
        reviews={recipe.reviews.map((review, index) => ({
          ...review,
          key: `${review.user_name}-${index}`, // Ensure unique key for each review
        }))}
      />

      <div className="flex justify-end">
        <Button variant="primary" className="px-6 py-3">
          Save Recipe
        </Button>
      </div>
    </motion.div>
  );
};

export default DetailsPage;
