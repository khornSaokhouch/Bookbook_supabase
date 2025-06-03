"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  Calendar,
  ImagePlus,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Search,
  Grid3X3,
  List,
  Plus,
  Eye,
  Clock,
  TrendingUp,
  Star,
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

const DEFAULT_IMAGE_URL = "/placeholder.svg?height=200&width=300";

export default function EventsManagement() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  useEffect(() => {
    let filtered = events;
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  }, [events, searchTerm]);


  const fetchEvents = async () => {
    setPageLoading(true);
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
      setPageLoading(false);
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
      setSuccessMessage("Event deleted successfully!");
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
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const openDetailModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const upcomingEvents = events.filter(
    (event) => new Date(event.start_date) > new Date()
  );
  const pastEvents = events.filter(
    (event) => new Date(event.start_date) <= new Date()
  );

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Events
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing your event calendar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={cardVariants}>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Events Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage your events and celebrations
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {events.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {upcomingEvents.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Past Events
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pastEvents.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  This Month
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    events.filter(
                      (event) =>
                        new Date(event.start_date).getMonth() ===
                          new Date().getMonth() &&
                        new Date(event.start_date).getFullYear() ===
                          new Date().getFullYear()
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8"
        variants={cardVariants}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-md text-indigo-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-md text-indigo-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <motion.button
              onClick={openModal}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Event
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-6 h-6 mr-3" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="w-6 h-6 mr-3" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events Display */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        variants={cardVariants}
      >
        {viewMode === "grid" ? (
          <div className="p-6">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.event_id}
                    className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={event.image_url || DEFAULT_IMAGE_URL}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        priority
                        unoptimized
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        {new Date(event.start_date) > new Date()
                          ? "Upcoming"
                          : "Past"}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.start_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          {new Date(event.start_date).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <motion.button
                          onClick={() => openDetailModal(event)}
                          className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleEdit(event)}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(event.event_id)}
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by creating your first event."}
                </p>
                <motion.button
                  onClick={openModal}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Create First Event
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event, index) => (
                    <motion.tr
                      key={event.event_id}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                            <Image
                              src={event.image_url || DEFAULT_IMAGE_URL}
                              alt={event.title}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                              priority
                              unoptimized
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-lg">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {event.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(event.start_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            {new Date(event.start_date).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                            new Date(event.start_date) > new Date()
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                          }`}
                        >
                          {new Date(event.start_date) > new Date()
                            ? "Upcoming"
                            : "Past"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            onClick={() => openDetailModal(event)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleEdit(event)}
                            className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(event.event_id)}
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No events found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first event."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
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
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editingId ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={closeModal}
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
                      {imageFile
                        ? imageFile.name
                        : "Click to upload event image"}
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

      {/* Event Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsDetailModalOpen(false);
              }
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <Image
                  src={selectedEvent.image_url || DEFAULT_IMAGE_URL}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors duration-200 p-2 rounded-full bg-black/20 hover:bg-black/40"
                >
                  <XCircle className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(selectedEvent.start_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(selectedEvent.start_date).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedEvent.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Start Date
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedEvent.start_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      End Date
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {selectedEvent.end_date
                        ? new Date(selectedEvent.end_date).toLocaleString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleEdit(selectedEvent);
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Event
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleDelete(selectedEvent.event_id);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Event
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
