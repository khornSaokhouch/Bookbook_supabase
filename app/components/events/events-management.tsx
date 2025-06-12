"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { StatsCards } from "./stats-cards";
import { SearchAndControls } from "./search-and-controls";
import { EventsDisplay } from "./events-display";
import { EventModal } from "./event-modal";
import { EventDetailModal } from "./event-detail-modal";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";

export type EventType = {
  event_id: number;
  admin_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
  created_at: string;
};

interface EventsManagementProps {
  adminId?: string;
}

export default function EventsManagement({ adminId }: EventsManagementProps) {
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    eventId: number | null;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: "",
  });

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

  const handleDeleteClick = (event: EventType) => {
    setDeleteConfirmation({
      isOpen: true,
      eventId: event.event_id,
      eventTitle: event.title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.eventId) return;

    try {
      const { error } = await supabase
        .from("event")
        .delete()
        .eq("event_id", deleteConfirmation.eventId);

      if (error) throw error;

      setSuccessMessage("Event deleted successfully!");
      fetchEvents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        eventId: null,
        eventTitle: "",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      eventId: null,
      eventTitle: "",
    });
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

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

        <StatsCards events={events} />
      </motion.div>

      <SearchAndControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        openModal={openModal}
      />

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

      <EventsDisplay
        events={filteredEvents}
        viewMode={viewMode}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onViewDetails={openDetailModal}
        openModal={openModal}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        form={form}
        setForm={setForm}
        imageFile={imageFile}
        setImageFile={setImageFile}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        editingId={editingId}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
        fetchEvents={fetchEvents}
        setEditingId={setEditingId}
        setIsModalOpen={setIsModalOpen}
      />

      <EventDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        eventTitle={deleteConfirmation.eventTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </motion.div>
  );
}
