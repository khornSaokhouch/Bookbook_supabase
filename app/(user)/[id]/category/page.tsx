// src/app/(user)/[id]/category/page.tsx

"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import RecipeCard from '../../../components/Card';
import { supabase } from '../../../lib/supabaseClient';

interface Recipe {
    recipe_id: number;
    recipe_name: string;
    description: string;
    prep_time: string;
    cook_time: string;
    image_url: string;
    average_rating: number;
    ingredients: string;
    author: string;
    date: string;
}

interface DatabaseRecipeType {
    recipe_id: number;
    recipe_name: string;
    description: string;
    prep_time: string;
    cook_time: string;
    image_recipe: { image_url: string }[];
    users: { user_name: string };
    reviews: { rating: number }[];
}

interface ReviewType {
    rating: number;
}

const CategoryPage: React.FC = () => {
    const router = useRouter();
    const { category_id } = router.query;

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!category_id) return;

        const fetchRecipesByCategory = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase
                    .from('recipe')
                    .select(`
            recipe_id,
            recipe_name,
            description,
            prep_time,
            cook_time,
            image_recipe(image_url),
            users(user_name),
            reviews(rating)
          `);

                if (error) {
                    throw error;
                }

                const recipesData = data.map((recipe: DatabaseRecipeType) => {
                    const ratings = recipe.reviews.map((review: ReviewType) => review.rating);
                    const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

                    return {
                        ...recipe,
                        average_rating: averageRating,
                        image_url: recipe.image_recipe?.[0]?.image_url || 'default-image.jpg',
                        author: recipe.users?.user_name || 'Unknown Author',
                    };
                });

                setRecipes(recipesData);
            } catch (err: Error) {
                setError("Error fetching recipes");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipesByCategory();
    }, [category_id]);

    if (loading) {
        return <div>Loading recipes...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (recipes.length === 0) {
        return <div>No recipes found for this category.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-10">
            {recipes.map((recipe) => (
                <RecipeCard
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

export default CategoryPage;