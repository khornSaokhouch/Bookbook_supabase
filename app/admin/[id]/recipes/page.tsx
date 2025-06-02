"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Button } from "../../../components/ui/button";
import {
  Trash2,
  CheckCircle,
  AlertTriangle,
  Search,
  Grid3X3,
  List,
  ChefHat,
  Calendar,
  Tag,
  Plus,
  Edit,
  Eye,
  Filter,
  BookOpen,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface Recipe {
  recipe_id: string;
  recipe_name: string;
  category_id: string;
  occasion_id: string;
  created_at: string;
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
              "recipe_id, recipe_name, category_id, occasion_id, created_at"
            )
            .order("created_at", { ascending: false }),
          supabase.from("category").select("category_id, category_name"),
          supabase.from("occasion").select("occasion_id, name"),
        ]);

      if (recipesResult.error) throw recipesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (occasionsResult.error) throw occasionsResult.error;

      setRecipes(recipesResult.data || []);
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
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <ChefHat className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        #{String(recipe.recipe_id).slice(-4)}
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
                    </div>

                    <div className="flex justify-center gap-2">
                      <motion.button
                        className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
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
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Recipe
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Occasion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe, index) => (
                    <motion.tr
                      key={recipe.recipe_id}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                            <ChefHat className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-lg">
                              {recipe.recipe_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: #{String(recipe.recipe_id).slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
                          <Tag className="w-4 h-4 mr-1" />
                          {getCategoryName(recipe.category_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                          <Calendar className="w-4 h-4 mr-1" />
                          {getOccasionName(recipe.occasion_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          {new Date(recipe.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
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
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No recipes found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
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
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Recipe
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
              Are you sure you want to delete this recipe? This action cannot be
              undone and will permanently remove the recipe from your
              collection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteRecipe}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
