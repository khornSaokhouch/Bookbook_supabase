"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, Eye, Edit, Trash2 } from "lucide-react";
import type { EventType } from "./events-management";

const DEFAULT_IMAGE_URL = "/placeholder.svg?height=200&width=300";

interface EventCardProps {
  event: EventType;
  index: number;
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
  onViewDetails: (event: EventType) => void;
}

export function EventCard({
  event,
  index,
  onEdit,
  onDelete,
  onViewDetails,
}: EventCardProps) {
  return (
    <motion.div
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
          {new Date(event.start_date) > new Date() ? "Upcoming" : "Past"}
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
            {new Date(event.start_date).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(event.start_date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <motion.button
            onClick={() => onViewDetails(event)}
            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button
              onClick={() => onEdit(event)}
              className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onDelete(event)}
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
  );
}
