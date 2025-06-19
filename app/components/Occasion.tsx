"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChefHat,
  Sparkles,
  X,
  Heart,
  Clock,
} from "lucide-react";

type Occasion = {
  occasion_id: number;
  name: string;
};

type Recipe = {
  recipe_id: number;
  recipe_name: string;
  overview: string | null;
  image_recipe?: { image_url: string }[];
  created_at: string;
};

export default function OccasionPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  const fetchOccasions = useCallback(async () => {
    setIsLoading(true);
    let query = supabase
      .from("occasion")
      .select("occasion_id, name")
      .order("occasion_id", { ascending: true });

    if (filter.trim() !== "") {
      query = query.ilike("name", `%${filter.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching occasions:", error);
    } else {
      setOccasions(data || []);
    }
    setIsLoading(false);
  }, [filter]);

  const fetchRecipes = useCallback(async (occasion_id?: number) => {
    setIsLoadingRecipes(true);

    let query = supabase
      .from("recipe")
      .select(
        `
        recipe_id,
        recipe_name,
        overview,
        created_at,
        image_recipe (image_url)
      `
      )
      .order("recipe_id", { ascending: true });

    if (occasion_id) {
      query = query.eq("occasion_id", occasion_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching recipes:", error);
    } else {
      setRecipes(data || []);
    }

    setIsLoadingRecipes(false);
  }, []);

  useEffect(() => {
    fetchOccasions();
    fetchRecipes();
  }, [fetchOccasions, fetchRecipes]);

  const handleSelectOccasion = (occasion: Occasion) => {
    setSelectedOccasion(occasion);
    fetchRecipes(occasion.occasion_id);
  };

  const handleClearFilter = () => {
    setSelectedOccasion(null);
    fetchRecipes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 via-pink-600/30 to-purple-600/30"></div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            Browse by Occasion
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Discover perfect recipes for every special moment and celebration
          </p>
        </div>
      </div>
      <div className="max-w-9xl mx-auto px-16 py-8">
        {/* Search Section (Unchanged) */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur-sm"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5 z-10" />
              <input
                type="text"
                placeholder="Search occasions... 🔍"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Occasions Sidebar (Unchanged) */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center mb-6">
                  <ChefHat className="h-6 w-6 text-orange-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Occasions
                  </h2>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                    {occasions.map((occasion, index) => (
                      <button
                        key={occasion.occasion_id}
                        onClick={() => handleSelectOccasion(occasion)}
                        className={`group relative w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                          selectedOccasion?.occasion_id === occasion.occasion_id
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                            : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 dark:hover:from-orange-900/30 dark:hover:to-pink-900/30"
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="relative z-10">{occasion.name}</span>
                          {selectedOccasion?.occasion_id ===
                            occasion.occasion_id && (
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                          )}
                        </div>
                        {selectedOccasion?.occasion_id !==
                          occasion.occasion_id && (
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedOccasion && (
                  <button
                    onClick={handleClearFilter}
                    className="mt-6 flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {selectedOccasion ? (
                    <span className="flex items-center">
                      <Heart className="h-8 w-8 text-red-500 mr-3" />
                      Recipes for &quot;{selectedOccasion.name}&quot;
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Sparkles className="h-8 w-8 text-purple-500 mr-3" />
                      All Recipes
                    </span>
                  )}
                </h2>

                <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                  {recipes.length} recipes found
                </div>
              </div>
            </div>

            {isLoadingRecipes ? (
              // FIX #1: Updated grid for loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
                  <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No recipes found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedOccasion
                      ? `No recipes available for "${selectedOccasion.name}" yet. Try selecting a different occasion! 🍳`
                      : "No recipes available at the moment. Check back soon! 👨‍🍳"}
                  </p>
                </div>
              </div>
            ) : (
              // FIX #2: Updated grid for actual recipe cards
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe, index) => (
                  <Link
                    key={recipe.recipe_id}
                    href={`/${recipe.recipe_id}/detailspage`}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {recipe.image_recipe?.[0]?.image_url ? (
                      <div className="relative overflow-hidden">
                        <Image
                          src={
                            recipe.image_recipe[0].image_url ||
                            "/placeholder.svg"
                          }
                          alt={recipe.recipe_name}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center">
                        <div className="text-center">
                          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No image
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="relative p-5">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                        {recipe.recipe_name}
                      </h3>
                      {recipe.overview && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                          {recipe.overview}
                        </p>
                      )}


                   

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {recipe.created_at
                              ? new Date(recipe.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "Date Unknown"}
                          </span>
                        </div>

                        {/* <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>Family Friendly</span>
                        </div> */}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
