import { useEffect, useState } from "react";
import { Camera, Star, X } from "lucide-react";

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

export default function WriteReviewModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bookName, setBookName] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [reviewText, setReviewText] = useState("");

  // Create and clean up image preview URLs
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setImage(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewData = {
      bookName: bookName.trim(),
      mainCategory,
      subCategory: subCategory.trim(),
      rating,
      reviewText: reviewText.trim(),
      image,
    };

    console.log(reviewData);
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
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
          {/* Image upload */}
          <div className="space-y-2">
            <Label htmlFor="review-image">Book Photo</Label>

            <label
              htmlFor="review-image"
              className="
    relative
    mx-auto
    block
    h-[140px] w-[112px]
    cursor-pointer
    overflow-hidden
    rounded-xl
    border-2 border-dashed border-border
    bg-muted/40
    transition-colors hover:bg-muted

    lg:mx-0
    lg:aspect-[3/4]
    lg:h-auto
    lg:w-full
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
        absolute inset-0
        flex flex-col
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
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />

            {image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setImage(null)}
              >
                <X className="mr-1 h-4 w-4" />
                Remove photo
              </Button>
            )}
          </div>

          {/* Review fields */}
          <div className="min-w-0 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="book-name">Book Name</Label>
                <Input
                  id="book-name"
                  placeholder="Enter book name..."
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Main Category</Label>
                <Select
                  value={mainCategory}
                  onValueChange={setMainCategory}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-category">Subcategory</Label>
                <Input
                  id="sub-category"
                  placeholder="Enter subcategory..."
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
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
                      className="cursor-pointer rounded-sm p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring"
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
                required
              />
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="review-form"
            className="bg-pink-500 text-white hover:bg-pink-600"
          >
            Post Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
