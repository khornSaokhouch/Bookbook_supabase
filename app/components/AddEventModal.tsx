"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  XCircle,
  CalendarDays,
  FileImage,
  PlusCircle,
} from "lucide-react"; // Import icons

interface AddEventModalProps {
  newEvent: Event;
  onSave: (event: Event) => void;
  onCancel: () => void;
  setNewEvent: React.Dispatch<React.SetStateAction<Event>>;
  creating: boolean;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  imageFile: File | null;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  newEvent,
  onSave,
  onCancel,
  setNewEvent,
  creating,
  handleImageChange,
  imageFile,
}) => {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setLocalImageUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl); // Cleanup URL
    } else {
      setLocalImageUrl(null);
    }
  }, [imageFile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newEvent);
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
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
            <PlusCircle className="w-5 h-5 mr-2 text-green-500" />
            Create New Event
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={newEvent.title || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={newEvent.description || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Start Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-500" />
              <input
                type="datetime-local"
                name="start_date"
                value={newEvent.start_date || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              End Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-500" />
              <input
                type="datetime-local"
                name="end_date"
                value={newEvent.end_date || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline pl-10"
                required
              />
            </div>
          </div>

          <div>
  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
    Upload Image
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
          <FileImage className="w-6 h-6 mb-2" />
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
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddEventModal;