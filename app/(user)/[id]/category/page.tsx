'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import motion correctly
import { Heart } from 'lucide-react'; // Import Heart icon correctly

export default function CategoryPage() {
  const { category_id } = useParams(); // Ensure category_id is dynamically fetched
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch user session
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          const { data: userData } = await supabase
            .from('users')
            .select('user_name, email, image_url')
            .eq('user_id', sessionUser.id)
            .single();

          if (userData) {
            setUser({
              user_id: sessionUser.id,
              user_name: userData.user_name || 'User',
              email: userData.email || '',
              image_url: userData.image_url || '/default-avatar.png',
            });

            const { data: savedData } = await supabase
              .from('saved_recipes')
              .select('recipe_id')
              .eq('user_id', sessionUser.id);

            setSavedRecipes(savedData?.map((item) => item.recipe_id) || []);
          }
        }

        // Fetch recipes by category
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipe')
          .select(`
            recipe_id,
            recipe_name,
            description,
            ingredients,
            instructions,
            created_at,
            prep_time,
            cook_time,
            note,
            image_recipe ( image_url )
          `)
          .eq('category_id', category_id); // Use dynamic category_id

        if (recipesError) throw recipesError;

        const normalizedRecipes = recipesData.map((r) => ({
          ...r,
          image_url: r.image_recipe?.[0]?.image_url || '/default-image.jpg',
        }));

        setRecipes(normalizedRecipes);

      } catch (err) {
        console.error('Error fetching category data:', err);
      }
    };

    if (category_id) {
      fetchAllData();
    }
  }, [category_id]);

  const handleSaveRecipe = async (recipeId) => {
    if (!user) return;

    if (savedRecipes.includes(recipeId)) return;

    try {
      const { error } = await supabase.from('saved_recipes').insert([{
        user_id: user.user_id,
        recipe_id: recipeId,
      }]);

      if (error) throw new Error(error.message);

      setSavedRecipes([...savedRecipes, recipeId]);
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  };

  const recipeCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.03 },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {recipes.map((recipe) => {
        const imageUrl = recipe.image_url || '/default-image.jpg';

        return (
          <motion.div
            key={recipe.recipe_id}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col"
            variants={recipeCardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link href={`/${recipe.recipe_id}/detailspage`} className="block">
              <Image
                src={imageUrl}
                alt={recipe.recipe_name}
                width={400}
                height={250}
                className="w-full h-48 object-cover rounded-lg"
                priority
                unoptimized
              />
              <div className="flex justify-between items-center mt-3">
                <h3 className="text-lg font-semibold">{recipe.recipe_name}</h3>
                {user && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveRecipe(recipe.recipe_id); // Use recipe.recipe_id
                    }}
                    className={`p-2 rounded-full ${savedRecipes.includes(recipe.recipe_id) ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Cook Time: {recipe.cook_time}
              </p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
