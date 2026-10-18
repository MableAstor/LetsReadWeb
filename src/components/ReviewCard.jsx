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

export default function ReviewCard({ review }) {
  if (!review) return null;

  const rating = Math.min(5, Math.max(0, Number(review.Rating) || 0));
  const userName = review.User_Name || "Reader";
  const bookTitle = review.Book_Title || "Untitled book";
  const reviewDate = review.Created_At
    ? new Date(review.Created_At).toLocaleDateString("th-TH")
    : null;

  return (
    <Card className="mx-auto w-full max-w-2xl gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-sm">
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
                  <span className="break-words">{review.Main_Category}</span>
                </Badge>
              )}

              {review.Sub_Category && (
                <Badge
                  variant="outline"
                  className="max-w-full rounded-full px-3 py-1 font-normal"
                >
                  <span className="break-words">{review.Sub_Category}</span>
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
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-w-0 gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
          aria-label="Like review"
        >
          <Heart className="h-4 w-4" />
          <span>Like</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-w-0 gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
          aria-label="Share review"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-w-0 gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
          aria-label="Save review"
        >
          <Bookmark className="h-4 w-4" />
          <span>Save</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
