"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import EditEventModal from "../../../components/EditEventModal";
import DeleteEventModal from "../../../components/DeleteEventModal";
import AddEventModal from "../../../components/AddEventModal";
import { Event, User } from "../../../components/types"; // Import types
import { motion } from "framer-motion";
import { Edit, Trash2, Plus } from "lucide-react"; // Import icons

async function getEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("event")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return data || [];
  } catch (error: unknown) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function getUser(): Promise<User> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw new Error("Failed to get session: " + sessionError.message);
    }

    if (!session?.user) {
      console.warn("No user in session. User might not be logged in.");
      return { user_id: 0, name: "Admin" }; // Return default user - Int 0
    }

    const { data, error } = await supabase
      .from("users")
      .select("user_id, user_name")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      throw new Error("Failed to fetch user data: " + error.message);
    }

    if (!data) {
      console.warn("User data not found in 'users' table for id:", session.user.id);
      return { user_id: 0, name: "Admin" }; // Return default user - Int 0
    }

    return { user_id: data.user_id, name: data.user_name };
  } catch (error: unknown) {
    console.error("Error in getUser function:", error);
    return { user_id: 0, name: "Admin" }; // Fallback user - Int 0
  }
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User>({ user_id: 0, name: "Admin" });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    event_id: "",
    admin_id: null, // Initialize to null
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const clearSuccessMessage = () => {
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const userData = await getUser();
        setUser(userData);
        console.log("Fetched User Data:", userData);
        if (userData && userData.user_id) {
          console.log("Using user_id from userData:", userData.user_id);
          setNewEvent((prevState) => ({
            ...prevState,
            admin_id: userData.user_id,
          }));
          console.log("newEvent initialized with admin_id:", userData.user_id);
        } else {
          console.warn("No valid user_id found, leaving admin_id as null");
        }
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (fetchError: unknown) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingEventId) return;

    setDeleting(true);
    try {
      const { error } = await supabase.from("event").delete().eq("event_id", deletingEventId);
      if (error) {
        console.error("Error deleting event:", error);
        setError(`An error occurred while deleting the event: ${error.message}`);
      } else {
        setEvents(events.filter((event) => event.event_id !== deletingEventId));
        setSuccessMessage("Event deleted successfully!");
        clearSuccessMessage();
      }
    } catch (deleteError: unknown) {
      console.error("Error during delete operation:", deleteError);
      setError(`An unexpected error occurred while deleting the event: ${deleteError instanceof Error ? deleteError.message : "Unknown error"}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = async (event: Event) => {
    setSelectedEvent({ ...event });
    setImageFile(null);  // Reset image file for edit
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedEvent: Event) => {
    if (!updatedEvent.title || !updatedEvent.start_date || !updatedEvent.end_date) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      let imageUrlToUpdate = updatedEvent.image_url;

      // Upload the image if a new image has been selected
      if (imageFile) {
        const uploadResult = await handleImageUpload(imageFile);
        if (uploadResult && uploadResult.publicURL) {
          imageUrlToUpdate = uploadResult.publicURL; //Use the return
        } else {
          return; // Stop saving the event if image upload fails
        }
      }

      const { data, error } = await supabase
        .from("event")
        .update({
          title: updatedEvent.title,
          description: updatedEvent.description,
          start_date: updatedEvent.start_date,
          end_date: updatedEvent.end_date,
          image_url: imageUrlToUpdate, // Use the new or existing image URL
        })
        .eq("event_id", updatedEvent.event_id);

      if (error) {
        console.error("Error saving event edit:", error);
        setError(`An error occurred while saving the event: ${error.message}`);
      } else {
        setEvents(
          events.map((e) => (e.event_id === updatedEvent.event_id ? { ...updatedEvent, image_url: imageUrlToUpdate } : e))
        );
        setShowEditModal(false);
        setSuccessMessage("Event updated successfully!");
        clearSuccessMessage();
      }
    } catch (updateError: unknown) {
      console.error("Error during edit operation:", updateError);
      setError(`An unexpected error occurred while saving the event: ${updateError instanceof Error ? updateError.message : "Unknown error"}`);
    }
  };

  const handleImageUpload = async (file: File): Promise<{ publicURL: string } | null> => {
    try {
      if (!file) {
        setError("Please select an image to upload.");
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { data, error } = await supabase.storage
        .from('event') // **CORRECTED BUCKET NAME: 'event'**
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading image:", error);
        setError(`Failed to upload image: ${error.message}`);
        return null;
      }

      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event/${filePath}`;

      return { publicURL }; // return publicURL
    } catch (uploadError: unknown) {
      console.error("Error during image upload:", uploadError);
      setError(`An unexpected error occurred while uploading the image: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
      return null;
    }
  };

  const handleCreateEvent = async (event: Event) => {
    if (!event.title || !event.start_date || !event.end_date) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      // Validate admin_id
      if (!event.admin_id) {
        console.warn("Admin ID is null or empty. Skipping validation.");
        setError("Invalid admin ID: Admin ID cannot be empty.");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", parseInt(event.admin_id)) // Parse Int
        .single();

      if (userError) {
        console.error("Error validating admin ID:", userError);
        setError(`Error validating admin ID: ${userError.message}`);
        return;
      }

      if (!userData) {
        console.warn("Admin ID not found in users table:", event.admin_id);
        setError("Invalid admin ID: Admin ID not found.");
        return;
      }

      setCreating(true);
      let imageUrlToInsert = event.image_url;
      if (imageFile) {
        const uploadResult = await handleImageUpload(imageFile);
        if (uploadResult && uploadResult.publicURL) {
          imageUrlToInsert = uploadResult.publicURL; // Use the return
        } else {
          return; // Stop saving if image upload fails
        }
      }

      const { data, error } = await supabase
        .from("event")
        .insert([{ ...event, image_url: imageUrlToInsert }]);

      if (error) {
        console.error("Error creating event:", error);
        setError(error.message || "An error occurred while creating the event.");
      } else {
        setEvents((prevEvents) => [...prevEvents, ...(data || [])]);
        setShowCreateModal(false);
        setSuccessMessage("Event created successfully!");
        clearSuccessMessage();
        setNewEvent({
          event_id: "",
          admin_id: user.user_id, // Correct Admin ID
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          image_url: "",
        });
      }
    } catch (createError: unknown) {
      console.error("Error during event creation:", createError);
      setError(createError instanceof Error ? createError.message : "An unexpected error occurred while creating the event.");
    } finally {
      setCreating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
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
      className="container mx-auto p-4 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-white">Events Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Manage events here. This section allows you to create, update, or delete events.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <motion.div
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border-dashed border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 transition-colors duration-200 cursor-pointer"
          onClick={() => setShowCreateModal(true)}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="text-orange-500 dark:text-orange-400 w-5 h-5 mr-2" />
          <button
            className="text-orange-500 dark:text-orange-400 text-lg font-medium hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200"
            disabled={creating}
          >
            {creating ? "Creating..." : "Add Event"}
          </button>
        </motion.div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Events List</h2>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-300">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">No events available.</p>
          ) : (
            <motion.div className="overflow-x-auto" variants={itemVariants}>
              <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Event ID</th>
                    <th className="py-3 px-6 text-left">Admin Name</th>
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Description</th>
                    <th className="py-3 px-6 text-left">Start Date</th>
                    <th className="py-3 px-6 text-left">End Date</th>
                    <th className="py-3 px-6 text-left">Image</th>
                    <th className="py-3 px-6 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400 text-sm font-light">
                  {events.map((event) => (
                    <motion.tr
                      key={event.event_id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                      variants={itemVariants}
                      whileHover={{ backgroundColor: "#ddd" }}
                    >
                      <td className="py-3 px-6">{event.event_id}</td>
                      <td className="py-3 px-6">{user.name}</td>
                      <td className="py-3 px-6">{event.title}</td>
                      <td className="py-3 px-6">{event.description}</td>
                      <td className="py-3 px-6">{new Date(event.start_date).toLocaleDateString()}</td>
                      <td className="py-3 px-6">{new Date(event.end_date).toLocaleDateString()}</td>
                      <td className="py-3 px-6">
                        {event.image_url && (
                          <Image
                            src={event.image_url}
                            alt={event.title}
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                          />
                        )}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 inline-flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeletingEventId(event.event_id);
                            setShowDeleteModal(true);
                          }}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditModal(false)}
          handleImageChange={handleImageChange} //pass the handler
          imageFile={imageFile} // pass the file
        />
      )}

      {/* Delete Event Modal */}
      {showDeleteModal && (
        <DeleteEventModal
          onDelete={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <AddEventModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onSave={handleCreateEvent} // call to save function
          onCancel={() => setShowCreateModal(false)}
          creating={creating}
          handleImageChange={handleImageChange}
          imageFile={imageFile} // Pass the file too
        />
      )}
    </motion.div>
  );
}