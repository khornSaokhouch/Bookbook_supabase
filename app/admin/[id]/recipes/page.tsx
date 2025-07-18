"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import {
  Trash2,
  CheckCircle,
  AlertTriangle,
  Search,
  Grid3X3,
  List,
  Calendar,
  Tag,
  Plus,
  Filter,
  BookOpen,
  TrendingUp,
  Clock,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Final shape of a recipe object used in the component's state
interface Recipe {
  recipe_id: string;
  recipe_name: string;
  category_id: string;
  occasion_id: string;
  created_at: string;
  image_url?: string | null;
  user_id?: string;
  user_name?: string;
}

// CORRECTED: Shape of the raw data returned from the Supabase query
interface RawRecipeFromSupabase {
  recipe_id: string;
  recipe_name: string;
  category_id: string;
  occasion_id: string;
  created_at: string;
  user_id: string | null;
  // FIX #1: Define 'users' as an array of objects or null, as indicated by the error.
  users: { user_name: string }[] | null;
  image_recipe: { image_url: string }[] | null;
}

interface Category {
  category_id: string;
  category_name: string;
}

interface Occasion {
  occasion_id: string;
  name: string;
}

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [occasionFilter, setOccasionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const filterRecipes = useCallback(() => {
    let filtered = recipes;

    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.category_id === categoryFilter
      );
    }

    if (occasionFilter !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.occasion_id === occasionFilter
      );
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, categoryFilter, occasionFilter]);

  useEffect(() => {
    filterRecipes();
  }, [filterRecipes]);

  async function fetchData() {
    try {
      setLoading(true);

      const [recipesResult, categoriesResult, occasionsResult] =
        await Promise.all([
          supabase
            .from("recipe")
            .select(
              `
          recipe_id,
          recipe_name,
          category_id,
          occasion_id,
          created_at,
          user_id,
          users(user_name),
          image_recipe(image_url)
        `
            )
            .order("created_at", { ascending: false }),

          supabase.from("category").select("category_id, category_name"),
          supabase.from("occasion").select("occasion_id, name"),
        ]);

      if (recipesResult.error) throw recipesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (occasionsResult.error) throw occasionsResult.error;

      // This is line 145 where the error occurred. It will now work with the corrected interface.
      const rawData: RawRecipeFromSupabase[] = recipesResult.data || [];

      const recipesWithData: Recipe[] = rawData.map(
        (recipe: RawRecipeFromSupabase) => ({
          recipe_id: recipe.recipe_id,
          recipe_name: recipe.recipe_name,
          category_id: recipe.category_id,
          occasion_id: recipe.occasion_id,
          created_at: recipe.created_at,
          user_id: recipe.user_id || undefined,
          image_url: recipe.image_recipe?.[0]?.image_url ?? null,
          // FIX #2: Access the first element of the 'users' array to get the user name.
          user_name: recipe.users?.[0]?.user_name || "Unknown User",
        })
      );

      setRecipes(recipesWithData);
      setCategories(categoriesResult.data || []);
      setOccasions(occasionsResult.data || []);
    } catch (error) {
      setError(`Error fetching data: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecipe() {
    if (!selectedRecipe) {
      setError("No recipe selected for deletion.");
      return;
    }

    try {
      const { error } = await supabase
        .from("recipe")
        .delete()
        .eq("recipe_id", selectedRecipe);

      if (error) throw error;

      setRecipes(
        recipes.filter((recipe) => recipe.recipe_id !== selectedRecipe)
      );
      setIsDeleteModalOpen(false);
      setSuccessMessage("Recipe deleted successfully!");
    } catch (error) {
      setError(`Error deleting recipe: ${(error as Error).message}`);
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.category_id === categoryId);
    return category?.category_name || "Unknown";
  };

  const getOccasionName = (occasionId: string) => {
    const occasion = occasions.find((occ) => occ.occasion_id === occasionId);
    return occasion?.name || "Unknown";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-orange-900 dark:to-amber-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Recipes
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing your recipe collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-orange-900 dark:to-amber-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={cardVariants}>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Recipe Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize your recipe collection
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Recipes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {recipes.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Categories
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Occasions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {occasions.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  This Month
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    recipes.filter(
                      (recipe) =>
                        new Date(recipe.created_at).getMonth() ===
                        new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8"
        variants={cardVariants}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={occasionFilter}
                onChange={(e) => setOccasionFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="all">All Occasions</option>
                {occasions.map((occasion) => (
                  <option
                    key={occasion.occasion_id}
                    value={occasion.occasion_id}
                  >
                    {occasion.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-md text-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-md text-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>

            <motion.button
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Recipe
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-6 h-6 mr-3" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="w-6 h-6 mr-3" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipes Display */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        variants={cardVariants}
      >
        {viewMode === "grid" ? (
          <div className="p-6">
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.recipe_id}
                    className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="relative mb-4">
                      <div className="w-full h-24 mx-auto rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <Image
                          src={
                            recipe.image_url ||
                            "/placeholder.svg?height=96&width=200"
                          }
                          alt={recipe.recipe_name}
                          width={200}
                          height={96}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        #{index + 1}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white text-center mb-2 text-lg">
                      {recipe.recipe_name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          <Tag className="w-3 h-3 mr-1" />
                          {getCategoryName(recipe.category_id)}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          <Calendar className="w-3 h-3 mr-1" />
                          {getOccasionName(recipe.occasion_id)}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                          <User className="w-3 h-3 mr-1" />
                          Published by {recipe.user_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-2">
                      <motion.button
                        onClick={() => {
                          setSelectedRecipe(recipe.recipe_id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm ||
                  categoryFilter !== "all" ||
                  occasionFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first recipe."}
                </p>
                <motion.button
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Add First Recipe
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    ID
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Image
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Occasion
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Published by
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe, index) => (
                    <motion.tr
                      key={recipe.recipe_id}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4 font-medium text-sm text-gray-700 dark:text-white">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                          #{index + 1}
                        </span>
                      </td>

                      {/* Image */}
                      <td className="px-6 py-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                          <Image
                            src={
                              recipe.image_url ||
                              "/placeholder.svg?height=56&width=56"
                            }
                            alt={recipe.recipe_name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                        {recipe.recipe_name}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md select-none">
                          <Tag className="w-4 h-4 mr-1" />
                          {getCategoryName(recipe.category_id)}
                        </span>
                      </td>

                      {/* Occasion */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md select-none">
                          <Calendar className="w-4 h-4 mr-1" />
                          {getOccasionName(recipe.occasion_id)}
                        </span>
                      </td>

                      {/* Published by */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md select-none">
                          <User className="w-4 h-4 mr-1" />
                          {recipe.user_name}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(recipe.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            onClick={() => {
                              setSelectedRecipe(recipe.recipe_id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Delete recipe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          No recipes found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                          {searchTerm ||
                          categoryFilter !== "all" ||
                          occasionFilter !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding your first recipe."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Recipe
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this recipe? This action cannot
                be undone and will permanently remove the recipe from your
                collection.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteRecipe}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Recipe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
