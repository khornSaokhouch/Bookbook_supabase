// app/components/EditRecipeModal.tsx (or wherever your modal is located)
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";
import { Sparkles, XCircle, UploadCloud, Image as ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { useAlert } from "@/app/context/AlertContext"; // <--- IMPORT THE USEALERT HOOK!

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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // const [error, setError] = useState<string | null>(null); // <--- REMOVE THIS LOCAL STATE
  // const [successMessage, setSuccessMessage] = useState<string | null>(null); // <--- REMOVE THIS LOCAL STATE
  const [userId, setUserId] = useState<string | null>(null);

  const { showAlert } = useAlert(); // <--- INITIALIZE THE useAlert HOOK

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
    setEditedRecipe({ ...recipe });
    setImageFiles([]);
    // setError(null); // <--- REMOVE
    // setSuccessMessage(null); // <--- REMOVE
  }, [recipe]);

  useEffect(() => {
    const originalKeptImageUrls = editedRecipe.images.map((img) => img.image_url);
    const newFileObjectUrls = imageFiles.map((file) => URL.createObjectURL(file));

    setImagePreviews([...originalKeptImageUrls, ...newFileObjectUrls]);

    return () => {
      newFileObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles, editedRecipe.images]);

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
      const uniqueNewFiles = files.filter(
        (file) =>
          !imageFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size) &&
          !editedRecipe.images.some(img => img.image_url.includes(file.name))
      );
      setImageFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
      e.target.value = '';
    }
  };

  const handleClearImage = (index: number) => {
    const currentOriginalImagesCount = editedRecipe.images.length;

    if (index < currentOriginalImagesCount) {
      setEditedRecipe(prev => {
        const updatedImages = prev.images.filter((_, i) => i !== index);
        return {
          ...prev,
          images: updatedImages
        };
      });
    } else {
      setImageFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        newFiles.splice(index - currentOriginalImagesCount, 1);
        return newFiles;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      // setError("User is not logged in."); // <--- REPLACE WITH showAlert
      showAlert("User is not logged in.", "error");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // setError(null); // <--- REMOVE

      const newUploadedImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        setUploading(true);
        const uploadPromises = imageFiles.map(async (imageFile) => {
          const uuid = uuidv4();
          const filePath = `${userId}/recipes/${recipe.recipe_id}/${uuid}-${imageFile.name}`;

          const { error: uploadError } = await supabase.storage
            .from("recipes")
            .upload(filePath, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipes/${filePath}`;
          return publicUrl;
        });

        const uploadResults = await Promise.all(uploadPromises);
        newUploadedImageUrls.push(...uploadResults);
        setUploading(false);
      }

      const finalImageUrlsToSave = [
        ...editedRecipe.images.map(img => img.image_url),
        ...newUploadedImageUrls
      ];

      const {error: updateRecipeError } = await supabase
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

      if (updateRecipeError) {
        console.error("Supabase Recipe Text Update Error:", updateRecipeError);
        // setError(`Recipe text update failed: ${updateRecipeError.message}`); // <--- REPLACE WITH showAlert
        showAlert(`Recipe text update failed: ${updateRecipeError.message}`, "error");
        setLoading(false);
        return;
      }

      const { data: currentDbImages, error: fetchDbImagesError } = await supabase
        .from("image_recipe")
        .select("image_url")
        .eq("recipe_id", editedRecipe.recipe_id);

      if (fetchDbImagesError) {
        throw fetchDbImagesError;
      }
      const currentDbImageUrls = currentDbImages.map(img => img.image_url);

      const imagesToDelete = currentDbImageUrls.filter(dbUrl =>
        !finalImageUrlsToSave.includes(dbUrl)
      );

      if (imagesToDelete.length > 0) {
        const storagePathsToDelete = imagesToDelete.map(url => {
          const parts = url.split('/storage/v1/object/public/recipes/');
          return parts.length > 1 ? parts[1] : url;
        });

        const { error: deleteStorageError } = await supabase.storage
          .from("recipes")
          .remove(storagePathsToDelete);

        if (deleteStorageError) {
          console.warn("Failed to delete some images from storage:", deleteStorageError);
        }

        const { error: deleteDbError } = await supabase
          .from("image_recipe")
          .delete()
          .in("image_url", imagesToDelete);

        if (deleteDbError) {
          throw deleteDbError;
        }
      }

      const imagesToInsert = finalImageUrlsToSave.filter(url =>
        !currentDbImageUrls.includes(url)
      );

      if (imagesToInsert.length > 0) {
        const insertData = imagesToInsert.map(url => ({
          recipe_id: editedRecipe.recipe_id,
          image_url: url
        }));
        const { error: insertError } = await supabase
          .from("image_recipe")
          .insert(insertData);

        if (insertError) {
          throw insertError;
        }
      }

      const { data: updatedRecipeData, error: fetchError } = await supabase
        .from("recipe")
        .select(
          `
          recipe_id,
          recipe_name,
          description,
          ingredients,
          instructions,
          created_at,
          image_recipe (image_url)
          `
        )
        .eq("recipe_id", editedRecipe.recipe_id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated recipe:", fetchError);
        // setError(`Failed to fetch updated recipe: ${fetchError.message}`); // <--- REPLACE WITH showAlert
        showAlert(`Failed to fetch updated recipe: ${fetchError.message}`, "error");
        setLoading(false);
        return;
      }

      const updatedRecipe: Recipe = {
        recipe_id: updatedRecipeData.recipe_id,
        recipe_name: updatedRecipeData.recipe_name,
        description: updatedRecipeData.description,
        ingredients: updatedRecipeData.ingredients,
        instructions: updatedRecipeData.instructions,
        created_at: updatedRecipeData.created_at,
        images: updatedRecipeData.image_recipe.map((img: { image_url: string }) => ({
          image_url: img.image_url,
        })),
      };

      onUpdateRecipe(updatedRecipe); // Update parent state first
      // setSuccessMessage("Recipe updated successfully!"); // <--- REPLACE WITH showAlert
      showAlert("Recipe updated successfully!", "success");

      // --- REMOVE THE LOCAL setTimeout. The global alert handles its own timeout. ---
      // setTimeout(() => {
      //   setSuccessMessage(null); // Clear message
      onClose(); // Then close modal immediately after triggering the global alert
      // }, 1500);

    } catch (dbErr: unknown) {
      console.error("Overall Update Process Error:", dbErr);
      const errorMessage =
        dbErr instanceof Error ? dbErr.message : "An unexpected error occurred.";
      // setError( // <--- REPLACE WITH showAlert
      //   `Recipe update failed: ${errorMessage}. Please check the console for details.`
      // );
      showAlert(
        `Recipe update failed: ${errorMessage}. Please check the console for details.`,
        "error"
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
          <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-200">
            Edit Recipe
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <XCircle className="w-8 h-8" />
          </button>
        </div>
        {/* <AnimatePresence> // <--- REMOVE THIS BLOCK
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100">
              {error}
            </div>
          )}
        </AnimatePresence> */}
        {/* Success Message - Positioned absolutely to appear over the modal, or outside for toasts */}
        {/* <AnimatePresence> // <--- REMOVE THIS BLOCK
          {successMessage && (
            <motion.div
              className="absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-sm text-center" // Adjusted positioning
              initial={{ opacity: 0, y: -50, scale: 0.8 }} // Changed initial animation for a pop-down effect
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
              <span className="font-medium text-lg">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence> */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-y min-h-[5rem]"
                rows={field === "instructions" ? 5 : 3}
              />
            </div>
          ))}

          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-700">
            <label htmlFor="image-upload" className="cursor-pointer">
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-300" />
                <p className="text-gray-600 dark:text-gray-200 font-medium text-lg">
                  Drag & Drop images here or <span className="text-blue-600 dark:text-blue-400 hover:underline">Browse files</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  (Up to 5 images, JPG, PNG, GIF)
                </p>
              </div>
            </label>

            {imagePreviews.length > 0 && (
              <div className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Selected Images
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      className="relative w-full aspect-square overflow-hidden rounded-lg shadow-md group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <Image
                        src={preview}
                        alt={`Recipe Preview ${index}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => handleClearImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Remove image"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? "Uploading Images..." : "Saving Recipe..."}
                </>
              ) : (
                <>
                  Save Changes <Sparkles className="h-4 w-4 ml-2" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditRecipeModal;