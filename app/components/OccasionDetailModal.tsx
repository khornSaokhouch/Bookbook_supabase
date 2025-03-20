// OccasionDetailModal.tsx
import React from "react";

interface OccasionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasion: {
    occasion_id: string;
    name: string;
    occasion_image: string;
  } | null;
}

const OccasionDetailModal: React.FC<OccasionDetailModalProps> = ({
  isOpen,
  onClose,
  occasion,
}) => {
  if (!isOpen || !occasion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Occasion Details
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              <strong>Name:</strong> {occasion.name}
            </p>
            {/* Display image, error handle for missing image */}
            <img src={occasion.occasion_image || "/default-image.jpg"} alt={occasion.name} className="mx-auto my-4 h-32 w-32 object-cover rounded-full" />
            <p className="text-sm text-gray-500">
              <strong>ID:</strong> {occasion.occasion_id}
            </p>

            {/* Add more occasion details here as needed */}
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

export default OccasionDetailModal;