"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Calendar,
  ImagePlus,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type EventType = {
  event_id: number;
  admin_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
  created_at: string;
};

const DEFAULT_IMAGE_URL =
  "https://your-project.supabase.co/storage/v1/object/public/event/default.png";

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data as EventType[]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const ext = imageFile.name.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("event")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from("event").getPublicUrl(fileName);

    if (!data?.publicUrl) {
      setError("Failed to generate public URL for the uploaded image.");
      return null;
    }

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not logged in.");

      let imageUrl = DEFAULT_IMAGE_URL;

      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      }

      const eventData = {
        ...form,
        admin_id: user.id,
        image_url: imageUrl,
        end_date: form.end_date || null,
      };

      const res = editingId
        ? await supabase
            .from("event")
            .update(eventData)
            .eq("event_id", editingId)
            .select()
        : await supabase.from("event").insert([eventData]).select();

      if (res.error) throw res.error;

      setEditingId(null);
      setForm({ title: "", description: "", start_date: "", end_date: "" });
      setImageFile(null);
      setImagePreview(null);
      fetchEvents();
      closeModal();
      setSuccessMessage(
        `Event ${editingId ? "updated" : "created"} successfully!`
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Submit error:", err.message);
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: EventType) => {
    setEditingId(event.event_id);
    setForm({
      title: event.title,
      description: event.description,
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date?.slice(0, 16) || "",
    });
    setImageFile(null);
    setImagePreview(event.image_url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("event")
        .delete()
        .eq("event_id", id);
      if (error) throw error;
      fetchEvents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingId(null);
    setForm({ title: "", description: "", start_date: "", end_date: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
    setSuccessMessage(null);
  };

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const eventVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Success Message */}
      {successMessage && (
        <motion.div
          className="fixed top-4 right-4 bg-green-100 border border-green-500 text-green-700 py-3 px-4 rounded-md shadow-md z-50 flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="fixed top-4 right-4 bg-red-100 border border-red-500 text-red-700 py-3 px-4 rounded-md shadow-md z-50 flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </motion.div>
      )}

      {/* Button to Open Modal */}
      <button
        onClick={openModal}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow-md transition-colors duration-200 mb-8"
      >
        Add New Event
      </button>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <motion.div
          // ADDED: p-4 for padding, bg-black, bg-opacity-30, backdrop-blur-sm
          className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-opacity-30 backdrop-blur-sm"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit" // Use exit prop if you have exit animations defined in modalVariants
          onClick={(e) => {
            // Close only if clicking the backdrop itself
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          {/* Modal Content */}
          <motion.div
            // ADDED: max-h-[90vh], overflow-y-auto
            // ADDED: onClick stopPropagation
            className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl overflow-y-auto max-h-[90vh]" // Adjusted padding slightly, added max-h and overflow
            variants={formVariants}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside closing modal
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
              {" "}
              {/* Added spacing and border */}
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">
                {" "}
                {/* Adjusted text size */}
                {editingId ? "Edit Event" : "Add New Event"}{" "}
                {/* Changed Add Event text */}
              </h1>
              <button
                onClick={closeModal}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" // Improved styling
                aria-label="Close modal" // Added aria-label
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {/* Form can be wrapped in <form> element */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {" "}
              {/* Wrap in form and add space-y */}
              {/* Error Display - moved inside form */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {/* Title Input */}
              <div>
                {" "}
                {/* Wrap inputs in divs for better spacing with space-y */}
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  placeholder="Event Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              {/* Description Textarea */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Event Description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-vertical"
                />
              </div>
              {/* Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Start Date & Time *
                  </label>
                  <div className="relative">
                    <input
                      id="start_date"
                      type="datetime-local"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    End Date & Time (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="end_date"
                      type="datetime-local"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      min={form.start_date || undefined}
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Image
                </label>
                <label
                  htmlFor="imageFile"
                  className="relative cursor-pointer bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200"
                >
                  <ImagePlus className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {imageFile ? imageFile.name : "Click to upload image"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </span>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-2">
                  {" "}
                  {/* Reduced top margin */}
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Preview:
                  </p>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={300} // Adjust as needed
                    height={200} // Adjust as needed
                    className="w-full h-auto max-h-60 object-contain rounded-lg border border-gray-200 dark:border-gray-700" // Use object-contain
                    // priority // Only if critical
                    unoptimized={imagePreview.startsWith("blob:")} // Unoptimize blob URLs
                  />
                </div>
              )}
              {/* Submit Button */}
              <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                {" "}
                {/* Added border-t */}
                <button
                  type="submit" // Use type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`} // Added loading styles
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>
            </form>{" "}
            {/* End form */}
          </motion.div>
        </motion.div>
      )}

      {/* Events Display Section */}
      <motion.div variants={formVariants} initial="hidden" animate="visible">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-300">
              Loading events...
            </p>
          ) : events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No events found.</p>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.event_id}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                variants={eventVariants}
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {event.title}
                </h2>

                {event.image_url && (
                  <Image
                    src={event.image_url || DEFAULT_IMAGE_URL}
                    alt={event.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                    priority
                    unoptimized
                  />
                )}
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Start: {new Date(event.start_date).toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1.5">
                  End:{" "}
                  {event.end_date
                    ? new Date(event.end_date).toLocaleString()
                    : "N/A"}
                </p>

                <div className="flex gap-4 mt-4">
                  <button
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="inline-block w-4 h-4 mr-1 align-middle" />
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200"
                    onClick={() => handleDelete(event.event_id)}
                  >
                    <Trash2 className="inline-block w-4 h-4 mr-1 align-middle" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventsPage;
