
import {
  Clock3,
} from "lucide-react";

import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function StopDialog({
  open,
  onOpenChange,
  onPause,
  onAnalyze,
  isSelectingNext,
  likedCount,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[calc(100vw-2rem)] !max-w-md max-h-[85dvh] overflow-y-auto rounded-2xl p-5 sm:rounded-3xl sm:p-7">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Clock3 className="h-7 w-7" />
          </div>

          <DialogTitle className="text-center text-base font-bold leading-relaxed text-gray-900">
            คุณต้องการที่จะหยุดปัดหาหนังสือใช่หรือไม่
          </DialogTitle>

          <DialogDescription className="text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
            คุณสามารถพักการปัดชั่วคราว หรือส่งรายการหนังสือที่ถูกใจไปสรุปผลได้ทันที
            การพักจะยังไม่ปิด Session
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onPause}
            disabled={isSelectingNext}
            className="w-full rounded-xl border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 sm:flex-1"
          >
            พักการปัด
          </Button>

          <Button
            type="button"
            disabled={isSelectingNext}
            onClick={onAnalyze}
            className="w-full rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 sm:flex-1"
          >
            วิเคราะห์ทันที ({likedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
