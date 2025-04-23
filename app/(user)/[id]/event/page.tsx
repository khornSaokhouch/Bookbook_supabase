"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

type Event = {
  event_id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  image_url: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex justify-center items-start min-h-screen dark:bg-gray-900 p-4 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-8xl w-full">
        {loading ? (
          <p className="text-center col-span-full text-gray-700 dark:text-gray-300">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center col-span-full text-gray-700 dark:text-gray-300">No events found.</p>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.event_id}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Bookmark Icon */}
              <div className="absolute top-2 left-2 bg-green-200 rounded-full p-1 z-10">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v3h8V6zm-5 5H6v3h3v-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Image */}
              <div className="aspect-w-4 aspect-h-3">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  width={500}
                    height={300}
                    className="w-full h-48 object-cover rounded-md mb-4"
                    priority
                    unoptimized
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{event.description?.substring(0, 150) || "No description"}...</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-4">
                  Starts: {new Date(event.start_date).toLocaleDateString()}
                  {event.end_date && (
                    <> – Ends: {new Date(event.end_date).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}