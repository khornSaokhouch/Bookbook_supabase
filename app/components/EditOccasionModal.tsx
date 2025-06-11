"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import Image from "next/image";
import { XCircle, ImageIcon, AlertTriangle } from "lucide-react";

type EditOccasionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  occasion: Occasion | null;
  onOccasionUpdated: () => void;
};

type Occasion = {
  occasion_id: string;
  name: string;
  occasion_image: string;
};

const EditOccasionModal: React.FC<EditOccasionModalProps> = ({
  isOpen,
  onClose,
  occasion,
  onOccasionUpdated,
}) => {
  const [occasionName, setOccasionName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (occasion) {
      setOccasionName(occasion.name);
      setImagePreview(occasion.occasion_image);
    }
  }, [occasion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file is too large. Maximum size is 5MB.");
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setImageFile(null);
      setImagePreview(occasion?.occasion_image || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!occasion) {
      setError("No occasion data to update.");
      setLoading(false);
      return;
    }

    let imageUrl: string | null = occasion.occasion_image;

    if (imageFile) {
      try {
        const fileName = `${uuidv4()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("occasion") // Use your correct bucket name
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase Storage Error:", uploadError);
          setError(`Image upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/occasion/${fileName}`;
      } catch (error: unknown) {
        console.error("Error uploading image:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during image upload."
        );
        setLoading(false);
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("occasion")
        .update({ name: occasionName, occasion_image: imageUrl })
        .eq("occasion_id", occasion.occasion_id);

      if (error) {
        console.error("Error updating occasion:", error);
        setError(`Failed to update occasion: ${error.message}`);
        setLoading(false);
        return;
      }

      onOccasionUpdated();
      onClose();
    } catch (error: unknown) {
      console.error("Error updating category:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while updating the category."
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

  if (!isOpen || !occasion) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Edit Occasion
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
              Occasion Name
            </label>
            <input
              type="text"
              id="occasionName"
              value={occasionName}
              onChange={(e) => setOccasionName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
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
                width={100}
                height={100}
                className="mt-2 rounded-full object-cover mx-auto"
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditOccasionModal;