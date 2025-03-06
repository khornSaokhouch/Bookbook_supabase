"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

type Event = {
  event_id: string;
  admin_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
};

type User = {
  user_id: string;
  name: string;
};

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
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function getUser(): Promise<User> {
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();

    // Check if session and session.user are properly loaded
    if (sessionError || !session || !session.user) {
      throw new Error("No authenticated user found");
    }

    const { data, error } = await supabase
      .from("users")
      .select("user_id, user_name")  // Use `user_name` here as per your table structure
      .eq("user_id", session.user.id)  // Using session.user.id for lookup
      .single();

    if (error || !data) {
      throw error || new Error("User not found");
    }

    return { user_id: data.user_id, name: data.user_name }; // Return user_id and user_name
  } catch (error) {
    console.error("Error fetching user:", error);
    return { user_id: "Admin", name: "Admin" }; // Return a fallback user in case of error
  }
}


export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User>({ user_id: "Admin", name: "Admin" });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false); // State for new event modal
  const [newEvent, setNewEvent] = useState<Event>({
    event_id: "",
    admin_id: user.user_id,
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    image_url: "",
  });

  const clearSuccessMessage = () => {
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [eventsData, userData] = await Promise.all([getEvents(), getUser()]);
        setEvents(eventsData);
        setUser(userData);
        setNewEvent((prevState) => ({
          ...prevState,
          admin_id: userData.user_id, // Ensure newEvent's admin_id is set correctly after user data is loaded
        }));
      } catch (fetchError: any) {
        setError(fetchError.message || "Failed to load data.");
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
        setError("An error occurred while deleting the event.");
      } else {
        setEvents(events.filter((event) => event.event_id !== deletingEventId));
        setSuccessMessage("Event deleted successfully!");
        clearSuccessMessage();
      }
    } catch (deleteError: any) {
      console.error("Error during delete operation:", deleteError);
      setError("An unexpected error occurred while deleting the event.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = async (event: Event) => {
    setSelectedEvent({ ...event });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedEvent: Event) => {
    if (!updatedEvent.title || !updatedEvent.start_date || !updatedEvent.end_date) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("event")
        .update({
          title: updatedEvent.title,
          description: updatedEvent.description,
          start_date: updatedEvent.start_date,
          end_date: updatedEvent.end_date,
          image_url: updatedEvent.image_url,
        })
        .eq("event_id", updatedEvent.event_id);

      if (error) {
        console.error("Error saving event edit:", error);
        setError("An error occurred while saving the event.");
      } else {
        setEvents(
          events.map((e) => (e.event_id === updatedEvent.event_id ? { ...updatedEvent } : e))
        );
        setShowEditModal(false);
        setSuccessMessage("Event updated successfully!");
        clearSuccessMessage();
      }
    } catch (updateError: any) {
      console.error("Error during edit operation:", updateError);
      setError("An unexpected error occurred while saving the event.");
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.start_date || !newEvent.end_date) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const { data, error } = await supabase.from("event").insert([newEvent]);

      if (error) {
        console.error("Error creating event:", error);
        setError(error.message || "An error occurred while creating the event.");
      } else {
        setEvents([...(data || []), ...events]);
        setShowCreateModal(false);
        setSuccessMessage("Event created successfully!");
        clearSuccessMessage();
      }
    } catch (createError: any) {
      console.error("Error during event creation:", createError);
      setError(createError.message || "An unexpected error occurred while creating the event.");
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-4">Events Management</h1>
        <p className="text-gray-600">Manage events here. This section allows you to create, update, or delete events.</p>

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

        <div className="mt-8 flex items-center justify-center bg-gray-100 p-6 rounded-lg border-dashed border-2 border-gray-300">
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-orange-500 text-lg font-medium"
          >
            + Add Event
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Events List</h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-gray-600">No events available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
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
                <tbody className="text-gray-600 text-sm font-light">
                  {events.map((event) => (
                    <tr key={event.event_id} className="border-b hover:bg-gray-100">
                      <td className="py-3 px-6 text-left">{event.event_id}</td>
                      <td className="py-3 px-6 text-left">{user.name}</td>
                      <td className="py-3 px-6 text-left">{event.title}</td>
                      <td className="py-3 px-6 text-left">{event.description}</td>
                      <td className="py-3 px-6 text-left">{new Date(event.start_date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">{new Date(event.end_date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-left">
                        {event.image_url && (
                          <Image
                            src={event.image_url}
                            alt={event.title}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                        )}
                      </td>
                      <td className="py-3 px-6 text-left">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeletingEventId(event.event_id);
                            setShowDeleteModal(true);
                          }}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Event Modal */}
        {showEditModal && selectedEvent && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
              <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit(selectedEvent);
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={selectedEvent.start_date}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, start_date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={selectedEvent.end_date}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, end_date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
                  <input
                    type="text"
                    value={selectedEvent.image_url}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, image_url: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
        )}

        {/* Delete Event Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
              <h2 className="text-2xl font-semibold mb-4">Are you sure you want to delete this event?</h2>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
              <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateEvent();
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
