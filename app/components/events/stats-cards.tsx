"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Clock, Star } from "lucide-react";
import type { EventType } from "./events-management";

interface StatsCardsProps {
  events: EventType[];
}

export function StatsCards({ events }: StatsCardsProps) {
  const upcomingEvents = events.filter(
    (event) => new Date(event.start_date) > new Date()
  );
  const pastEvents = events.filter(
    (event) => new Date(event.start_date) <= new Date()
  );

  const thisMonthEvents = events.filter(
    (event) =>
      new Date(event.start_date).getMonth() === new Date().getMonth() &&
      new Date(event.start_date).getFullYear() === new Date().getFullYear()
  );

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
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
              {thisMonthEvents.length}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
            <Star className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
