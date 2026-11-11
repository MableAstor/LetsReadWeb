
import { useState } from "react";
import {
  BookOpen,
  Heart,
  Sparkles,
  X,
} from "lucide-react";

import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

export default function SwipeBookCard({
  currentBook,
  category,
  subcategories,
  likedCount,
  dragX,
  isDragging,
  isSelectingNext,
  isPaused,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLike,
  onDislike,
}) {
  const [showSynopsis, setShowSynopsis] = useState(false);

  return (
    <Card
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        transform: `
          translate3d(${dragX}px, ${Math.abs(dragX) * 0.05}px, 0)
          rotate(${dragX / 18}deg)
        `,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
      }}
      className="
        group relative aspect-[2/3] w-full max-w-[340px]
        min-w-0 max-h-[510px] touch-pan-y select-none
        cursor-grab overflow-hidden rounded-[1.75rem]
        border-4 border-white/80 bg-slate-900 py-0
        shadow-2xl active:cursor-grabbing
        sm:rounded-[2.5rem]
      "
    >
      {/* Book Image */}
      <img
        src={currentBook?.image}
        alt={currentBook?.title || "Book cover"}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />

      {/* Tinder indicators */}
      {dragX > 35 && (
        <div
          className="pointer-events-none absolute left-5 top-20 z-20 rotate-[-15deg] rounded-xl border-4 border-emerald-400 px-4 py-2 text-2xl font-black tracking-widest text-emerald-400"
          style={{
            opacity: Math.min(Math.abs(dragX) / 110, 0.95),
          }}
        >
          LIKE
        </div>
      )}

      {dragX < -35 && (
        <div
          className="pointer-events-none absolute right-5 top-20 z-20 rotate-[15deg] rounded-xl border-4 border-rose-400 px-4 py-2 text-2xl font-black tracking-widest text-rose-400"
          style={{
            opacity: Math.min(Math.abs(dragX) / 110, 0.95),
          }}
        >
          NOPE
        </div>
      )}

      {/* Top Badges */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
        <Badge className="rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[10px] text-white backdrop-blur-md hover:bg-white/20">
          <Sparkles className="mr-1 h-3 w-3" />
          ค้นพบหนังสือ
        </Badge>

        <Badge className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md hover:bg-black/60">
          <Heart className="mr-1 h-3 w-3" />
          {likedCount} เล่มที่ถูกใจ
        </Badge>
      </div>

      {/* Book Information */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-4 text-center sm:px-6 sm:pb-5">
        <h2 className="w-full break-words text-base font-bold leading-snug text-white drop-shadow-md sm:text-lg">
          {currentBook?.title}
        </h2>

        <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-1.5">
          {category && (
            <Badge className="rounded-full border border-rose-200/40 bg-rose-400/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm hover:bg-rose-400/90">
              {category}
            </Badge>
          )}

          {subcategories.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              className="rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md hover:bg-white/20"
            >
              {item}
            </Badge>
          ))}
        </div>

        {currentBook?.author && (
          <p className="mt-2 text-[11px] text-gray-300">
            ผู้แต่ง: {currentBook.author}
          </p>
        )}

        {/* Synopsis Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPaused}
          onClick={() => setShowSynopsis(true)}
          className="pointer-events-auto mt-3 h-8 rounded-full border border-white/40 bg-white/25 px-4 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/35 hover:text-white"
        >
          <BookOpen className="h-3.5 w-3.5" />
          อ่านเรื่องย่อ
        </Button>

        {/* Swipe Actions */}
        <div className="pointer-events-auto mt-3 flex w-full items-center justify-center gap-3">
          <Button
            type="button"
            disabled={isSelectingNext || isPaused}
            onClick={onDislike}
            className="h-10 min-w-0 max-w-[120px] flex-1 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95"
          >
            <X className="h-4 w-4" />
            ข้ามไป
          </Button>

          <Button
            type="button"
            disabled={isSelectingNext || isPaused}
            onClick={onLike}
            className="h-10 min-w-0 max-w-[120px] flex-1 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md hover:bg-emerald-600 active:scale-95"
          >
            <Heart className="h-4 w-4 fill-current" />
            ถูกใจ
          </Button>
        </div>
      </div>

      {/* Synopsis Bottom Sheet */}
      {showSynopsis && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex h-[85%] min-h-0 flex-col rounded-t-[2rem] border border-white/70 bg-white p-4 text-gray-900 shadow-2xl animate-in slide-in-from-bottom duration-200 sm:p-6">
          <div className="mx-auto mb-3 h-1 w-12 shrink-0 rounded-full bg-gray-200" />

          <div className="mb-3 flex shrink-0 items-start justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-rose-400">
                BOOK SYNOPSIS
              </p>
              <h3 className="mt-1 break-words text-sm font-bold text-gray-900">
                {currentBook?.title}
              </h3>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowSynopsis(false)}
              aria-label="ปิดเรื่องย่อ"
              className="h-8 w-8 shrink-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <p className="whitespace-pre-wrap pr-3 text-left text-sm leading-7 text-gray-700">
              {currentBook?.synopsis ||
                currentBook?.Synopsis ||
                "ยังไม่มีข้อมูลเรื่องย่อ"}
            </p>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
