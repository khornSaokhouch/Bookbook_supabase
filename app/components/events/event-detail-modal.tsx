"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { XCircle, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import type { EventType } from "./events-management";

const DEFAULT_IMAGE_URL = "/placeholder.svg?height=200&width=300";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventType | null;
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
}

export function EventDetailModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (!event) return null;

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64">
              <Image
                src={event.image_url || DEFAULT_IMAGE_URL}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors duration-200 p-2 rounded-full bg-black/20 hover:bg-black/40"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(event.start_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(event.start_date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
                  {event.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Start Date
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(event.start_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    End Date
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {event.end_date
                      ? new Date(event.end_date).toLocaleString()
                      : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    onClose();
                    onEdit(event);
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
                    onClose();
                    onDelete(event);
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
  );
}
