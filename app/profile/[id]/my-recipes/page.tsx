"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Plus,
  ChefHat,
  Heart,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Recipe = {
  recipe_id: number;
  recipe_name: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  images: { image_url: string }[];
};

const constructImageUrl = (path: string | null) => {
  if (!path) return "/default-image.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("recipe")
          .select(
            `recipe_id, recipe_name, description, ingredients, instructions, created_at, image_recipe(image_url)`
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const recipesWithImages = data.map((recipe) => ({
          recipe_id: recipe.recipe_id,
          recipe_name: recipe.recipe_name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          created_at: recipe.created_at,
          images: recipe.image_recipe || [],
        })) as Recipe[];

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

  const handleDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    try {
      const { error } = await supabase
        .from("recipe")
        .delete()
        .eq("recipe_id", recipeToDelete);
      if (error) throw error;

      setRecipes((prev) => prev.filter((r) => r.recipe_id !== recipeToDelete));
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while deleting.");
      }
    }
  };

  const openDeleteModal = (id: number) => {
    setRecipeToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRecipeToDelete(null);
  };

  const openEditModal = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setRecipeToEdit(null);
  };

  const handleUpdateRecipe = async () => {
    if (!recipeToEdit) return;
    try {
      const { error } = await supabase
        .from("recipe")
        .update({
          recipe_name: recipeToEdit.recipe_name,
          description: recipeToEdit.description,
          ingredients: recipeToEdit.ingredients,
          instructions: recipeToEdit.instructions,
        })
        .eq("recipe_id", recipeToEdit.recipe_id);

      if (error) throw error;

      setRecipes((prev) =>
        prev.map((r) =>
          r.recipe_id === recipeToEdit.recipe_id ? recipeToEdit : r
        )
      );

      closeEditModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while updating.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Loading your delicious recipes...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🍳 Getting everything ready for you
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800 py-8 px-4 sm:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-orange-200 dark:border-orange-700 mb-4">
            <ChefHat className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              My Kitchen
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            My Recipes 👨‍🍳
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Your personal collection of culinary masterpieces
          </p>

          {/* Stats */}
          {recipes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 dark:border-orange-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  📚 {recipes.length} recipes created
                </span>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-200 dark:border-pink-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ⭐ Your culinary journey
                </span>
              </div>
            </div>
          )}

          {/* Add Recipe Button */}
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/recipe/create")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Recipe
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center"
            variants={itemVariants}
          >
            <p className="text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </motion.div>
        )}

        {recipes.length === 0 ? (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-6xl mb-6">🍳</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                No recipes yet!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start your culinary journey by creating your first recipe
              </p>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/recipe/create")}
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Create Your First Recipe
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {recipes.map((recipe, index) => {
              const imageUrl = constructImageUrl(recipe.images[0]?.image_url);

              return (
                <motion.div
                  key={recipe.recipe_id}
                  className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Recipe Image */}
                  <div className="relative overflow-hidden">
                    <Link
                      href={`/${recipe.recipe_id}/detailspage`}
                      className="block"
                    >
                      {recipe.images.length > 0 ? (
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={recipe.recipe_name}
                          width={400}
                          height={250}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          priority
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20">
                          <div className="text-center">
                            <ChefHat className="h-12 w-12 text-orange-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              No image available
                            </p>
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Overlay with actions */}
                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        onClick={() => openEditModal(recipe)}
                        className="bg-blue-500/90 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit Recipe"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => openDeleteModal(recipe.recipe_id)}
                        className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete Recipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="p-6">
                    <Link
                      href={`/${recipe.recipe_id}/detailspage`}
                      className="block"
                    >
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200 line-clamp-2">
                        {recipe.recipe_name}
                      </h3>
                    </Link>

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created {new Date(recipe.created_at).toLocaleDateString()}
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 mt-4">
                      <motion.button
                        onClick={() => openEditModal(recipe)}
                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit className="h-3 w-3 mr-1 inline" />
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => openDeleteModal(recipe.recipe_id)}
                        className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 className="h-3 w-3 mr-1 inline" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Delete Recipe?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this recipe? This action
                  cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={closeDeleteModal}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteRecipe}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && recipeToEdit && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">✏️</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Edit Recipe
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your delicious creation
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateRecipe();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={recipeToEdit.recipe_name}
                      onChange={(e) =>
                        setRecipeToEdit({
                          ...recipeToEdit,
                          recipe_name: e.target.value,
                        })
                      }
                      placeholder="Enter recipe name"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={recipeToEdit.description || ""}
                      onChange={(e) =>
                        setRecipeToEdit({
                          ...recipeToEdit,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your amazing recipe..."
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Ingredients
                    </label>
                    <textarea
                      value={recipeToEdit.ingredients || ""}
                      onChange={(e) =>
                        setRecipeToEdit({
                          ...recipeToEdit,
                          ingredients: e.target.value,
                        })
                      }
                      placeholder="List your ingredients (comma-separated)"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={recipeToEdit.instructions || ""}
                      onChange={(e) =>
                        setRecipeToEdit({
                          ...recipeToEdit,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Step-by-step cooking instructions"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={5}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={closeEditModal}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles className="h-4 w-4 mr-2 inline" />
                      Save Changes
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
