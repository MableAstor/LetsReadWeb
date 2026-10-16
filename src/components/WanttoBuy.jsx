
import { useState } from "react";
import { ExternalLink, Store } from "lucide-react";

import { BookCard } from "./BookCard";
import { libraryBooks } from "../data/books";
import { Button } from "./ui/button";
import BookStoreModel from "./BookStoreModel";

export default function WanttoBuy({
  book = libraryBooks[0],
  onClick,
  onOfficialStoreClick,
}) {
  const [showStores, setShowStores] = useState(false);

  if (!book) return null;

  const handleBookStore = () => {
    setShowStores(true);
    onClick?.();
  };

  return (
    <>
      <div
        className="
          mx-auto flex w-full min-w-0
          max-w-[190px] flex-col
          gap-2
          sm:max-w-[210px]
        "
      >
        {/* Shared BookCard */}
        <BookCard book={book} />

        {/* Store actions */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!onOfficialStoreClick}
            onClick={() => onOfficialStoreClick?.(book)}
            className="
              h-8 w-full rounded-full
              bg-[#1D77FF] px-2
              text-[11px] font-semibold
              text-white hover:bg-blue-600
              sm:h-9 sm:text-xs
            "
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Official Store
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleBookStore}
            className="
              h-8 w-full rounded-full
              bg-gray-100 px-2
              text-[11px] font-semibold
              text-gray-700 hover:bg-gray-200
              sm:h-9 sm:text-xs
            "
          >
            <Store className="h-3.5 w-3.5" />
            Book Store
          </Button>
        </div>
      </div>

      <BookStoreModel
        open={showStores}
        onClose={() => setShowStores(false)}
      />
    </>
  );
}
