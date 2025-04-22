// "use client";

// import { useState, useEffect } from "react";
// import { FaBookmark, FaStar } from "react-icons/fa";
// import Link from "next/link";
// import Image from "next/image";
// import { supabase } from "../lib/supabaseClient";
// import { useRouter } from "next/navigation";

// interface RecipeData {
//   recipe_id: number;
//   recipe_name: string;
//   cook_time: string;
//   average_rating: number;
//   image_url: string;
// }

// const Card: React.FC<RecipeData> = ({
//   recipe_id,
//   recipe_name,
//   cook_time,
//   average_rating,
//   image_url,
// }) => {
//   const [rating, setRating] = useState<number | null>(null);
//   const [currentAverageRating, setCurrentAverageRating] = useState<number>(average_rating);
//   const [userId, setUserId] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchUserId = async () => {
//       const { data, error } = await supabase.auth.getUser();
//       if (error) console.error("Error fetching user:", error);
//       if (data?.user) setUserId(data.user.id);
//     };
//     fetchUserId();
//   }, []);

//   const handleStarClick = async (index: number): Promise<void> => {
//     if (!userId) {
//       alert("You must be logged in to rate a recipe.");
//       return;
//     }

//     const newRating = index + 1;
//     setRating(newRating);

//     try {
//       const { error } = await supabase.from("reviews").insert([
//         {
//           recipe_id: recipe_id,
//           rating: newRating,
//           user_id: userId,
//         },
//       ]);

//       if (error) throw error;

//       const newAverageRating = await fetchAverageRating(recipe_id);
//       setCurrentAverageRating(newAverageRating);
//       setRating(null);
//     } catch (error) {
//       console.error("Error submitting rating:", (error as Error).message);
//       alert("Failed to submit rating. Please try again.");
//     }
//   };

//   const fetchAverageRating = async (id: number): Promise<number> => {
//     const { data, error } = await supabase.from("reviews").select("rating").eq("recipe_id", id);
//     if (error) {
//       console.error("Error fetching average rating:", error);
//       return 0;
//     }

//     const totalRatings = data.length;
//     const sumRatings = data.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0);
//     return totalRatings > 0 ? sumRatings / totalRatings : 0;
//   };

//   useEffect(() => {
//     const getAverageRating = async () => {
//       const avgRating = await fetchAverageRating(recipe_id);
//       setCurrentAverageRating(avgRating);
//     };
//     getAverageRating();
//   }, [recipe_id]);

//   const handleViewDetailClick = () => {
//     router.push(`/recipe/${recipe_id}`);
//   };

//   return (
//     <div className="relative w-full md:w-80 h-auto rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 transition-transform transform hover:scale-105 duration-300 ease-in-out">
//       <div className="absolute top-2 left-2">
//         <Link href={`/profile/save-recipe/${recipe_id}`}>
//           <FaBookmark className="h-6 w-6 text-white hover:text-blue-600 transition-colors duration-300" />
//         </Link>
//       </div>

//       <div className="relative h-48">
//         {image_url ? (
//           <Image
//             src={image_url}
//             alt={recipe_name}
//             width={500}
//             height={200}
//             className="w-full h-48 object-cover rounded-md"
//             priority
//             unoptimized
//           />
//         ) : (
//           <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-md">
//             <p className="text-gray-500">No image available</p>
//           </div>
//         )}
//       </div>

//       <div className="p-4">
//         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{recipe_name}</h2>
//         <p className="text-sm text-gray-600 dark:text-gray-400">Cooking time: {cook_time}</p>

//         <div className="flex items-center mt-2">
//           {Array.from({ length: 5 }, (_, index) => {
//             const isFilled = index < (rating !== null ? rating : Math.round(currentAverageRating));
//             const starColor = isFilled ? "text-yellow-400" : "text-gray-300";
//             return (
//               <FaStar
//                 key={index}
//                 className={`h-5 w-5 ${userId ? "cursor-pointer" : "cursor-not-allowed"} ${starColor}`}
//                 onClick={() => {
//                   if (userId) handleStarClick(index);
//                   else alert("You must be logged in to rate a recipe.");
//                 }}
//                 title={userId ? "Rate this recipe" : "Login to rate"}
//               />
//             );
//           })}
//           <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
//             ({currentAverageRating.toFixed(1)})
//           </span>
//         </div>

//         {!userId && (
//           <p className="text-xs text-gray-500 mt-1 italic">Login to rate this recipe</p>
//         )}

//         <div className="mt-4">
//           <button
//             className="px-5 text-white py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
//             onClick={handleViewDetailClick}
//           >
//             View Detail
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Card;



