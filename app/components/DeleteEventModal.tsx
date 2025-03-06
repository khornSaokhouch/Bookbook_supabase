import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const DeleteEventModal = ({ eventId, onClose, onDelete }: { eventId: string; onClose: () => void; onDelete: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("event")
      .delete()
      .eq("event_id", eventId);

    setLoading(false);
    if (error) {
      console.error("Error deleting event:", error);
    } else {
      onDelete(); // Callback to remove event from the list
      onClose(); // Close the modal
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this event?</h3>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className={`px-6 py-2 bg-red-600 text-white rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;
