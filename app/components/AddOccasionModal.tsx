"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { XCircle, ImageIcon, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface AddOccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOccasionAdded: () => void;
}

interface fetchCategoriesType {
  category_id: number;
  category_name: string;
}

const AddOccasionModal: React.FC<AddOccasionModalProps> = ({
  isOpen,
  onClose,
  onOccasionAdded,
}) => {
  const [occasionName, setOccasionName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<
    { category_id: number; category_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("category")
          .select("category_id, category_name");

        if (error) {
          console.error("Error fetching categories:", error);
          setError(error.message);
        } else {
          setCategories(
            data.map((cat: fetchCategoriesType) => ({
              category_id: cat.category_id,
              category_name: cat.category_name,
            }))
          );
          if (data.length > 0) {
            setCategoryId(data[0].category_id); // Set the first category as default
          }
        }
      } catch (err: unknown) { // Change type to 'unknown'
        console.error("Error fetching categories:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader(); // Use FileReader to read the file
      reader.onload = (event) => {
        setImageFile(file);
        setImagePreview(event.target?.result as string); // Use optional chaining
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure a category is selected
    if (!categoryId) {
      setError("Please select a category.");
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        // Generate a unique file name for the image
        const fileName = `${uuidv4()}-${imageFile.name}`;

        // Upload the image to Supabase Storage
        const { error: storageError } =
          await supabase.storage
            .from("occasion") // Change this to "images" to match your bucket name
            .upload(fileName, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (storageError) {
          console.error("Error uploading image:", storageError);
          setError(storageError.message);
          setLoading(false);
          return;
        }

        // Get the public URL of the uploaded image
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/occasion/${fileName}`; // Construct the full URL
      } catch (uploadErr: unknown) { // Change type to 'unknown'
        console.error("Error uploading image:", uploadErr);
        setError(
          uploadErr instanceof Error
            ? uploadErr.message
            : "An unexpected error occurred during image upload."
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Insert new occasion into the 'occasion' table
      const { data, error } = await supabase.from("occasion").insert([
        {
          name: occasionName,
          occasion_image: imageUrl, // Save the image URL (if uploaded)
          category_id: categoryId, // Save the category ID
        },
      ]);

      if (error) {
        console.error("Error adding occasion:", error);
        setError(error.message);
      } else {
        console.log("Occasion added successfully:", data);
        onOccasionAdded(); // Refresh the occasion list
        onClose(); // Close the modal
      }
    } catch (err: unknown) {
      console.error("Error adding occasion:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
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
            Add New Occasion
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
              htmlFor="occasionName"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Occasion Name:
            </label>
            <input
              type="text"
              id="occasionName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={occasionName}
              onChange={(e) => setOccasionName(e.target.value)}
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
              <Image
                src={imagePreview}
                alt="Occasion Preview"
                width={96}
                height={96}
                className="mt-2 object-cover rounded-full mx-auto"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Category:
            </label>
            <select
              id="categoryId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={categoryId || ""}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
            >
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Occasion"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddOccasionModal;