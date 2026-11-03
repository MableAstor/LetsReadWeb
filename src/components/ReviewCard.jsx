
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart, Share2, Bookmark, Star } from "lucide-react";

import { supabase } from "../lib/supabase";

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

export default function ReviewCard({
  review,
  onLike,
  onSave,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sharing, setSharing] = useState(false);

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

  // ตรวจสอบ Login ก่อนทำรายการ
  const requireLogin = async () => {
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
      console.error("[ReviewCard] Login check error:", error);
      alert("ไม่สามารถตรวจสอบสถานะเข้าสู่ระบบได้ กรุณาลองใหม่");
      return false;
    }
  };

  const handleLike = async () => {
    const allowed = await requireLogin();

    if (!allowed) return;

    if (onLike) {
      await onLike(review);
    } else {
      alert("ระบบ Like กำลังรอเชื่อมต่อกับฐานข้อมูล");
    }
  };

  const handleSave = async () => {
    const allowed = await requireLogin();

    if (!allowed) return;

    if (onSave) {
      await onSave(review);
    } else {
      alert("ระบบ Save กำลังรอเชื่อมต่อกับฐานข้อมูล");
    }
  };

  // แชร์รีวิว
  const handleShare = async () => {
    if (sharing) return;

    setSharing(true);

    try {
      const shareUrl = window.location.href;

      const shareData = {
        title: `รีวิวหนังสือ ${bookTitle}`,
        text: `รีวิวหนังสือ ${bookTitle} โดย ${userName}`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareUrl}`
        );

        alert("คัดลอกลิงก์เรียบร้อยแล้ว");
      } else {
        alert("เบราว์เซอร์นี้ไม่รองรับการแชร์");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("[ReviewCard] Share error:", error);
        alert("แชร์ไม่สำเร็จ กรุณาลองใหม่");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl gap-0 overflow-hidden rounded-2xl border-[#F1D9D2] bg-white/95 py-0 shadow-sm transition-shadow hover:shadow-md">

      {/* Reviewer profile */}
      <CardHeader className="flex flex-row items-center gap-3 px-4 py-4 sm:px-5">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-[#F8E7E3]">
          <AvatarImage src={profileicon} alt={userName} />
          <AvatarFallback className="bg-[#F8E7E3] text-[#B77D80]">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

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

      {/* Review content */}
      <CardContent className="px-4 pb-4 sm:px-5">
        <div className="space-y-3 rounded-xl border border-[#F1D9D2] bg-[#FFFAF8] p-3 sm:p-4">

          {/* Book title and rating */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 break-words text-base font-bold text-[#684B50]">
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
                  className={`h-4 w-4 ${
                    star <= rating
                      ? "fill-[#F2C66D] text-[#F2C66D]"
                      : "text-[#E8DAD5]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          {(review.Main_Category || review.Sub_Category) && (
            <div className="flex flex-wrap gap-2">
              {review.Main_Category && (
                <Badge className="rounded-full border-0 bg-[#F8E5E1] px-3 text-[#A76F75] hover:bg-[#F8E5E1]">
                  {review.Main_Category}
                </Badge>
              )}

              {review.Sub_Category && (
                <Badge className="rounded-full border-0 bg-[#FCEFD9] px-3 text-[#A78350] hover:bg-[#FCEFD9]">
                  {review.Sub_Category}
                </Badge>
              )}
            </div>
          )}

          {/* Review text */}
          {review.Review_Text && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#80676A]">
              {review.Review_Text}
            </p>
          )}

          {/* Review image */}
          {review.Image_URL && (
            <img
              src={review.Image_URL}
              alt={`รูปประกอบรีวิว ${bookTitle}`}
              loading="lazy"
              className="mt-3 max-h-[400px] w-full rounded-xl bg-[#F8F0ED] object-contain"
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
      <CardFooter className="flex items-center justify-between gap-1 border-t border-[#F5E6E1] px-3 py-2 sm:px-5">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="gap-1.5 rounded-full px-3 text-[#98777A] hover:bg-[#FCEAE8] hover:text-[#D47F89]"
            aria-label="Like review"
          >
            <Heart className="h-4 w-4" />
            <span>Like</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={sharing}
            className="gap-1.5 rounded-full px-3 text-[#98777A] hover:bg-[#FCEAE8] hover:text-[#B77D80]"
            aria-label="Share review"
          >
            <Share2 className="h-4 w-4" />
            <span>{sharing ? "Sharing..." : "Share"}</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="gap-1.5 rounded-full px-3 text-[#98777A] hover:bg-[#FCEAE8] hover:text-[#B77D80]"
          aria-label="Save review"
        >
          <Bookmark className="h-4 w-4" />
          <span>Save</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
