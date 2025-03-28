"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import RecipeModal from "../../../components/RecipeModal";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';  // Import UUID generator

const AddRecipe = () => {
    const [recipeName, setRecipeName] = useState("");
    const [overview, setOverview] = useState("");
    const [prepTime, setPrepTime] = useState("");
    const [cookTime, setCookTime] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [instructions, setInstructions] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [occasionId, setOccasionId] = useState<number | null>(null);
    const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]); //  3 Images
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null); //  User ID as number
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);  // New state for the modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);  // New state for the success modal

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
                    // Check if the userId is a valid UUID
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
        
        // Helper function to validate if the userId is a valid UUID
        const isValidUUID = (id) => {
            const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            return regex.test(id);
        };
        

        const fetchData = async () => {
            try {
                const fetchedUserId = getUserIdFromCookies();
                if (fetchedUserId) {
                    setUserId(parseInt(fetchedUserId, 10)); // Parse to integer
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


    const handleCategorySelect = async (category: { category_id: number; category_name: string }, occasion: { occasion_id: number; name: string }) => {
        // Setting the category and occasion ids
        setCategoryId(category.category_id); 
        setOccasionId(occasion.occasion_id); 
    
        // Close the modal
        setIsModalOpen(false); 
        setShowCategoryModal(false);
    
        // Now you can call actuallySubmit
        await actuallySubmit();  // Submit after category is selected
    };
    

   const uploadImage = async (file: File | null, path: string) => {
    if (!file) return null;

    const { data, error } = await supabase.storage
        .from("recipes")  // Changed to 'add-recipe' bucket
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
        .from("recipes")  // Changed to 'add-recipe' bucket
        .getPublicUrl(imagePath);
    return data.publicUrl;
};

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setShowCategoryModal(true);  // Show the modal instead of submitting immediately
    };


    const actuallySubmit = async () => {
        // This function will be called *after* the user selects the category
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

        if (!categoryId || !occasionId) {
            console.error("Category and/or Occasion are missing.");
            setUploadError("Please select a category and occasion.");
            setUploading(false);
            return;
        }

        try {
            const recipeId = uuidv4();  // Generate unique ID

            const imagePaths = await Promise.all(
                imageFiles.map(async (file, index) => {
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

            const prepTimeInterval = `PT${prepTime}M`; // ISO 8601 duration format
            const cookTimeInterval = `PT${cookTime}M`; // ISO 8601 duration format


            const { data, error } = await supabase.from("recipe").insert([
                {
                    user_id: userId,
                    category_id: categoryId,
                    occasion_id: occasionId,
                    recipe_name: recipeName,
                    overview: overview,
                    prep_time: prepTimeInterval,
                    cook_time: cookTimeInterval,
                    ingredients: ingredients,
                    instructions: instructions,
                    description: description,
                    note: note,
                },
            ]).select().single();

            if (error) {
                console.error("Failed to add recipe:", error.message);
                setUploadError(error.message);
                setErrorMessage("Failed to add recipe. Please check your input and try again.");
            } else {
                console.log("Recipe added successfully!", data);
                setSuccessMessage("Recipe added successfully!");
                setShowSuccessModal(true); // Show the success modal


                // Upload Images to image_recipe table
                if (data && data.recipe_id) { // Ensure data and recipe_id exist
                    for (const imageUrl of imageUrls) {
                        if (imageUrl) {
                            const { error: imageError } = await supabase.from("image_recipe").insert([
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
                // Delay the router.push to allow the success modal to be seen
                setTimeout(() => {
                    router.push("/admin/recipes");
                }, 2000); // Adjust the delay as needed


                // Reset the form
                setRecipeName("");
                setOverview("");
                setPrepTime("");
                setCookTime("");
                setIngredients("");
                setInstructions("");
                setDescription("");
                setNote("");
                setCategoryId(null);
                setOccasionId(null);
                setImageFiles([null, null, null]);
                setImagePreviews([null, null, null]);
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            setUploadError(error.message || "An unexpected error occurred.");
            setErrorMessage("An unexpected error occurred. Please try again later.");
        } finally {
            setUploading(false);
        }
    };


    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        router.push("/admin/recipes");  // Or wherever you want to redirect
    };


    return (
            <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
                <h1 className="text-4xl font-bold text-center mb-6">Add a Recipe</h1>
                <p className="mb-6 text-center text-gray-700">
                    Feeling like a kitchen Picasso? We want to see your masterpiece! Add
                    your recipe and show off your culinary creativity.
                </p>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{errorMessage}</span>
                </div>
            )}

            {uploadError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
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
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="border-dashed border-2 border-gray-300 rounded-md p-2 flex flex-col items-center justify-center relative h-[250px]"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, index)}
                                        className="hidden"
                                        id={`image-${index}`}
                                    />
                                    <label
                                        htmlFor={`image-${index}`}
                                        className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
                                    >
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt={`Image ${index + 1}`}
                                                className="object-cover h-full w-full rounded-md"
                                            />
                                        ) : (
                                            <div className="text-gray-500 text-center">
                                                <span className="text-2xl">+</span>
                                                <p>Add a photo</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                            <h2 className="text-3xl font-semibold text-green-600 mb-4">Success!</h2>
                            <p className="text-gray-700 mb-6">Your recipe has been added successfully.</p>
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