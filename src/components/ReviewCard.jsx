import { useEffect, useState } from "react";
import { Heart, Share2, Bookmark, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import profileicon from "../assets/profile-icon.png";
import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

export default function ReviewCard({ review }) {
  // สถานะหัวใจและจำนวนหัวใจ
  const [likeCount, setLikeCount] = useState(
    Number(review?.Like_Count) || 0
  );

  const [liked, setLiked] = useState(
    Boolean(review?.Liked_By_Me)
  );

  const [liking, setLiking] = useState(false);

  // สถานะการบันทึกรีวิว
  const [saved, setSaved] = useState(
    Boolean(review?.Saved_By_Me)
  );

  const [saving, setSaving] = useState(false);

  // สถานะเมนูแชร์
  const [shareOpen, setShareOpen] = useState(false);

  // อัปเดตสถานะเมื่อได้รับข้อมูลรีวิวใหม่จาก Feed
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

  const reviewDate = review.Created_At
    ? new Date(review.Created_At).toLocaleDateString("th-TH")
    : null;

  // ======================================================
  // LIKE / UNLIKE REVIEW
  // ======================================================
  const handleLike = async () => {
    if (liking || !review.ReviewsID) return;

    setLiking(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

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

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "กดใจไม่สำเร็จ กรุณาลองใหม่"
        );
      }

      setLiked(Boolean(result.liked));
      setLikeCount(Number(result.likeCount) || 0);
    } catch (error) {
      console.error("[ReviewCard] Like error:", error);

      alert(
        error.message || "ไม่สามารถกดใจรีวิวได้ กรุณาลองใหม่"
      );
    } finally {
      setLiking(false);
    }
  };

  // ======================================================
  // SAVE / UNSAVE REVIEW
  // ======================================================
  const handleSave = async () => {
    if (saving || !review.ReviewsID) return;

    setSaving(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

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

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "บันทึกรีวิวไม่สำเร็จ"
        );
      }

      setSaved(Boolean(result.saved));
    } catch (error) {
      console.error("[ReviewCard] Save error:", error);

      alert(
        error.message || "ไม่สามารถบันทึกรีวิวได้"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // เตรียมข้อมูลสำหรับแชร์
  // ======================================================
  const getShareData = () => {
    const shareUrl = new URL(window.location.href);

    // ระบุตำแหน่งรีวิวที่ต้องการแชร์
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

  // ======================================================
  // SHARE REVIEW TO SOCIAL MEDIA
  // ======================================================
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

    // เปิดหน้าสำหรับแชร์ของ Social Media ที่เลือก
    window.open(targetUrl, "_blank", "noopener,noreferrer");

    setShareOpen(false);
  };

  // ======================================================
  // COPY REVIEW LINK
  // ======================================================
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
      console.error("[ReviewCard] Copy link error:", error);

      window.prompt("คัดลอกลิงก์รีวิวนี้", url);
    }
  };

  return (
    <Card
      id={`review-${review.ReviewsID}`}
      className="mx-auto w-full max-w-2xl gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-sm"
    >
      {/* Reviewer profile */}
      <CardHeader className="flex flex-row items-center gap-3 px-3 py-3 sm:px-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={profileicon} alt={userName} />

          <AvatarFallback className="bg-pink-100 text-pink-600">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold sm:text-base">
          {userName}
        </span>

        {reviewDate && (
          <time className="shrink-0 text-xs text-muted-foreground sm:text-sm">
            {reviewDate}
          </time>
        )}
      </CardHeader>

      {/* Review content */}
      <CardContent className="px-3 pb-3 sm:px-4">
        <div className="min-w-0 space-y-3 rounded-lg border border-border p-3 sm:p-4">
          {/* Book title and rating */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="min-w-0 break-words text-sm font-semibold sm:text-base">
              {bookTitle}
            </h3>

            <div
              className="flex shrink-0 items-center gap-0.5"
              aria-label={`คะแนน ${rating} จาก 5 ดาว`}
              role="img"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-transparent text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          {(review.Main_Category || review.Sub_Category) && (
            <div className="flex flex-wrap gap-2">
              {review.Main_Category && (
                <Badge
                  variant="outline"
                  className="max-w-full rounded-full px-3 py-1 font-normal"
                >
                  <span className="break-words">
                    {review.Main_Category}
                  </span>
                </Badge>
              )}

              {review.Sub_Category && (
                <Badge
                  variant="outline"
                  className="max-w-full rounded-full px-3 py-1 font-normal"
                >
                  <span className="break-words">
                    {review.Sub_Category}
                  </span>
                </Badge>
              )}
            </div>
          )}

          {/* Review text */}
          {review.Review_Text && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
              {review.Review_Text}
            </p>
          )}

          {/* Image from Supabase Storage */}
          {review.Image_URL && (
            <img
              src={review.Image_URL}
              alt={`รูปประกอบรีวิว ${bookTitle}`}
              loading="lazy"
              className="mt-3 max-h-[400px] w-full rounded-lg bg-muted/30 object-contain"
              onError={(event) => {
                console.error(
                  "[ReviewCard] โหลดรูปไม่สำเร็จ:",
                  review.Image_URL
                );

                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex items-center justify-around gap-1 border-t px-2 py-2 sm:justify-start sm:gap-4 sm:px-4">
        {/* Like */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
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
              liked ? "fill-current text-pink-500" : ""
            }`}
          />

          <span>
            {liking ? "..." : `Like ${likeCount}`}
          </span>
        </Button>

        {/* Share */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => setShareOpen((open) => !open)}
          aria-label="Share review"
          aria-expanded={shareOpen}
          className="min-w-0 gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        {/* Save */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
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

          <span>
            {saving ? "..." : saved ? "Saved" : "Save"}
          </span>
        </Button>
      </CardFooter>

      {/* Social sharing menu */}
      {shareOpen && (
        <div className="border-t border-border p-3 sm:p-4">
          <p className="mb-3 text-sm font-semibold">
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