// components/DetailsPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaStar, FaRegBookmark } from 'react-icons/fa';
import { AiOutlineStar } from 'react-icons/ai';
import { FiClock } from 'react-icons/fi';
import { ImSpoonKnife } from 'react-icons/im';
import { BsSun } from 'react-icons/bs';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  image_url: string;
  average_rating: number;
  ingredients: string;
  author: string;
  created_at: string;
  category_id: number //Add the type
}

// Function to fetch a recipe by its ID
async function getRecipeById(recipeId: number): Promise<Recipe | null> {
  try {
    const { data, error } = await supabase
      .from("recipe")
      .select(`
        *,
        image_recipe(image_url),
        users(user_name),
        reviews(rating)
      `)
      .eq("recipe_id", recipeId)
      .single(); // Ensures only one recipe is returned

    if (error) throw error;

    if (!data) {
      console.warn("No recipe found for the ID:", recipeId);
      return null;
    }

    // Calculate average rating from reviews
    const ratings = data.reviews.map((review: { rating: number }) => review.rating);
    const average_rating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      ...data,
      image_url: data.image_recipe?.[0]?.image_url || " ", // Handle array response
      average_rating, // Include average rating
      author: data.users?.user_name || "Unknown User", // Include author
      recipe_name: data.recipe_name || "Unknown Recipe", //Assign the default value if recipe is undefined
      description: data.description || "No description available",
      prep_time: data.prep_time || 0,
      cook_time: data.cook_time || 0,
      ingredients: data.ingredients || "No ingredients available", // ingredients
      date: data.created_at || "Unknown Date",
      category_id: data.category_id || 0
    };
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

const DetailsPage: React.FC = () => {
  const { id } = useParams();
  const recipeId = Number(id); // Ensure recipeId is a number
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true); // Set loading to true when fetching starts
      setError(null); // Reset error
      try {
        if (isNaN(recipeId)) {
          setError('Invalid recipe ID.  Must be a number.');
          return;
        }

        const data = await getRecipeById(recipeId);
        if (data) {
          setRecipe(data);
        } else {
          setError('Recipe not found.'); // Handle null recipe
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe.');
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchRecipe();
  }, [recipeId]);

  if (loading) {
    return <p className="text-gray-600">Loading recipe...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!recipe) {
    return <p className="text-gray-600">No recipe found.</p>; // Explicitly handle null recipe
  }

  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <div className="container mx-auto px-8 md:px-44 py-8">
      <h1 className="text-3xl font-bold mb-2">{recipe.recipe_name}</h1>
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <div className="flex items-center mr-4">
          {[...Array(5)].map((_, index) => (
            index < Math.round(recipe.average_rating) ? (
              <FaStar key={index} className="text-yellow-500 mr-1" />
            ) : (
              <AiOutlineStar key={index} className="text-yellow-500 mr-1" />
            )
          ))}
          <span className="ml-1">{recipe.average_rating.toFixed(1)}</span>{/* toFixed */}
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <span className="mr-2">By {recipe.author || 'Unknown User'}</span>
        <span>{recipe.created_at}</span>
      </div>

      <div className="mb-4">
        <Image
          src={recipe.image_url}
          alt={recipe.recipe_name}
          width={800}
          height={400}
          style={{ objectFit: 'cover', width: '100%', height: 'auto' }} // Use style for objectFit
          className="rounded-lg"
        />
      </div>

      <div className="flex items-center mb-4">
        <button className="flex items-center bg-blue-500 text-white rounded-md px-4 py-2 mr-2 hover:bg-blue-700 transition-colors">
          <FaRegBookmark className="mr-1" />
          <span>Save</span>
        </button>
        <button className="flex items-center bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors">
          <span>☆</span>
          <span>Rate</span>
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Overview</h2>
      <p className="text-gray-700 mb-4">{recipe.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 rounded-lg">
        <div className="flex flex-col bg-gray-300 items-center rounded-lg shadow-md p-4">
          <FiClock className="text-3xl text-red-600" />
          <h3 className="mt-2 font-semibold text-orange-600">Prep Time</h3>
          <p>{recipe.prep_time} mins</p>
        </div>
        <div className="flex flex-col bg-gray-300 items-center rounded-lg shadow-md p-4">
          <ImSpoonKnife className="text-3xl text-purple-700" />
          <h3 className="mt-2 font-semibold text-blue-600">Cook Time</h3>
          <p>{recipe.cook_time} mins</p>
        </div>
        <div className="flex flex-col bg-gray-300 items-center rounded-lg shadow-md p-4">
          <BsSun className="text-3xl text-yellow-600" />
          <h3 className="mt-2 font-semibold text-green-700">Total Time</h3>
          <p>{totalTime} mins</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {recipe.ingredients.split(',').map((ingredient, index) => (
            <li key={index}>{ingredient.trim()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DetailsPage;