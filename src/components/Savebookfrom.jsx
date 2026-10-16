
import { useState } from "react";
import {
  Bookmark,
  Eye,
  MoreHorizontal,
  ShoppingBag,
  BookCheck,
  Trash2,
} from "lucide-react";

import { BookCard } from "./BookCard";
import SaveBookModel from "./SaveBookModel";

import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Savebookfrom({
  book,
  review,
  onMoveToWantToBuy,
  onMarkAsRead,
  onRemove,
}) {
  const [showReview, setShowReview] = useState(false);

  if (!book) {
    return null;
  }

  
return (
  <>
    <div className="flex h-full w-full min-w-0 flex-col">
      {/* BookCard */}
      <div className="min-w-0 flex-1">
        <BookCard book={book} />
      </div>

      {/* Saved Information */}
      <div className="mt-2 min-w-0 px-1">
        <div className="flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5 shrink-0 text-[#A36D70]" />

          <span className="text-[10px] text-gray-500 sm:text-xs">
            Saved from Feed
          </span>
        </div>

        <p className="mt-1 truncate text-[11px] font-semibold text-[#533C3E] sm:text-xs">
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
            rounded-full bg-[#1D77FF]
            px-2 text-[11px]
            font-semibold text-white
            hover:bg-blue-600
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
              rounded-full border border-gray-200
              bg-white text-gray-700
              shadow-sm hover:bg-gray-100
              sm:h-9 sm:w-9
            "
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={6}>
            <DropdownMenuItem
              disabled={!onMoveToWantToBuy}
              onSelect={() => onMoveToWantToBuy?.(book)}
            >
              <ShoppingBag className="h-4 w-4" />
              Want to Buy
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!onMarkAsRead}
              onSelect={() => onMarkAsRead?.(book)}
            >
              <BookCheck className="h-4 w-4" />
              Mark as Read
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              disabled={!onRemove}
              onSelect={() => onRemove?.(book)}
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
    />
  </>
);

}
