"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { Calendar, ImagePlus, Clock, Sparkles, CalendarDays, Eye } from "lucide-react";

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

interface EditEventFormProps {
  event: EventType;
  onEventSaved: (message: string) => void;
  onError: (error: string) => void;
}

const DEFAULT_IMAGE_URL = "/placeholder.svg?height=200&width=300";

export default function EditEventForm({ event, onEventSaved, onError }: EditEventFormProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        start_date: event.start_date.slice(0, 16),
        end_date: event.end_date?.slice(0, 16) || "",
      });
      setImageFile(null);
      setImagePreview(event.image_url || null);
    }
  }, [event]);

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

    const { error: uploadError } = await supabase.storage.from("event").upload(fileName, imageFile, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      onError(`Image upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from("event").getPublicUrl(fileName);

    if (!data?.publicUrl) {
      onError("Failed to generate public URL for the uploaded image.");
      return null;
    }

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get the current session: This is crucial for protected operations!
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      if (!session) {
        throw new Error("Auth session missing!"); // Consistent error message
      }

      // 2. Access the user from the session:  Reliable after session is confirmed
      const user = session.user;
      if (!user) {
        throw new Error("User not found in session.");
      }

      let imageUrl = DEFAULT_IMAGE_URL;

      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      } else if (imagePreview && !imagePreview.startsWith("blob:")) {
        imageUrl = imagePreview;
      }

      const eventData = {
        ...form,
        admin_id: user.id,
        image_url: imageUrl,
        end_date: form.end_date || null,
      };

      const res = await supabase.from("event").update(eventData).eq("event_id", event.event_id).select();

      if (res.error) throw res.error;

      onEventSaved("Event updated successfully!");
    } catch (err: unknown) {
      let errorMessage = "An unknown error occurred."; // Default error message
      if (err instanceof Error) {
        console.error("Submit error:", err.message);
        errorMessage = err.message; // Use the specific error message
      } else {
        console.error("Submit error:", err); // Log the entire error object for debugging
      }
      onError(errorMessage); // Pass the error message to the parent component

    } finally {
      setLoading(false);
    }
  };

  return (

    <motion.div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Edit Event
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update your event details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Field */}
        <div className="relative group">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Event Title *
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              placeholder="Enter a captivating event title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:text-white transition-all duration-300 group-hover:shadow-md"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div className="relative group">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe your event in detail..."
              value={form.description}
              onChange={handleChange}
              className="w-full p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:text-white transition-all duration-300 resize-vertical group-hover:shadow-md"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* Enhanced Date Range */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Start Date */}
          <div className="relative group">
            <label
              htmlFor="start_date"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Start Date & Time *
            </label>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <input
                id="start_date"
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-700 border-2 border-emerald-200 dark:border-gray-600 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none dark:text-white transition-all duration-300 group-hover:shadow-lg relative z-10"
                style={{
                  colorScheme: "light dark",
                }}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              When does your event begin?
            </p>
          </div>

          {/* End Date */}
          <div className="relative group">
            <label
              htmlFor="end_date"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4 text-purple-500" />
              End Date & Time (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <input
                id="end_date"
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date || undefined}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-gray-600 rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none dark:text-white transition-all duration-300 group-hover:shadow-lg relative z-10"
                style={{
                  colorScheme: "light dark",
                }}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              When does your event end? (Leave blank for single-time events)
            </p>
          </div>
        </div>

        {/* Enhanced Image Upload */}
        <div className="relative group">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-blue-500" />
            Event Image
          </label>
          <label
            htmlFor="imageFile"
            className="group/upload relative border-3 border-dashed border-gray-300 dark:border-gray-600 p-12 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50 hover:shadow-xl"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg mb-6 group-hover/upload:scale-110 transition-transform duration-300">
                <ImagePlus className="w-12 h-12 text-white" />
              </div>

              <div className="text-center">
                <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">
                  {imageFile?.name || "Upload New Event Image"}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Drag and drop or click to browse</p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">PNG</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">JPG</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">GIF</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Max 5MB</span>
                </div>
              </div>
            </div>

            <input
              id="imageFile"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Enhanced Preview */}
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              Image Preview
            </p>
            <div className="relative w-full h-80 rounded-3xl overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
              <Image
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized={imagePreview.startsWith("blob:")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        )}

        {/* Enhanced Submit Button */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-4 h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg">Updating Event...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                <span className="text-lg">Update Event</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}