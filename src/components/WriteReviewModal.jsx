
import { useEffect, useState } from "react";
import { Camera, Star, X } from "lucide-react";
import { supabase } from "../lib/supabase";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const API_URL = "http://localhost:5000/api/auth";
const STORAGE_BUCKET = "review-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function WriteReviewModal({
  onClose,
  onReviewPosted,
}) {
  const [rating, setRating] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bookName, setBookName] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // สร้าง Preview และคืนหน่วยความจำเมื่อเปลี่ยนรูป
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // ตรวจสอบไฟล์รูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        "รองรับเฉพาะไฟล์ JPG, PNG, WEBP และ GIF"
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("รูปภาพต้องมีขนาดไม่เกิน 5 MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setErrorMessage("");
  };

  // อัปโหลดรูปภาพไป Supabase Storage
  const uploadReviewImage = async (file, userId) => {
    const extensionByType = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const extension = extensionByType[file.type];

    if (!extension) {
      throw new Error("ชนิดไฟล์รูปภาพไม่รองรับ");
    }

    const imagePath =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imagePath);

    if (!data?.publicUrl) {
      throw new Error("ไม่สามารถสร้าง URL ของรูปได้");
    }

    return data.publicUrl;
  };

  // บันทึกรีวิว
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setErrorMessage("");

    if (!bookName.trim()) {
      setErrorMessage("กรุณากรอกชื่อหนังสือ");
      return;
    }

    if (!mainCategory) {
      setErrorMessage("กรุณาเลือกหมวดหมู่หนังสือ");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage("กรุณาเลือกคะแนน 1–5 ดาว");
      return;
    }

    if (!reviewText.trim()) {
      setErrorMessage("กรุณาเขียนข้อความรีวิว");
      return;
    }

    setSubmitting(true);

    try {
      // 1. ตรวจสอบ Session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token || !session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนเขียนรีวิว");
      }

      // 2. อัปโหลดรูป หากผู้ใช้เลือกรูปไว้
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadReviewImage(
          imageFile,
          session.user.id
        );
      }

      // 3. ส่งข้อมูลไป Backend
      const response = await fetch(
        `${API_URL}/reviews/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            bookName: bookName.trim(),
            mainCategory,
            subCategory: subCategory.trim(),
            rating,
            reviewText: reviewText.trim(),
            imageUrl,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "บันทึกรีวิวไม่สำเร็จ"
        );
      }

      // 4. รีเฟรชข้อมูล Feed
      if (onReviewPosted) {
        await onReviewPosted();
      }

      onClose();
    } catch (error) {
      console.error("[Review] Submit error:", error);

      setErrorMessage(
        error.message || "เกิดข้อผิดพลาดขณะบันทึกรีวิว"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
    >
      <DialogContent
        className="
          !w-[calc(100vw-2rem)]
          !max-w-[900px]
          max-h-[85dvh]
          overflow-x-hidden overflow-y-auto
          p-4 sm:p-6
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Write a Review
          </DialogTitle>
          <DialogDescription>
            Share your thoughts about a book.
          </DialogDescription>
        </DialogHeader>

        <form
          id="review-form"
          onSubmit={handleSubmit}
          className="
            grid w-full min-w-0
            grid-cols-1 gap-4
            lg:grid-cols-[240px_minmax(0,1fr)]
            lg:gap-6
          "
        >
          {/* Book Photo */}
          <div className="space-y-2">
            <Label htmlFor="review-image">Book Photo</Label>

            <label
              htmlFor="review-image"
              className="
                relative mx-auto block
                h-[140px] w-[112px]
                cursor-pointer overflow-hidden
                rounded-xl border-2 border-dashed
                border-border bg-muted/40
                transition-colors hover:bg-muted
                lg:mx-0 lg:aspect-[3/4]
                lg:h-auto lg:w-full
              "
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected book preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="
                    absolute inset-0 flex flex-col
                    items-center justify-center
                    gap-2 text-center
                  "
                >
                  <Camera className="h-10 w-10 shrink-0 text-muted-foreground" />
                  <span className="text-sm leading-none text-muted-foreground">
                    Add a photo
                  </span>
                </div>
              )}
            </label>

            <Input
              id="review-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="sr-only"
              disabled={submitting}
            />

            {imageFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={submitting}
                onClick={() => {
                  setImageFile(null);
                  setErrorMessage("");

                  const input = document.getElementById(
                    "review-image"
                  );

                  if (input) input.value = "";
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Remove photo
              </Button>
            )}
          </div>

          {/* Review Details */}
          <div className="min-w-0 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="book-name">Book Name</Label>
                <Input
                  id="book-name"
                  placeholder="Enter book name..."
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  maxLength={200}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Main Category</Label>
                <Select
                  value={mainCategory}
                  onValueChange={setMainCategory}
                  disabled={submitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Horror">Horror</SelectItem>
                    <SelectItem value="Historical Fiction">
                      Historical Fiction
                    </SelectItem>
                    <SelectItem value="Yaoi">Yaoi</SelectItem>
                    <SelectItem value="Yuri">Yuri</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-category">
                  Subcategory
                </Label>
                <Input
                  id="sub-category"
                  placeholder="Enter subcategory..."
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  maxLength={100}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div
                  className="flex h-10 items-center gap-1"
                  role="group"
                  aria-label="Book rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      aria-pressed={rating === star}
                      disabled={submitting}
                      className="
                        cursor-pointer rounded-sm p-1
                        transition-transform hover:scale-110
                        focus-visible:outline-2
                        focus-visible:outline-ring
                        disabled:cursor-not-allowed
                      "
                    >
                      <Star
                        className={
                          star <= rating
                            ? "h-7 w-7 fill-yellow-400 text-yellow-400"
                            : "h-7 w-7 text-muted-foreground/40"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-text">Your Review</Label>
              <Textarea
                id="review-text"
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px] resize-y md:min-h-36"
                maxLength={5000}
                required
                disabled={submitting}
              />
            </div>
          </div>
        </form>

        {errorMessage && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {errorMessage}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="review-form"
            disabled={submitting}
            className="bg-pink-500 text-white hover:bg-pink-600"
          >
            {submitting ? "Posting..." : "Post Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
