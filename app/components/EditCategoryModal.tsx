import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

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

  useEffect(() => {
    if (category) {
      setCategoryName(category.category_name);
      setImage(category.image);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (category) {
      try {
        const { error } = await supabase
          .from("category")
          .update({ category_name: categoryName, image: image })
          .eq("category_id", category.category_id);

        if (error) throw error;

        onCategoryUpdated(); // Call callback to refresh data
        onClose(); // Close modal
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
  };

  return (
    <>
      {isOpen && category && (
        <div className="fixed inset-0 flex items-center justify-center m-auto bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-4">Edit Category</h3>
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
                <label htmlFor="image" className="block font-semibold">
                  Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mt-2"
                />
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
                >
                  Save Changes
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
