"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const category_id = params?.category_id as string;

  const [recipes, setRecipes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!category_id) {
          setError("Category ID missing from URL.");
          return;
        }

        const categoryId = parseInt(category_id, 10);
        if (isNaN(categoryId)) {
          setError("Invalid category selected.");
          return;
        }

        // Get user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.error("Session error:", sessionError);

        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("user_name, email, image_url")
            .eq("user_id", sessionUser.id)
            .single();

          if (userError) console.error("User fetch error:", userError);

          if (userData) {
            setUser({
              user_id: sessionUser.id,
              user_name: userData.user_name || "User",
              email: userData.email || "",
              image_url: userData.image_url || "/default-avatar.png",
            });

            const { data: savedData, error: savedError } = await supabase
              .from("saved_recipes")
              .select("recipe_id")
              .eq("user_id", sessionUser.id);

            if (savedError) console.error("Saved recipes fetch error:", savedError);

            setSavedRecipes(savedData?.map((item) => item.recipe_id) || []);
          }
        }

        // Fetch category recipes
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipe")
          .select(`
            recipe_id,
            recipe_name,
            description,
            ingredients,
            instructions,
            created_at,
            prep_time,
            cook_time,
            note,
            image_recipe(image_url)
          `)
          .eq("category_id", categoryId);

        if (recipesError) throw recipesError;

        const normalized = recipesData.map((r: any) => ({
          ...r,
          image_url: r.image_recipe?.[0]?.image_url || "/default-image.jpg",
        }));

        setRecipes(normalized);
      } catch (err: any) {
        console.error("Error fetching category data:", err);
        setError("Failed to load category recipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [category_id]);

  const handleSaveRecipe = async (recipeId: string) => {
    if (!user) return;

    const isSaved = savedRecipes.includes(recipeId);

    if (isSaved) {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", user.user_id)
        .eq("recipe_id", recipeId);

      if (!error) {
        setSavedRecipes((prev) => prev.filter((id) => id !== recipeId));
      } else {
        console.error("Error unsaving recipe:", error);
      }
    } else {
      const { error } = await supabase
        .from("saved_recipes")
        .insert([{ user_id: user.user_id, recipe_id: recipeId }]);

      if (!error) {
        setSavedRecipes((prev) => [...prev, recipeId]);
      } else {
        console.error("Error saving recipe:", error);
      }
    }
  };

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-white">
        Category Recipes
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-300">Loading recipes...</p>
      ) : error ? (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">{error}</div>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">
          No recipes found in this category.
        </p>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.recipe_id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-xl flex flex-col"
              variants={recipeCardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Link href={`/${recipe.recipe_id}/detailspage`} className="block">
                <div className="relative h-48 overflow-hidden rounded-lg mb-3">
                  <Image
                    src={recipe.image_url}
                    alt={recipe.recipe_name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 hover:scale-110"
                    priority
                    unoptimized
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">
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
                          : "bg-gray-200 dark:bg-gray-600 dark:text-gray-300"
                      }`}
                      aria-label={savedRecipes.includes(recipe.recipe_id) ? "Unsave Recipe" : "Save Recipe"}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cook Time: {recipe.cook_time}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
