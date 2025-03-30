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
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getUserIdFromCookies = () => {
      if (typeof document === "undefined") {
        return null;
      }
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((cookie) => cookie.startsWith("user="));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
          const userId = user.id;
          if (isValidUUID(userId)) {
            return userId;
          } else {
            console.error("Invalid UUID format for userId:", userId);
            return null;
          }
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          return null;
        }
      }
      return null;
    };

    const isValidUUID = (id: string) => {
      const regex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      return regex.test(id);
    };

    const fetchData = async () => {
      try {
        const fetchedUserId = getUserIdFromCookies();
        if (fetchedUserId) {
          setUserId(fetchedUserId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

  const handleCategorySelect = useCallback(
    (category: { category_id: number; category_name: string }, occasion: { occasion_id: number; name: string }) => {
      setCategoryOccasion({
        categoryId: category.category_id,
        occasionId: occasion.occasion_id,
      });
      setShowCategoryModal(false);
    },
    []
  );

  const actuallySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!userId) {
      console.error("User ID is missing. Please log in.");
      setUploadError("User ID is missing. Please log in.");
      setUploading(false);
      return;
    }

    if (!categoryOccasion.categoryId || !categoryOccasion.occasionId) {
      console.error("Category and/or Occasion are missing.");
      setUploadError("Please select a category and occasion.");
      setUploading(false);
      return;
    }

    try {
      const recipeId = uuidv4();

      const imagePaths = await Promise.all(
        imageFiles.map(async (file) => {
          if (file) {
            return await uploadImage(file, `${recipeId}/images`);
          }
          return null;
        })
      );

      const imageUrls = await Promise.all(
        imagePaths.map(async (imagePath) => {
          if (imagePath) {
            return await getImageUrl(imagePath);
          }
          return null;
        })
      );

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
        console.error("Failed to add recipe:", error.message);
        setUploadError(error.message);
        setErrorMessage("Failed to add recipe. Please check your input and try again.");
      } else {
        console.log("Recipe added successfully!", data);
        setSuccessMessage("Recipe added successfully!");
        setShowSuccessModal(true);

        if (data && data.recipe_id) {
          for (const imageUrl of imageUrls) {
            if (imageUrl) {
              const { error: imageError } = await supabase
                .from("image_recipe")
                .insert([
                  {
                    recipe_id: data.recipe_id,
                    image_url: imageUrl,
                  },
                ]);

              if (imageError) {
                console.error("Error uploading image URL:", imageError);
                setUploadError(imageError.message);
                setErrorMessage("Failed to add image to recipe. Please check your input and try again.");
              }
            }
          }
        }

        setTimeout(() => {
          router.push("/");
        }, 2000);

        // Reset all states after success
        setRecipeName("");
        setOverview("");
        setPrepTime("");
        setCookTime("");
        setIngredients("");
        setInstructions("");
        setDescription("");
        setNote("");
        setCategoryOccasion({ categoryId: null, occasionId: null });
        setImageFiles([null, null, null]);
        setImagePreviews([null, null, null]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadError(error.message || "An unexpected error occurred.");
      }
    }
  };

  const uploadImage = async (file: File | null, path: string) => {
    if (!file) return null;

    const { data, error } = await supabase.storage
      .from("recipes")
      .upload(`${path}/${file.name}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error(error.message);
    }

    return data?.path;
  };

  const getImageUrl = async (imagePath: string | null) => {
    if (!imagePath) return null;

    const { data } = await supabase.storage
      .from("recipes")
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-4xl font-bold text-center mb-6">Add a Recipe</h1>
      <p className="mb-6 text-center text-gray-700">
        Feeling like a kitchen Picasso? We want to see your masterpiece! Add
        your recipe and show off your culinary creativity.
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

      <form onSubmit={actuallySubmit}>
        {/* Recipe form inputs... */}

        {/* Image Previews */}
        <div className="grid grid-cols-3 gap-6 mt-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, index)} // Correct use of index
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
              {preview && (
                <div className="w-full h-32 bg-gray-100 relative">
                  <Image src={preview} alt={`image-${index}`} layout="fill" objectFit="cover" />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-6 px-8 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Submit Recipe"}
        </button>
      </form>

      {/* RecipeModal Component */}
      {showCategoryModal && (
        <RecipeModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Recipe Added Successfully!</h2>
            <p>Your recipe was added. Redirecting to home page...</p>
            <button onClick={() => setShowSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecipe;