"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Button } from "../../../components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { motion } from "framer-motion";

interface Recipe {
  recipe_id: string;
  recipe_name: string;
  category_id: string;
  occasion_id: string;
  created_at: string;
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
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

    if (error) {
      console.error("Error fetching recipes:", error);
      return;
    }
    setRecipes(data);
  }

  async function deleteRecipe() {
    if (!selectedRecipe) {
      console.error("No recipe selected for deletion.");
      return;
    }
    
    console.log("Attempting to delete recipe:", selectedRecipe);

    const { error } = await supabase
      .from("recipe")
      .delete()
      .eq("recipe_id", selectedRecipe);

    if (error) {
      console.error("Error deleting recipe:", error);
      return;
    }

    console.log("Recipe deleted successfully.");
    setRecipes(recipes.filter((recipe) => recipe.recipe_id !== selectedRecipe));
    setIsDeleteModalOpen(false);
    setIsSuccessModalOpen(true);

    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 3000);
  }

  return (
    <motion.div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Recipe List</h1>
      <table className="w-full border border-gray-200 rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr className="text-center">
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Recipe Name</th>
            <th className="p-3 border">Category</th>
            <th className="p-3 border">Occasion</th>
            <th className="p-3 border">Created At</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.recipe_id} className="text-center border">
              <td className="p-3 border">{recipe.recipe_id}</td>
              <td className="p-3 border">{recipe.recipe_name}</td>
              <td className="p-3 border">{recipe.category_id}</td>
              <td className="p-3 border">{recipe.occasion_id}</td>
              <td className="p-3 border">
                {new Date(recipe.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 border flex justify-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    console.log("Opening delete modal for:", recipe.recipe_id);
                    setSelectedRecipe(recipe.recipe_id);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border rounded-lg shadow-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteRecipe}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md bg-white border rounded-lg shadow-md">
          <DialogHeader className="px-6 py-4 bg-green-100">
            <DialogTitle className="text-green-700 flex items-center">
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
    </motion.div>
  );
}
