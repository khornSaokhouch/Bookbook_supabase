// app/components/EditRecipeModal.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, XCircle, UploadCloud, Image as ImageIcon, Info, Save, RotateCcw } from "lucide-react"; // Added Save and RotateCcw for button icons
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { useAlert } from "@/app/context/AlertContext";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof Recipe, string>>
  >({});

  const { showAlert } = useAlert();

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
    setValidationErrors({});
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
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const uniqueNewFiles = files.filter(
        (file) =>
          !imageFiles.some(
            (existingFile) =>
              existingFile.name === file.name && existingFile.size === file.size
          ) &&
          !editedRecipe.images.some((img) => img.image_url.includes(file.name))
      );
      setImageFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
      e.target.value = ""; // Clear input to allow selecting same file again if needed
    }
  };

  const handleClearImage = (index: number) => {
    const currentOriginalImagesCount = editedRecipe.images.length;

    if (index < currentOriginalImagesCount) {
      setEditedRecipe((prev) => {
        const updatedImages = prev.images.filter((_, i) => i !== index);
        return {
          ...prev,
          images: updatedImages,
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
      showAlert("User is not logged in.", "error");
      setLoading(false); // Ensure loading is false if not logged in
      return;
    }

    const errors: Partial<Record<keyof Recipe, string>> = {};
    if (!editedRecipe.recipe_name.trim()) {
      errors.recipe_name = "Recipe Name is required.";
    }
    if (!editedRecipe.description.trim()) {
      errors.description = "Description is required.";
    }
    if (!editedRecipe.ingredients.trim()) {
      errors.ingredients = "Ingredients are required.";
    }
    if (!editedRecipe.instructions.trim()) {
      errors.instructions = "Instructions are required.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    try {
      setLoading(true);
      setValidationErrors({});

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
        ...editedRecipe.images.map((img) => img.image_url),
        ...newUploadedImageUrls,
      ];

      const { error: updateRecipeError } = await supabase
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
      const currentDbImageUrls = currentDbImages.map((img) => img.image_url);

      const imagesToDelete = currentDbImageUrls.filter(
        (dbUrl) => !finalImageUrlsToSave.includes(dbUrl)
      );

      if (imagesToDelete.length > 0) {
        const storagePathsToDelete = imagesToDelete.map((url) => {
          const parts = url.split("/storage/v1/object/public/recipes/");
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

      const imagesToInsert = finalImageUrlsToSave.filter(
        (url) => !currentDbImageUrls.includes(url)
      );

      if (imagesToInsert.length > 0) {
        const insertData = imagesToInsert.map((url) => ({
          recipe_id: editedRecipe.recipe_id,
          image_url: url,
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
        images: updatedRecipeData.image_recipe.map(
          (img: { image_url: string }) => ({
            image_url: img.image_url,
          })
        ),
      };

      onUpdateRecipe(updatedRecipe);
      showAlert("Recipe updated successfully!", "success");
      onClose();
    } catch (dbErr: unknown) {
      console.error("Overall Update Process Error:", dbErr);
      const errorMessage =
        dbErr instanceof Error ? dbErr.message : "An unexpected error occurred.";
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
      className="fixed inset-0 bg-opacity-70 z-50 flex items-center justify-center p-4 " // Darker overlay, stronger blur
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white dark:bg-gray-850 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-gray-100 dark:border-gray-700 p-8 relative transform transition-transform duration-300 ease-out" // Larger max-w, rounded-3xl, increased padding, new dark background color
        variants={modalVariants}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center">
            <Sparkles className="h-7 w-7 text-yellow-500 mr-3" />
            Edit Your Recipe
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close modal"
          >
            <XCircle className="w-9 h-9" />
          </button>
        </div>

        {/* Info box for input guidance */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 md:p-5 mb-8 flex items-start space-x-3 text-sm md:text-base"> {/* Changed to blue theme */}
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Please ensure all details are accurate and descriptive:
                </p>
                <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1">
                    <li>**Recipe Name & Description:** Provide a clear and inviting overview.</li>
                    <li>**Ingredients:** List each item on a new line (e.g., 1 cup flour, 2 large eggs).</li>
                    <li>**Instructions:** Detail each step numerically for easy following.</li>
                </ul>
            </div>
        </div>

        {/* Recipe Form */}
        <form onSubmit={handleSubmit} className="space-y-7"> {/* Increased spacing */}
          {editableFields.map((field) => (
            <div key={field} className="w-full"> {/* Ensure input container takes full width */}
              <label
                htmlFor={field}
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize tracking-wide" // Added tracking
              >
                {field.replace("_", " ")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id={field}
                name={field}
                value={(editedRecipe[field] as string) ?? ""}
                onChange={handleChange}
                placeholder={`Enter ${field.replace("_", " ")}`}
                className={`w-full px-5 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:outline-none focus:ring-3 transition-all duration-300 resize-y
                  ${
                    validationErrors[field]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                      : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-300"
                  }
                  ${field === "description" ? "min-h-[6rem]" : ""}
                  ${field === "ingredients" ? "min-h-[8rem]" : ""}
                  ${field === "instructions" ? "min-h-[10rem]" : ""}
                `}
                rows={field === "instructions" ? 8 : (field === "ingredients" ? 6 : (field === "description" ? 4 : 3))} // Dynamic rows
              />
              {validationErrors[field] && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 flex items-center font-medium"
                >
                  <XCircle className="w-4 h-4 mr-1.5 flex-shrink-0" /> {/* Larger margin for icon */}
                  {validationErrors[field]}
                </motion.p>
              )}
            </div>
          ))}

          {/* Image Upload Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-7 text-center bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600"> {/* Enhanced styling */}
            <label htmlFor="image-upload" className="cursor-pointer block"> {/* Block level for full click area */}
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-3"> {/* Increased spacing */}
                <UploadCloud className="w-14 h-14 text-gray-400 dark:text-gray-300" /> {/* Larger icon */}
                <p className="text-gray-700 dark:text-gray-100 font-semibold text-xl"> {/* Larger, bolder text */}
                  Drag & Drop images here
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline font-medium"> {/* More prominent browse text */}
                  or Click to Browse files
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  (Up to 5 images, Max 5MB each, JPG, PNG, GIF)
                </p>
              </div>
            </label>

            {imagePreviews.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-600"> {/* Increased spacing, stronger border */}
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center justify-center"> {/* Larger heading */}
                  <ImageIcon className="w-6 h-6 mr-3 text-blue-500" /> {/* Larger, colored icon */}
                  Current Images
                </h4>
                <AnimatePresence> {/* For smooth removal of images */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"> {/* Increased gap */}
                    {imagePreviews.map((preview, index) => (
                      <motion.div
                        key={preview} // Use preview URL as key for better animation
                        className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg group border border-gray-200 dark:border-gray-700" // Stronger shadow, border
                        initial={{ opacity: 0, scale: 0.7, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: 20 }}
                        transition={{ duration: 0.2 }}
                        layout // For smooth layout transitions
                      >
                        <Image
                          src={preview}
                          alt={`Recipe Preview ${index}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-110" // More pronounced hover effect
                        />
                        <button
                          type="button"
                          onClick={() => handleClearImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 z-10" // Larger button, z-index
                          aria-label="Remove image"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div> {/* Hover overlay */}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6"> {/* Responsive button layout */}
            <motion.button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3.5 px-8 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center justify-center"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="h-5 w-5 mr-2" /> {/* Added icon */}
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-green-600 text-white py-3.5 px-8 rounded-xl font-semibold hover:from-teal-600 hover:to-green-700 transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center" // New gradient color
              whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? "Uploading Images..." : "Saving Changes..."} {/* Changed text */}
                </>
              ) : (
                <>
                  Save Changes <Save className="h-5 w-5 ml-2" /> {/* New icon */}
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