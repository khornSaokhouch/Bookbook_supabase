"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Layout from "../components/layout";
import Navbar from "../components/Header";
import RecipeModal from "../components/RecipeModal";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';  // Import UUID generator

const supabase = createClientComponentClient();

const AddRecipe = () => {
    const [recipeTitle, setRecipeTitle] = useState("");
    const [description, setDescription] = useState("");
    const [preparationTime, setPreparationTime] = useState("");
    const [cookTime, setCookTime] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [instructions, setInstructions] = useState("");
    const [preparationInstructions, setPreparationInstructions] = useState("");
    const [resultImages, setResultImages] = useState<(File | null)[]>([
        null,
        null,
        null,
    ]);
    const [resultPreviews, setResultPreviews] = useState<(string | null)[]>([
        null,
        null,
        null,
    ]);
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [ingredientsImage, setIngredientsImage] = useState<File | null>(null);
    const [ingredientsPreview, setIngredientsPreview] = useState<string | null>(
        null
    );

    const [note, setNote] = useState("");
    const [category, setCategory] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
                    return user.id;
                } catch (error) {
                    console.error("Error parsing user cookie:", error);
                    return null;
                }
            }
            return null;
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

    const handleResultImageChange = (
        e: ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newResultImages = [...resultImages];
            const newResultPreviews = [...resultPreviews];

            newResultImages[index] = file;
            newResultPreviews[index] = URL.createObjectURL(file);

            setResultImages(newResultImages);
            setResultPreviews(newResultPreviews);
        }
    };

    const handleBannerImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setBannerImage(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleIngredientsImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIngredientsImage(file);
            setIngredientsPreview(URL.createObjectURL(file));
        }
    };

    const handleNextClick = () => {
        setIsModalOpen(true);
    };

    const handleCategorySelect = (foods: string[], occasions: string[]) => {
        const selectedCategory = foods.join(", ") + ", " + occasions.join(", ");
        setCategory(selectedCategory);
        setIsModalOpen(false);
    };

    const uploadImage = async (file: File | null, path: string) => {
        if (!file) return null;

        const { data, error } = await supabase.storage
            .from("recipe-images")
            .upload(`${path}/${file.name}`, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Error uploading image:", error);
            throw new Error(error.message);
        }

        return data.path;
    };

    const getImageUrl = async (imagePath: string | null) => {
        if (!imagePath) return null;

        const { data } = await supabase.storage
            .from("recipe-images")
            .getPublicUrl(imagePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: FormEvent) => {
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

        try {
            const recipeId = uuidv4();  // Generate unique ID
            const bannerImagePath = await uploadImage(bannerImage, recipeId);
            const ingredientsImagePath = await uploadImage(ingredientsImage, recipeId);

            let resultImageUrls: (string | null)[] = [];
            if (resultImages && resultImages.length > 0) {
                const resultImagePaths = await Promise.all(
                    resultImages.map(async (image, index) => {
                        if (image) {
                            return await uploadImage(image, `${recipeId}/results`);
                        }
                        return null; // or handle the null case as needed
                    })
                );

                // Filter out null values from resultImagePaths before mapping
                const filteredResultImagePaths = resultImagePaths.filter(path => path !== null);

                resultImageUrls = await Promise.all(
                    filteredResultImagePaths.map(async (imagePath) => {
                        if (imagePath) {
                            return await getImageUrl(imagePath);
                        }
                        return null; // or handle the null case as needed
                    })
                );
            }

            const bannerImageUrl = bannerImagePath ? await getImageUrl(bannerImagePath) : null;
            const ingredientsImageUrl = ingredientsImagePath ? await getImageUrl(ingredientsImagePath) : null;

            const { data, error } = await supabase.from("recipes").insert([
                {
                    recipeTitle,
                    description,
                    preparationTime,
                    cookTime,
                    ingredients,
                    instructions,
                    preparationInstructions,
                    note,
                    category,
                    bannerImage: bannerImageUrl,
                    ingredientsImage: ingredientsImageUrl,
                    resultImages: resultImageUrls,
                    user_id: userId,
                },
            ]);

            if (error) {
                console.error("Failed to add recipe:", error.message);
                setUploadError(error.message);
                setErrorMessage("Failed to add recipe. Please check your input and try again.");
            } else {
                console.log("Recipe added successfully!", data);
                setSuccessMessage("Recipe added successfully!");
                router.push("/admin/recipes");
                // Reset the form
                setRecipeTitle("");
                setDescription("");
                setPreparationTime("");
                setCookTime("");
                setIngredients("");
                setInstructions("");
                setPreparationInstructions("");
                setResultImages([null, null, null]);
                setResultPreviews([null, null, null]);
                setBannerImage(null);
                setBannerPreview(null);
                setIngredientsImage(null);
                setIngredientsPreview(null);
                setNote("");
                setCategory("");
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            setUploadError(error.message || "An unexpected error occurred.");
            setErrorMessage("An unexpected error occurred. Please try again later.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <Navbar />
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
                    {/* Recipe Title */}
                    <div className="mb-6">
                        <label
                            htmlFor="recipeTitle"
                            className="block text-2xl font-semibold mb-2"
                        >
                            Recipe Title *
                        </label>
                        <textarea
                            id="recipeTitle"
                            value={recipeTitle}
                            onChange={(e) => setRecipeTitle(e.target.value)}
                            placeholder="Enter your recipe title"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        ></textarea>
                    </div>

                    {/* Banner Image */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">
                            Recipe Image or Banner *
                        </h2>
                        <div className="border-dashed border-2 border-gray-300 rounded-md p-2 flex flex-col items-center justify-center relative h-[450px]">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerImageChange}
                                className="hidden"
                                id="bannerImage"
                            />
                            <label
                                htmlFor="bannerImage"
                                className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
                            >
                                {bannerPreview ? (
                                    <img
                                        src={bannerPreview}
                                        alt="Banner"
                                        className="object-cover h-full w-full rounded-md"
                                    />
                                ) : (
                                    <div className="text-gray-500 text-center">
                                        <span className="text-2xl">+</span>
                                        <p>Add a banner image</p>
                                    </div>
                                )}
                            </label>

                            {/* Undo Button */}
                            {bannerPreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBannerImage(null);
                                        setBannerPreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-2xl font-semibold mb-2">
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                                type="text"
                                value={preparationTime}
                                onChange={(e) => setPreparationTime(e.target.value)}
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
                                type="text"
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

                    <div className="mb-6">
                        <div className="border-dashed border-2 border-gray-300 rounded-md p-2 flex flex-col items-center justify-center relative h-[450px]">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleIngredientsImageChange}
                                className="hidden"
                                id="ingredientsImage"
                            />
                            <label
                                htmlFor="ingredientsImage"
                                className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
                            >
                                {ingredientsPreview ? (
                                    <img
                                        src={ingredientsPreview}
                                        alt="Ingredients"
                                        className="object-cover h-full w-full rounded-md"
                                    />
                                ) : (
                                    <div className="text-gray-500 text-center">
                                        <span className="text-2xl">+</span>
                                        <p>Ingredients image</p>
                                    </div>
                                )}
                            </label>

                            {/* Undo Button */}
                            {ingredientsPreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIngredientsImage(null);
                                        setIngredientsPreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                                >
                                    X
                                </button>
                            )}
                        </div>
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

                    {/* Preparation Instructions */}
                    <div className="mb-6">
                        <label className="block text-2xl font-semibold mb-2">
                            Preparation Instructions *
                        </label>
                        <textarea
                            value={preparationInstructions}
                            onChange={(e) => setPreparationInstructions(e.target.value)}
                            placeholder="Describe your preparation instructions."
                            className="w-full h-[150px] border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        ></textarea>
                    </div>

                    {/* Cooking Results */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Cooking Result *</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {resultPreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="border-dashed border-2 border-gray-300 rounded-md p-2 flex flex-col items-center justify-center relative h-[250px]"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleResultImageChange(e, index)}
                                        className="hidden"
                                        id={`resultImage-${index}`}
                                    />
                                    <label
                                        htmlFor={`resultImage-${index}`}
                                        className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
                                    >
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt={`Result ${index + 1}`}
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
                            type="submit"  // Changed to submit type
                            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-300"
                            disabled={uploading}
                        >
                            {uploading ? "Submitting..." : "Save"}  // Changed button text
                        </button>
                    </div>

                    {/* Recipe Modal */}
                    <RecipeModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCategorySelect={handleCategorySelect}
                    />
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default AddRecipe;