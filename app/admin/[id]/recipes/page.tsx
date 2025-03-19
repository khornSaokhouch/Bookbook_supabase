"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import AddCategoryModal from "../../../components/AddCategoryModal";
import AddOccasionModal from "../../../components/AddOccasionModal";
import EditCategoryModal from "../../../components/EditCategoryModal";
import EditOccasionModal from "../../../components/EditOccasionModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import CategoryDetailModal from "../../../components/CategoryDetailModal"; // Import Category Detail Modal
import OccasionDetailModal from "../../../components/OccasionDetailModal"; // Import Occasion Detail Modal

type Category = {
  category_id: string;
  category_name: string;
  image: string;
};

type Occasion = {
  occasion_id: string;
  name: string;
  image_occasions: string;
};

export default function RecipeManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditOccasionModal, setShowEditOccasionModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentOccasion, setCurrentOccasion] = useState<Occasion | null>(
    null
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemType, setDeleteItemType] =
    useState<"category" | "occasion">("category");
  const [itemToDelete, setItemToDelete] = useState<string>("");

  // State for detail modals
  const [showCategoryDetailModal, setShowCategoryDetailModal] =
    useState(false);
  const [showOccasionDetailModal, setShowOccasionDetailModal] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
    fetchOccasions();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("category").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchOccasions = async () => {
    try {
      const { data, error } = await supabase.from("occasion").select("*");
      if (error) throw error;
      setOccasions(data || []);
    } catch (error) {
      console.error("Error fetching occasions:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await supabase.from("category").delete().eq("category_id", id);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const deleteOccasion = async (id: string) => {
    try {
      await supabase.from("occasion").delete().eq("occasion_id", id);
      fetchOccasions();
    } catch (error) {
      console.error("Error deleting occasion:", error);
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
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleEditOccasion = (occasion: Occasion) => {
    setCurrentOccasion(occasion);
    setShowEditOccasionModal(true);
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-4 md:mb-6">Recipe Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category.category_id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-200 flex flex-col items-center justify-center"
              >
                <Image
                  src={category.image || "/default-image.jpg"}
                  alt={category.category_name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                />
                <h3 className="text-lg font-semibold text-center mb-2">
                  {category.category_name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDetailModal(true);
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center hover:bg-orange-600 transition-colors duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteItem(category.category_id, "category")
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="text-orange-500 text-lg font-medium hover:text-orange-600 transition-colors duration-200"
              >
                + Add Category
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-4 md:mb-6">Occasion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {occasions.map((occasion) => (
              <div
                key={occasion.occasion_id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-200 flex flex-col items-center justify-center"
              >
                <Image
                  src={occasion.image_occasions || "/default-image.jpg"}
                  alt={occasion.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                />
                <h3 className="text-lg font-semibold text-center mb-2">
                  {occasion.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOccasion(occasion);
                      setShowOccasionDetailModal(true);
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center hover:bg-orange-600 transition-colors duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditOccasion(occasion)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteItem(occasion.occasion_id, "occasion")
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
              <button
                onClick={() => setShowAddOccasionModal(true)}
                className="text-orange-500 text-lg font-medium hover:text-orange-600 transition-colors duration-200"
              >
                + Add Occasion
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
    </main>
  );
}