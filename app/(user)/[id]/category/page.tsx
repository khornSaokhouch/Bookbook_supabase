// src/app/(user)/[id]/category/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import RecipeCard from "../../../components/Card";
import { supabase } from "../../../lib/supabaseClient";

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  description: string;
  prep_time: string;
  cook_time: string;
  image_url: string;
  average_rating: number;
  ingredients: string;
  author: string;
}

interface DatabaseRecipeType {
  recipe_id: number;
  recipe_name: string;
  description: string;
  prep_time: string;
  cook_time: string;
  image_recipe: { image_url: string }[];
  users: { user_name: string }[];
  reviews: { rating: number }[];
  ingredients: string;
}

interface ReviewType {
  rating: number;
}

const constructImageUrl = (path: string | null) => {
  if (!path) return "/default-image.jpg"; // Fallback to a default image
  if (path.startsWith("http://") || path.startsWith("https://")) return path; // Already a valid URL
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`; // Construct full URL
};

const CategoryPage: React.FC = () => {
  const searchParams = useSearchParams();
  const category_id = searchParams.get("category_id");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category_id) return;

    const fetchRecipesByCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("recipe")
          .select(`
            recipe_id,
            recipe_name,
            description,
            prep_time,
            cook_time,
            image_recipe(image_url),
            users(user_name),
            reviews(rating),
            ingredients
          `)
          .eq("category_id", category_id); // Filter by category_id

        if (error) {
          console.error("Supabase Error:", error); // Log Supabase error
          throw error;
        }

        const recipesData = data.map((recipe: DatabaseRecipeType) => {
          const ratings = recipe.reviews?.map(
            (review: ReviewType) => review.rating
          ) || [];
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
              : 0;

          return {
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name || "Unknown Recipe",
            description: recipe.description || "No description available",
            prep_time: recipe.prep_time || "N/A",
            cook_time: recipe.cook_time || "N/A",
            image_url: constructImageUrl(recipe.image_recipe?.[0]?.image_url), // Use constructImageUrl
            average_rating: averageRating,
            ingredients: recipe.ingredients || "No ingredients provided",
            author: recipe.users?.[0]?.user_name || "Unknown Author",
          };
        });

        setRecipes(recipesData);
      } catch (err: unknown) {
        setError("Error fetching recipes. Please try again later.");
        console.error("Error fetching recipes:", err); // Log error
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesByCategory();
  }, [category_id]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading recipes...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (recipes.length === 0) {
    return <div className="text-center text-gray-500">No recipes found for this category.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Main Content */}
      <main className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-10">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipe_id}
              recipe_id={recipe.recipe_id}
              recipe_name={recipe.recipe_name}
              cook_time={recipe.cook_time}
              average_rating={recipe.average_rating}
              image_url={recipe.image_url}
              description={recipe.description}
              ingredients={recipe.ingredients}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
