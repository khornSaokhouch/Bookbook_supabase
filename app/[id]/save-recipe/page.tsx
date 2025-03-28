"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Define the Recipe type
type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
};

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current user's ID
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch saved recipes
        const { data, error } = await supabase
          .from("saved_recipes")
          .select("id, title, description, ingredients, instructions, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setSavedRecipes(data || []);
      } catch (err) {
        setError("Failed to load saved recipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [router]);

  // Remove saved recipe
  const handleRemoveSavedRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase.from("saved_recipes").delete().eq("id", recipeId);

      if (error) throw error;

      // Update state to reflect deletion
      setSavedRecipes(savedRecipes.filter((recipe) => recipe.id !== recipeId));
    } catch (err) {
      console.error("Error removing recipe:", err);
      setError("Failed to remove recipe.");
    }
  };

  return (
    <motion.div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-6 text-center">Saved Recipes</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-xl">Loading saved recipes...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : savedRecipes.length === 0 ? (
        <p className="text-center text-gray-500">No saved recipes found.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {savedRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-semibold mb-2">{recipe.title}</h3>
              <p className="text-gray-600 mb-4">{recipe.description}</p>
              <p className="text-sm text-gray-500">Ingredients: {recipe.ingredients}</p>
              <p className="text-sm text-gray-500 mt-2">Instructions: {recipe.instructions}</p>
              <p className="text-xs text-gray-400 mt-4">Saved on: {new Date(recipe.created_at).toLocaleDateString()}</p>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveSavedRecipe(recipe.id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
