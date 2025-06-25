"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  Star,
  Sparkles,
  Heart,
  Share2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";
import { Badge } from "@/app/components/ui/badge";

interface EventData {
  event_id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  image_url: string;
  location?: string;
  max_participants?: number;
  current_participants?: number;
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  price?: number;
  category?: string;
}

async function getEventById(eventId: number): Promise<EventData | null> {
  try {
    const { data, error } = await supabase
      .from("event")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (error) throw error;

    if (!data) {
      console.warn("No event found for the ID:", eventId);
      return null;
    }

    return data as EventData;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const eventId = Number(id);
  const [event, setEvent] = useState<EventData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isNaN(eventId)) {
          setError("Invalid event ID. Must be a number.");
          return;
        }

        const eventData = await getEventById(eventId);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError("Event not found.");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);


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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description || "Check out this amazing event!",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Calendar className="h-16 w-16 text-purple-500 animate-bounce mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Loading event details...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Just a moment while we gather all the exciting details! 🎉
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Event not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            This event seems to have disappeared from our calendar!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        className="container mx-auto px-4 md:px-8 lg:px-16 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center mb-6 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </motion.button>

        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src={event.image_url || "/placeholder.svg"}
              alt={event.title}
              width={1200}
              height={600}
              unoptimized
              className="w-full h-64 md:h-96 lg:h-[500px] object-cover"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>

            {/* Status Badge */}
            <div className="absolute top-6 left-6">
              {isToday(event.start_date) ? (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 px-4 py-2 text-lg font-bold shadow-lg animate-pulse">
                  🔴 HAPPENING NOW!
                </Badge>
              ) : isUpcoming(event.start_date) ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 text-lg font-bold shadow-lg">
                  ✨ Upcoming Event
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 px-4 py-2 text-lg font-bold shadow-lg">
                  📅 Past Event
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex space-x-3">
              <button
                onClick={handleShare}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Event title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {event.title}
              </motion.h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {/* Main Content - Modified to remove the grid and make description full width */}
        <div className="mb-12">
          {/* Description - Now full width */}
          <motion.section
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                About This Event
              </h2>
            </div>
            <div className="max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 text-justify leading-relaxed tracking-wide mb-6">
                {event.description ||
                  `Join us for an unforgettable culinary experience that brings together food enthusiasts from all walks of life. 
          This carefully curated event is designed to inspire, educate, and delight participants with a unique blend of 
          hands-on activities and expert demonstrations. Whether you're a novice cook or a seasoned chef, you'll find 
          valuable takeaways that will elevate your culinary skills.`}
              </p>
            </div>
          </motion.section>
        </div>

        {/* Additional Info */}
        <motion.section
          className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl shadow-lg border border-purple-200/50 dark:border-gray-600/50 p-8 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Ready for an Amazing Experience? 🌟
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join our vibrant community of food lovers and cooking enthusiasts.
              This event promises to be filled with learning, laughter, and
              delicious discoveries that you will treasure forever!
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>5-star rated events</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-500 mr-1" />
                <span>Community focused</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span>Made with love</span>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default EventDetailPage;
