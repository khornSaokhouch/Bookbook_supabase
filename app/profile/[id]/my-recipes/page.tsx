"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react"; // Import icons
import { motion } from "framer-motion"; // Import framer-motion

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

  // Handle Delete
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

  // Open delete modal
  const openDeleteModal = (id: number) => {
    setRecipeToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRecipeToDelete(null);
  };

  // Open edit modal
  const openEditModal = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setRecipeToEdit(null);
  };

  // Handle Edit Save
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
        prev.map((r) => (r.recipe_id === recipeToEdit.recipe_id ? recipeToEdit : r))
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



  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">My Recipes</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Loading recipes...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">No recipes found.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const imageUrl = constructImageUrl(recipe.images[0]?.image_url);

            return (
              <div
                key={recipe.recipe_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
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
                    <div className="flex items-center justify-center w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-300">No image available</p>
                    </div>
                  )}
                </Link>
                <h3 className="text-lg font-semibold mt-4 text-gray-800 dark:text-gray-200">{recipe.recipe_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ingredients: {recipe.ingredients}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Added on: {new Date(recipe.created_at).toLocaleDateString()}</p>

                {/* Edit & Delete Buttons */}
                <div className="mt-4 flex space-x-2 justify-end">
                  <button onClick={() => openEditModal(recipe)} className="text-blue-500 hover:underline" aria-label="Edit">
                    <Edit className="w-8" />
                  </button>
                  <button onClick={() => openDeleteModal(recipe.recipe_id)} className="text-red-500 hover:underline" aria-label="Delete">
                    <Trash2 className="w-8" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <motion.div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">Are you sure you want to delete this recipe?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteRecipe}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button onClick={closeDeleteModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {showEditModal && recipeToEdit && (
        <motion.div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-196">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Edit Recipe</h3>
             <form onSubmit={handleUpdateRecipe} className="space-y-4">
              <div>
                <label htmlFor="recipe_name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Recipe Name</label>
                <input
                  type="text"
                  id="recipe_name"
                  value={recipeToEdit.recipe_name}
                  onChange={(e) => setRecipeToEdit({ ...recipeToEdit, recipe_name: e.target.value })}
                  placeholder="Enter recipe name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Description</label>
                <textarea
                  id="description"
                  value={recipeToEdit.description || ""}
                  onChange={(e) => setRecipeToEdit({ ...recipeToEdit, description: e.target.value })}
                  placeholder="Enter description"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none"
                />
              </div>
              <div>
                <label htmlFor="ingredients" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Ingredients</label>
                <textarea
                  id="ingredients"
                  value={recipeToEdit.ingredients || ""}
                  onChange={(e) => setRecipeToEdit({ ...recipeToEdit, ingredients: e.target.value })}
                  placeholder="Enter ingredients (comma-separated)"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none"
                />
              </div>
              <div>
                <label htmlFor="instructions" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Instructions</label>
                <textarea
                  id="instructions"
                  value={recipeToEdit.instructions || ""}
                  onChange={(e) => setRecipeToEdit({ ...recipeToEdit, instructions: e.target.value })}
                  placeholder="Enter instructions"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
                />
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleUpdateRecipe}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
                <button onClick={closeEditModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
              </div>
              </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}