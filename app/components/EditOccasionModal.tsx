import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type EditOccasionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  occasion: Occasion | null;
  onOccasionUpdated: () => void;
};

const EditOccasionModal = ({
  isOpen,
  onClose,
  occasion,
  onOccasionUpdated,
}: EditOccasionModalProps) => {
  const [occasionName, setOccasionName] = useState<string>("");
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    if (occasion) {
      setOccasionName(occasion.name);
      setImage(occasion.image_occasions);
    }
  }, [occasion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (occasion) {
      try {
        const { error } = await supabase
          .from("occasion")
          .update({ name: occasionName, image_occasions: image })
          .eq("occasion_id", occasion.occasion_id);

        if (error) throw error;

        onOccasionUpdated(); // Call callback to refresh data
        onClose(); // Close modal
      } catch (error) {
        console.error("Error updating occasion:", error);
      }
    }
  };

  return (
    <>
      {isOpen && occasion && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-4">Edit Occasion</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="occasionName" className="block font-semibold">
                  Occasion Name
                </label>
                <input
                  type="text"
                  id="occasionName"
                  value={occasionName}
                  onChange={(e) => setOccasionName(e.target.value)}
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

export default EditOccasionModal;
