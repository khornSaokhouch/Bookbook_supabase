// EditEventModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Event } from "./types"; // Assuming you have a types.ts file

interface EditEventModalProps {
  selectedEvent: Event | null;
  onSave: (event: Event) => void;
  onCancel: () => void;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageFile: File | null;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  selectedEvent,
  onSave,
  onCancel,
  setSelectedEvent,
  handleImageChange,
  imageFile
}) => {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(selectedEvent?.image_url || null); // Local state for preview

  useEffect(() => {
    if (imageFile) {
      setLocalImageUrl(URL.createObjectURL(imageFile));
    } else {
      setLocalImageUrl(selectedEvent?.image_url || null);
    }
  }, [imageFile, selectedEvent?.image_url]);

  if (!selectedEvent) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedEvent(prevEvent => ({
      ...prevEvent,
      [name]: value,
    } as Event)); // Type assertion here to satisfy TypeScript
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(selectedEvent);
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={selectedEvent.title}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={selectedEvent.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              name="start_date"
              value={selectedEvent.start_date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={selectedEvent.end_date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Upload New Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {localImageUrl && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Image Preview</label>
              <img src={localImageUrl} alt="Image Preview" className="max-w-full h-auto" />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;