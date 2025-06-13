"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Clock, ChefHat, Timer, Star, Sparkles, Heart, Users, Award } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/app/lib/supabaseClient"
import { motion } from "framer-motion"
import { Badge } from "@/app/components/ui/badge"
import InteractiveRating from "@/app/components/InteractiveRating"
import RecipeGallery from "@/app/components/recipe-gallery"

// Type for a single user object as potentially returned by Supabase in an array
interface UserObjectFromDB {
  user_name: string
}

// Type for review data as it comes from Supabase before mapping user_name
interface RawReviewFromDB {
  review_id: number
  user_id: string
  comment: string
  created_at: string
  rating: number
  // Supabase might return users as an array from a join
  users: UserObjectFromDB[] | UserObjectFromDB | null
}

interface RecipeDataFromDB {
  recipe_id: number
  recipe_name: string
  description: string
  prep_time: number | string
  cook_time: number | string
  overview: string
  note: string
  instructions: string
  ingredients: string
  image_recipe: { image_url: string }[]
  // Supabase might return users as an array for the recipe author
  users: UserObjectFromDB[] | UserObjectFromDB | null
  reviews: RawReviewFromDB[]
}

// Final, shaped Review type
interface Review {
  review_id: number
  user_id: string
  comment: string
  created_at: string
  user_name: string
  rating: number
}

// Final, shaped RecipeData type used in the component state
interface Recipe {
  recipe_id: string
  recipe_name: string
  description: string
  instructions: string
  prep_time: number // in minutes
  cook_time: number // in minutes
  image_url: string // main image URL
  image_urls?: string[] // optional array of all image URLs
  overview: string
  note: string
  average_rating: number
  ingredients: string
  author: string
  reviews: Review[]
}

interface User {
  user_id: string
  user_name: string
  email: string
  image_url: string
}

async function getRecipeById(recipeId: number): Promise<RecipeDataFromDB | null> {
  try {
    const { data, error } = await supabase
      .from("recipe")
      .select(
        `
        recipe_id, recipe_name, description, prep_time, cook_time, overview, note, instructions, ingredients,
        image_recipe(image_url), 
        users(user_name), 
        reviews(review_id, user_id, comment, created_at, rating, users(user_name))
        `,
      )
      .eq("recipe_id", recipeId)
      .single()

    if (error) throw error

    if (!data) {
      console.warn("No recipe found for the ID:", recipeId)
      return null
    }
    // Supabase returns data that needs to be cast to our DB structure type
    return data as RecipeDataFromDB
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return null
  }
}

const formatTime = (minutes?: number) => {
  if (minutes === undefined || minutes === null || isNaN(minutes) || minutes < 0) return "0m"
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${remainingMinutes}m`
  }
}

const parseTime = (value: string | number): number => {
  if (typeof value === "number") {
    return Math.max(0, value)
  }
  if (typeof value === "string") {
    if (value.includes(":")) {
      const parts = value.split(":").map(Number)
      if (parts.length === 3) {
        const [h, m, s] = parts
        return Math.max(0, h * 60 + m + Math.round(s / 60))
      } else if (parts.length === 2) {
        const [m, s] = parts
        return Math.max(0, m + Math.round(s / 60))
      }
    }
    const parsedInt = Number.parseInt(value, 10)
    if (!isNaN(parsedInt)) {
      return Math.max(0, parsedInt)
    }
  }
  return 0
}

const shapeRecipeData = (data: RecipeDataFromDB): Recipe => {
  // Changed to accept single RecipeDataFromDB
  const ratings = (data.reviews || [])
    .filter((review) => review.rating != null && !isNaN(review.rating))
    .map((review) => Number(review.rating))
  const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  // Handle recipe author (users property)
  let authorName = "Unknown Author"
  if (data.users) {
    if (Array.isArray(data.users) && data.users.length > 0) {
      authorName = data.users[0].user_name || "Unknown Author"
    } else if (!Array.isArray(data.users) && (data.users as UserObjectFromDB).user_name) {
      authorName = (data.users as UserObjectFromDB).user_name || "Unknown Author"
    }
  }

  const shapedReviews: Review[] = (data.reviews || []).map((review) => {
    let reviewUserName = "Anonymous"
    if (review.users) {
      if (Array.isArray(review.users) && review.users.length > 0) {
        reviewUserName = review.users[0].user_name || "Anonymous"
      } else if (!Array.isArray(review.users) && (review.users as UserObjectFromDB).user_name) {
        reviewUserName = (review.users as UserObjectFromDB).user_name || "Anonymous"
      }
    }
    return {
      review_id: review.review_id,
      user_id: review.user_id,
      comment: review.comment,
      created_at: review.created_at || new Date().toISOString(),
      rating: review.rating,
      user_name: reviewUserName,
    }
  })

  return {
    recipe_id: data.recipe_id.toString(),
    recipe_name: data.recipe_name || "Unnamed Recipe",
    description: data.description || "No description available.",
    instructions: data.instructions || "No instructions provided.",
    prep_time: parseTime(data.prep_time),
    cook_time: parseTime(data.cook_time),
    image_url: data.image_recipe?.[0]?.image_url || "/default-recipe.jpg",
    image_urls: data.image_recipe?.map((img) => img.image_url) || [],

    overview: data.overview || "No overview provided.",
    note: data.note || "No special notes.",
    average_rating: averageRating,
    ingredients: data.ingredients || "No ingredients provided",
    author: authorName,
    reviews: shapedReviews,
  }
}

const DetailsPage: React.FC = () => {
  const params = useParams()
  const id = params.id as string
  const recipeId = Number(id)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)
  const [showAllComments, setShowAllComments] = useState(false)
  const INITIAL_COMMENTS_LIMIT = 3

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData?.session?.user

      if (sessionUser) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_name, email, image_url")
          .eq("user_id", sessionUser.id)
          .single()

        if (!userError && userData) {
          setUser({
            user_id: sessionUser.id,
            user_name: userData.user_name || "User",
            email: userData.email || "",
            image_url: userData.image_url || "/default-avatar.png",
          })
        } else if (userError) {
          console.error("Error fetching current user data:", userError.message)
        }
      }
    }

    getCurrentUser()
  }, [])

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true)
      setError(null)
      setRecipe(null)

      if (!id || isNaN(recipeId) || recipeId <= 0) {
        setError("Invalid recipe ID provided.")
        setLoading(false)
        return
      }

      try {
        const rawRecipeData = await getRecipeById(recipeId) // Fetches RecipeDataFromDB
        if (rawRecipeData) {
          const shapedRecipe = shapeRecipeData(rawRecipeData) // Shapes it to Recipe
          setRecipe(shapedRecipe)
        } else {
          setError("Recipe not found.")
        }
      } catch (err) {
        console.error("Error fetching or shaping recipe:", err)
        setError("Failed to load recipe.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id, recipeId])

  const totalTime = (recipe?.prep_time || 0) + (recipe?.cook_time || 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <ChefHat className="h-16 w-16 text-orange-500 animate-bounce mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Preparing your recipe...</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Just a moment while we gather all the delicious details! 👨‍🍳
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Recipe not found</h2>
          <p className="text-gray-500 dark:text-gray-400">This recipe seems to have disappeared from our kitchen!</p>
        </div>
      </div>
    )
  }

  const validReviewsForComments = (recipe.reviews || []).map((review, index) => ({
    review_id: review.review_id || index,
    user_id: review.user_id,
    comment: review.comment,
    created_at: review.created_at || new Date().toISOString(),
    user_name: review.user_name || "Anonymous",
    rating: review.rating,
    key: `${review.user_id || "anon"}-${review.review_id || index}-${index}`,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        className="container mx-auto px-4 md:px-8 lg:px-16 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            {recipe && (
              <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-8">
                <Image
                  src={recipe.image_url || "/placeholder.svg"}
                  alt={recipe.recipe_name}
                  width={1200}
                  height={600}
                  unoptimized
                  className="w-full h-64 md:h-96 lg:h-[500px] object-cover"
                  priority
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-pink-600/20 to-purple-600/20"></div>

            <div className="absolute top-6 right-6">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-2 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <Star className="h-5 w-5 fill-current mr-2" />
                {Math.round(recipe.average_rating * 10) / 10} ⭐
              </Badge>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
              <motion.div
                className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white text-sm font-medium mb-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Delicious Recipe
              </motion.div>
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {recipe.recipe_name}
              </motion.h1>
              <motion.div
                className="flex flex-wrap items-center gap-4 text-white/90 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <ChefHat className="h-5 w-5 mr-2" />
                  <span>By {recipe.author}</span>
                </div>
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Heart className="h-5 w-5 mr-2 text-red-400" />
                  <span>Loved by many!</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Time Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-2">Prep Time</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTime(recipe.prep_time)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get ready to cook! 🥄</p>
            </div>
          </div>

          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">Cook Time</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTime(recipe.cook_time)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Magic happens here! ✨</p>
            </div>
          </div>

          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Timer className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Total Time</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTime(totalTime)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From start to finish! 🎉</p>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="flex flex-col gap-8 mb-12">
          <motion.section
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Overview</h2>
            </div>
            <ul className="space-y-3">
              {(recipe.overview || "").split(",").map(
                (overviewItem, index) =>
                  overviewItem.trim() && (
                    <li key={`overview-${index}`} className="flex items-start text-gray-700 dark:text-gray-300">
                      <span className="text-orange-500 mr-3 mt-1">🔸</span>
                      <span className="leading-relaxed">{overviewItem.trim()}</span>
                    </li>
                  ),
              )}
            </ul>
          </motion.section>

          <motion.section
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ingredients</h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-4 border border-green-100/50 dark:border-gray-600/50">
              <ul className="space-y-3 divide-y divide-green-100 dark:divide-gray-600/50">
                {(recipe.ingredients || "").split(",").map(
                  (ingredient, index) =>
                    ingredient.trim() && (
                      <li
                        key={`ingredient-${index}`}
                        className="flex items-center py-3 text-gray-700 dark:text-gray-300 group"
                      >
                        <span className="text-green-500 mr-3 text-xl group-hover:scale-125 transition-transform">
                          🌿
                        </span>
                        <span className="leading-relaxed text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {ingredient.trim()}
                        </span>
                      </li>
                    ),
                )}
              </ul>
            </div>
          </motion.section>
        </div>

        {/* <motion.section
  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 mb-8"
  initial={{ y: 50, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.8 }}
>
  {recipe.image_urls && recipe.image_urls.length > 1 && (
    <div className="max-w-6xl mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-600">
        More Recipe Images
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {recipe.image_urls.map((url, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Image
              src={url || "/placeholder.svg"}
              alt={`Recipe image ${index + 1}`}
              width={300}
              height={200}
              unoptimized
              className="w-full h-44 object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  )}
</motion.section> */}

        <div>
          <RecipeGallery recipe={recipe} />
        </div>

        <motion.section
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Instructions</h2>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-6 border border-purple-100/50 dark:border-gray-600/50">
            <ol className="space-y-6 relative before:absolute before:left-[15px] before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:to-blue-500">
              {(recipe.instructions || "").split(",").map(
                (instruction, index) =>
                  instruction.trim() && (
                    <li
                      key={`instruction-${index}`}
                      className="flex items-start text-gray-700 dark:text-gray-300 ml-10 relative"
                    >
                      <span className="absolute -left-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed text-lg hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                        {instruction.trim()}
                      </span>
                    </li>
                  ),
              )}
            </ol>
          </div>
        </motion.section>

        <motion.section
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Description</h2>
          </div>
          <ul className="space-y-3">
            {(recipe.description || "").split(",").map(
              (descriptionItem, index) =>
                descriptionItem.trim() && (
                  <li key={`description-${index}`} className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="text-pink-500 mr-3 mt-1">🔸</span>
                    <span className="leading-relaxed text-lg">{descriptionItem.trim()}</span>
                  </li>
                ),
            )}
          </ul>
        </motion.section>

        {recipe.note && recipe.note !== "No special notes." && (
          <motion.section
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-lg rounded-2xl shadow-lg border border-yellow-200/50 dark:border-gray-700/50 p-8 mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">💡</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Chef&apos;s Note</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">&quot;{recipe.note}&quot;</p>
          </motion.section>
        )}

        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-8"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reviews & Comments</h2>
            </div>

            {/* Keep only the InteractiveRating component that includes stars */}
            <div className="mb-8">
              <InteractiveRating
                recipeId={recipeId}
                userId={user?.user_id}
                onRatingSubmitted={async () => {
                  setLoading(true)
                  const rawRecipeData = await getRecipeById(recipeId)
                  if (rawRecipeData) {
                    const shapedRecipe = shapeRecipeData(rawRecipeData)
                    setRecipe(shapedRecipe)
                  } else {
                    setError("Failed to refresh recipe data after rating.")
                  }
                  setLoading(false)
                }}
              />
            </div>

            {/* Display comments below the form */}
            {validReviewsForComments.length > 0 ? (
              <div className="mt-8 space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  User Comments ({validReviewsForComments.length})
                </h3>
                {validReviewsForComments
                  .slice(0, showAllComments ? validReviewsForComments.length : INITIAL_COMMENTS_LIMIT)
                  .map((review) => (
                    <div
                      key={review.key}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600"
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {review.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{review.user_name}</p>
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                    </div>
                  ))}

                {/* Show More/Show Less Button */}
                {validReviewsForComments.length > INITIAL_COMMENTS_LIMIT && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      {showAllComments
                        ? `Show Less`
                        : `See More Comments (${validReviewsForComments.length - INITIAL_COMMENTS_LIMIT} more)`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}

export default DetailsPage
