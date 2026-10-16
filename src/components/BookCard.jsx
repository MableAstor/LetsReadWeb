
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

function BookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="
        group relative mx-auto
        aspect-[3/4] w-full min-w-0
        overflow-hidden rounded-lg
        bg-[#F7E4DE]
      "
    >
      {!imageError && book.image ? (
        <img
          src={book.image}
          alt={`ปกหนังสือ ${book.title}`}
          onError={() => setImageError(true)}
          className="
            h-full w-full object-cover
            transition-transform duration-300
            group-hover:scale-105
          "
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-[#9B8583]">
          ไม่พบรูปปกหนังสือ
        </div>
      )}
    </div>
  );
}

export function BookCard({
  book,
  hasActions = false,
}) {
  if (!book) return null;

  return (
    <Card
  className="
    group flex h-full w-full min-w-0
    flex-col overflow-hidden
    rounded-xl border-2
    bg-white py-0 shadow-sm
    transition-shadow duration-200
    hover:shadow-md
  "
>
  <CardContent className="flex h-full min-w-0 flex-col p-2 sm:p-3">
        <BookCover
          key={book.image}
          book={book}
        />

        <div
          className={`
            mt-2 min-w-0
            ${hasActions ? "pr-9 sm:pr-10" : ""}
          `}
        >
          {/* Book Tags */}
          <div className="flex min-h-[40px] flex-wrap content-start items-start gap-1">
            {book.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="
                  max-w-full rounded-full
                  bg-[#FAEFEB]
                  px-1.5 py-0.5
                  text-[10px] font-normal
                  text-[#A36D70]
                  whitespace-normal
                "
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Book Title */}
          <h3
            title={book.title}
            className="
              mt-2 truncate
              text-xs font-semibold
              text-[#533C3E]
              sm:text-sm
            "
          >
            {book.title}
          </h3>

          {/* Author */}
          <p
            className="
              mt-1 truncate
              text-[10px] text-[#9B8583]
              sm:text-xs
            "
          >
            {book.author}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
