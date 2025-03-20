import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface AddOccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOccasionAdded: () => void; // Callback to refresh the occasion list
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
            data.map((cat) => ({
              category_id: cat.category_id,
              category_name: cat.category_name,
            }))
          );
          if (data.length > 0) {
            setCategoryId(data[0].category_id); // Set the first category as default
          }
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(err.message || "An unexpected error occurred.");
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL
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
        const { data: storageData, error: storageError } =
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
      } catch (uploadErr: any) {
        console.error("Error uploading image:", uploadErr);
        setError(
          uploadErr.message ||
            "An unexpected error occurred during image upload."
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
    } catch (err: any) {
      console.error("Error adding occasion:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Add New Occasion
          </h3>
          <div className="mt-2">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="occasionName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Occasion Name:
                </label>
                <input
                  type="text"
                  id="occasionName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={occasionName}
                  onChange={(e) => setOccasionName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="imageFile"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Image (Optional):
                </label>
                <input
                  type="file"
                  id="imageFile"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Occasion Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-full"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Category:
                </label>
                <select
                  id="categoryId"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Occasion"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-2"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOccasionModal;
