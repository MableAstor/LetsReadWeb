
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import ReviewInput from "../components/ReviewInput";
import WriteReviewModal from "../components/WriteReviewModal";
import ReviewCard from "../components/ReviewCard";
import UserAvatar from "../components/UserAvatar";
import ReviewSkeleton from "../components/skeleton/ReviewSkeleton";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

export default function FeedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [feedError, setFeedError] = useState("");

  // ตรวจสอบ Login ก่อนทำรายการที่ต้องใช้บัญชี
  const requireLogin = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (!session) {
        navigate("/Login", {
          state: { from: location.pathname },
        });

        return false;
      }

      return true;
    } catch (error) {
      console.error("[Feed] Check login error:", error);
      alert("ไม่สามารถตรวจสอบสถานะเข้าสู่ระบบได้ กรุณาลองใหม่");
      return false;
    }
  }, [navigate, location.pathname]);

  // เปิดหน้าต่างเขียนรีวิวเมื่อ Login แล้ว
  const handleOpenReview = async () => {
    const isLoggedIn = await requireLogin();

    if (!isLoggedIn) return;

    setIsReviewOpen(true);
  };

  // โหลดรีวิวจาก Backend
  const loadReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      setFeedError("");

      const requestUrl = `${API_URL}/reviews/test`;

      console.log("[Feed] Request URL:", requestUrl);

      // เก็บ Logic จาก main: ส่ง Access Token
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

      // อ่าน Response อย่างปลอดภัย
      const responseText = await response.text();

      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error("[Feed] Invalid JSON:", responseText);

        throw new Error(
          `เซิร์ฟเวอร์ตอบกลับข้อมูลที่ไม่ใช่ JSON (HTTP ${response.status})`
        );
      }

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

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
      {/* Page heading */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#B77D80]">
          Pastel Book Club
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[#684B50] sm:text-3xl">
          Feed
        </h1>

        <p className="text-sm text-[#98777A]">
          พื้นที่แบ่งปันความรู้สึกและเรื่องราวจากหนังสือที่คุณอ่าน
        </p>
      </div>

      {/* Write review */}
      <div className="rounded-2xl border border-[#F1D9D2] bg-white/80 p-3 shadow-sm">
        <ReviewInput onClick={handleOpenReview} />
      </div>

      {/* Write review modal */}
      {isReviewOpen && (
        <WriteReviewModal
          onClose={() => setIsReviewOpen(false)}
          onReviewPosted={loadReviews}
        />
      )}

      {/* Review list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#684B50]">
            รีวิวจากชุมชน
          </h2>

          {!loadingReviews && !feedError && (
            <span className="text-xs text-[#B18A8D]">
              {reviews.length} รีวิว
            </span>
          )}
        </div>

        {/* Skeleton loading */}
        {loadingReviews && <ReviewSkeleton count={3} />}

        {/* Error state */}
        {!loadingReviews && feedError && (
          <Card className="rounded-2xl border-[#F1D9D2] bg-white/90">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="text-3xl">📚</div>

              <p className="font-medium text-[#684B50]">
                โหลดรีวิวไม่สำเร็จ
              </p>

              <p className="text-sm text-[#98777A]">
                {feedError}
              </p>

              <Button
                onClick={loadReviews}
                className="rounded-full bg-[#D99BA0] text-white hover:bg-[#C9868C]"
              >
                ลองอีกครั้ง
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loadingReviews &&
          !feedError &&
          reviews.length === 0 && (
            <Card className="rounded-2xl border-dashed border-[#EBCDC7] bg-white/70">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="text-5xl">📖</div>

                <h3 className="font-semibold text-[#684B50]">
                  ยังไม่มีรีวิวในตอนนี้
                </h3>

                <p className="text-sm text-[#98777A]">
                  มาแบ่งปันความรู้สึกจากหนังสือเล่มโปรดกันเถอะ
                </p>

                <Button
                  onClick={handleOpenReview}
                  className="rounded-full bg-[#D99BA0] text-white hover:bg-[#C9868C]"
                >
                  เขียนรีวิวแรกของคุณ
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Reviews */}
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
