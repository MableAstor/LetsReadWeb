
import { Star } from "lucide-react";

export default function StarRating({ rating = 0 }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`คะแนน ${rating} จาก 5 ดาว`}
    >
      <Star
        className="size-4 fill-[#E8BC68] text-[#E8BC68]"
      />
      <span className="text-sm font-medium text-[#886D52]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
