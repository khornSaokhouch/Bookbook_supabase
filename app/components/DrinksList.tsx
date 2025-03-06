
// components/DrinkList.tsx (Create this file)
"use client"; // Add this line at the very top
import { useState, useEffect } from 'react';
import Drinks from './Card';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  description: string;
  prep_time: number;
  cook_time: string;
  image_url: string;
  average_rating: number;
  ingredients: string;
  author: string;
  date: string;
}

// Function to fetch a recipe by its ID (Keep this if you need it elsewhere)
export async function getRecipeById(recipeId: number): Promise<Recipe | null> {
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
    };
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

// Function to fetch drink recipes
export async function getDrinkRecipes(): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from("recipe")
      .select("*, image_recipe(image_url), reviews(rating)")
      .eq("category_id", 4); // Filter for drinks

    if (error) throw error;

    console.log("Fetched recipes:", data); // Debugging: Check the response

    // Calculate average rating from reviews
    return data.map((recipe: any) => {
      const ratings = recipe.reviews.map((review: any) => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

      return {
        ...recipe,
        recipe_name: recipe.recipe_name || "Unknown Recipe", //Added recipe name as undefined
        description: recipe.description || "No description available", // description undefined
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || "0",
        image_url: recipe.image_recipe?.[0]?.image_url ?? " ",
        average_rating: averageRating || 0, // Add average rating to the returned object
        ingredients: recipe.ingredients || "No ingredients available", // add ingredient to avoid undefined
        author: recipe.author || "Unknown Author",
        date: recipe.date || "Unknown Date",
      };
    }) as Recipe[];
  } catch (error) {
    console.error("Error fetching drink recipes:", error);
    return [];
  }
}

// Component to display the list of drinks
const List: React.FC = () => {
  const [drinkRecipes, setDrinkRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDrinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const recipes = await getDrinkRecipes();
        setDrinkRecipes(recipes);
      } catch (e: any) {
        setError(e.message || "Failed to load drinks.");
        console.error("Error loading drinks:", e);
      } finally {
        setLoading(false);
      }
    };

    loadDrinks();
  }, []);

  if (loading) {
    return <div>Loading drinks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-26 py-10">
    {drinkRecipes.map((recipe) => (
      <Drinks
        key={recipe.recipe_id}
        recipe_id={recipe.recipe_id}
        recipe_name={recipe.recipe_name}
        cook_time={recipe.cook_time}
        average_rating={recipe.average_rating}
        image_url={recipe.image_url}
        description={recipe.description}
        ingredients={recipe.ingredients}
      />
    ))}
  </div>
  );
};

export default List;