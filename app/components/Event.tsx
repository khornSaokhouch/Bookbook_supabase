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
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        console.log("Fetched events:", data); // Debug log
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

  const getEventStatus = (startDate: string, endDate: string | null) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    // Reset time to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventStart = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const eventEnd = end
      ? new Date(end.getFullYear(), end.getMonth(), end.getDate())
      : eventStart;

    console.log("Date comparison:", {
      today: today.toISOString(),
      eventStart: eventStart.toISOString(),
      eventEnd: eventEnd.toISOString(),
      startDate,
      endDate,
    });

    // Check if event is happening today
    if (
      eventStart.getTime() <= today.getTime() &&
      eventEnd.getTime() >= today.getTime()
    ) {
      return "live";
    }

    // Check if event is upcoming
    if (eventStart.getTime() > today.getTime()) {
      return "upcoming";
    }

    // Event is in the past
    return "past";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
            🔴 LIVE NOW!
          </div>
        );
      case "upcoming":
        return (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
            ✨ Upcoming
          </div>
        );
      case "past":
        return (
          <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
            📅 Past
          </div>
        );
      default:
        return null;
    }
  };

  // Separate events by status for better organization
  const categorizeEvents = () => {
    const liveEvents: Event[] = [];
    const upcomingEvents: Event[] = [];
    const pastEvents: Event[] = [];

    events.forEach((event) => {
      const status = getEventStatus(event.start_date, event.end_date);
      switch (status) {
        case "live":
          liveEvents.push(event);
          break;
        case "upcoming":
          upcomingEvents.push(event);
          break;
        case "past":
          pastEvents.push(event);
          break;
      }
    });

    return { liveEvents, upcomingEvents, pastEvents };
  };

  const { liveEvents, upcomingEvents, pastEvents } = categorizeEvents();

  const renderEventCard = (event: Event, index: number) => {
    const status = getEventStatus(event.start_date, event.end_date);

    return (
      <Link href={`/${event.event_id}/event-detail`} key={event.event_id}>
        <motion.div
          className="group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden cursor-pointer"
          variants={itemVariants}
          whileHover="hover"
          transition={{ delay: index * 0.1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute top-4 left-4 z-10">
            {getStatusBadge(status)}
          </div>

          <div className="absolute top-4 right-4 z-10">
            <button className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
              <Heart className="h-4 w-4 text-red-500" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-t-3xl">
            <Image
              src={event.image_url || "/placeholder.svg?height=300&width=500"}
              alt={event.title}
              width={500}
              height={300}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
              <Users className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Community Event
              </span>
            </div>
          </div>

          <div className="p-6 relative">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-3 line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
              {event.description?.substring(0, 120) ||
                "Join us for an amazing experience you won't forget! 🎉"}
              {event.description && event.description.length > 120 ? "..." : ""}
            </p>

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

          <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400/30 rounded-3xl transition-all duration-300"></div>

          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-full shadow-xl">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  };

  const renderEventSection = (
    title: string,
    events: Event[],
    emoji: string
  ) => {
    if (events.length === 0) return null;

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3 text-3xl">{emoji}</span>
          {title} ({events.length})
        </h2>
        <motion.div
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {events.map((event, index) => renderEventCard(event, index))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Amazing Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our incredible community events and create unforgettable
            memories! 🎉✨
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full">
              📍 {events.length} total events
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-green-100/50 dark:bg-green-900/20 px-4 py-2 rounded-full">
              🔴 {liveEvents.length} live
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-100/50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              ✨ {upcomingEvents.length} upcoming
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-4 py-2 rounded-full">
              📅 {pastEvents.length} past
            </div>
          </div>
        </div>

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
                Stay tuned for upcoming events! 🎊
              </p>
            </div>
          </div>
        ) : (
          <div>
            {renderEventSection("Live Events", liveEvents, "🔴")}
            {renderEventSection("Upcoming Events", upcomingEvents, "✨")}
            {renderEventSection("Past Events", pastEvents, "📅")}
          </div>
        )}

        {events.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl p-8 max-w-2xl mx-auto border border-purple-200/50 dark:border-gray-600/50">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                Dont Miss Out! 🎉
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
