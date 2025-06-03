// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { motion } from "framer-motion";
// import { ChefHat, Star, TrendingUp } from "lucide-react";
// import { supabase } from "../../../lib/supabaseClient";
// import RecipeCard from "../../../components/recipe-card";
// import type { User } from "@/app/types";

// // Transform the data types to match RecipeCard expectations
// type Recipe = {
//   recipe_id: number;
//   recipe_name: string;
//   cook_time: string;
//   image_recipe: { image_url: string }[];
//   description: string;
//   ingredients: string;
//   instructions: string;
//   created_at: string;
//   totalTime: string;
//   prep_time: string;
//   note: string;
// };

// type Review = {
//   review_id: number;
//   recipe_id: number;
//   user_id: string;
//   comment: string;
//   rating: number;
//   created_at: string;
// };

// const PopularPage = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [recipes, setRecipes] = useState<Recipe[]>([]);
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Helper functions for time parsing and formatting
//   const parseTime = (value: string | number) => {
//     if (typeof value === "number") return value;
//     if (typeof value === "string" && value.includes(":")) {
//       const [h, m, s] = value.split(":").map(Number);
//       return h * 60 + m + Math.round(s / 60);
//     }
//     return Number.parseInt(value) || 0;
//   };

//   const formatTime = (minutes: number) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`;
//   };

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Get current user session
//       const { data: sessionData } = await supabase.auth.getSession();
//       const sessionUser = sessionData?.session?.user;

//       if (sessionUser) {
//         const { data, error } = await supabase
//           .from("users")
//           .select("user_name, email, image_url")
//           .eq("user_id", sessionUser.id)
//           .single();

//         if (!error && data) {
//           setUser({
//             user_id: sessionUser.id,
//             user_name: data.user_name || "User",
//             email: data.email || "",
//             image_url: data.image_url || "/default-avatar.png",
//           });

//           // Fetch saved recipes for logged-in users
//           const { data: savedData } = await supabase
//             .from("saved_recipes")
//             .select("recipe_id")
//             .eq("user_id", sessionUser.id);

//           setSavedRecipes(savedData?.map((item) => item.recipe_id) || []);
//         }
//       }

//       // Fetch popular recipes with all required fields
//       const { data: recipesData, error: recipesError } = await supabase
//         .from("recipe")
//         .select(
//           `
//           recipe_id,
//           recipe_name,
//           description,
//           ingredients,
//           instructions,
//           created_at,
//           prep_time,
//           cook_time,
//           note,
//           image_recipe ( image_url )
//         `
//         )
//         .order("created_at", { ascending: false })
//         .limit(12); // Show more popular recipes

//       if (recipesError) throw recipesError;

//       // Transform the data to match RecipeCard expectations
//       const transformedRecipes = (recipesData || []).map((recipe) => ({
//         ...recipe,
//         totalTime: "", // Will be calculated by RecipeCard
//         description:
//           recipe.description || "A delicious and popular recipe loved by many!",
//         ingredients: recipe.ingredients || "Fresh ingredients",
//         instructions: recipe.instructions || "Easy to follow instructions",
//         note: recipe.note || "Enjoy this amazing recipe!",
//         prep_time: recipe.prep_time || "0:00:00",
//         cook_time: recipe.cook_time || "0:00:00",
//       }));

//       setRecipes(transformedRecipes as Recipe[]);

//       // Fetch all reviews
//       const { data: reviewsData, error: reviewsError } = await supabase
//         .from("reviews")
//         .select("review_id, recipe_id, user_id, comment, rating, created_at");

//       if (reviewsError) throw reviewsError;

//       setReviews(reviewsData as Review[]);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(`Failed to load data: ${err.message}`);
//       } else {
//         setError("An unexpected error occurred.");
//       }
//       console.error("Error fetching data:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleSaveRecipe = async (recipeId: number) => {
//     if (!user) return;
//     if (savedRecipes.includes(recipeId)) return;

//     try {
//       const { error } = await supabase.from("saved_recipes").insert([
//         {
//           user_id: user.user_id,
//           recipe_id: recipeId,
//         },
//       ]);

//       if (error) throw new Error(error.message);

//       setSavedRecipes([...savedRecipes, recipeId]);
//     } catch (err) {
//       console.error("Error saving recipe:", err);
//     }
//   };

//   const containerVariants = {
//     initial: { opacity: 0 },
//     animate: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//       <main className="container mx-auto px-4 py-12">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center mb-4">
//             <TrendingUp className="h-12 w-12 text-orange-500 mr-3" />
//             <Star className="h-8 w-8 text-yellow-400" />
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
//             Popular Recipes
//           </h1>
//           <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//             Discover the most loved recipes by our amazing cooking community!
//             🔥👨‍🍳
//           </p>
//           <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full inline-block">
//             {recipes.length} trending recipes right now
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading ? (
//           <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
//             {[...Array(8)].map((_, i) => (
//               <div
//                 key={i}
//                 className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg overflow-hidden"
//               >
//                 <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
//                 <div className="p-4 space-y-3">
//                   <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
//                   <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
//                   <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : error ? (
//           <div className="text-center py-16">
//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
//               <ChefHat className="h-16 w-16 text-red-400 mx-auto mb-4" />
//               <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
//                 Oops! Something went wrong
//               </h3>
//               <p className="text-red-500 mb-4">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         ) : recipes.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
//               <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
//                 No popular recipes yet
//               </h3>
//               <p className="text-gray-500 dark:text-gray-400">
//                 Check back soon for trending recipes! 🍳
//               </p>
//             </div>
//           </div>
//         ) : (
//           <motion.div
//             className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
//             variants={containerVariants}
//             initial="initial"
//             animate="animate"
//           >
//             {recipes.map((recipe, index) => (
//               <RecipeCard
//                 key={recipe.recipe_id}
//                 recipe={recipe}
//                 reviews={reviews}
//                 user={user}
//                 savedRecipes={savedRecipes}
//                 onSaveRecipe={handleSaveRecipe}
//                 parseTime={parseTime}
//                 formatTime={formatTime}
//                 index={index}
//               />
//             ))}
//           </motion.div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default PopularPage;

import Popular from "@/app/components/Popular"

export default function Page() {
  return (
    <div>
      <Popular />
    </div>
  )
};
