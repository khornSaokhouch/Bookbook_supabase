import type React from "react";

interface StarRatingProps {
  reviews: { rating: number | null }[];
}

const StarRating: React.FC<StarRatingProps> = ({ reviews }) => {
  const validRatings = reviews
    .filter((review) => review.rating != null && !isNaN(review.rating))
    .map((review) => Number(review.rating));

  const averageRating =
    validRatings.length > 0
      ? validRatings.reduce((sum, rating) => sum + rating, 0) /
        validRatings.length
      : 0;

  const displayRating = Math.round(averageRating * 10) / 10;

  const filledStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;
  const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[...Array(filledStars)].map((_, i) => (
          <span key={`filled-${i}`} className="text-yellow-400 text-lg">
            ★
          </span>
        ))}
        {hasHalfStar && (
          <span className="text-yellow-400 text-lg relative">
            <span className="absolute inset-0 overflow-hidden w-1/2">★</span>
            <span className="text-gray-300">★</span>
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
        ({displayRating}) • {validRatings.length} review
        {validRatings.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

export default StarRating;
