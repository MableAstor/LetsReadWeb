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

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

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

  // รูปประกอบรีวิว
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ค้นหาและเลือกหนังสือจากฐานข้อมูล
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookResults, setBookResults] = useState([]);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [bookSearchError, setBookSearchError] = useState("");

  // เพิ่มหนังสือใหม่
  const [isAddingNewBook, setIsAddingNewBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookSynopsis, setNewBookSynopsis] = useState("");
  const [bookCoverFile, setBookCoverFile] = useState(null);
  const [bookCoverPreview, setBookCoverPreview] = useState(null);

  // ตรวจสอบหนังสือชื่อซ้ำ
  const [duplicateBook, setDuplicateBook] = useState(null);

  // ข้อมูลรีวิว
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [reviewText, setReviewText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // ค้นหาหนังสือจากตาราง Books
  // ======================================================
  useEffect(() => {
    const search = bookSearch.trim();

    if (!search || selectedBook || isAddingNewBook) {
      setBookResults([]);
      setSearchingBooks(false);
      setBookSearchError("");
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearchingBooks(true);
      setBookSearchError("");

      try {
        const response = await fetch(
          `${API_URL}/library/books?search=${encodeURIComponent(search)}`
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "ค้นหาหนังสือไม่สำเร็จ"
          );
        }

        if (!cancelled) {
          setBookResults(
            Array.isArray(result.books) ? result.books : []
          );
        }
      } catch (error) {
        console.error("[Review] Search books error:", error);

        if (!cancelled) {
          setBookResults([]);
          setBookSearchError(
            error instanceof Error
              ? error.message
              : "ไม่สามารถค้นหาหนังสือได้"
          );
        }
      } finally {
        if (!cancelled) {
          setSearchingBooks(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [bookSearch, selectedBook, isAddingNewBook]);

  // ======================================================
  // Preview รูปประกอบรีวิว
  // ======================================================
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

  // ======================================================
  // Preview รูปปกหนังสือใหม่
  // ======================================================
  useEffect(() => {
    if (!bookCoverFile) {
      setBookCoverPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(bookCoverFile);

    setBookCoverPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [bookCoverFile]);

  // ======================================================
  // เลือกหนังสือที่มีอยู่แล้ว
  // ======================================================
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setBookSearch(book.Books_title || "");
    setBookResults([]);
    setBookSearchError("");
    setIsAddingNewBook(false);
    setDuplicateBook(null);
    setErrorMessage("");
  };

  // ======================================================
  // เปลี่ยนหนังสือที่เลือก
  // ======================================================
  const handleChangeBook = () => {
    setSelectedBook(null);
    setBookSearch("");
    setBookResults([]);
    setBookSearchError("");
    setDuplicateBook(null);
    setErrorMessage("");
  };

  // ======================================================
  // เริ่มเพิ่มหนังสือใหม่
  // ======================================================
  const handleStartAddBook = () => {
    setIsAddingNewBook(true);
    setNewBookTitle(bookSearch.trim());
    setNewBookSynopsis("");
    setBookCoverFile(null);
    setSelectedBook(null);
    setBookResults([]);
    setBookSearchError("");
    setDuplicateBook(null);
    setErrorMessage("");
  };

  // ======================================================
  // ยกเลิกการเพิ่มหนังสือใหม่
  // ======================================================
  const handleCancelAddBook = () => {
    setIsAddingNewBook(false);
    setNewBookTitle("");
    setNewBookSynopsis("");
    setBookCoverFile(null);
    setDuplicateBook(null);
    setErrorMessage("");
  };

  // ======================================================
  // ตรวจสอบไฟล์รูปประกอบรีวิว
  // ======================================================
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

  // ======================================================
  // ตรวจสอบไฟล์รูปปกหนังสือ
  // ======================================================
  const handleBookCoverChange = (e) => {
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
      setErrorMessage("รูปปกต้องมีขนาดไม่เกิน 5 MB");
      e.target.value = "";
      return;
    }

    setBookCoverFile(file);
    setErrorMessage("");
  };

  // ======================================================
  // อัปโหลดรูปประกอบรีวิว
  // ======================================================
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
        `อัปโหลดรูปรีวิวไม่สำเร็จ: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imagePath);

    if (!data?.publicUrl) {
      throw new Error("ไม่สามารถสร้าง URL ของรูปรีวิวได้");
    }

    return data.publicUrl;
  };

  // ======================================================
  // อัปโหลดรูปปกหนังสือ
  // ======================================================
  const uploadBookCover = async (file, userId) => {
    const extensionByType = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const extension = extensionByType[file.type];

    if (!extension) {
      throw new Error("ชนิดไฟล์รูปปกไม่รองรับ");
    }

    const imagePath =
      `${userId}/book-cover-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `อัปโหลดรูปปกไม่สำเร็จ: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imagePath);

    if (!data?.publicUrl) {
      throw new Error("ไม่สามารถสร้าง URL ของรูปปกได้");
    }

    return data.publicUrl;
  };

  // ======================================================
  // ตรวจสอบชื่อหนังสือซ้ำ
  // ======================================================
  const checkDuplicateBook = async (title) => {
    const response = await fetch(
      `${API_URL}/library/books?search=${encodeURIComponent(title)}`
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || "ไม่สามารถตรวจสอบชื่อหนังสือได้"
      );
    }

    const normalizedTitle = title
      .trim()
      .toLocaleLowerCase();

    const duplicate = (result.books || []).find(
      (book) =>
        String(book.Books_title || "")
          .trim()
          .toLocaleLowerCase() === normalizedTitle
    );

    return duplicate || null;
  };

  // ======================================================
  // บันทึกรีวิวและหนังสือใหม่ (ถ้ามี)
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setErrorMessage("");

    // ตรวจสอบข้อมูลหนังสือ
    if (isAddingNewBook) {
      if (!newBookTitle.trim()) {
        setErrorMessage("กรุณากรอกชื่อหนังสือ");
        return;
      }

      if (!newBookSynopsis.trim()) {
        setErrorMessage("กรุณากรอกเรื่องย่อหนังสือ");
        return;
      }

      if (!bookCoverFile) {
        setErrorMessage("กรุณาเลือกรูปปกหนังสือ");
        return;
      }
    } else if (!selectedBook?.BooksID) {
      setErrorMessage(
        "กรุณาค้นหาและเลือกหนังสือจากฐานข้อมูลก่อนเขียนรีวิว"
      );
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

      // ======================================================
      // 2. ตรวจสอบชื่อหนังสือซ้ำก่อนอัปโหลดรูป
      // ทำเฉพาะกรณีเพิ่มหนังสือใหม่
      // ======================================================
      if (isAddingNewBook) {
        const duplicate = await checkDuplicateBook(
          newBookTitle
        );

        if (duplicate) {
          setDuplicateBook(duplicate);
          setErrorMessage("");
          return;
        }

        setDuplicateBook(null);
      }

      // ======================================================
      // 3. อัปโหลดรูปปก หากเป็นหนังสือใหม่
      // ======================================================
      let newBook = null;

      if (isAddingNewBook) {
        const bookCoverUrl = await uploadBookCover(
          bookCoverFile,
          session.user.id
        );

        newBook = {
          title: newBookTitle.trim(),
          synopsis: newBookSynopsis.trim(),
          coverUrl: bookCoverUrl,
        };
      }

      // ======================================================
      // 4. อัปโหลดรูปประกอบรีวิว หากมี
      // ======================================================
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadReviewImage(
          imageFile,
          session.user.id
        );
      }

      // ======================================================
      // 5. ส่งข้อมูลไป Backend
      // ======================================================
      const response = await fetch(
        `${API_URL}/reviews/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            BooksID: isAddingNewBook
              ? null
              : selectedBook.BooksID,

            newBook,

            mainCategory,
            subCategory: subCategory.trim(),
            rating,
            reviewText: reviewText.trim(),
            imageUrl,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      // ======================================================
      // 6. กรณี Backend ตรวจพบชื่อซ้ำ
      // ======================================================
      if (
        response.status === 409 &&
        result.code === "BOOK_ALREADY_EXISTS" &&
        result.existingBook
      ) {
        setDuplicateBook(result.existingBook);
        setErrorMessage("");
        return;
      }

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "บันทึกรีวิวไม่สำเร็จ"
        );
      }

      // ======================================================
      // 7. ตรวจสอบและปลดล็อกรางวัลหลังบันทึกรีวิวสำเร็จ
      // ======================================================
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

        if (!rewardResponse.ok || rewardResult.success === false) {
          console.error(
            "[REWARDS] ตรวจสอบรางวัลไม่สำเร็จ:",
            rewardResult.message
          );
        } else if (rewardResult.newlyUnlocked?.length > 0) {
          console.log(
            "[REWARDS] ปลดล็อกรางวัลใหม่:",
            rewardResult.newlyUnlocked
          );
        }
      } catch (rewardError) {
        // หากตรวจสอบรางวัลผิดพลาด ไม่ให้กระทบการบันทึกรีวิว
        console.error("[REWARDS] Error:", rewardError);
      }

      // ======================================================
      // 8. รีเฟรชข้อมูล Feed
      // ======================================================
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
            <Label htmlFor="review-image">
              Review Photo
            </Label>

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
                  alt="Selected review image"
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
              {/* Search and select book / Add new book */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="book-search">
                  Book Name
                </Label>

                {!isAddingNewBook && !selectedBook && (
                  <>
                    <div className="relative">
                      <Input
                        id="book-search"
                        placeholder="Search books in the database..."
                        value={bookSearch}
                        onChange={(e) => {
                          setBookSearch(e.target.value);
                          setSelectedBook(null);
                          setErrorMessage("");
                          setBookSearchError("");
                          setDuplicateBook(null);
                        }}
                        autoComplete="off"
                        disabled={submitting}
                        aria-expanded={bookResults.length > 0}
                        aria-controls="book-search-results"
                      />

                      {/* Search results */}
                      {bookResults.length > 0 && (
                        <div
                          id="book-search-results"
                          className="
                            absolute z-50 mt-1
                            max-h-64 w-full
                            overflow-y-auto
                            rounded-lg border border-border
                            bg-popover text-popover-foreground
                            shadow-lg
                          "
                        >
                          {bookResults.map((book) => (
                            <button
                              key={book.BooksID}
                              type="button"
                              onClick={() => handleSelectBook(book)}
                              className="
                                flex w-full items-center gap-3
                                border-b border-border/50
                                px-3 py-2 text-left
                                last:border-b-0
                                hover:bg-muted
                                focus-visible:bg-muted
                                focus-visible:outline-none
                              "
                            >
                              {book.Books_Cover ? (
                                <img
                                  src={book.Books_Cover}
                                  alt=""
                                  className="
                                    h-12 w-9 shrink-0
                                    rounded object-cover
                                    bg-muted
                                  "
                                />
                              ) : (
                                <div
                                  className="
                                    flex h-12 w-9 shrink-0
                                    items-center justify-center
                                    rounded bg-muted
                                    text-xs text-muted-foreground
                                  "
                                >
                                  Book
                                </div>
                              )}

                              <span className="min-w-0 flex-1">
                                <span className="block break-words text-sm font-medium">
                                  {book.Books_title}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {searchingBooks && (
                      <p className="text-xs text-muted-foreground">
                        กำลังค้นหาหนังสือ...
                      </p>
                    )}

                    {/* ไม่พบหนังสือ */}
                    {!searchingBooks &&
                      bookSearch.trim() &&
                      !bookSearchError &&
                      bookResults.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          ไม่พบหนังสือที่ตรงกับคำค้นหา
                        </p>
                      )}

                    {/* ปุ่มเพิ่มหนังสือใหม่ แสดงตลอดเวลา */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartAddBook}
                      disabled={submitting}
                      className="w-full border-dashed"
                    >
                      + เพิ่มหนังสือใหม่
                    </Button>

                    {bookSearchError && (
                      <p className="text-xs text-red-600">
                        {bookSearchError}
                      </p>
                    )}
                  </>
                )}

                {/* Selected existing book */}
                {selectedBook && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="break-words text-sm font-semibold text-green-800">
                      เลือกหนังสือแล้ว: {selectedBook.Books_title}
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto px-0 text-green-800 underline"
                      onClick={handleChangeBook}
                      disabled={submitting}
                    >
                      เลือกหนังสือเล่มอื่น
                    </Button>
                  </div>
                )}

                {/* New book form */}
                {isAddingNewBook && (
                  <div className="space-y-4 rounded-lg border border-pink-200 bg-pink-50/40 p-3 sm:p-4">
                    <div>
                      <p className="text-sm font-semibold text-pink-700">
                        เพิ่มหนังสือใหม่
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        หนังสือเล่มนี้จะถูกเพิ่มลงฐานข้อมูล Let Read
                      </p>
                    </div>

                    {/* New book title */}
                    <div className="space-y-2">
                      <Label htmlFor="new-book-title">
                        ชื่อหนังสือ
                      </Label>

                      <Input
                        id="new-book-title"
                        placeholder="กรอกชื่อหนังสือ..."
                        value={newBookTitle}
                        onChange={(e) => {
                          setNewBookTitle(e.target.value);
                          setDuplicateBook(null);
                          setErrorMessage("");
                        }}
                        maxLength={255}
                        required
                        disabled={submitting}
                      />

                      {/* แจ้งเตือนชื่อซ้ำ */}
                      {duplicateBook && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                          <p className="text-sm font-semibold text-amber-800">
                            พบหนังสือชื่อนี้ในฐานข้อมูลแล้ว
                          </p>

                          <p className="mt-1 text-sm text-amber-700">
                            {duplicateBook.Books_title}
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                              handleSelectBook(duplicateBook)
                            }
                            disabled={submitting}
                          >
                            เลือกหนังสือเล่มเดิม
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* New book synopsis */}
                    <div className="space-y-2">
                      <Label htmlFor="new-book-synopsis">
                        เรื่องย่อ
                      </Label>

                      <Textarea
                        id="new-book-synopsis"
                        placeholder="กรอกเรื่องย่อของหนังสือ..."
                        value={newBookSynopsis}
                        onChange={(e) =>
                          setNewBookSynopsis(e.target.value)
                        }
                        className="min-h-[100px] resize-y"
                        maxLength={10000}
                        required
                        disabled={submitting}
                      />
                    </div>

                    {/* New book cover */}
                    <div className="space-y-2">
                      <Label htmlFor="new-book-cover">
                        รูปปกหนังสือ
                      </Label>

                      <Input
                        id="new-book-cover"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleBookCoverChange}
                        required
                        disabled={submitting}
                      />

                      <p className="text-xs text-muted-foreground">
                        รองรับ JPG, PNG, WEBP และ GIF ขนาดไม่เกิน 5 MB
                      </p>

                      {bookCoverPreview && (
                        <div className="flex items-start gap-3">
                          <img
                            src={bookCoverPreview}
                            alt="New book cover preview"
                            className="h-36 w-24 rounded-md border object-cover"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBookCoverFile(null);

                              const input = document.getElementById(
                                "new-book-cover"
                              );

                              if (input) input.value = "";
                            }}
                            disabled={submitting}
                          >
                            <X className="mr-1 h-4 w-4" />
                            ลบรูปปก
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAddBook}
                      disabled={submitting}
                    >
                      ยกเลิกการเพิ่มหนังสือ
                    </Button>
                  </div>
                )}
              </div>

              {/* Main Category */}
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
                    <SelectItem value="Mystery">
                      Mystery
                    </SelectItem>

                    <SelectItem value="Fantasy">
                      Fantasy
                    </SelectItem>

                    <SelectItem value="Horror">
                      Horror
                    </SelectItem>

                    <SelectItem value="Historical Fiction">
                      Historical Fiction
                    </SelectItem>

                    <SelectItem value="Yaoi">
                      Yaoi
                    </SelectItem>

                    <SelectItem value="Yuri">
                      Yuri
                    </SelectItem>

                    <SelectItem value="Romance">
                      Romance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory - unchanged */}
              <div className="space-y-2">
                <Label htmlFor="sub-category">
                  Subcategory
                </Label>

                <Input
                  id="sub-category"
                  placeholder="Enter subcategory..."
                  value={subCategory}
                  onChange={(e) =>
                    setSubCategory(e.target.value)
                  }
                  maxLength={100}
                  disabled={submitting}
                />
              </div>

              {/* Rating */}
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

            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review-text">
                Your Review
              </Label>

              <Textarea
                id="review-text"
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
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