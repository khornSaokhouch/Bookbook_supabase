"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Define the Review type
type Review = {
  review_id: number;
  recipe_id: string;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
};

// Define the Recipe type
type Recipe = {
  recipe_id: string;
  recipe_name: string;
  description: string;
  cook_time: string;
  image_recipe: { image_url: string }[];
};

const StarRating = ({ reviews }: { reviews: Review[] }) => {
  // Calculate average rating if reviews are available
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="text-yellow-500">
      {/* Replace with your real logic to show stars based on average rating */}
      ★ ★ ★ ★ ☆
      <p className="text-sm">{averageRating.toFixed(1)} / 5</p>
    </div>
  );
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<Recipe[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Map<string, Review[]>>(new Map());

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("recipe")
        .select("*, image_recipe ( image_url )")
        .or(`recipe_name.ilike.%${query}%,description.ilike.%${query}%,ingredients.ilike.%${query}%`);

      if (error) {
        console.error("Search error:", error);
        return;
      }

      setResults(data || []);
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase.from("reviews").select("*");

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      const reviewsByRecipeId = new Map<string, Review[]>();
      data?.forEach((review: Review) => {
        if (!reviewsByRecipeId.has(review.recipe_id)) {
          reviewsByRecipeId.set(review.recipe_id, []);
        }
        reviewsByRecipeId.get(review.recipe_id)?.push(review);
      });
      setReviewsMap(reviewsByRecipeId);
    };

    fetchReviews();
  }, []);

  return (
    <main className="container mx-auto p-6">
      <section className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          Search Results for: <span className="text-blue-600">{query}</span>
        </h2>

        {results.length === 0 ? (
          <p className="text-center text-gray-500">No recipes found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {results.map((recipe) => {
              const imageUrl = recipe.image_recipe?.[0]?.image_url || "/default-recipe.jpg";
              const reviews = reviewsMap.get(recipe.recipe_id) || []; // Get reviews for each recipe

              return (
                <motion.div
                  key={recipe.recipe_id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col"
                  whileHover={{ scale: 1.03 }}
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
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Cook Time: {recipe.cook_time}</p>
                  </Link>

                  <div className="mt-3">
                    <StarRating reviews={reviews} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
