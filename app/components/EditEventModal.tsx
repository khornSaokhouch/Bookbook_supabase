"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  XCircle,
  CalendarDays,
  FileImage,
  AlertTriangle,
  ImageIcon,
} from "lucide-react"; // Import icons

type EditEventModalProps = {
  selectedEvent: Event;
  setSelectedEvent: (event: Event) => void;
  onSave: (updatedEvent: Event) => void;
  onCancel: () => void;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  imageFile: File | null;
  setError?: (message: string | null) => void;
};

const EditEventModal: React.FC<EditEventModalProps> = ({
  selectedEvent,
  setSelectedEvent,
  onSave,
  onCancel,
  handleImageChange,
  imageFile,
  setError,
}) => {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setLocalImageUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl); // Cleanup old URL
    } else {
      setLocalImageUrl(null);
    }
  }, [imageFile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSelectedEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      onSave(selectedEvent);
    } else {
      console.error("No event selected to update.");
      setError?.("No event selected to update.");
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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Edit className="w-5 h-5 mr-2 text-blue-500" />
            Edit Event
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title:
            </label>
            <input
              type="text"
              name="title"
              value={selectedEvent?.title || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              name="description"
              value={selectedEvent?.description || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date:
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="datetime-local"
                name="start_date"
                value={selectedEvent?.start_date || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date:
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="datetime-local"
                name="end_date"
                value={selectedEvent?.end_date || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pl-10"
                required
              />
            </div>
          </div>

          <div>
  <label className="block text-gray-700 text-sm font-bold mb-2">
    Image (Optional):
  </label>
  <label
    htmlFor="imageUpload"
    className={`relative cursor-pointer bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 w-full ${
      localImageUrl ? "h-48" : "" // Set a height when an image is present
    }`}
    style={{
      backgroundImage: localImageUrl ? `url('${localImageUrl}')` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="absolute inset-0 w-full h-full opacity-0"
      id="imageUpload"
    />
    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-500">
      {localImageUrl ? (
        <div className="text-white bg-black bg-opacity-50 rounded p-2">Change Image</div> // Change Image Label
      ) : (
        <>
          <ImageIcon className="w-6 h-6 mb-2" />
          Click to Upload
        </>
      )}
    </div>
  </label>
</div>
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditEventModal;