"use client"

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Recipe Type
type Recipe = {
  recipe_id: string; // Ensure this is unique for each recipe
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  images: { image_url: string }[]; // Add an images property to hold image URLs
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

        // Fetch recipes only created by the logged-in user and join with image data
        const { data, error } = await supabase
          .from("recipe")
          .select(`
            recipe_id,
            recipe_name,
            description,
            ingredients,
            instructions,
            created_at,
            image_recipe(image_url)  // Join with the image_recipe table to get images
          `)
          .eq("user_id", user.id) // Filter by current user
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Ensure each recipe has an images array
        const recipesWithImages = data.map((recipe: any) => ({
          ...recipe,
          images: recipe.image_recipe || [],  // Attach images array
        }));

        setRecipes(recipesWithImages);
      } catch (err) {
        setError("Failed to load recipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [router]);

  return (
    <motion.div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-8 text-center">My Recipes</h1>

      {/* Display Recipes */}
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
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.recipe_id} // Make sure this `id` is unique and properly passed to `key`
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
            >

              {/* Display Image if available */}
              {recipe.images.length > 0 ? (
                <img
                  src={recipe.images[0].image_url} // Use the first image URL from the images array
                  alt={recipe.recipe_name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              ) : (
                <p className="text-center text-gray-400">No image available</p>
              )}

              <p className="text-gray-600 mb-4">{recipe.description}</p>
              <p className="text-sm text-gray-500">Ingredients: {recipe.ingredients}</p>
              <p className="text-sm text-gray-500 mt-2">Instructions: {recipe.instructions}</p>
              <p className="text-xs text-gray-400 mt-4">Added on: {new Date(recipe.created_at).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
