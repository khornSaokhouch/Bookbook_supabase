"use client";

import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion"; // Import framer-motion
import { XCircle, ImageIcon } from "lucide-react"; // Import icons

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        setError("Image file is too large. Maximum size is 5MB.");
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        const fileName = `${uuidv4()}-${imageFile.name}`;

        const { data: storageData, error: storageError } =
          await supabase.storage
            .from("images") // Change this to "images" to match your bucket name
            .upload(fileName, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (storageError) {
          console.error("Supabase Storage Error:", storageError); // Log the full error
          setError(
            `Image upload failed: ${storageError.message}.  Please check the console for details.`
          );
          setLoading(false);
          return;
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          console.error(
            "NEXT_PUBLIC_SUPABASE_URL is not defined in your environment variables!"
          );
          setError(
            "Configuration error: Supabase URL is missing. Please check your .env.local file and restart the server."
          );
          setLoading(false);
          return;
        }

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`; // Ensure 'images' matches your bucket name
      } catch (uploadErr: any) {
        console.error("Image Upload Error:", uploadErr); // Log the full error
        setError(
          `Image upload failed: ${
            uploadErr.message || "An unexpected error occurred."
          }. Please check the console for details.`
        );
        setLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from("category")
        .insert([{ category_name: categoryName, image: imageUrl }]);

      if (error) {
        console.error("Supabase Insert Error:", error); // Log the full error
        setError(
          `Category creation failed: ${error.message}. Please check the console for details.`
        );
      } else {
        console.log("Category added successfully:", data);
        onCategoryAdded();
        onClose();
      }
    } catch (dbErr: any) {
      console.error("Database Insert Error:", dbErr); // Log the full error
      setError(
        `Category creation failed: ${
          dbErr.message || "An unexpected error occurred."
        }. Please check the console for details.`
      );
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Add New Category
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="categoryName"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Category Name:
            </label>
            <input
              type="text"
              id="categoryName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="imageFile"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Image (Optional):
            </label>
            <label
              htmlFor="imageFile"
              className="relative cursor-pointer bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <ImageIcon className="w-6 h-6 text-gray-500 dark:text-gray-500 mb-2" />
              <span className="text-gray-500 dark:text-gray-500 text-sm">
                Click to Upload
              </span>
              <input
                type="file"
                id="imageFile"
                className="absolute inset-0 w-full h-full opacity-0"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Category Preview"
                className="mt-2 w-24 h-24 object-cover rounded-full mx-auto"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded focus:outline-none focus:shadow-outline transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddCategoryModal;