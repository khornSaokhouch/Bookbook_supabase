"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import AddCategoryModal from "../../../components/AddCategoryModal";
import EditCategoryModal from "../../../components/EditCategoryModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import CategoryDetailModal from "../../../components/CategoryDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Search,
  Grid3X3,
  List,
  ChefHat,
  TrendingUp,
  Star,
} from "lucide-react";

type Category = {
  category_id: string;
  category_name: string;
  image: string;
};

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string>("");
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
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

  const filterCategories = useCallback(() => {
    let filtered = categories;
    if (searchTerm) {
      filtered = filtered.filter((category) =>
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  useEffect(() => {
    filterCategories();
  }, [filterCategories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("category").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      setError(`Error fetching categories: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("category")
        .delete()
        .eq("category_id", id);
      if (error) throw error;
      setSuccessMessage("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      setError(`Error deleting category: ${(error as Error).message}`);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    deleteCategory(itemToDelete);
    setShowDeleteConfirmation(false);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowEditCategoryModal(true);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Categories
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing your recipe categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={cardVariants}>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Recipe Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize and manage your recipe categories
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Categories
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <Grid3X3 className="w-6 h-6 text-white" />
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
                  Most Popular
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {categories.length > 0
                    ? categories[0]?.category_name || "N/A"
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
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
                  Growth Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  +12%
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8"
        variants={cardVariants}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-md text-emerald-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-md text-emerald-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <motion.button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Category
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

      {/* Categories Display */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        variants={cardVariants}
      >
        {viewMode === "grid" ? (
          <div className="p-6">
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.category_id}
                    className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="relative mb-4">
                      <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Image
                          src={
                            category.image ||
                            "/placeholder.svg?height=80&width=80"
                          }
                          alt={category.category_name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        #{String(category.category_id).slice(-4)}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white text-center mb-4 text-lg">
                      {category.category_name}
                    </h3>

                    <div className="flex justify-center gap-2">
                      <motion.button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDetailModal(true);
                        }}
                        className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() =>
                          handleDeleteItem(String(category.category_id))
                        }
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
                <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No categories found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by adding your first category."}
                </p>
                <motion.button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Add First Category
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
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    ID
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <motion.tr
                      key={category.category_id}
                      className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                            <Image
                              src={
                                category.image ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={category.category_name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-lg">
                              {category.category_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
                          #{String(category.category_id).slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDetailModal(true);
                            }}
                            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() =>
                              handleDeleteItem(String(category.category_id))
                            }
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
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No categories found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "Get started by adding your first category."}
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

      {/* Modals */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={fetchCategories}
      />
      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => setShowEditCategoryModal(false)}
        category={currentCategory}
        onCategoryUpdated={fetchCategories}
      />
      <CategoryDetailModal
        isOpen={showCategoryDetailModal}
        onClose={() => setShowCategoryDetailModal(false)}
        category={selectedCategory}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        itemType="category"
      />
    </motion.div>
  );
}
