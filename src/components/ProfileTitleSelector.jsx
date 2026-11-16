
import { useState } from "react";
import {
  Award,
  Check,
  ChevronRight,
  Crown,
  LockKeyhole,
  Medal,
  Sparkles,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Button } from "./ui/button";

// ข้อมูลตัวอย่างสำหรับ Frontend เท่านั้น
// เมื่อทำ Backend แล้ว ให้ส่งข้อมูลจริงผ่าน props
const DEFAULT_TITLES = [
  {
    id: "TOP_1",
    name: "ราชานักรีวิว",
    description: "อันดับ 1 ประจำเดือน",
    requirement: "จบเดือนด้วยอันดับ 1",
    color: "gold",
    unlocked: false,
  },
  {
    id: "TOP_2",
    name: "ยอดนักรีวิว",
    description: "อันดับ 2 ประจำเดือน",
    requirement: "จบเดือนด้วยอันดับ 2",
    color: "silver",
    unlocked: false,
  },
  {
    id: "TOP_3",
    name: "ดาวรุ่งนักรีวิว",
    description: "อันดับ 3 ประจำเดือน",
    requirement: "จบเดือนด้วยอันดับ 3",
    color: "bronze",
    unlocked: false,
  },
];

const titleStyles = {
  gold: {
    badge:
      "border-[#E8C878] bg-[#FFF4D4] text-[#98651C]",
    selected:
      "border-[#D6AD57] bg-[#FFF9EA]",
    icon: "text-[#C08A2F]",
  },
  silver: {
    badge:
      "border-[#C9CDD4] bg-[#F1F3F6] text-[#667181]",
    selected:
      "border-[#AAB4C1] bg-[#F7F8FA]",
    icon: "text-[#8996A8]",
  },
  bronze: {
    badge:
      "border-[#DDB6A3] bg-[#FBECE4] text-[#A46A4B]",
    selected:
      "border-[#D9A58E] bg-[#FFF4EF]",
    icon: "text-[#BD8164]",
  },
};

function TitleIcon({ id, size = 20 }) {
  if (id === "TOP_1") {
    return <Crown size={size} />;
  }

  if (id === "TOP_2") {
    return <Medal size={size} />;
  }

  return <Award size={size} />;
}

export function ProfileTitleBadge({ title }) {
  if (!title) return null;

  const style =
    titleStyles[title.color] || titleStyles.bronze;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5
        rounded-full border px-2.5 py-1
        text-[11px] font-bold ${style.badge}`}
    >
      <span className="shrink-0">
        <TitleIcon id={title.id} size={13} />
      </span>

      <span className="truncate">
        {title.name}
      </span>
    </span>
  );
}

export default function ProfileTitleSelector({
  username = "นักอ่าน",
  titles = DEFAULT_TITLES,
  activeTitleId = null,
  onApply,
  saving = false,
  error = "",
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const activeTitle =
    titles.find(
      (title) =>
        title.id === activeTitleId &&
        title.unlocked
    ) || null;

  const selectedTitle =
    titles.find(
      (title) => title.id === selectedId
    ) || null;

  const unlockedTitles = titles.filter(
    (title) => title.unlocked
  );

  const lockedTitles = titles.filter(
    (title) => !title.unlocked
  );

  const openDialog = () => {
    setSelectedId(activeTitle?.id || null);
    setOpen(true);
  };

  const handleApply = async () => {
    if (
      selectedId !== null &&
      !titles.some(
        (title) =>
          title.id === selectedId &&
          title.unlocked
      )
    ) {
      return;
    }

    if (saving) return;
    const saved = await onApply?.(selectedId);
    if (saved === true) setOpen(false);
  };

  return (
    <>
      {/* การ์ดเลือกแท็กในหน้าแก้ไขโปรไฟล์ */}
      <section className="mt-6 border-t border-[#F1DFD7] pt-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles
            size={17}
            className="text-[#A76F71]"
          />
          <h2 className="text-sm font-bold text-[#684B50]">
            แท็กฉายาที่ใช้งาน
          </h2>
        </div>

        <button
          type="button"
          onClick={openDialog}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#E8D5D0] bg-white p-4 text-left transition hover:border-[#D99BA0] hover:bg-[#FFF7F3]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E9] text-[#A76F71]">
            <Award size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#674B45]">
              {activeTitle?.name || "ไม่แสดงแท็ก"}
            </p>

            <p className="mt-1 text-xs text-[#A18C85]">
              กดเพื่อเลือกแท็กฉายา
            </p>

            <p className="mt-1 text-[11px] text-[#B18A8D]">
              ได้รับแล้ว {unlockedTitles.length}/
              {titles.length} แท็ก
            </p>
          </div>

          <ChevronRight
            size={19}
            className="shrink-0 text-[#A76F71]"
          />
        </button>
      </section>

      {/* Popup เลือกแท็ก */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            flex max-h-[90dvh] w-[calc(100vw-24px)]
            max-w-[820px] flex-col overflow-hidden
            rounded-[24px] border-[#F1DFD7]
            bg-[#FFFAF7] p-0
            sm:!max-w-[820px]
          "
        >
          <DialogHeader className="shrink-0 border-b border-[#F1DFD7] px-5 py-5 pr-12 sm:px-7">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#49332F]">
              <Sparkles
                size={19}
                className="text-[#B77C85]"
              />
              เลือกแท็กฉายา
            </DialogTitle>

            <DialogDescription className="text-sm text-[#98777A]">
              เลือกฉายาที่ได้รับมาแสดงข้างชื่อโปรไฟล์
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-7">
            <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_260px]">

              {/* รายการแท็ก */}
              <div className="min-w-0 space-y-6">
                <section>
                  <h3 className="mb-3 text-sm font-bold text-[#674B45]">
                    แท็กที่ได้รับแล้ว
                  </h3>

                  <div className="space-y-2">
                    {/* ไม่แสดงแท็ก */}
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                        selectedId === null
                          ? "border-[#A76F71] bg-[#FFF0EB]"
                          : "border-[#F1E6E1] bg-white hover:border-[#D9AAA5]"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7ECE7] text-[#A88C84]">
                        <X size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#674B45]">
                          ไม่แสดงแท็ก
                        </p>
                        <p className="text-xs text-[#A18C85]">
                          แสดงเฉพาะชื่อผู้ใช้
                        </p>
                      </div>

                      {selectedId === null && (
                        <Check
                          size={17}
                          className="shrink-0 text-[#A76F71]"
                        />
                      )}
                    </button>

                    {unlockedTitles.map((title) => {
                      const style =
                        titleStyles[title.color] ||
                        titleStyles.bronze;

                      return (
                        <button
                          key={title.id}
                          type="button"
                          onClick={() =>
                            setSelectedId(title.id)
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                            selectedId === title.id
                              ? style.selected
                              : "border-[#F1E6E1] bg-white hover:border-[#D9AAA5]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF2E8] ${style.icon}`}
                          >
                            <TitleIcon id={title.id} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <ProfileTitleBadge title={title} />

                            <p className="mt-1 text-xs text-[#A18C85]">
                              {title.description}
                            </p>
                          </div>

                          {selectedId === title.id && (
                            <Check
                              size={17}
                              className="shrink-0 text-[#A76F71]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#674B45]">
                    <LockKeyhole size={15} />
                    แท็กที่ยังไม่ได้รับ
                  </h3>

                  <div className="space-y-2">
                    {lockedTitles.map((title) => {
                      const style =
                        titleStyles[title.color] ||
                        titleStyles.bronze;

                      return (
                        <div
                          key={title.id}
                          className="flex items-center gap-3 rounded-xl border border-[#F1E6E1] bg-[#F7F3F0] p-3"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ${style.icon} opacity-50`}
                          >
                            <TitleIcon id={title.id} />
                          </div>

                          <div className="min-w-0 flex-1 opacity-60">
                            <ProfileTitleBadge title={title} />

                            <p className="mt-1 text-xs text-[#98777A]">
                              {title.requirement}
                            </p>
                          </div>

                          <LockKeyhole
                            size={15}
                            className="shrink-0 text-[#A99B95]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* ตัวอย่างแสดงแท็ก */}
              <aside className="min-w-0">
                <div className="rounded-2xl border border-[#F1DFD7] bg-white p-5 md:sticky md:top-0">
                  <p className="mb-4 text-center text-sm font-bold text-[#674B45]">
                    ตัวอย่างการแสดงผล
                  </p>

                  <div className="rounded-xl bg-gradient-to-br from-[#FFF0E9] to-[#FFF9F5] p-5 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EED4CC] text-[#A76F71]">
                      <Award size={26} />
                    </div>

                    <p className="mt-3 break-words text-base font-extrabold text-[#49332F]">
                      {username}
                    </p>

                    <div className="mt-2 flex min-h-8 items-center justify-center">
                      {selectedTitle ? (
                        <ProfileTitleBadge
                          title={selectedTitle}
                        />
                      ) : (
                        <span className="text-xs text-[#A18C85]">
                          ไม่แสดงแท็กฉายา
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-center text-xs leading-relaxed text-[#A18C85]">
                    แท็กที่เลือกจะแสดงคู่กับชื่อผู้ใช้
                  </p>

                  {selectedId === activeTitleId && (
                    <div className="mt-3 flex justify-center">
                      <span className="rounded-full bg-[#E8F5EA] px-3 py-1 text-[11px] font-semibold text-[#4B8655]">
                        กำลังใช้งาน
                      </span>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>

          {error && <p role="alert" className="px-5 text-sm text-red-600">{error}</p>}
          <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t border-[#F1DFD7] bg-white px-5 py-4 sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-[#E8D5D0] text-[#80676A]"
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              onClick={handleApply}
              disabled={saving || selectedId === activeTitleId}
              className="rounded-xl bg-[#A76F71] text-white hover:bg-[#915C60]"
            >
              ใช้แท็กนี้
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
