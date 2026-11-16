
import { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  Bookmark,
  Star,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/card";

import { Button } from "./ui/button";

import profileicon from "../assets/profile-icon.png";
import UserAvatar from "./UserAvatar";
import ReviewComments from "./ReviewComments";

import firstLogin from "../assets/pink-cloud-circle-frame-2026.png";
import reviewFive from "../assets/red-fire-abstract-frame.png";
import toponeNOV from "../assets/blue-and-orange-fish-frame.png";
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png";
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png";
import toponeDEC from "../assets/red-cat-yarn-frame.png.png";
import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png";
import topthreeDEC from "../assets/golden-thorn-vines-frame.png";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .replace(/\/+$/, "") + "/api/auth";

// กรอบโปรไฟล์ตาม ID
const FRAME_IMAGES = {
  1: firstLogin,
  2: reviewFive,
  3: toponeNOV,
  4: toptwoNOV,
  5: topthreeNOV,
  6: toponeDEC,
  7: toptwoDEC,
  8: topthreeDEC,
};

export default function ReviewCard({
  review,
  selectedTag,
  onTagClick,
}) {
  // Like
  const [likeCount, setLikeCount] = useState(
    Number(review?.Like_Count) || 0
  );

  const [liked, setLiked] = useState(
    Boolean(review?.Liked_By_Me)
  );

  const [liking, setLiking] = useState(false);

  // Save
  const [saved, setSaved] = useState(
    Boolean(review?.Saved_By_Me)
  );

  const [saving, setSaving] = useState(false);

  // Share
  const [shareOpen, setShareOpen] = useState(false);

  // Expand review text
  const [textExpanded, setTextExpanded] = useState(false);

  // Comments
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Image
  const [imageError, setImageError] = useState(false);

  // รีเซ็ตส่วนที่เปิดอยู่เมื่อเปลี่ยนโพสต์
  useEffect(() => {
    setTextExpanded(false);
    setCommentsOpen(false);
    setShareOpen(false);
    setImageError(false);
  }, [review?.ReviewsID]);

  // ซิงก์ข้อมูล Like / Save
  useEffect(() => {
    setLikeCount(Number(review?.Like_Count) || 0);
    setLiked(Boolean(review?.Liked_By_Me));
    setSaved(Boolean(review?.Saved_By_Me));
  }, [
    review?.ReviewsID,
    review?.Like_Count,
    review?.Liked_By_Me,
    review?.Saved_By_Me,
  ]);

  if (!review) return null;

  const rating = Math.min(
    5,
    Math.max(0, Number(review.Rating) || 0)
  );

  const userName = review.User_Name || "Reader";
  const bookTitle = review.Book_Title || "Untitled book";

  // รูปโปรไฟล์
  const avatarUrl =
    review.User_Avatar_URL ||
    review.User?.User_Avatar_URL ||
    profileicon;

  // กรอบโปรไฟล์
  const activeFrameId = Number(
    review.Active_Frame_RewardsID ??
      review.User?.Active_Frame_RewardsID
  );

  const activeFrameImage =
    FRAME_IMAGES[activeFrameId] || null;

  // รูปรีวิว หรือรูปปกหนังสือ
  const reviewImage =
    review.Image_URL || review.Books_Cover;

  const reviewDate = review.Created_At
    ? new Date(review.Created_At).toLocaleDateString("th-TH")
    : null;

  // รายการแท็ก
 
const tags = [
  review.Main_Category,
  review.Sub_Category,
]
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
        (item) => item.toLowerCase() === tag.toLowerCase()
      ) === index
  );


  const normalizeTag = (value) =>
    String(value ?? "").trim().toLowerCase();

  // LIKE / UNLIKE
  const handleLike = async () => {
    if (liking || !review.ReviewsID) return;

    setLiking(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        alert("กรุณาเข้าสู่ระบบก่อนกดใจ");
        return;
      }

      const response = await fetch(
        `${API_URL}/reviews/${review.ReviewsID}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "กดใจไม่สำเร็จ กรุณาลองใหม่"
        );
      }

      setLiked(Boolean(result.liked));
      setLikeCount(Number(result.likeCount) || 0);
    } catch (error) {
      console.error("[ReviewCard] Like error:", error);
      alert(error.message || "ไม่สามารถกดใจรีวิวได้");
    } finally {
      setLiking(false);
    }
  };

  // SAVE / UNSAVE
  const handleSave = async () => {
    if (saving || !review.ReviewsID) return;

    setSaving(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        alert("กรุณาเข้าสู่ระบบก่อนบันทึกรีวิว");
        return;
      }

      const response = await fetch(
        `${API_URL}/reviews/${review.ReviewsID}/save`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "บันทึกรีวิวไม่สำเร็จ"
        );
      }

      setSaved(Boolean(result.saved));

      // ตรวจสอบรางวัลเมื่อบันทึกสำเร็จ
      if (result.saved) {
        try {
          const rewardResponse = await fetch(
            `${API_URL}/rewards/check`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          const rewardResult = await rewardResponse
            .json()
            .catch(() => ({}));

          if (
            !rewardResponse.ok ||
            rewardResult.success === false
          ) {
            console.error(
              "[REWARDS] ตรวจสอบรางวัลไม่สำเร็จ:",
              rewardResult.message
            );
          } else if (
            rewardResult.newlyUnlocked?.length > 0
          ) {
            console.log(
              "[REWARDS] ปลดล็อกรางวัลใหม่:",
              rewardResult.newlyUnlocked
            );
          }
        } catch (rewardError) {
          console.error(
            "[REWARDS] Error:",
            rewardError
          );
        }
      }
    } catch (error) {
      console.error("[ReviewCard] Save error:", error);
      alert(error.message || "ไม่สามารถบันทึกรีวิวได้");
    } finally {
      setSaving(false);
    }
  };

  // เตรียมข้อมูลสำหรับแชร์
  const getShareData = () => {
    const shareUrl = new URL(window.location.href);

    shareUrl.hash = `review-${review.ReviewsID}`;

    const shareText = [
      `รีวิวหนังสือ: ${bookTitle}`,
      `ผู้รีวิว: ${userName}`,
      `คะแนน: ${rating}/5`,
      review.Review_Text || "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      url: shareUrl.toString(),
      text: shareText,
    };
  };

  // แชร์ไป Social Media
  const handleShare = (platform) => {
    const { url, text } = getShareData();

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    const shareLinks = {
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `${text}\n${url}`
      )}`,
    };

    const targetUrl = shareLinks[platform];

    if (!targetUrl) return;

    window.open(
      targetUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setShareOpen(false);
  };

  // คัดลอกลิงก์
  const handleCopyLink = async () => {
    const { url } = getShareData();

    try {
      if (!navigator.clipboard?.writeText) {
        window.prompt("คัดลอกลิงก์รีวิวนี้", url);
        setShareOpen(false);
        return;
      }

      await navigator.clipboard.writeText(url);
      alert("คัดลอกลิงก์รีวิวแล้ว");
      setShareOpen(false);
    } catch (error) {
      console.error(
        "[ReviewCard] Copy link error:",
        error
      );

      window.prompt("คัดลอกลิงก์รีวิวนี้", url);
    }
  };

  return (
    <Card
      id={`review-${review.ReviewsID}`}
      className="mx-auto w-full max-w-xl gap-0 overflow-hidden rounded-2xl border border-[#F1D9D2] bg-white py-0 shadow-sm"
    >

      {/* PROFILE */}
      <CardHeader className="flex flex-row items-center gap-3 px-4 py-3">

        <UserAvatar
          avatarUrl={avatarUrl}
          userName={userName}
          frameImage={activeFrameImage}
          size={40}
          frameScale={1.3}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#684B50] sm:text-base">
            {userName}
          </p>

          {reviewDate && (
            <time className="text-xs text-[#B18A8D]">
              {reviewDate}
            </time>
          )}
        </div>
      </CardHeader>

      {/* REVIEW CONTENT */}
      <CardContent className="px-4 pb-3">
        <div className="space-y-2.5">

          {/* BOOK TITLE */}
          <h3 className="break-words text-base font-bold text-[#684B50]">
            {bookTitle}
          </h3>

          {/* RATING */}
          <div
            className="flex items-center gap-0.5"
            aria-label={`คะแนน ${rating} จาก 5 ดาว`}
            role="img"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= rating
                    ? "fill-[#F2C66D] text-[#F2C66D]"
                    : "text-[#E8DAD5]"
                }`}
              />
            ))}
          </div>

          {/* CLICKABLE TAGS */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">

              {tags.map((tag, index) => {
                const isActive =
                  normalizeTag(selectedTag) ===
                  normalizeTag(tag);

                return (
                  <button
                    key={`${tag}-${index}`}
                    type="button"
                    onClick={() => onTagClick?.(tag)}
                    aria-pressed={isActive}
                    className={`
                      max-w-full rounded-full border
                      px-2.5 py-1 text-left text-[11px]
                      font-medium transition-all duration-200
                      hover:border-[#D99BA0]
                      hover:bg-[#FFF1EE]
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-[#B77D80]
                      ${
                        isActive
                          ? "border-[#D99BA0] bg-[#F9DFE0] text-[#A85F69]"
                          : "border-[#E8D5D0] bg-white text-[#80676A]"
                      }
                    `}
                  >
                    <span className="break-words">
                      {tag}
                    </span>
                  </button>
                );
              })}

            </div>
          )}

          {/* REVIEW TEXT */}
          {review.Review_Text && (
            <div>
              <p
                className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#80676A]"
                style={
                  textExpanded
                    ? undefined
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                }
              >
                {review.Review_Text}
              </p>

              {review.Review_Text.length > 160 && (
                <button
                  type="button"
                  onClick={() =>
                    setTextExpanded((value) => !value)
                  }
                  aria-expanded={textExpanded}
                  className="mt-1 text-xs font-semibold text-[#B77D80] hover:underline"
                >
                  {textExpanded
                    ? "แสดงน้อยลง"
                    : "อ่านเพิ่มเติม"}
                </button>
              )}
            </div>
          )}

          {/* REVIEW IMAGE WITH BLURRED BACKGROUND */}
          {reviewImage && !imageError && (
            <div className="relative mt-2 h-[210px] w-full overflow-hidden rounded-xl bg-[#F8F0ED] sm:h-[240px]">

              {/* พื้นหลังเบลอ */}
              <img
                src={reviewImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-white/15" />

              {/* รูปจริง */}
              <img
                src={reviewImage}
                alt={`รูปประกอบรีวิว ${bookTitle}`}
                loading="lazy"
                className="relative z-10 h-full w-full object-contain"
                onError={() => setImageError(true)}
              />

            </div>
          )}

        </div>
      </CardContent>

      {/* ACTION BUTTONS */}
      <CardFooter className="flex flex-wrap items-center justify-between gap-1 border-t border-[#F1D9D2] px-3 py-1.5">

        {/* LIKE */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={liking}
          aria-pressed={liked}
          aria-label={liked ? "Unlike review" : "Like review"}
          className={`min-w-0 gap-1.5 px-2 ${
            liked
              ? "text-pink-600"
              : "text-muted-foreground hover:text-pink-500"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${
              liked
                ? "fill-current text-pink-500"
                : ""
            }`}
          />

          <span className="text-xs">
            {liking ? "..." : `Like ${likeCount}`}
          </span>
        </Button>

        {/* SHARE */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            setShareOpen((open) => !open)
          }
          aria-label="Share review"
          aria-expanded={shareOpen}
          className="min-w-0 gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
        >
          <Share2 className="h-4 w-4" />

          <span className="text-xs">
            Share
          </span>
        </Button>

        {/* SAVE */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          aria-pressed={saved}
          aria-label={saved ? "Unsave review" : "Save review"}
          className={`min-w-0 gap-1.5 px-2 ${
            saved
              ? "text-amber-600"
              : "text-muted-foreground hover:text-pink-500"
          }`}
        >
          <Bookmark
            className={`h-4 w-4 ${
              saved ? "fill-current" : ""
            }`}
          />

          <span className="text-xs">
            {saving
              ? "..."
              : saved
                ? "Saved"
                : "Save"}
          </span>
        </Button>

        {/* COMMENTS */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            setCommentsOpen((value) => !value)
          }
          aria-expanded={commentsOpen}
          className="min-w-0 gap-1 px-2 text-[#80676A] hover:text-[#B77D80]"
        >
          <MessageCircle className="h-4 w-4" />

          <span className="text-xs">
            ความคิดเห็น
          </span>

          {commentsOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

      </CardFooter>

      {/* COMMENTS SECTION */}
      {commentsOpen && (
        <ReviewComments reviewId={review.ReviewsID} />
      )}

      {/* SHARE MENU */}
      {shareOpen && (
        <div className="border-t border-[#F1D9D2] p-3">

          <p className="mb-3 text-sm font-semibold text-[#684B50]">
            แชร์รีวิวไปยัง
          </p>

          <div className="flex flex-wrap gap-2">

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShare("x")}
            >
              X (Twitter)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShare("facebook")}
            >
              Facebook
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShare("line")}
            >
              LINE
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShare("whatsapp")}
            >
              WhatsApp
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              Copy link
            </Button>

          </div>
        </div>
      )}

    </Card>
  );
}
