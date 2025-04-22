"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Recipe Type
type Recipe = {
  recipe_id: string;
  recipe_name: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  images: { image_url: string }[];
};

const constructImageUrl = (path: string | null) => {
  if (!path) return "/default-image.jpg"; // Fallback to a default image
  if (path.startsWith("http://") || path.startsWith("https://")) return path; // Already a valid URL
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`; // Construct full URL
};

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the logged-in user
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch recipes created by the logged-in user
        const { data, error } = await supabase
          .from("recipe")
          .select(
            `recipe_id,
            recipe_name,
            description,
            ingredients,
            instructions,
            created_at,
            image_recipe(image_url)`
          )
          .eq("user_id", user.id) // Filter by current user
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Ensure each recipe has an images array
        const recipesWithImages = data.map((recipe) => ({
          recipe_id: recipe.recipe_id,
          recipe_name: recipe.recipe_name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          created_at: recipe.created_at,
          images: recipe.image_recipe || [], // Transform image_recipe to images
        })) as Recipe[]; // Explicitly cast to Recipe[]

        setRecipes(recipesWithImages);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [router]);

  return (
    <motion.div
      className="container mx-auto py-10 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">My Recipes</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-xl">Loading recipes...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-500">No recipes found.</p>
      ) : (
        <motion.div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const imageUrl = constructImageUrl(recipe.images[0]?.image_url);

            return (
              <motion.div
                key={recipe.recipe_id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/${recipe.recipe_id}/detailspage`} className="block">
                  {recipe.images.length > 0 ? (
                    <Image
                      src={imageUrl}
                      alt={recipe.recipe_name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg"
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-lg">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </Link>
                <h3 className="text-lg font-semibold mt-4">{recipe.recipe_name}</h3>
                <p className="text-gray-600 mt-2">{recipe.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ingredients: {recipe.ingredients}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Instructions: {recipe.instructions}
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  Added on: {new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
