import { Check, Loader2, LockKeyhole, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import FrameAvatar from "./FrameAvatar";

export default function FrameSelector({ model }) {
  const { username, displayedAvatar, frameDialogOpen, setFrameDialogOpen,
    frameSaving, loadingFrames, unlockedFrames, lockedFrames, selectedFrameId,
    setSelectedFrameId, activeFrameId, selectedFrame, frameError,
    handleApplyFrame } = model;
  return (
      <Dialog
        open={frameDialogOpen}
        onOpenChange={(open) => {
          if (!frameSaving) {
            setFrameDialogOpen(open);
          }
        }}
      >
        <DialogContent className="!fixed !left-1/2 !top-1/2 !w-[calc(100vw-24px)] !max-w-[920px] !-translate-x-1/2 !-translate-y-1/2 flex max-h-[90dvh] flex-col overflow-hidden rounded-[24px] border border-[#F1DFD7] bg-[#FFFAF7] p-0 sm:!w-[calc(100vw-64px)] sm:!max-w-[920px] md:!max-w-[920px] lg:!max-w-[920px]">
          <DialogHeader className="shrink-0 border-b border-[#F1DFD7] px-5 py-5 pr-12 sm:px-7">
            <DialogTitle className="text-xl font-bold text-[#49332F]">
              เลือกกรอบโปรไฟล์
            </DialogTitle>

            <DialogDescription className="text-sm text-[#98777A]">
              เลือกกรอบที่คุณได้รับเพื่อใช้ตกแต่งรูปโปรไฟล์
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-7">
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

              {/* ฝั่งซ้าย: รายการกรอบ */}
              <div className="min-w-0 w-full space-y-6">

                {/* กรอบที่ได้รับ */}
                <section>
                  <h3 className="mb-3 text-sm font-bold text-[#674B45]">
                    กรอบที่ได้รับแล้ว
                  </h3>

                  {loadingFrames ? (
                    <div className="flex items-center gap-2 py-5 text-sm text-[#98777A]">
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      กำลังโหลดกรอบ...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">

                      {/* ไม่ใช้กรอบ */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFrameId(null)
                        }
                        className={`relative flex flex-col items-center rounded-xl border-2 p-2 transition ${
                          selectedFrameId === null
                            ? "border-[#A76F71] bg-[#FFF0EB]"
                            : "border-[#F1E6E1] bg-white hover:border-[#D9AAA5]"
                        }`}
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7ECE7]">
                          <X
                            size={24}
                            className="text-[#A88C84]"
                          />
                        </div>

                        <span className="mt-2 text-center text-[11px] font-semibold text-[#674B45]">
                          ไม่ใช้กรอบ
                        </span>

                        {selectedFrameId === null && (
                          <Check
                            size={15}
                            className="absolute right-1 top-1 text-[#A76F71]"
                          />
                        )}
                      </button>

                      {unlockedFrames.map((frame) => (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() =>
                            setSelectedFrameId(frame.id)
                          }
                          className={`relative flex flex-col items-center rounded-xl border-2 p-2 transition ${
                            selectedFrameId === frame.id
                              ? "border-[#A76F71] bg-[#FFF0EB]"
                              : "border-[#F1E6E1] bg-white hover:border-[#D9AAA5]"
                          }`}
                        >
                          <FrameAvatar
                            avatarUrl={displayedAvatar}
                            username={username}
                            frame={frame}
                            size={68}
                          />

                          <span className="mt-2 line-clamp-2 text-center text-[11px] font-semibold text-[#674B45]">
                            {frame.title}
                          </span>

                          {selectedFrameId === frame.id && (
                            <Check
                              size={15}
                              className="absolute right-1 top-1 text-[#A76F71]"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* กรอบที่ยังไม่ได้รับ */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#674B45]">
                    <LockKeyhole size={15} />
                    กรอบที่ยังไม่ได้รับ
                  </h3>

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {lockedFrames.map((frame) => (
                      <div
                        key={frame.id}
                        title={frame.description}
                        className="relative flex flex-col items-center rounded-xl border border-[#F1E6E1] bg-[#F6F2EF] p-2"
                      >
                        <div className="relative opacity-50 grayscale">
                          <FrameAvatar
                            avatarUrl={displayedAvatar}
                            username={username}
                            frame={frame}
                            size={68}
                          />
                        </div>

                        <div className="absolute right-1 top-1 rounded-full bg-white p-1 shadow-sm">
                          <LockKeyhole
                            size={12}
                            className="text-[#9D8B85]"
                          />
                        </div>

                        <span className="mt-2 line-clamp-2 text-center text-[11px] font-semibold text-[#9D8B85]">
                          {frame.title}
                        </span>

                        <span className="mt-1 text-center text-[10px] leading-snug text-[#A99B95]">
                          {frame.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* ฝั่งขวา: ตัวอย่างขนาดใหญ่ */}
              <aside className="min-w-0">
                <div className="rounded-2xl border border-[#F1DFD7] bg-white p-5 md:sticky md:top-0">

                  <h3 className="mb-4 text-center text-sm font-bold text-[#674B45]">
                    ตัวอย่างกรอบโปรไฟล์
                  </h3>

                  <div className="flex min-h-[190px] items-center justify-center rounded-xl bg-[#FFF7F3] p-4">
                    <FrameAvatar
                      avatarUrl={displayedAvatar}
                      username={username}
                      frame={selectedFrame}
                      size={160}
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-[#674B45]">
                      {selectedFrame?.title ||
                        "ไม่ใช้กรอบ"}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-[#A18C85]">
                      {selectedFrame?.description ||
                        "แสดงรูปโปรไฟล์แบบปกติ"}
                    </p>
                  </div>

                  {selectedFrameId === activeFrameId && (
                    <div className="mt-3 flex justify-center">
                      <span className="rounded-full bg-[#E8F5EA] px-3 py-1 text-[11px] font-semibold text-[#4B8655]">
                        กำลังใช้งาน
                      </span>
                    </div>
                  )}
                </div>
              </aside>
            </div>

            {frameError && (
              <div
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
              >
                {frameError}
              </div>
            )}
          </div>

          {/* ปุ่มล่าง Popup */}
          <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t border-[#F1DFD7] bg-white px-5 py-4 sm:px-7">
            <Button
              type="button"
              variant="outline"
              disabled={frameSaving}
              onClick={() => setFrameDialogOpen(false)}
              className="rounded-xl border-[#E8D5D0] text-[#80676A]"
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              onClick={handleApplyFrame}
              disabled={
                frameSaving ||
                loadingFrames ||
                Boolean(frameError) ||
                selectedFrameId === activeFrameId
              }
              className="rounded-xl bg-[#A76F71] text-white hover:bg-[#915C60]"
            >
              {frameSaving ? (
                <>
                  <Loader2
                    size={15}
                    className="mr-2 animate-spin"
                  />
                  กำลังบันทึก...
                </>
              ) : (
                "ใช้กรอบนี้"
              )}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
  );
}
