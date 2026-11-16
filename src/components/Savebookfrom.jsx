import { useState } from "react";
import {
  Bookmark,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { BookCard } from "./BookCard";
import SaveBookModel from "./SaveBookModel";

import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Savebookfrom({
  book,
  review,
  onRemove,
}) {
  const [showReview, setShowReview] = useState(false);

  if (!book) {
    return null;
  }

  // นำรีวิวออกจาก Saved Books
  const handleRemove = () => {
    console.log("[Savebookfrom] Remove clicked:", book);

    if (typeof onRemove !== "function") {
      console.error("[Savebookfrom] onRemove is not a function");
      return;
    }

    onRemove(book);
  };

  return (
    <>
      <div className="group flex h-full w-full min-w-0 flex-col rounded-[22px] border border-[#F0E0D9] bg-white p-2.5 shadow-[0_5px_18px_rgba(120,80,80,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3">
        {/* BookCard */}
        <div className="min-w-0 flex-1">
          <BookCard book={book} />
        </div>

        {/* Saved Information */}
        <div className="mt-2 min-w-0 px-1">
          <div className="flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 shrink-0 text-[#A36D70]" />

            <span className="text-[10px] text-[#A18C85] sm:text-xs">
              Saved from Feed
            </span>
          </div>

          <p className="mt-1 truncate text-[11px] font-semibold text-[#674B50] sm:text-xs">
            {review?.username
              ? `${review.username}'s Review`
              : "Saved Review"}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setShowReview(true)}
            className="
              h-8 min-w-0 flex-1
              rounded-full bg-[#B77D80]
              px-2 text-[11px]
              font-semibold text-white
              hover:bg-[#A56970]
              sm:h-9 sm:text-xs
            "
          >
            <Eye className="h-3.5 w-3.5" />
            See post
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`จัดการหนังสือ ${book.title}`}
              className="
                inline-flex h-8 w-8 shrink-0
                items-center justify-center
                rounded-full border border-[#EBD7D1]
                bg-[#FFF9F6] text-[#9F7076]
                shadow-sm hover:bg-[#F8E9E5]
                sm:h-9 sm:w-9
              "
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={6} className="z-50 rounded-2xl border-[#EEDCD6] bg-[#FFFAF8] p-1.5 shadow-xl">
              {/* Remove from Saved */}
              <DropdownMenuItem
                variant="destructive"
                disabled={!onRemove}
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
                Remove from Saved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SaveBookModel
        open={showReview}
        onClose={() => setShowReview(false)}
        review={review}
        book={book}
        onRemove={onRemove}
      />
    </>
  );
}