// components/Drinks.tsx

'use client'
import { useState, useEffect } from 'react';
import { FaBookmark, FaStar } from 'react-icons/fa';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; // Import your Supabase client
import { useRouter } from 'next/navigation'; // Import useRouter

interface RecipeData {
  recipe_id: number;
  recipe_name: string;
  cook_time: string;
  average_rating: number;
  image_url: string;
  description: string;
  ingredients: string;
}

const Card: React.FC<RecipeData> = ({
  recipe_id,
  recipe_name,
  cook_time,
  average_rating,
  image_url,
  description, // You may want to use these
  ingredients, // You may want to use these
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [currentAverageRating, setCurrentAverageRating] = useState<number>(average_rating);
   const router = useRouter(); // Initialize useRouter

  const handleStarClick = async (index: number) => {
    const newRating = index + 1; // Set the rating based on the star clicked
    setRating(newRating); // Update local rating state

    try {
      const user_id = 6; // Default user_id for anonymous ratings

      // Here, send the rating to the Supabase database
      const { data, error } = await supabase
        .from('reviews') // Assuming 'reviews' is your table name
        .insert([
          {
            recipe_id: recipe_id,
            rating: newRating,
            user_id: user_id, // Include user_id in the insertion
          },
        ]);

      if (error) throw error;

      // Update the current average rating after a successful submission
      const newAverageRating = await fetchAverageRating(recipe_id);
      setCurrentAverageRating(newAverageRating);
      setRating(null); // Reset the local rating state after submission
    } catch (error) {
      console.error("Error submitting rating:", error.message, error.details);
    }
  };

  const fetchAverageRating = async (id: number): Promise<number> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('recipe_id', id);

    if (error) {
      console.error('Error fetching average rating:', error);
      return 0;
    }

    const totalRatings = data.length;
    const sumRatings = data.reduce((acc: number, review: any) => acc + review.rating, 0);
    return totalRatings > 0 ? (sumRatings / totalRatings) : 0;
  };

  // Fetch the average rating when the component mounts
  useEffect(() => {
    const getAverageRating = async () => {
      const avgRating = await fetchAverageRating(recipe_id);
      setCurrentAverageRating(avgRating);
    };

    getAverageRating();
  }, [recipe_id]);

   const handleViewDetailClick = () => {
     router.push(`/${recipe_id}`); // Use router.push
   };

  return (
    <div className="w-80 h-auto rounded-lg overflow-hidden shadow-lg bg-white transition-transform transform hover:scale-105 duration-300 ease-in-out">
      {/* Save Recipe Button */}
      <div className="absolute top-2 left-2">
        <Link href={`/profile/save-recipe/${recipe_id}`}>
          <FaBookmark className="h-6 w-6 text-white hover:text-blue-600 transition-colors duration-300" />
        </Link>
      </div>
       <div className="relative h-48">
          <img
            className="w-full h-full object-cover"
            src={image_url}
            alt={recipe_name}
          />
        </div>

      {/* Recipe Details */}
      <div className="p-4">
        {/* Recipe Title */}
        <h2 className="text-lg font-bold text-gray-800">{recipe_name}</h2>

        {/* Cooking Time */}
        <p className="text-sm text-gray-600">Cooking time: {cook_time} </p>

        {/* Rating */}
        <div className="flex items-center mt-2">
          {Array.from({ length: 5 }, (_, index) => (
            <FaStar
              key={index}
              className={`h-5 w-5 cursor-pointer ${index < (rating !== null ? rating : currentAverageRating) ? 'text-green-800' : 'text-yellow-200'}`}
              onClick={() => handleStarClick(index)} // Allow user to click to rate
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({currentAverageRating.toFixed(1)})</span>
        </div>

        {/* View Detail Button */}
        <div className="mt-4">
          <button
            className='px-5 text-white py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors'
            onClick={handleViewDetailClick} // Use onClick handler
          >
            View Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;