"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { Edit, Trash2, Calendar, ImagePlus, XCircle, CheckCircle, AlertTriangle } from "lucide-react";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New state
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const { data, error: urlError } = supabase.storage
      .from("event")
      .getPublicUrl(fileName);

    if (urlError) {
      setError(`URL generation failed: ${urlError.message}`);
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
      setSuccessMessage(`Event ${editingId ? 'updated' : 'created'} successfully!`);  // Set success message
    } catch (err: any) {
      console.error("Submit error:", err.message);
      setError(err.message);
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
      const { error } = await supabase.from("event").delete().eq("event_id", id);
      if (error) throw error;
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  //Modal Handle
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
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded shadow-md transition-colors duration-200 mb-8"
      >
        Add New Event
      </button>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          {/* Modal Content */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
            variants={formVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                {editingId ? "Edit Event" : "Add Event"}
              </h1>
              <button
                onClick={closeModal}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Form Inputs */}
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 border rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 mb-3"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-3 border rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 mb-3"
            />

            <div className="flex items-center space-x-4 mb-3">
              <div className="relative w-full">
                <input
                  type="datetime-local"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full p-3 border rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>
              <Calendar className="h-6 w-6 text-gray-500" />
            </div>

            <div className="flex items-center space-x-4 mb-3">
              <div className="relative w-full">
                <input
                  type="datetime-local"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full p-3 border rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>
              <Calendar className="h-6 w-6 text-gray-500" />
            </div>

            <label
              htmlFor="imageFile"
              className="relative cursor-pointer bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-3 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 mb-3"
            >
              <ImagePlus className="w-6 h-6 text-gray-500 dark:text-gray-500 mb-2" />
              <span className="text-gray-500 dark:text-gray-500 text-sm">
                {imageFile ? imageFile.name : "Upload Image"}
              </span>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0"
              />
            </label>

            {imagePreview && (
              <div className="flex justify-center mb-3">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                  priority
                  unoptimized
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow-md transition-colors duration-200 w-full"
            >
              {loading ? "Saving..." : editingId ? "Update Event" : "Create Event"}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Events Display Section */}
      <motion.div variants={formVariants} initial="hidden" animate="visible">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-300">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No events found.</p>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.event_id}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                variants={eventVariants}
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {event.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  Start: {new Date(event.start_date).toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  End: {event.end_date ? new Date(event.end_date).toLocaleString() : "N/A"}
                </p>
                {event.image_url && (
                  <Image
  src={event.image_url || DEFAULT_IMAGE_URL}  // Fallback to default image
  alt={event.title}
  width={300}
  height={200}
  className="w-full h-48 object-cover rounded-lg"
  priority
  unoptimized
/>

)}

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