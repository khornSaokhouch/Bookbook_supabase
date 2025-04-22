"use client";

import {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../../../lib/supabaseClient";
import RecipeModal from "../../../components/RecipeModal";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

const AddRecipe = () => {
  const [recipeName, setRecipeName] = useState("");
  const [overview, setOverview] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [categoryOccasion, setCategoryOccasion] = useState<{
    categoryId: number | null;
    occasionId: number | null;
  }>({
    categoryId: null,
    occasionId: null,
  });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        setUserId(sessionUser.id);
      }
    };

    fetchUserId();
  }, []);

  const addImageInput = () => {
    setImageFiles((prev) => [...prev, null]);
    setImagePreviews((prev) => [...prev, null]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImageFiles = [...imageFiles];
      const newImagePreviews = [...imagePreviews];

      newImageFiles[index] = file;
      newImagePreviews[index] = URL.createObjectURL(file);

      setImageFiles(newImageFiles);
      setImagePreviews(newImagePreviews);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategorySelect = useCallback(
    (
      category: { category_id: number; category_name: string },
      occasion: { occasion_id: number; name: string }
    ) => {
      setCategoryOccasion({
        categoryId: category.category_id,
        occasionId: occasion.occasion_id,
      });
      setShowCategoryModal(false);
    },
    []
  );

  const uploadImage = async (file: File | null, path: string) => {
    if (!file) return null;

    const fileName = `${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage
      .from("recipes") // Use the "recipes" bucket
      .upload(`${path}/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error(error.message);
    }

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipes/${path}/${fileName}`; // Construct the full URL
  };

  const actuallySubmit = useCallback(async () => {
    setUploadError(null);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!userId) {
      setUploadError("User ID is missing. Please log in.");
      return;
    }

    if (!categoryOccasion.categoryId || !categoryOccasion.occasionId) {
      setUploadError("Please select a category and occasion.");
      return;
    }

    try {
      const recipeId = uuidv4();

      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          if (file) {
            return await uploadImage(file, `${recipeId}/images`);
          }
          return null;
        })
      );

      const filteredImageUrls = imageUrls.filter((url): url is string => url !== null);

      const prepTimeInterval = `PT${prepTime}M`;
      const cookTimeInterval = `PT${cookTime}M`;

      const { data, error } = await supabase
        .from("recipe")
        .insert([
          {
            user_id: userId,
            category_id: categoryOccasion.categoryId,
            occasion_id: categoryOccasion.occasionId,
            recipe_name: recipeName,
            overview: overview,
            prep_time: prepTimeInterval,
            cook_time: cookTimeInterval,
            ingredients: ingredients,
            instructions: instructions,
            description: description,
            note: note,
          },
        ])
        .select()
        .single();

      if (error) {
        setUploadError(error.message);
        setErrorMessage("Failed to add recipe. Please try again.");
        return;
      }

      for (const imageUrl of filteredImageUrls) {
        const { error: imageError } = await supabase
          .from("image_recipe")
          .insert([
            {
              recipe_id: data.recipe_id,
              image_url: imageUrl, // Insert the full image URL
            },
          ]);

        if (imageError) {
          setUploadError(imageError.message);
          setErrorMessage("Failed to add image to recipe. Please try again.");
        }
      }

      setSuccessMessage("Recipe added successfully!");
      setShowSuccessModal(true);

      setRecipeName("");
      setOverview("");
      setPrepTime("");
      setCookTime("");
      setIngredients("");
      setInstructions("");
      setDescription("");
      setNote("");
      setCategoryOccasion({ categoryId: null, occasionId: null });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadError(error.message || "An unexpected error occurred.");
      }
    }
  }, [
    categoryOccasion.categoryId,
    categoryOccasion.occasionId,
    imageFiles,
    prepTime,
    cookTime,
    userId,
    recipeName,
    overview,
    ingredients,
    instructions,
    description,
    note,
  ]);

  useEffect(() => {
    if (
      categoryOccasion.categoryId !== null &&
      categoryOccasion.occasionId !== null
    ) {
      actuallySubmit();
    }
  }, [
    categoryOccasion.categoryId,
    categoryOccasion.occasionId,
    actuallySubmit,
  ]);

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowCategoryModal(true);
  };

  const renderImagePreview = (preview: string | null, index: number) => (
    <div key={index} className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e, index)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
      {preview ? (
        <Image
          src={preview}
          alt={`Preview ${index}`}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      ) : (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
          <span className="text-gray-500">No image selected</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => handleRemoveImage(index)}
        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
      >
        &times;
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-4xl font-bold text-center mb-6">Add a Recipe</h1>
      <p className="mb-6 text-center text-gray-700">
        Feeling like a kitchen Picasso? Add your recipe and show off your culinary creativity.
      </p>

      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      {uploadError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{uploadError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Recipe Name */}
        <div className="mb-6">
          <label
            htmlFor="recipeName"
            className="block text-2xl font-semibold mb-2"
          >
            Recipe Name *
          </label>
          <textarea
            id="recipeName"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="Enter your recipe name"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Overview */}
        <div className="mb-6">
          <label className="block text-2xl font-semibold mb-2">
            Overview *
          </label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Describe your recipe."
            className="w-full h-[150px] border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Preparation and Cook Time */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold mb-2">
              Preparation Time *
            </label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="mins"
              className="w-full border border-gray-300 rounded-md p-4 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2">
              Cook Time *
            </label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="mins"
              className="w-full border border-gray-300 rounded-md p-4 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <label className="block text-2xl font-semibold mb-2">
            Ingredients *
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="List your ingredients."
            className="w-full border h-[150px] border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <label className="block text-2xl font-semibold mb-2">
            Instructions *
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Describe your cooking instructions."
            className="w-full h-[150px] border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-2xl font-semibold mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your description."
            className="w-full h-[150px] border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Images */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Images</h2>
          <div className="grid grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) =>
              renderImagePreview(preview, index)
            )}
          </div>
          <button
            type="button"
            onClick={addImageInput}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add More Images
          </button>
        </div>

        {/* Note */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Note</h2>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Your kitchen secrets! Oven hacks, swaps, or any tips for ultimate recipe success."
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Save
          </button>
        </div>

        {/* Recipe Modal */}
        <RecipeModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategorySelect={handleCategorySelect}
        />

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <h2 className="text-3xl font-semibold text-green-600 mb-4">
                Success!
              </h2>
              <p className="text-gray-700 mb-6">
                Your recipe has been added successfully.
              </p>
              <button
                onClick={closeSuccessModal}
                className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddRecipe;
