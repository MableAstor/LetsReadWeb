import { useState } from "react";
import ReviewInput from "../components/ReviewInput";
import WriteReviewModal from "../components/WriteReviewModal";
import ReviewCard from "../components/ReviewCard";

export default function FeedPage() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <div className="flex flex-col w-full p-4 ">

      <ReviewInput
        onClick={() => setIsReviewOpen(true)} 
      />

      {isReviewOpen && (
        <WriteReviewModal
          onClose={() => setIsReviewOpen(false)}
        />
      )}

      <div className="mt-4">
        <ReviewCard />
      </div>

    </div>
  );
}