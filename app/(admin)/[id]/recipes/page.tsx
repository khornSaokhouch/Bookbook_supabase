"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Button } from "../../../components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

// Define the type for a single recipe
interface Recipe {
  recipe_id: string; // Change to 'string' if it's a string, otherwise 'number'
  recipe_name: string;
  category_id: string; // Adjust the type if needed
  occasion_id: string; // Adjust the type if needed
  created_at: string; // Adjust the type if needed
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]); // Explicitly define the state type
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null); // Recipe ID (string or null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipe")
      .select("recipe_id, recipe_name, category_id, occasion_id, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setRecipes(data); // TypeScript now understands the type of 'data'
  }

  async function deleteRecipe(id: string) {
    const { error } = await supabase.from("recipe").delete().eq("recipe_id", id);
    if (error) {
      console.error(error);
    } else {
      fetchRecipes();
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 3000);
    }
    setIsDeleteModalOpen(false);
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Recipe List
      </h1>
      <motion.table
        className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
      >
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          <tr className="text-center">
            <th className="p-3 border font-semibold uppercase text-sm">ID</th>
            <th className="p-3 border font-semibold uppercase text-sm">Recipe Name</th>
            <th className="p-3 border font-semibold uppercase text-sm">Category</th>
            <th className="p-3 border font-semibold uppercase text-sm">Occasion</th>
            <th className="p-3 border font-semibold uppercase text-sm">Created At</th>
            <th className="p-3 border font-semibold uppercase text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <motion.tr
              key={recipe.recipe_id}
              className="text-center border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <td className="p-3 border">{recipe.recipe_id}</td>
              <td className="p-3 border">{recipe.recipe_name}</td>
              <td className="p-3 border">{recipe.category_id}</td>
              <td className="p-3 border">{recipe.occasion_id}</td>
              <td className="p-3 border">
                {new Date(recipe.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 border flex justify-center gap-2">
                {/* Delete Button */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedRecipe(recipe.recipe_id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>

                  {/* Modal content */}
                  <DialogContent className="max-w-md bg-white border rounded-lg shadow-md overflow-hidden">
                    <DialogHeader className="px-6 py-4 bg-gray-50 dark:bg-white">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                        Confirm Deletion
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this recipe? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (selectedRecipe) {
                            deleteRecipe(selectedRecipe);
                          }
                        }}
                      >
                        Confirm Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="max-w-md bg-white border dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
            <DialogHeader className="px-6 py-4 bg-green-100">
              <DialogTitle className="text-lg font-semibold text-green-700 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Success!
              </DialogTitle>
              <DialogDescription className="text-green-700">
                The recipe was successfully deleted!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="px-6 py-4 bg-green-100 flex justify-end">
              <Button variant="outline" onClick={() => setIsSuccessModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
