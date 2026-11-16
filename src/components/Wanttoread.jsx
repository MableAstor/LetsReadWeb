
import {
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { BookCard } from "./BookCard";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function WanttoRead({
  book,
  onRemove,
}) {
  if (!book) return null;

  return (
    <div className="relative w-full min-w-0 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
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
              rounded-full border border-[#ead6d4]
              bg-[#fffaf7] text-[#a36d70]
              shadow-sm transition-colors
              hover:bg-[#faefeb]
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
