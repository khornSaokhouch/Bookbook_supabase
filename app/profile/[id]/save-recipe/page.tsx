"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Define the Recipe type
type Recipe = {
  id: string
  title: string
  description: string
  ingredients: string
  instructions: string
  created_at: string
  image_url?: string
}

const constructImageUrl = (path: string | null) => {
  if (!path) return "/default-image.jpg" // Fallback to a default image
  if (path.startsWith("http://") || path.startsWith("https://")) return path // Already a valid URL
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}` // Construct full URL
}

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData?.session?.user
        if (!user) {
          router.push("/login")
          return
        }
        const { data, error } = await supabase
          .from("saved_recipes")
          .select(
            `id, created_at, recipe:recipe_id (recipe_name, description, ingredients, instructions, image_recipe (image_url))`,
          )
          .eq("user_id", user.id)
        if (error) throw error
        const formattedRecipes =
          data?.map((savedRecipe) => {
            const recipe = Array.isArray(savedRecipe.recipe) ? savedRecipe.recipe[0] : savedRecipe.recipe
            return {
              id: savedRecipe.id,
              title: recipe?.recipe_name || "Unknown",
              description: recipe?.description || "No description available",
              ingredients: recipe?.ingredients || "No ingredients listed",
              instructions: recipe?.instructions || "No instructions provided",
              created_at: savedRecipe.created_at,
              image_url: constructImageUrl(recipe?.image_recipe?.[0]?.image_url),
            }
          }) || []
        setSavedRecipes(formattedRecipes)
      } catch (e) {
        console.error("Error fetching recipes:", e)
        setError("Failed to load saved recipes.")
      } finally {
        setLoading(false)
      }
    }
    fetchSavedRecipes()
  }, [router])

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return
    try {
      const { error } = await supabase.from("saved_recipes").delete().eq("id", recipeToDelete)
      if (error) throw error
      setSavedRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeToDelete))
    } catch (err) {
      console.error("Error removing recipe:", err)
      setError("Failed to remove recipe.")
    } finally {
      setRecipeToDelete(null)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  }

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  }

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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden" // Added overflow-hidden
              variants={recipeCardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              {/* --- START OF CHANGES --- */}

              {/* 1. Create a relative container for the image and icon */}
              <div className="relative">
                <Link href={`/recipes/${recipe.id}/detailspage`} className="block">
                  {recipe.image_url ? (
                    <Image
                      src={recipe.image_url || "/placeholder.svg"}
                      alt={recipe.title}
                      width={500}
                      height={200}
                      className="w-full h-48 object-cover" // Removed rounded-md and mb-4
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-gray-200">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </Link>

                {/* 2. Add the new absolute-positioned icon button */}
                <motion.button
                  onClick={() => setRecipeToDelete(recipe.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors duration-200"
                  aria-label="Delete recipe"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* 3. Wrap text content in a div with padding */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{recipe.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{recipe.description}</p>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  Saved on: {new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* 4. The old button is now removed from here */}

              {/* --- END OF CHANGES --- */}
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL (Unchanged) */}
      <AnimatePresence>
        {recipeToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🗑️</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Delete Favorite Recipe?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this Favorite Recipe? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setRecipeToDelete(null)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmDelete}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete Recipe
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}