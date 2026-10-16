
import { Bookmark, BookOpen } from "lucide-react";

import ReviewCard from "./ReviewCard";

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
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose?.();
      }}
    >
      <DialogContent
        className="
          !w-[calc(100vw-2rem)]
          !max-w-[560px]
          max-h-[85dvh]
          overflow-x-hidden
          overflow-y-auto
          rounded-2xl
          p-4
          sm:rounded-3xl
          sm:p-6
        "
      >
        <DialogHeader className="space-y-1">
          <DialogTitle
            className="
              flex items-center gap-2
              text-base font-bold
              sm:text-lg
            "
          >
            <Bookmark className="h-5 w-5 text-[#A36D70]" />
            Book Review Saved
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm">
            รีวิวหนังสือที่คุณบันทึกจาก Feed
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 min-w-0">
          {review ? (
            <ReviewCard review={review} />
          ) : (
            <div
              className="
                flex min-h-36 flex-col
                items-center justify-center
                gap-2 rounded-xl
                border border-dashed
                border-border
                bg-muted/30
                px-4 py-6 text-center
              "
            >
              <BookOpen className="h-7 w-7 text-muted-foreground" />

              <p className="text-sm font-semibold">
                ยังไม่มีข้อมูลรีวิว
              </p>

              <p className="text-xs text-muted-foreground">
                กรุณาเลือกรายการรีวิวที่บันทึกจาก Feed
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
