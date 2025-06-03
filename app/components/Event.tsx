"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import Image from "next/image";
import { Calendar, Clock, Users, Sparkles, Heart } from "lucide-react";
import Link from "next/link";

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

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -8, scale: 1.02 },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return (
      today.getDate() === eventDate.getDate() &&
      today.getMonth() === eventDate.getMonth() &&
      today.getFullYear() === eventDate.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Amazing Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our incredible community events and create unforgettable
            memories! 🎉✨
          </p>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full inline-block">
            {events.length} exciting events waiting for you
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No events yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Stay tuned for amazing upcoming events! We&apos;re planning
                something special just for you! 🎊
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {events.map((event, index) => (
              <Link href={`/${event.event_id}/event-detail`} key={event.event_id}>
                <motion.div
                  className="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden cursor-pointer"
                  variants={itemVariants}
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Magical gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    {isToday(event.start_date) ? (
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                        🔴 LIVE NOW!
                      </div>
                    ) : isUpcoming(event.start_date) ? (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        ✨ Upcoming
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        📅 Past Event
                      </div>
                    )}
                  </div>

                  {/* Bookmark/Favorite Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <button className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                      <Heart className="h-4 w-4 text-red-500" />
                    </button>
                  </div>

                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <Image
                      src={event.image_url || "/placeholder.svg"}
                      alt={event.title}
                      width={500}
                      height={300}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Floating Elements */}
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                      <Users className="h-3 w-3 text-blue-500 mr-1" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Community Event
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 relative">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                      {event.description?.substring(0, 120) ||
                        "Join us for an amazing experience you won&apos;t forget! 🎉"}
                      {event.description && event.description.length > 120
                        ? "..."
                        : ""}
                    </p>

                    {/* Date Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="font-medium">
                          Starts: {formatDate(event.start_date)}
                        </span>
                      </div>
                      {event.end_date && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium">
                            Ends: {formatDate(event.end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Magical hover border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400/30 rounded-3xl transition-all duration-300"></div>

                  {/* Floating discover button */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-full shadow-xl">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* Call to Action */}
        {events.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl p-8 max-w-2xl mx-auto border border-purple-200/50 dark:border-gray-600/50">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                Don&apos;t Miss Out! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join our amazing community events and connect with fellow food
                lovers and cooking enthusiasts!
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-purple-600 hover:to-blue-600">
                <Calendar className="h-5 w-5 inline mr-2" />
                View All Events
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
