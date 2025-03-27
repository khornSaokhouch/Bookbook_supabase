"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import AddCategoryModal from "../../../components/AddCategoryModal";
import AddOccasionModal from "../../../components/AddOccasionModal";
import EditCategoryModal from "../../../components/EditCategoryModal";
import EditOccasionModal from "../../../components/EditOccasionModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import CategoryDetailModal from "../../../components/CategoryDetailModal";
import OccasionDetailModal from "../../../components/OccasionDetailModal";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type Category = {
  category_id: string;
  category_name: string;
  image: string;
};

type Occasion = {
  occasion_id: string;
  name: string;
  occasion_image: string;
};

export default function RecipeManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditOccasionModal, setShowEditOccasionModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentOccasion, setCurrentOccasion] = useState<Occasion | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<"category" | "occasion">(
    "category"
  );
  const [itemToDelete, setItemToDelete] = useState<string>("");
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [showOccasionDetailModal, setShowOccasionDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchOccasions();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("category").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      setError(`Error fetching categories: ${error.message}`);
    }
  };

  const fetchOccasions = async () => {
    try {
      const { data, error } = await supabase.from("occasion").select("*");
      if (error) throw error;
      setOccasions(data || []);
    } catch (error: any) {
      console.error("Error fetching occasions:", error);
      setError(`Error fetching occasions: ${error.message}`);
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
    } catch (error: any) {
      setError(`Error deleting category: ${error.message}`);
    }
  };

  const deleteOccasion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("occasion")
        .delete()
        .eq("occasion_id", id);
      if (error) throw error;
      setSuccessMessage("Occasion deleted successfully!");
      fetchOccasions();
    } catch (error: any) {
      setError(`Error deleting occasion: ${error.message}`);
    }
  };

  const handleDeleteItem = (id: string, itemType: "category" | "occasion") => {
    setItemToDelete(id);
    setDeleteItemType(itemType);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItemType === "category") {
      deleteCategory(itemToDelete);
    } else if (deleteItemType === "occasion") {
      deleteOccasion(itemToDelete);
    }
    setShowDeleteConfirmation(false);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleEditOccasion = (occasion: Occasion) => {
    setCurrentOccasion(occasion);
    setShowEditOccasionModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    hover: { backgroundColor: "#f9f9f9" },
  };

  return (
    <motion.main
      className="container mx-auto p-4 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8 rounded-lg shadow-md">
        {/* Error Message */}
        {error && (
          <motion.div
            className="fixed top-4 right-4 bg-red-100 border border-red-500 text-red-700 py-3 px-4 rounded-md shadow-md z-50 flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            className="fixed top-4 right-4 bg-green-100 border border-green-500 text-green-700 py-3 px-4 rounded-md shadow-md z-50 flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.5 } }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </motion.div>
        )}

        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-white">
            Recipe Categories
          </h2>
          <div className="overflow-x-auto mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left text-white">ID</th>
                  <th className="py-3 px-6 text-left text-white">Image</th>
                  <th className="py-3 px-6 text-left text-white">Name</th>
                  <th className="py-3 px-6 text-right text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-400 text-sm font-light">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <motion.tr
                      key={category.category_id}
                      className="border-b dark:border-gray-700 hover:bg-gray-500 hover:text-black transition-colors duration-200 text-white"
                      variants={rowVariants}
                      whileHover="hover"
                    >
                      <td className="py-3 px-6">{category.category_id}</td>
                      <td className="py-3 px-6">
                        <Image
                          src={category.image || "/default-image.jpg"}
                          alt={category.category_name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-6">{category.category_name}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-right">
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDetailModal(true);
                            }}
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mr-2 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 inline-flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItem(category.category_id, "category")
                            }
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-500 dark:text-gray-300"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-center p-4">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-white">
            Occasions
          </h2>
          <div className="overflow-x-auto mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left text-white">ID</th>
                  <th className="py-3 px-6 text-left text-white">Image</th>
                  <th className="py-3 px-6 text-left text-white">Name</th>
                  <th className="py-3 px-6 text-right text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-400 text-sm font-light">
                {occasions.length > 0 ? (
                  occasions.map((occasion) => (
                    <motion.tr
                      key={occasion.occasion_id}
                      className="border-b dark:border-gray-700 hover:bg-gray-500 hover:text-black transition-colors duration-200 text-white"
                      variants={rowVariants}
                      whileHover="hover"
                    >
                      <td className="py-3 px-6">{occasion.occasion_id}</td>
                      <td className="py-3 px-6">
                        <Image
                          src={occasion.occasion_image || "/default-image.jpg"}
                          alt={occasion.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-6">{occasion.name}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-right">
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedOccasion(occasion);
                              setShowOccasionDetailModal(true);
                            }}
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mr-2 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditOccasion(occasion)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 inline-flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItem(occasion.occasion_id, "occasion")
                            }
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-500 dark:text-gray-300"
                    >
                      No occasions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-center p-4">
              <button
                onClick={() => setShowAddOccasionModal(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Occasion
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={fetchCategories}
      />
      <AddOccasionModal
        isOpen={showAddOccasionModal}
        onClose={() => setShowAddOccasionModal(false)}
        onOccasionAdded={fetchOccasions}
      />
      <EditCategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => setShowEditCategoryModal(false)}
        category={currentCategory}
        onCategoryUpdated={fetchCategories}
      />
      <EditOccasionModal
        isOpen={showEditOccasionModal}
        onClose={() => setShowEditOccasionModal(false)}
        occasion={currentOccasion}
        onOccasionUpdated={fetchOccasions}
      />

      {/* Detail Modals */}
      <CategoryDetailModal
        isOpen={showCategoryDetailModal}
        onClose={() => setShowCategoryDetailModal(false)}
        category={selectedCategory}
      />
      <OccasionDetailModal
        isOpen={showOccasionDetailModal}
        onClose={() => setShowOccasionDetailModal(false)}
        occasion={selectedOccasion}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        itemType={deleteItemType}
      />
    </motion.main>
  );
}
