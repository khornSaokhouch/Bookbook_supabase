"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, XCircle, CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

type Recipe = {
  recipe_id: number;
  recipe_name: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  images: { image_url: string }[];
};

interface EditRecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onUpdateRecipe: (updatedRecipe: Recipe) => void;
}

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({
  recipe,
  onClose,
  onUpdateRecipe,
}) => {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>({ ...recipe });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    recipe.images.map((img) => img.image_url)
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID asynchronously on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (imageFiles.length > 0) {
      const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  }, [imageFiles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const uniqueFiles = files.filter(
        (file) =>
          !imageFiles.find((existingFile) => existingFile.name === file.name)
      );
      setImageFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
    }
  };

  const handleClearImage = (index: number) => {
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        setUploading(true);

        const uploadPromises = imageFiles.map(async (imageFile) => {
          const uuid = uuidv4();
          const filePath = `${userId}/images/${uuid}-${imageFile.name}`; // uses userId now

          const { error: uploadError } = await supabase.storage
            .from("recipes")
            .upload(filePath, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          // Build full public URL manually using env
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipes/${filePath}`;
          return publicUrl;
        });

        const uploadResults = await Promise.all(uploadPromises);
        newImageUrls.push(...uploadResults);
        setUploading(false);
      }

      // Update recipe fields
      const { data, error } = await supabase
        .from("recipe")
        .update({
          recipe_name: editedRecipe.recipe_name,
          description: editedRecipe.description,
          ingredients: editedRecipe.ingredients,
          instructions: editedRecipe.instructions,
        })
        .eq("recipe_id", editedRecipe.recipe_id)
        .select("*")
        .single();

      if (error) {
        console.error("Supabase Update Error:", error);
        setError(`Recipe update failed: ${error.message}`);
        setLoading(false);
        return;
      }

      // Clear and insert image references
      await supabase
        .from("image_recipe")
        .delete()
        .eq("recipe_id", editedRecipe.recipe_id);

      const imageInsertPromises = newImageUrls.map((imageUrl) =>
        supabase
          .from("image_recipe")
          .insert([{ recipe_id: editedRecipe.recipe_id, image_url: imageUrl }])
      );
      await Promise.all(imageInsertPromises);

      const updatedRecipe: Recipe = {
        recipe_id: data.recipe_id,
        recipe_name: data.recipe_name,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        created_at: data.created_at,
        images: newImageUrls.map((url) => ({ image_url: url })),
      };

      onUpdateRecipe(updatedRecipe);
      setSuccessMessage("Recipe updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
      onClose();
    } catch (dbErr: unknown) {
      console.error("Database Update Error:", dbErr);

      // Check if dbErr is an Error object with a message property
      const errorMessage =
        dbErr instanceof Error ? dbErr.message : "An unexpected error occurred.";

      setError(
        `Recipe update failed: ${errorMessage}. Please check the console for details.`
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const editableFields: (keyof Recipe)[] = [
    "recipe_name",
    "description",
    "ingredients",
    "instructions",
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 p-6 relative"
        variants={modalVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
            Edit Recipe
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">{error}</div>
        )}
         {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editableFields.map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize"
              >
                {field.replace("_", " ")}
              </label>
              <textarea
                id={field}
                name={field}
                value={(editedRecipe[field] as string) ?? ""}
                onChange={handleChange}
                placeholder={`Enter ${field.replace("_", " ")}`}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={field === "instructions" ? 5 : 3}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Add Images (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-800"
            />
            <div className="flex flex-wrap mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative m-2">
                  <Image
                    src={preview}
                    alt={`Recipe Preview ${index}`}
                    width={96} // 24 * 4px (Tailwind default spacing)
                    height={96}
                    className="object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleClearImage(index)}
                    className="absolute top-0 right-0 bg-black text-white rounded-full p-1 text-xs hover:bg-red-700"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <motion.button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (uploading ? "Uploading..." : "Saving...") : "Save Changes"}
              <Sparkles className="h-4 w-4 ml-2 inline" />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditRecipeModal;