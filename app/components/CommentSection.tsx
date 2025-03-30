"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

interface Review {
  review_id: number;
  user_id: string;
  comment: string;
  created_at: string;
}

interface CommentSectionProps {
  recipeId: number;
  reviews: Review[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ recipeId, reviews }) => {
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Review[]>(reviews);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getUserIdFromCookies = () => {
      if (typeof document === "undefined") {
        return null;
      }
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((cookie) => cookie.startsWith("user="));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
          return user.id;
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          return null;
        }
      }
      return null;
    };

    const fetchedUserId = getUserIdFromCookies();
    if (fetchedUserId) {
      setUserId(fetchedUserId);
      fetchUsername(fetchedUserId);
    }
  }, []);

  const fetchUsername = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching username:", error);
      } else {
        setUsername(data?.user_name || "Unknown User");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  useEffect(() => {
    setComments(reviews);
  }, [reviews]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([{ recipe_id: recipeId, user_id: userId, comment: comment }])
        .select("*")
        .single();

      if (error) {
        console.error("Error submitting comment:", error);
      } else {
        console.log("Comment submitted successfully!", data);
        setComment("");
        fetchUsername(userId);
        setComments((prevComments) => [...prevComments, data]);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div>
      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Reviews:</h4>

      <form onSubmit={handleCommentSubmit} className="mt-4">
        <textarea
          className="w-full p-2 border rounded-md text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>

      {comments.length > 0 ? (
        comments.map((review) => (
          <motion.div
            key={review.review_id}
            className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {review.user_id === userId ? username || "You" : review.user_id}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mt-2">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
};

export default CommentSection;
