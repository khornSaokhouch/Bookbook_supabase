"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

interface InteractiveRatingProps {
  recipeId: number;
  userId?: string;
  onRatingSubmitted?: () => void;
}

const InteractiveRating = ({
  recipeId,
  userId,
  onRatingSubmitted,
}: InteractiveRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userExistingRating, setUserExistingRating] = useState<number | null>(
    null
  );
  const [hasRated, setHasRated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const checkExistingRating = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating, comment")
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .single();

      if (data && !error) {
        setUserExistingRating(data.rating);
        setRating(data.rating);
        setComment(data.comment || "");
        setHasRated(true);
      }
    } catch {
      // User hasn't rated yet, which is fine
      console.log("No existing rating found");
    }
  }, [recipeId, userId]);

  useEffect(() => {
    if (userId) {
      checkExistingRating();
    }
  }, [userId, recipeId, checkExistingRating]);

  const submitRating = async () => {
    if (!userId || rating === 0) return;

    setIsSubmitting(true);
    try {
      if (hasRated) {
        // Update existing rating
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: rating,
            comment: comment.trim(),
            created_at: new Date().toISOString(),
          })
          .eq("recipe_id", recipeId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase.from("reviews").insert([
          {
            recipe_id: recipeId,
            user_id: userId,
            rating: rating,
            comment: comment.trim(),
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }

      setHasRated(true);
      setUserExistingRating(rating);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

      // Notify parent component
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-6 text-center border border-blue-200/50 dark:border-gray-600/50">
        <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Want to rate this recipe?
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Please log in to share your rating and review!
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
          Log In to Rate
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <Star className="h-6 w-6 text-white fill-current" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {hasRated ? "Update Your Rating" : "Rate This Recipe"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {hasRated
              ? "You can update your rating anytime!"
              : "Share your experience with others! ⭐"}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              {hasRated
                ? "Rating updated successfully! 🎉"
                : "Thank you for your rating! 🎉"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Star Rating Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Your Rating{" "}
          {hasRated && (
            <span className="text-yellow-500">
              (Current: {userExistingRating} ⭐)
            </span>
          )}
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-all duration-200 transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 dark:text-gray-600"
                } hover:text-yellow-400`}
              />
            </button>
          ))}
          <span className="ml-3 text-lg font-medium text-gray-700 dark:text-gray-300">
            {rating > 0 && (
              <span className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 py-1 rounded-full text-sm">
                {rating} star{rating !== 1 ? "s" : ""} ⭐
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Your Review (Optional) 💬
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this recipe... What did you love? Any tips for other cooks? 😊"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 resize-none"
          rows={4}
          maxLength={500}
        />
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comment.length}/500 characters
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitRating}
        disabled={rating === 0 || isSubmitting}
        className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
          rating === 0 || isSubmitting
            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-orange-600"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            {hasRated ? "Updating..." : "Submitting..."}
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            {hasRated ? "Update Rating" : "Submit Rating"}
          </>
        )}
      </button>

      {/* Helpful Tips */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/30 dark:to-gray-600/30 rounded-xl border border-blue-200/50 dark:border-gray-600/50">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 <strong>Tip:</strong> Your honest review helps other home cooks
          discover amazing recipes!
        </p>
      </div>
    </div>
  );
};

export default InteractiveRating;
