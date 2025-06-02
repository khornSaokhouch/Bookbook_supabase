"use client";

import { motion } from "framer-motion";
import { Heart, Clock, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";
import type { User } from "@/app/types";

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

interface RecipeCardProps {
  recipe: Recipe;
  reviews: Review[];
  user: User | null;
  savedRecipes: number[];
  onSaveRecipe: (recipeId: number) => void;
  parseTime: (value: string | number) => number;
  formatTime: (minutes: number) => string;
  index?: number;
}

const RecipeCard = ({
  recipe,
  reviews,
  user,
  savedRecipes,
  onSaveRecipe,
  parseTime,
  formatTime,
  index = 0,
}: RecipeCardProps) => {
  const imageUrl = recipe.image_recipe[0]?.image_url || "/default-recipe.jpg";
  const userReviews = reviews.filter(
    (review) => review.recipe_id === recipe.recipe_id
  );
  const totalTime = parseTime(recipe.prep_time) + parseTime(recipe.cook_time);
  const averageRating =
    userReviews.length > 0
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) /
        userReviews.length
      : 0;

  const recipeCardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -8, scale: 1.02 },
  };

  // Create the detail page URL based on folder structure
  const getDetailUrl = () => {
    // Based on the folder structure: app/(user)/[id]/detailspage/page.tsx
    // The URL should be /${user_id}/${recipe_id}/detailspage
    return `/${recipe.recipe_id}/detailspage`;
  };

  return (
    <Link href={getDetailUrl()} passHref legacyBehavior>
      <motion.a
        className="block group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden cursor-pointer"
        variants={recipeCardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        transition={{ delay: index * 0.1 }}
      >
        {/* Magical gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Image Container with magical effects */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={recipe.recipe_name}
            width={300}
            height={200}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Floating time badge */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(totalTime)}
          </div>

          {/* Rating sparkle */}
          {averageRating > 0 && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              {averageRating.toFixed(1)}
            </div>
          )}

          {/* New recipe magic */}
          {new Date(recipe.created_at) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
              ✨ Fresh Recipe!
            </div>
          )}
        </div>

        {/* Content with friendly design */}
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 line-clamp-2 flex-1 mr-3">
              {recipe.recipe_name}
            </h3>

            {user && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSaveRecipe(recipe.recipe_id);
                }}
                className={`relative p-3 rounded-full transition-all duration-300 transform hover:scale-110 z-10 ${
                  savedRecipes.includes(recipe.recipe_id)
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${
                    savedRecipes.includes(recipe.recipe_id)
                      ? "fill-current"
                      : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* Friendly description */}
          {recipe.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
              {recipe.description.length > 80
                ? `${recipe.description.substring(0, 80)}...`
                : recipe.description}
            </p>
          )}

          {/* Star rating with friendly message */}
          <div className="mb-4">
            <StarRating reviews={userReviews} />
          </div>
        </div>

        {/* Magical hover border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-orange-400/50 group-hover:to-pink-400/50 rounded-3xl transition-all duration-300"></div>

        {/* Floating discover button */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-full shadow-xl">
            <Eye className="h-4 w-4" />
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

export default RecipeCard;
