"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, Eye, Edit, Trash2 } from "lucide-react";
import type { EventType } from "./events-management";

const DEFAULT_IMAGE_URL = "/placeholder.svg?height=200&width=300";

interface EventTableProps {
  events: EventType[];
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
  onViewDetails: (event: EventType) => void;
}

export function EventTable({
  events,
  onEdit,
  onDelete,
  onViewDetails,
}: EventTableProps) {
  return (
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
          {events.map((event, index) => (
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
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(event.start_date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
                    onClick={() => onViewDetails(event)}
                    className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
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
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
