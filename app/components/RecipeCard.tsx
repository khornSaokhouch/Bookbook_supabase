// components/RecipeCard.tsx
import Image from 'next/image';
import Link from 'next/link';

type Recipe = {
  recipe_id: number;
  recipe_name: string;
  cook_time: string;
  prep_time: string;
  description: string;
  ingredients: string;
  instructions: string;
  created_at: string;
  note: string;
  image_recipe: { image_url: string }[];
};

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl =
    recipe.image_recipe && recipe.image_recipe[0]?.image_url
      ? recipe.image_recipe[0].image_url
      : '/default-recipe.jpg';

  return (
    <Link href={`/${recipe.recipe_id}/detailspage`} className="block h-full">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={recipe.recipe_name}
            fill
            style={{ objectFit: 'cover' }}
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {recipe.recipe_name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Cook Time: {recipe.cook_time} | Prep Time: {recipe.prep_time}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
          {recipe.description}
        </p>
      </div>
    </Link>
  );
}
