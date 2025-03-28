"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react"; // Import Trash2 Icon

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
          // User is not authenticated, redirect to login or handle accordingly
          router.push("/login");
          return;
        }
  
        // Now that we know there is a user, continue fetching.
  
        setLoading(false);
      } catch(e){
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
    } catch (err: any) {
      console.error("Error removing recipe:", err);
      setError("Failed to remove recipe.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="container mx-auto py-10 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Saved Recipes</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">Loading saved recipes...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : savedRecipes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">No saved recipes found.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {savedRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              variants={recipeCardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{recipe.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{recipe.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingredients: {recipe.ingredients}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Instructions: {recipe.instructions}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Saved on: {new Date(recipe.created_at).toLocaleDateString()}</p>

              {/* Remove Button with Icon */}
              <button
                onClick={() => handleRemoveSavedRecipe(recipe.id)}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 inline-flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}