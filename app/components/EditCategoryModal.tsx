import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

type EditCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onCategoryUpdated: () => void;
};

const EditCategoryModal = ({
  isOpen,
  onClose,
  category,
  onCategoryUpdated,
}: EditCategoryModalProps) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setCategoryName(category.category_name);
      setImage(category.image);
      setImagePreview(category.image);
    }
  }, [category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic client-side file size check (e.g., limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file is too large. Maximum size is 5MB.");
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Preview the image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    let updatedImageUrl = image;

    // If the user has selected a new image, upload it to Supabase
    if (imageFile) {
      try {
        const fileName = `${uuidv4()}-${imageFile.name}`;

        const { data: storageData, error: storageError } = await supabase
          .storage
          .from("images") // Change this to your bucket name
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: true, // Overwrite the file if it already exists
          });

        if (storageError) throw storageError;

        updatedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Image upload failed. Please try again.");
        setLoading(false);
        return;
      }
    }

    if (category) {
      try {
        const { error } = await supabase
          .from("category")
          .update({ category_name: categoryName, image: updatedImageUrl })
          .eq("category_id", category.category_id);

        if (error) throw error;

        onCategoryUpdated(); // Callback to refresh data
        onClose(); // Close modal
      } catch (error) {
        console.error("Error updating category:", error);
        setError("Category update failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {isOpen && category && (
        <div className="fixed inset-0 flex items-center justify-center m-auto bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-4">Edit Category</h3>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="categoryName" className="block font-semibold">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="imageFile" className="block font-semibold">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  id="imageFile"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                  accept="image/*"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditCategoryModal;
