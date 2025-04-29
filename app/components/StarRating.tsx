"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Adjust if needed
import { Star } from "lucide-react"; // Star icon

interface Review {
  rating: number | null;
  user_id: string;
}

interface StarRatingProps {
  recipeId: number;
  reviews: Review[];
}

const StarRating: React.FC<StarRatingProps> = ({ recipeId, reviews }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserIdFromCookies = (): string | null => {
      if (typeof document === "undefined") return null;
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((cookie) => cookie.startsWith("user="));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
          return user.id;
        } catch (error) {
          console.error("Error parsing user cookie:", error);
        }
      }
      return null;
    };

    const fetchedUserId = getUserIdFromCookies();
    if (fetchedUserId) setUserId(fetchedUserId);

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0);
      const validRatingsCount = reviews.filter((r) => r.rating !== null).length;
      const averageRating = validRatingsCount ? totalRating / validRatingsCount : null;
      setRating(averageRating);
    }
  }, [reviews]);

  const handleRating = async (selectedRating: number) => {
    if (!userId) {
      alert("You must be logged in to rate.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([{ recipe_id: recipeId, user_id: userId, rating: selectedRating }])
        .single();

      if (error) throw error;
      console.log("Rating submitted successfully!", data);
      setRating(selectedRating);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="flex flex-row">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={`cursor-pointer h-5 w-5 ${
            6 - index <= (hoverRating || rating || 0) ? "text-yellow-500" : "text-gray-300"
          }`}
          onMouseEnter={() => setHoverRating(6 - index)}
          onMouseLeave={() => setHoverRating(null)}
          onClick={() => handleRating(6 - index)}
        />
      ))}
    </div>
  );
};

export default StarRating;
