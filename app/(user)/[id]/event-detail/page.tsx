"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Sparkles,
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
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

interface UserData {
  user_id: string;
  user_name: string;
  email: string;
  image_url: string;
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
  const [user, setUser] = useState<UserData | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        const { data, error } = await supabase
          .from("users")
          .select("user_name, email, image_url")
          .eq("user_id", sessionUser.id)
          .single();

        if (!error && data) {
          setUser({
            user_id: sessionUser.id,
            user_name: data.user_name || "User",
            email: data.email || "",
            image_url: data.image_url || "/default-avatar.png",
          });
        }
      }
    };

    getCurrentUser();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  const handleRegister = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsRegistering(true);
    try {
      // Simulate registration API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsRegistered(true);
      // You would implement actual registration logic here
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      setIsRegistering(false);
    }
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
            Just a moment while we gather all the exciting details!
            &apos;🎉&apos;
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
            This event seems to have disappeared from our calendar&apos;!
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
              <motion.div
                className="flex items-center text-white/90 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <User className="h-5 w-5 mr-2" />
                <span>Organized by {event.organizer || "Community Team"}</span>
                <Sparkles className="h-5 w-5 ml-4 mr-2 text-yellow-400" />
                <span>Don&apos;t miss out!</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Event Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                Date
              </h3>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {formatDate(event.start_date)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Mark your calendar! 📅
              </p>
            </div>
          </div>

          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Time
              </h3>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {formatTime(event.start_date)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Don&apos;t be late! ⏰
              </p>
            </div>
          </div>

          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                Location
              </h3>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {event.location || "Community Center"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                See you there! 📍
              </p>
            </div>
          </div>

          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Attendees
              </h3>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {event.current_participants || 42}/
                {event.max_participants || 100}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Join the crowd! 👥
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Description */}
          <motion.section
            className="lg:col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8"
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
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed text-lg">
                {event.description ||
                  "Join us for an amazing community event that brings together food lovers, cooking enthusiasts, and friends! This is a perfect opportunity to learn new recipes, share cooking tips, and enjoy delicious food together. Whether you&apos;re a beginner or an experienced cook, everyone is welcome to participate and have fun!"}
              </p>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border-l-4 border-yellow-400">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  🎯 What to Expect:
                </h4>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Interactive cooking demonstrations</li>
                  <li>• Recipe sharing and tasting sessions</li>
                  <li>• Meet fellow cooking enthusiasts</li>
                  <li>• Take home new recipes and tips</li>
                  <li>• Fun activities and prizes!</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Registration Card */}
          <motion.section
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                {isRegistered ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                  <Users className="h-8 w-8 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {isRegistered
                  ? "You&apos;re Registered! 🎉"
                  : "Join This Event"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isRegistered
                  ? "We can&apos;t wait to see you there!"
                  : "Reserve your spot for this amazing experience!"}
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {event.price ? `$${event.price}` : "FREE"}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {event.price ? "Per person" : "No cost to join!"}
              </p>
            </div>

            {/* Registration Button */}
            {!isRegistered ? (
              <button
                onClick={handleRegister}
                disabled={isRegistering || !isUpcoming(event.start_date)}
                className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  !isUpcoming(event.start_date)
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : isRegistering
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white cursor-wait"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600"
                }`}
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Registering...
                  </>
                ) : !isUpcoming(event.start_date) ? (
                  <>
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Event Ended
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Register Now
                  </>
                )}
              </button>
            ) : (
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    Registration Confirmed!
                  </p>
                </div>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Add to Calendar
                </button>
              </div>
            )}

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">
                📞 Contact Organizer
              </h4>
              <div className="space-y-2 text-sm">
                {event.contact_email && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{event.contact_email}</span>
                  </div>
                )}
                {event.contact_phone && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{event.contact_phone}</span>
                  </div>
                )}
                {event.website && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>{event.website}</span>
                  </div>
                )}
              </div>
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
              delicious discoveries that you&apos;ll treasure forever!
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
