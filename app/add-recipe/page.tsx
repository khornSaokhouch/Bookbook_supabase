"use client";

// import RecipeModal from "./RecipeModal";
import { useState, ChangeEvent, FormEvent } from "react";
import { createClient } from '@supabase/supabase-js';
import Layout from "../components/layout";
import Navbar from "../components/Navbar";
import RecipeModal from "../components/RecipeModal";
import Footer from "../components/Footer"



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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNextClick = () => {
    setIsModalOpen(true);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("recipeTitle", recipeTitle);
    formData.append("description", description);
    formData.append("preparationTime", preparationTime);
    formData.append("cookTime", cookTime);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);
    formData.append("preparationInstructions", preparationInstructions);
    formData.append("note", note);
    formData.append("category", category);
    resultImages.forEach((image, index) => {
      if (image) formData.append(`resultImages[${index}]`, image);
    });
    if (bannerImage) formData.append("bannerImage", bannerImage);
    if (ingredientsImage) formData.append("ingredientsImage", ingredientsImage);

    try {
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('recipes')
        .insert([
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
            bannerImage: bannerImage ? bannerImage.name : null,
            ingredientsImage: ingredientsImage ? ingredientsImage.name : null,
            resultImages: resultImages.map(image => image ? image.name : null)
          }
        ]);

      if (error) {
        console.error("Failed to add recipe:", error.message);
      } else {
        console.log("Recipe added successfully!", data);
        // Optionally, redirect or show a success message
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setIngredientsImage(file); // Set the image file for ingredients
                setIngredientsPreview(URL.createObjectURL(file)); // Generate a preview URL
              }
            }}
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
                setIngredientsImage(null); // Reset the image file
                setIngredientsPreview(null); // Reset the preview
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
          type="button"
          onClick={handleNextClick}
          className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Next
        </button>
      </div>

      {/* Recipe Modal */}
      <RecipeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCategorySelect={handleCategorySelect} />
    </form>
  </div>
  <Footer />
  </div>
  );
};

export default AddRecipe;
