"use client";

import { motion } from "framer-motion";
import { Calendar, Plus } from "lucide-react";
import { EventGrid } from "./event-grid";
import { EventTable } from "./event-table";
import type { EventType } from "./events-management";

interface EventsDisplayProps {
  events: EventType[];
  viewMode: "grid" | "list";
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
  onViewDetails: (event: EventType) => void;
  openModal: () => void;
}

export function EventsDisplay({
  events,
  viewMode,
  onEdit,
  onDelete,
  onViewDetails,
  openModal,
}: EventsDisplayProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      variants={cardVariants}
    >
      {events.length > 0 ? (
        viewMode === "grid" ? (
          <EventGrid
            events={events}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ) : (
          <EventTable
            events={events}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        )
      ) : (
        <div className="p-6">
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first event.
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
        </div>
      )}
    </motion.div>
  );
}
