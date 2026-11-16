
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import ReviewInput from "../components/ReviewInput";
import WriteReviewModal from "../components/WriteReviewModal";
import ReviewCard from "../components/ReviewCard";
import ReviewSkeleton from "../components/skeleton/ReviewSkeleton";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .replace(/\/+$/, "") + "/api/auth";

// แยกแท็กจากข้อความ เช่น "Supernatural, Adventure"
const splitTags = (...categories) => {
  return categories
    .filter(Boolean)
    .flatMap((category) =>
      String(category)
        .split(/[,，、]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
    .filter(
      (tag, index, array) =>
        array.findIndex(
          (item) =>
            item.toLowerCase() === tag.toLowerCase()
        ) === index
    );
};

// ทำให้ชื่อแท็กเปรียบเทียบกันได้
const normalizeTag = (value) =>
  String(value ?? "").trim().toLowerCase();

export default function FeedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [feedError, setFeedError] = useState("");

  // ตรวจสอบการเข้าสู่ระบบ
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
      console.error("[Feed] Login error:", error);

      alert("ไม่สามารถตรวจสอบสถานะเข้าสู่ระบบได้");

      return false;
    }
  }, [navigate, location.pathname]);

  // เปิดหน้าต่างเขียนรีวิว
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

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const response = await fetch(
        `${API_URL}/reviews/test`,
        {
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : {},
        }
      );

      const responseText = await response.text();

      let result = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
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

      // ดึงข้อมูลรีวิว
      const reviewList = Array.isArray(result.reviews)
        ? result.reviews.map((review) => ({
            ...review,
            Image_URL: review.Image_URL || null,
          }))
        : [];

      setReviews(reviewList);
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

  // โหลดรีวิวเมื่อเข้าหน้า Feed
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // กรองโพสต์ตามแท็กที่เลือก
  const filteredReviews = selectedTag
    ? reviews.filter((review) => {
        const tags = splitTags(
          review.Main_Category,
          review.Sub_Category
        );

        return tags.some(
          (tag) =>
            normalizeTag(tag) === normalizeTag(selectedTag)
        );
      })
    : reviews;

  // เมื่อผู้ใช้กดแท็ก
  const handleTagClick = (tag) => {
    if (!tag) return;

    setSelectedTag((currentTag) =>
      normalizeTag(currentTag) === normalizeTag(tag)
        ? null
        : tag
    );
  };

  // ล้างตัวกรอง
  const handleClearFilter = () => {
    setSelectedTag(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5 sm:px-6">

      {/* HEADER */}
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

      {/* REVIEW INPUT */}
      <div className="rounded-2xl border border-[#F1D9D2] bg-white/80 p-3 shadow-sm">
        <ReviewInput onClick={handleOpenReview} />
      </div>

      {/* WRITE REVIEW MODAL */}
      {isReviewOpen && (
        <WriteReviewModal
          onClose={() => setIsReviewOpen(false)}
          onReviewPosted={loadReviews}
        />
      )}

      {/* REVIEW LIST */}
      <div className="flex flex-col gap-3">

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#684B50]">
            รีวิวจากชุมชน
          </h2>

          {!loadingReviews && !feedError && (
            <span className="text-xs text-[#B18A8D]">
              {filteredReviews.length} รีวิว
            </span>
          )}
        </div>

        {/* ACTIVE TAG FILTER */}
        {selectedTag && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#F1D9D2] bg-[#FFF1EE] px-3 py-2">

            <span className="text-xs text-[#98777A]">
              กำลังแสดงแท็ก
            </span>

            <span className="rounded-full border border-[#D99BA0] bg-white px-3 py-1 text-xs font-semibold text-[#A85F69]">
              {selectedTag}
            </span>

            <button
              type="button"
              onClick={handleClearFilter}
              className="ml-auto text-xs font-semibold text-[#B77D80] hover:underline"
            >
              ล้างตัวกรอง ×
            </button>
          </div>
        )}

        {/* LOADING */}
        {loadingReviews && (
          <ReviewSkeleton count={3} />
        )}

        {/* ERROR */}
        {!loadingReviews && feedError && (
          <Card className="rounded-2xl border-[#F1D9D2] bg-white/90">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">

              <div className="text-3xl">
                📚
              </div>

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

        {/* EMPTY FEED */}
        {!loadingReviews &&
          !feedError &&
          reviews.length === 0 && (
            <Card className="rounded-2xl border-dashed border-[#EBCDC7] bg-white/70">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">

                <div className="text-5xl">
                  📖
                </div>

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

        {/* NO MATCHING TAG */}
        {!loadingReviews &&
          !feedError &&
          selectedTag &&
          filteredReviews.length === 0 &&
          reviews.length > 0 && (
            <div className="rounded-2xl border border-[#F1D9D2] bg-white p-6 text-center">

              <div className="mb-2 text-3xl">
                🔎
              </div>

              <p className="text-sm text-[#98777A]">
                ไม่พบรีวิวที่มีแท็ก "{selectedTag}"
              </p>

              <button
                type="button"
                onClick={handleClearFilter}
                className="mt-3 text-xs font-semibold text-[#B77D80] hover:underline"
              >
                กลับไปดูรีวิวทั้งหมด
              </button>

            </div>
          )}

        {/* FILTERED REVIEWS */}
        {!loadingReviews &&
          !feedError &&
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.ReviewsID}
              review={review}
              selectedTag={selectedTag}
              onTagClick={handleTagClick}
            />
          ))}

      </div>
    </div>
  );
}
