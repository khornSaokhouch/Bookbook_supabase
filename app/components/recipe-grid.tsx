"use client";

import { motion } from "framer-motion";
import RecipeCard from "./recipe-card";

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
};

type Review = {
  review_id: number;
  recipe_id: number;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

type User = {
  user_id: string;
  user_name: string;
  email: string;
  image_url: string;
};

interface RecipeGridProps {
  recipes: Recipe[];
  reviews: Review[];
  user: User | null;
  savedRecipes: number[];
  onSaveRecipe: (recipeId: number) => void;
  parseTime: (value: string | number) => number;
  formatTime: (minutes: number) => string;
  loading?: boolean;
}

const RecipeGrid = ({
  recipes,
  reviews,
  user,
  savedRecipes,
  onSaveRecipe,
  parseTime,
  formatTime,
  loading = false,
}: RecipeGridProps) => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
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
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
          <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            🍳
          </div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back soon for delicious new recipes!
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.recipe_id}
          recipe={recipe}
          reviews={reviews}
          user={user}
          savedRecipes={savedRecipes}
          onSaveRecipe={onSaveRecipe}
          parseTime={parseTime}
          formatTime={formatTime}
          index={index}
        />
      ))}
    </motion.div>
  );
};

export default RecipeGrid;
