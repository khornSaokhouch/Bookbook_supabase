import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

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
  const [image, setImage] = useState<File | null>(null); // Now using File instead of string
  const [imagePreview, setImagePreview] = useState<string | null>(""); // For the image preview URL

  useEffect(() => {
    if (occasion) {
      setOccasionName(occasion.name);
      setImagePreview(occasion.occasion_image); // Set the preview to the current image URL
    }
  }, [occasion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Preview the selected image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!occasion) return;

    let imageUrl: string | null = imagePreview; // Default to current image if no new image is uploaded

    if (image) {
      try {
        // Generate a unique file name for the new image
        const fileName = `${uuidv4()}-${image.name}`;

        // Upload the new image to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from("occasion") // Make sure to use your correct bucket name
          .upload(fileName, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL of the uploaded image
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/occasion/${fileName}`;
      } catch (uploadErr) {
        console.error("Error uploading image:", uploadErr);
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("occasion")
        .update({ name: occasionName, occasion_image: imageUrl })
        .eq("occasion_id", occasion.occasion_id);

      if (error) throw error;

      onOccasionUpdated(); // Refresh the list of occasions
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating occasion:", error);
    }
  };

  if (!isOpen || !occasion) return null;

  return (
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
              Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded mt-2"
              accept="image/*"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
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
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOccasionModal;
