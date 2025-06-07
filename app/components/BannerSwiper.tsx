"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { supabase } from "@/app/lib/supabaseClient";
import { Calendar, ArrowRight, Sparkles, Star, Play } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

type Event = {
  event_id: number;
  title: string;
  image_url: string;
};

const DEFAULT_EVENT: Event = {
  event_id: 0,
  title: "Stay Tuned for Amazing Events!",
  image_url: "/placeholder.svg?height=500&width=1200",
};

export default function BannerSwiper() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("event")
        .select("event_id, title, image_url")
        .gte("start_date", now)
        .order("start_date", { ascending: true });

      if (error) {
        setError("Failed to load events.");
        console.error("Supabase error:", error.message);
        // Use default event even on error
        setEvents([DEFAULT_EVENT]);
      } else {
        // If no upcoming events, show default event
        setEvents(data && data.length > 0 ? data : [DEFAULT_EVENT]);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-[400px] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 animate-pulse"></div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>

        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <Sparkles className="h-12 w-12 text-yellow-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Loading Events...
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[400px] bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-white/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/60 !w-3 !h-3 !mx-1",
          bulletActiveClass:
            "swiper-pagination-bullet-active !bg-white !scale-125",
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        modules={[Autoplay, Pagination, EffectFade]}
        className="w-full h-[400px] md:h-[500px]"
      >
        {events.map((event, index) => (
          <SwiperSlide key={event.event_id}>
            <div className="relative w-full h-full group overflow-hidden">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${
                    event.image_url || "/placeholder.svg?height=500&width=1200"
                  })`,
                }}
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

              {/* Content Overlay */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
                  <div className="max-w-4xl">
                    {/* Featured Badge */}
                    <div
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-6 opacity-0 animate-fadeInUp"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      {event.event_id === 0 ? "Coming Soon" : "Featured Event"}
                    </div>

                    {/* Event Title */}
                    <h1
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight opacity-0 animate-fadeInUp"
                      style={{
                        animationDelay: `${index * 0.1 + 0.2}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                        {event.title}
                      </span>
                    </h1>

                    {/* Event Description */}
                    <p
                      className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl opacity-0 animate-fadeInUp"
                      style={{
                        animationDelay: `${index * 0.1 + 0.4}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      {event.event_id === 0
                        ? "We're planning something amazing for you! Check back soon for exciting upcoming events and experiences. 🌟"
                        : "Join us for an amazing experience that you will never forget. Do not miss out on this incredible opportunity! 🎉"}
                    </p>

                    {/* Action Buttons */}
                    <div
                      className="flex flex-wrap gap-4 opacity-0 animate-fadeInUp"
                      style={{
                        animationDelay: `${index * 0.1 + 0.6}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      {event.event_id === 0 ? (
                        <>
                          <button className="group flex items-center px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm md:text-base shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-700 hover:to-pink-700">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span>Notify Me</span>
                            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </button>

                          <button className="flex items-center px-6 py-3 md:px-8 md:py-4 bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-sm md:text-base hover:bg-white/25 transition-all duration-300 transform hover:scale-105">
                            <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            Browse Recipes
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="group flex items-center px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm md:text-base shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-700 hover:to-pink-700">
                            <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span>Explore Event</span>
                            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </button>

                          <button className="flex items-center px-6 py-3 md:px-8 md:py-4 bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-sm md:text-base hover:bg-white/25 transition-all duration-300 transform hover:scale-105">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            Learn More
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Counter */}
              <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-medium">
                {index + 1} / {events.length}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .swiper-pagination {
          bottom: 20px !important;
        }

        .swiper-pagination-bullet {
          transition: all 0.3s ease !important;
          opacity: 0.7 !important;
        }

        .swiper-pagination-bullet:hover {
          transform: scale(1.2) !important;
          opacity: 1 !important;
        }

        .swiper-pagination-bullet-active {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
