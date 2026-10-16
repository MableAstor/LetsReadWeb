
import {
  MoreHorizontal,
  ShoppingBag,
  BookCheck,
  Trash2,
} from "lucide-react";

import { BookCard } from "./BookCard";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function WanttoRead({
  book,
  onMoveToWantToBuy,
  onMarkAsRead,
  onRemove,
}) {
  if (!book) return null;

  return (
    <div className="relative w-full min-w-0">
      {/* Book Card */}
      <BookCard book={book} hasActions />

      {/* Bottom-right Menu */}
      <div className="absolute bottom-2 right-2 z-20 sm:bottom-3 sm:right-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`จัดการหนังสือ ${book.title}`}
            className="
              inline-flex h-7 w-7
              items-center justify-center
              rounded-full border border-gray-200
              bg-white text-gray-700
              shadow-sm transition-colors
              hover:bg-gray-100
              focus-visible:outline-2
              focus-visible:outline-ring
              sm:h-8 sm:w-8
            "
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="z-50 w-48 rounded-xl p-1.5 shadow-lg sm:w-52"
          >
            <DropdownMenuItem
              disabled={!onMoveToWantToBuy}
              onSelect={() => onMoveToWantToBuy?.(book)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Want to Buy
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!onMarkAsRead}
              onSelect={() => onMarkAsRead?.(book)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm"
            >
              <BookCheck className="h-4 w-4" />
              Mark as Read
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              disabled={!onRemove}
              onSelect={() => onRemove?.(book)}
              className="
                cursor-pointer gap-2 rounded-lg
                px-3 py-2.5 text-xs
                text-red-600
                focus:bg-red-50 focus:text-red-600
                sm:text-sm
              "
            >
              <Trash2 className="h-4 w-4" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
