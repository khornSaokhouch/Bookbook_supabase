// CategoryDetailModal.tsx
import React from "react";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    category_id: string;
    category_name: string;
    image: string;
  } | null;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  if (!isOpen || !category) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Category Details
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              <strong>Name:</strong> {category.category_name}
            </p>
            {/* Display image, error handle for missing image */}
            <img src={category.image || "/default-image.jpg"} alt={category.category_name} className="mx-auto my-4 h-32 w-32 object-cover rounded-full" />
            <p className="text-sm text-gray-500">
              <strong>ID:</strong> {category.category_id}
            </p>

            {/* Add more category details here as needed */}
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;