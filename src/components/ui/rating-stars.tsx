// components/RatingStars.js
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingStars = ({
  rating,
  starSize = 16,
}: {
  rating: number;
  starSize?: number;
}) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={starSize} />
      ))}
      {halfStar && <FaStarHalfAlt key="half" size={starSize} />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} size={starSize} />
      ))}
      {/* Optional: Display numerical rating */}
      {/* <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span> */}
    </div>
  );
};

export default RatingStars;
