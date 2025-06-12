"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/app/lib/supabaseClient";
import { XCircle, Calendar, ImagePlus } from "lucide-react";

const DEFAULT_IMAGE_URL = "/placeholder.svg?height=200&width=300";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      start_date: string;
      end_date: string;
    }>
  >;
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  editingId: number | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  fetchEvents: () => void;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EventModal({
  isOpen,
  onClose,
  form,
  setForm,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  editingId,
  loading,
  setLoading,
  error,
  setError,
  setSuccessMessage,
  fetchEvents,
  setEditingId,
  setIsModalOpen,
}: EventModalProps) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else if (
        editingId &&
        imagePreview &&
        !imagePreview.startsWith("blob:")
      ) {
        imageUrl = imagePreview;
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
      onClose();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingId ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Event Title *
                </label>
                <input
                  id="title"
                  name="title"
                  placeholder="Enter event title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your event"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-vertical"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 pr-12"
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 pr-12"
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Image
                </label>
                <label
                  htmlFor="imageFile"
                  className="relative cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200 group"
                >
                  <ImagePlus className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 group-hover:text-indigo-500 transition-colors duration-200" />
                  <span className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                    {imageFile ? imageFile.name : "Click to upload event image"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
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

              {imagePreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Image Preview:
                  </p>
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={imagePreview.startsWith("blob:")}
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
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
                      Saving Event...
                    </>
                  ) : editingId ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
