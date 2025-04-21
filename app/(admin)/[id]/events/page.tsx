"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, CalendarDays } from "lucide-react";

type EventType = {
  event_id: number;
  admin_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null; // Allow null end_date
  image_url: string | null; // Allow null image_url
  created_at: string;
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null); // Correct type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        setError(`Failed to load events: ${error.message}`);
      } else {
        setEvents(data as EventType[]); // Explicit type assertion
        if (!data || data.length === 0) {
          console.warn("No events found in database.");
        }
      }
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("event") // Bucket name 'event'
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error.message);
      setError(`Image upload failed: ${error.message}`);
      return null;
    }

    const { publicURL, error: urlError } = supabase.storage
      .from("event")
      .getPublicUrl(fileName);

    if (urlError) {
      console.error("Error generating public URL:", urlError.message);
      setError(`Failed to generate public URL: ${urlError.message}`);
      return null;
    }

    return publicURL;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await supabase.auth.getUser();
      const admin_id = user.data.user?.id;

      if (!admin_id) {
        setError("You must be logged in.");
        return;
      }

      let imageUrl: string | null = null;  // allow null value
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) return; // uploadImage already set the error message if it fails
      }

      const eventData = {
        ...form,
        admin_id,
        image_url: imageUrl,
      };

      let res;
      if (editingId) {
        res = await supabase
          .from("event")
          .update(eventData)
          .eq("event_id", editingId)
          .select();
      } else {
        res = await supabase.from("event").insert([eventData]).select();
      }

      if (res.error) {
        console.error("DB operation error:", res.error.message);
        setError(`Failed to ${editingId ? "update" : "create"} event: ${res.error.message}`);
      } else {
        console.log(`${editingId ? "Updated" : "Inserted"} event:`, res.data);
        setEditingId(null);
        setForm({ title: "", description: "", start_date: "", end_date: "" });
        setImageFile(null);
        fetchEvents();
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const { error } = await supabase.from("event").delete().eq("event_id", id);
      if (error) {
        console.error("Error deleting event:", error);
        setError(`Failed to delete event: ${error.message}`);
      } else {
        fetchEvents();
      }
    } catch (err: any) {
      console.error("Error deleting event:", err);
      setError(`An unexpected error occurred while deleting event: ${err.message}`);
    }
  };

  const handleEdit = (event: EventType) => {
    setEditingId(event.event_id);
    setForm({
      title: event.title,
      description: event.description,
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date ? event.end_date.slice(0, 16) : "",
    });
    setImageFile(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-2xl font-bold mb-4">{editingId ? "Edit Event" : "Add Event"}</h1>

      {/* Error Message */}
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">{error}</div>}

      <div className="grid gap-4 max-w-xl mb-8">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="start_date"
          type="datetime-local"
          value={form.start_date}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="end_date"
          type="datetime-local"
          value={form.end_date}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : editingId ? "Update" : "Create"}
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div>Loading events...</div>
        ) : events && events.length > 0 ? (
          events.map((event) => (
            <motion.div
              key={event.event_id}
              className="border p-4 rounded shadow"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>{event.description}</p>
              <p>Start: {new Date(event.start_date).toLocaleString()}</p>
              <p>
                End: {event.end_date ? new Date(event.end_date).toLocaleString() : "N/A"}
              </p>
              {event.image_url && (
                <Image
                  src={event.image_url}
                  width={200}
                  height={150}
                  alt={event.title}
                  style={{ objectFit: "contain" }}
                />
              )}
              <div className="flex gap-4 mt-2">
                <button onClick={() => handleEdit(event)} className="text-blue-600">
                  Edit
                </button>
                <button onClick={() => handleDelete(event.event_id)} className="text-red-600">
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div>No events found.</div>
        )}
      </div>
    </motion.div>
  );
};

export default EventsPage;