
import { useEffect, useState } from "react";
import camerapc from "../assets/photo-camera.png";
import { supabase } from "../lib/supabase";

const API_URL = "http://localhost:5000/api/auth";
const STORAGE_BUCKET = "review-images";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

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

  // คืนพื้นที่หน่วยความจำของภาพตัวอย่างเมื่อเปลี่ยนรูปหรือปิดหน้าต่าง
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ========================================
  // เลือกรูปและแสดงตัวอย่าง
  // ========================================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        "รองรับเฉพาะไฟล์ JPG, PNG, WEBP และ GIF"
      );

      setImageFile(null);
      setImagePreview(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("รูปภาพต้องมีขนาดไม่เกิน 5 MB");

      setImageFile(null);
      setImagePreview(null);
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  // ========================================
  // อัปโหลดรูปไป Supabase Storage
  // ========================================
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

    // แยกโฟลเดอร์ตามผู้ใช้และตั้งชื่อไฟล์ไม่ให้ซ้ำกัน
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
      console.error("[Review] Image upload error:", uploadError);

      throw new Error(
        `อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}`
      );
    }

    // สร้าง URL สำหรับให้หน้า Feed แสดงรูป
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imagePath);

    if (!data?.publicUrl) {
      throw new Error("ไม่สามารถสร้าง URL ของรูปได้");
    }

    console.log("[Review] Uploaded image:", data.publicUrl);

    return data.publicUrl;
  };

  // ========================================
  // บันทึกรีวิวลง Reviews_Test
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setErrorMessage("");

    if (!bookName.trim()) {
      setErrorMessage("กรุณากรอกชื่อหนังสือ");
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
      // 1. ตรวจสอบ Session ของผู้ใช้
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token || !session?.user?.id) {
        throw new Error(
          "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว"
        );
      }

      // 2. อัปโหลดรูปก่อน (หากผู้ใช้เลือกรูปไว้)
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadReviewImage(
          imageFile,
          session.user.id
        );
      }

      // 3. ส่งข้อมูลรีวิวและ URL รูปไปยัง Backend
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

      console.log("[Review] Saved:", result.review);

      // 4. โหลดรีวิวใหม่บนหน้า Feed
      if (onReviewPosted) {
        await onReviewPosted();
      }

      alert("โพสต์รีวิวสำเร็จ!");
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

  // ========================================
  // UI
  // ========================================
  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <h2 className="text-xl font-bold mb-6">
          Write a Review
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Photo preview */}
            <div className="border border-gray-950 rounded-xl w-full md:w-60 h-64 flex items-center justify-center flex-col gap-3 overflow-hidden shrink-0">
              <label
                htmlFor="review-image"
                className="w-full h-full flex items-center justify-center flex-col gap-3 cursor-pointer"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Review preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={camerapc}
                      alt="Camera"
                      className="h-15 w-15"
                    />

                    <p className="text-gray-500">
                      Add a photo
                    </p>
                  </>
                )}
              </label>

              <input
                id="review-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Review details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="review-book-name"
                    className="block text-lg text-gray-950 font-bold pb-1"
                  >
                    Book name:
                  </label>

                  <input
                    id="review-book-name"
                    type="text"
                    placeholder="Enter book name..."
                    value={bookName}
                    onChange={(e) =>
                      setBookName(e.target.value)
                    }
                    className="border border-gray-950 rounded-xl w-full h-10 px-3"
                    maxLength={200}
                    required
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="review-main-category"
                    className="block text-lg text-gray-950 font-bold pb-1"
                  >
                    Main category:
                  </label>

                  <select
                    id="review-main-category"
                    value={mainCategory}
                    onChange={(e) =>
                      setMainCategory(e.target.value)
                    }
                    className="border border-gray-950 rounded-xl w-full h-10 px-2"
                  >
                    <option value="">
                      Select category...
                    </option>
                    <option value="Fiction">Fiction</option>
                    <option value="Romance">Romance</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Mystery">Mystery</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 mt-5">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="review-sub-category"
                    className="block text-lg text-gray-950 font-bold pb-1"
                  >
                    Sub category:
                  </label>

                  <input
                    id="review-sub-category"
                    type="text"
                    placeholder="Enter sub category..."
                    value={subCategory}
                    onChange={(e) =>
                      setSubCategory(e.target.value)
                    }
                    className="border border-gray-950 rounded-xl w-full h-10 px-3"
                    maxLength={100}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg text-gray-950 font-bold pb-1">
                    Rating Star:
                  </p>

                  <div className="h-10 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} stars`}
                        aria-pressed={rating === star}
                        onClick={() => setRating(star)}
                        className={`p-0 text-5xl leading-none transition ${
                          star <= rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor="review-text"
                  className="block font-bold mb-1"
                >
                  Your review:
                </label>

                <textarea
                  id="review-text"
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value)
                  }
                  className="w-full h-32 resize-none rounded-lg border border-gray-950 p-3 outline-none"
                  maxLength={5000}
                  required
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600"
            >
              {errorMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2 cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-black text-white px-5 py-2 disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
