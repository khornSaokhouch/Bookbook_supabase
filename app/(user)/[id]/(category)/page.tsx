// app/category/[category_name]/page.tsx

import { supabase } from '../../../lib/supabaseClient';
import RecipeCard from '../../../components/RecipeCard';

interface CategoryPageProps {
  params: { category_name: string };  // Changed from category_id to category_name
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = params.category_name; // get category name

  console.log('Category Name:', categoryName);  // Add this line for debugging

  if (!categoryName) {
    return (
      <main className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-white dark:text-white">
          Invalid Category ID
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">The category ID is invalid. Please check the URL.</p>
      </main>
    );
  }

  // Query to fetch the recipes
  const { data: recipes, error } = await supabase
    .from('recipe')
    .select(`
      recipe_id,
      recipe_name,
      cook_time,
      prep_time,
      description,
      ingredients,
      instructions,
      note,
      created_at,
      image_recipe ( image_url )
    `)
    .eq('category_name', categoryName)
    
  if (error) {
    console.error('Error fetching recipes:', error);
    return (
      <main className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-white dark:text-white">
          Error
        </h2>
        <p className="text-center text-red-500">Failed to load recipes. Please try again later.</p>
      </main>
    );
  }

  // If no recipes found for the given category
  if (!recipes || recipes.length === 0) {
    return (
      <main className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-white dark:text-white">
          No Recipes Found
        </h2>
        <p className="text-center text-gray-400 dark:text-gray-400">There are no recipes in this category.</p>
      </main>
    );
  }

  // Successfully fetched recipes, render them
  return (
    <main className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-white dark:text-white">
        Recipes in Category {categoryName}
      </h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.recipe_id} recipe={recipe} />
        ))}
      </div>
    </main>
  );
}