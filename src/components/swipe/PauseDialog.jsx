
import { Clock3, Play, Sparkles } from "lucide-react";

import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function PauseDialog({
  open,
  onOpenChange,
  pauseRemaining,
  pauseExpired,
  formatPauseTime,
  onResume,
  onAnalyze,
  isSelectingNext,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!w-[calc(100vw-2rem)] !max-w-md rounded-2xl p-5 sm:rounded-3xl sm:p-7"
      >
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Clock3 className="h-8 w-8" />
          </div>

          <DialogTitle className="text-center text-lg font-bold text-gray-900">
            {pauseExpired ? "ครบเวลาพักแล้ว!" : "กำลังพักการปัด"}
          </DialogTitle>

          <DialogDescription className="text-center text-sm leading-relaxed text-gray-500">
            {pauseExpired
              ? "คุณสามารถกลับไปเลือกหนังสือต่อ หรือวิเคราะห์ผลการเลือกที่ผ่านมาได้"
              : "ระบบกำลังนับเวลาพัก 20 นาที คุณสามารถกลับไปปัดต่อได้ทุกเมื่อ"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-5 text-center">
          <p className="text-4xl font-bold tabular-nums tracking-wider text-rose-500">
            {formatPauseTime(pauseRemaining)}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            {pauseExpired ? "หมดเวลาพัก" : "เวลาพักคงเหลือ"}
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            onClick={onResume}
            className="w-full rounded-xl bg-rose-500 font-bold text-white hover:bg-rose-600"
          >
            <Play className="h-4 w-4" />
            กลับไปปัดต่อ
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSelectingNext}
            onClick={onAnalyze}
            className="w-full rounded-xl border-emerald-200 font-bold text-emerald-700 hover:bg-emerald-50"
          >
            <Sparkles className="h-4 w-4" />
            วิเคราะห์ผล
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
