"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Button } from "../../../components/ui/button";
import { Trash } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);  // State for success pop-up
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipe")
      .select("recipe_id, recipe_name, category_id, occasion_id, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setRecipes(data);
  }

  async function deleteRecipe(id) {
    const { error } = await supabase.from("recipe").delete().eq("recipe_id", id);
    if (error) {
      console.error(error);
    } else {
      fetchRecipes();
      setIsSuccessModalOpen(true); // Open the success modal
      setTimeout(() => {
        setIsSuccessModalOpen(false); // Close the success modal after 3 seconds
      }, 3000);
    }
    setIsDeleteModalOpen(false); // Close the delete confirmation modal after deletion
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recipe List</h1>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Recipe Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Occasion</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.recipe_id} className="text-center border">
              <td className="p-2 border">{recipe.recipe_id}</td>
              <td className="p-2 border">{recipe.recipe_name}</td>
              <td className="p-2 border">{recipe.category_id}</td>
              <td className="p-2 border">{recipe.occasion_id}</td>
              <td className="p-2 border">
                {new Date(recipe.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 border flex justify-center gap-2">
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
                      <Trash className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>

                  {/* Modal content */}
                  <DialogContent>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this recipe? This action cannot be undone.
                    </DialogDescription>
                    {/* Manual footer with action buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteRecipe(selectedRecipe);
                        }}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>The recipe was successfully deleted!</DialogDescription>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setIsSuccessModalOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
