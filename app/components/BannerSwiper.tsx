"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function BannerSwiper() {
  const banners = [
    { id: 1, image: "/banner.png", title: "Discover New Recipes" },
    { id: 2, image: "/banner.png", title: "Cook with Love" },
    { id: 3, image: "/banner.png", title: "Healthy & Delicious" },
  ];

  return (
    <div className="w-full">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 2000, disableOnInteraction: false }} // Auto slide every 4 seconds
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="w-full h-[400px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center text-white"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              <div className="bg-black bg-opacity-50 p-6 rounded-lg">
                <h2 className="text-3xl font-bold">{banner.title}</h2>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
