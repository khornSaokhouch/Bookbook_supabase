"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { supabase } from "@/app/lib/supabaseClient"; // adjust to your setup
import "swiper/css";
import "swiper/css/pagination";

type Event = {
  event_id: number;
  title: string;
  image_url: string;
};

export default function BannerSwiper() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("event")
        .select("event_id, title, image_url")
        .order("start_date", { ascending: true });

      if (error) {
        setError("Failed to load events.");
        console.error("Supabase error:", error.message);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-600">Loading events...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div className="w-full">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="w-full h-[600px]"
      >
        {events.map((event) => (
          <SwiperSlide key={event.event_id}>
            <div
              className="relative w-full h-[600px] bg-cover bg-center flex items-center justify-center text-white"
              style={{ backgroundImage: `url(${event.image_url})` }}
            >
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
