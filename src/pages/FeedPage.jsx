import { useCallback, useEffect, useState } from "react";
import ReviewInput from "../components/ReviewInput";
import WriteReviewModal from "../components/WriteReviewModal";
import ReviewCard from "../components/ReviewCard";
import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

export default function FeedPage() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [feedError, setFeedError] = useState("");

  // โหลดรีวิวจาก Backend
  const loadReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      setFeedError("");

      const requestUrl = `${API_URL}/reviews/test`;

      console.log("[Feed] API_URL:", API_URL);
      console.log("[Feed] Request URL:", requestUrl);

      // เพิ่ม: ดึง Session ของผู้ใช้เพื่อส่ง Access Token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const response = await fetch(requestUrl, {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : {},
      });

      // อ่าน Response อย่างปลอดภัย เผื่อ Backend ส่ง HTML แทน JSON
      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error(
          "[Feed] Response is not valid JSON:",
          responseText
        );

        throw new Error(
          `เซิร์ฟเวอร์ตอบกลับข้อมูลที่ไม่ใช่ JSON (HTTP ${response.status})`
        );
      }

      console.log("[Feed] Response status:", response.status);
      console.log("[Feed] Response body:", result);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            result.error ||
            `โหลดรีวิวไม่สำเร็จ (HTTP ${response.status})`
        );
      }

      const reviewList = Array.isArray(result.reviews)
        ? result.reviews.map((review) => ({
            ...review,
            Image_URL: review.Image_URL || null,
          }))
        : [];

      setReviews(reviewList);

      console.log("[Feed] Reviews loaded:", reviewList.length);
    } catch (error) {
      console.error("[Feed] Load reviews error:", error);

      setFeedError(
        error instanceof Error
          ? error.message
          : "โหลดรีวิวไม่สำเร็จ กรุณาลองใหม่"
      );
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // โหลดรีวิวเมื่อเปิดหน้า Feed
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="flex flex-col w-full p-4">
      {/* ปุ่มเปิดหน้าต่างเขียนรีวิว */}
      <ReviewInput onClick={() => setIsReviewOpen(true)} />

      {/* หน้าต่างเขียนรีวิว */}
      {isReviewOpen && (
        <WriteReviewModal
          onClose={() => setIsReviewOpen(false)}
          onReviewPosted={loadReviews}
        />
      )}

      {/* รายการรีวิว */}
      <div className="mt-4 flex flex-col gap-4">
        {loadingReviews && (
          <p className="text-center text-gray-500 py-4">
            Loading reviews...
          </p>
        )}

        {!loadingReviews && feedError && (
          <div className="text-center py-4">
            <p className="text-red-600">{feedError}</p>

            <button
              type="button"
              onClick={loadReviews}
              className="mt-2 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loadingReviews && !feedError && reviews.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            ยังไม่มีรีวิว มาเป็นคนแรกที่รีวิวหนังสือกันเถอะ!
          </p>
        )}

        {!loadingReviews &&
          !feedError &&
          reviews.map((review) => (
            <ReviewCard
              key={review.ReviewsID}
              review={review}
            />
          ))}
      </div>
    </div>
  );
}