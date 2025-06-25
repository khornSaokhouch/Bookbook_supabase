"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import AddOccasionModal from "../../../components/AddOccasionModal";
import EditOccasionModal from "../../../components/EditOccasionModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import OccasionDetailModal from "../../../components/OccasionDetailModal";
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
  Calendar,
  Star,
  PartyPopper,
  Gift,
} from "lucide-react";

interface Occasion {
  occasion_id: string;
  name: string;
  occasion_image: string;
  category_id: number;
  category: { category_name: string } | null;
}

export default function RecipeManagement() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [filteredOccasions, setFilteredOccasions] = useState<Occasion[]>([]);
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);
  const [showEditOccasionModal, setShowEditOccasionModal] = useState(false);
  const [currentOccasion, setCurrentOccasion] = useState<Occasion | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string>("");
  const [showOccasionDetailModal, setShowOccasionDetailModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccasions();
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

  const filterOccasions = useCallback(() => {
    let filtered = occasions;
    if (searchTerm) {
      filtered = filtered.filter((occasion) =>
        occasion.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOccasions(filtered);
  }, [occasions, searchTerm]);

  useEffect(() => {
    filterOccasions();
  }, [filterOccasions]);

  const fetchOccasions = async () => {
    setLoading(true);
    setError(null);

    try {
        const { data, error } = await supabase
            .from("occasion")
            .select(
                `
              occasion_id,
              name,
              occasion_image,
              category_id,
              category (category_name)
            `
            );

        if (error) {
            console.error("Supabase error:", error);
            setError(error.message);
            setOccasions([]);
            return;
        }

        if (data) {
            const typedData: Occasion[] = data.map(item => ({
            
                occasion_id: String((item as any).occasion_id),
                name: (item as any).name,
                occasion_image: (item as any).occasion_image,
                category_id: (item as any).category_id,
          
                category: (item as any).category
                    ? { category_name: (item as any).category.category_name }
                    : null,
            }));

            setOccasions(typedData);
        } else {
            setOccasions([]);
        }
    } catch (err: unknown) {
        console.error("Unexpected error:", err);
        setError("Error fetching occasions");
        setOccasions([]);
    } finally {
        setLoading(false);
    }
};
  const deleteOccasion = async (id: string) => {
    try {
      const { error } = await supabase.from("occasion").delete().eq("occasion_id", id);
      if (error) throw error;
      setSuccessMessage("Occasion deleted successfully!");
      fetchOccasions();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error deleting occasion: ${error.message}`);
      } else {
        setError("Error deleting occasion: An unexpected error occurred.");
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    deleteOccasion(itemToDelete);
    setShowDeleteConfirmation(false);
  };

  const handleEditOccasion = (occasion: Occasion) => {
    setCurrentOccasion(occasion);
    setShowEditOccasionModal(true);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Occasions
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing your special occasions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={cardVariants}>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Occasions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage occasions and celebrations for your recipes
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
                  Total Occasions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {occasions.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
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
                  Most Popular
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {occasions.length > 0 ? occasions[0]?.name || "N/A" : "N/A"}
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
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  5
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
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
              placeholder="Search occasions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-md text-purple-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-md text-purple-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <motion.button
              onClick={() => setShowAddOccasionModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Occasion
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

      {/* Occasions Display */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        variants={cardVariants}
      >
        {viewMode === "grid" ? (
          <div className="p-6">
            {filteredOccasions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOccasions.map((occasion, index) => (
                  <motion.div
                    key={occasion.occasion_id}
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
                            occasion.occasion_image ||
                            "/default-recipe.jpg"
                          }
                          alt={occasion.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        #{index + 1}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white text-center mb-4 text-lg">
                      {occasion.name}
                    </h3>

                    <div className="flex justify-center gap-2">
                      <motion.button
                        onClick={() => {
                          setSelectedOccasion(occasion);
                          setShowOccasionDetailModal(true);
                        }}
                        className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditOccasion(occasion)}
                        className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() =>
                          handleDeleteItem(String(occasion.occasion_id))
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
                <PartyPopper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No occasions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by adding your first occasion."}
                </p>
                <motion.button
                  onClick={() => setShowAddOccasionModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Add First Occasion
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
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Category ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Occasion Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Image
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredOccasions.length > 0 ? (
                  filteredOccasions.map((occasion, index) => (
                    <motion.tr
                      key={occasion.occasion_id}
                      className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
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

                      <td className="px-6 py-4">
                        {occasion.category?.category_name || "Unknown"}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {occasion.name}
                      </td>

                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                          <Image
                            src={occasion.occasion_image || "/default-recipe.jpg"}
                            alt={occasion.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            onClick={() => {
                              setSelectedOccasion(occasion);
                              setShowOccasionDetailModal(true);
                            }}
                            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            onClick={() => handleEditOccasion(occasion)}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            onClick={() =>
                              handleDeleteItem(String(occasion.occasion_id))
                            }
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg"
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
                        <PartyPopper className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No occasions found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "Get started by adding your first occasion."}
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
      <AddOccasionModal
        isOpen={showAddOccasionModal}
        onClose={() => setShowAddOccasionModal(false)}
        onOccasionAdded={fetchOccasions}
      />
      <EditOccasionModal
        isOpen={showEditOccasionModal}
        onClose={() => setShowEditOccasionModal(false)}
        occasion={currentOccasion}
        onOccasionUpdated={fetchOccasions}
      />
      <OccasionDetailModal
        isOpen={showOccasionDetailModal}
        onClose={() => setShowOccasionDetailModal(false)}
        occasion={selectedOccasion}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        itemType="occasion"
      />
    </motion.div>
  );
}