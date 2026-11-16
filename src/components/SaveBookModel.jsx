
import { useState } from "react";
import { Bookmark, BookOpen, Trash2 } from "lucide-react";

import ReviewCard from "./ReviewCard";
import { Button } from "./ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function SaveBookModel({
  open = false,
  onClose,
  review,
  book,
  onRemove,
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (!book || !onRemove || removing) return;

    setRemoving(true);
    try {
      await onRemove(book);
      onClose?.();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !removing) onClose?.();
      }}
    >
      <DialogContent
        className="
          !w-[calc(100vw-1.5rem)]
          !max-w-[580px]
          max-h-[90dvh]
          gap-0 overflow-hidden
          rounded-[24px]
          border border-[#EEDDD7]
          bg-[#FFFAF7]
          p-0 shadow-xl
          sm:rounded-[28px]
        "
      >
        <DialogHeader
          className="
            border-b border-[#F0E2DC]
            bg-[#FFF8F5]
            px-5 pb-4 pt-6
            text-left sm:px-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-2xl bg-[#F8E9E5]
                text-[#A36D70]
              "
            >
              <Bookmark className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle
                className="
                  text-lg font-bold
                  text-[#604448]
                "
              >
                Saved Review
              </DialogTitle>

              <DialogDescription
                className="
                  mt-1 text-xs
                  text-[#A18A89]
                "
              >
                รีวิวที่คุณบันทึกไว้จาก Feed
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className="
            min-h-0 overflow-y-auto
            overflow-x-hidden
            px-3 py-4
            sm:px-5 sm:py-5
          "
        >
          {review ? (
            <div className="min-w-0">
              <ReviewCard review={review} />
            </div>
          ) : (
            <div
              className="
                flex min-h-48 flex-col
                items-center justify-center
                gap-3 rounded-2xl
                border border-dashed
                border-[#EBD7D1]
                bg-white/70
                px-4 text-center
              "
            >
              <BookOpen
                className="h-9 w-9 text-[#B58B8C]"
              />

              <p
                className="
                  text-sm font-semibold
                  text-[#604448]
                "
              >
                ยังไม่มีข้อมูลรีวิว
              </p>

              <p className="text-xs text-[#A18A89]">
                กรุณาเลือกรีวิวที่บันทึกไว้
              </p>
            </div>
          )}
        </div>

        {review && book && (
          <div
            className="
              flex items-center
              justify-end
              border-t border-[#F0E2DC]
              bg-[#FFF8F5]
              px-4 py-3 sm:px-6
            "
          >
            <Button
              type="button"
              variant="outline"
              disabled={removing}
              onClick={handleRemove}
              className="
                rounded-xl
                border-[#E9C8C5]
                bg-white
                text-[#A75D65]
                hover:bg-[#FCECEB]
                hover:text-[#974D56]
              "
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {removing
                ? "Removing..."
                : "Remove from Saved"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
