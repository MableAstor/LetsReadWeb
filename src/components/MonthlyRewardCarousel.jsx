
import { useEffect, useState } from "react";
import { Award, ChevronLeft, ChevronRight, Crown, Medal } from "lucide-react";

import profileicon from "../assets/profile-icon.png";

// กรอบเดือนพฤศจิกายน
import toponeNOV from "../assets/blue-and-orange-fish-frame.png";
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png";
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png";

// กรอบเดือนธันวาคม
import toponeDEC from "../assets/red-cat-yarn-frame.png.png";
import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png";
import topthreeDEC from "../assets/golden-thorn-vines-frame.png";

const FRAMES = {
  11: [toponeNOV, toptwoNOV, topthreeNOV],
  12: [toponeDEC, toptwoDEC, topthreeDEC],
};

const MEDALS = ["🥇", "🥈", "🥉"];

// ตัวอย่างแท็กฉายาตามรางวัลอันดับประจำเดือน (ไม่ใช่สถานะปลดล็อกจริง)
const TITLE_PREVIEWS = [
  {
    name: "ราชานักรีวิว",
    Icon: Crown,
    className: "border-amber-300 bg-[#FFF0C2] text-[#926315]",
  },
  {
    name: "ยอดนักรีวิว",
    Icon: Medal,
    className: "border-slate-300 bg-[#F0F3F7] text-[#64748B]",
  },
  {
    name: "ดาวรุ่งนักรีวิว",
    Icon: Award,
    className: "border-orange-300 bg-[#FBE4D4] text-[#A35F37]",
  },
];

export default function MonthlyRewardCarousel({
  month = new Date().getMonth() + 1,
}) {
  const [index, setIndex] = useState(0);

  const frames = FRAMES[Number(month)] ?? [];
  const activeTitle = TITLE_PREVIEWS[index];

  useEffect(() => {
    setIndex(0);
  }, [month]);

  // เลื่อนสไลด์อัตโนมัติทุก 4 วินาที
  useEffect(() => {
    if (frames.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [month, frames.length]);

  const previous = () => {
    setIndex(
      (current) =>
        (current - 1 + frames.length) % frames.length
    );
  };

  const next = () => {
    setIndex(
      (current) => (current + 1) % frames.length
    );
  };

  if (frames.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        ยังไม่ได้กำหนดกรอบรางวัลสำหรับเดือนนี้
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">

      <p className="text-xs font-semibold text-[#80676A]">
        ตัวอย่างกรอบโปรไฟล์ที่จะได้รับ
      </p>

      {/* พื้นที่สไลด์ */}
      <div className="relative flex min-h-[230px] w-full items-center justify-center rounded-2xl bg-[#FFF5F2] px-10 py-5">

        {/* ปุ่มก่อนหน้า */}
        <button
          type="button"
          onClick={previous}
          aria-label="กรอบก่อนหน้า"
          className="absolute left-2 z-20 rounded-full bg-white p-2 shadow-sm hover:bg-[#FFE8E2]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* ตัวอย่างโปรไฟล์วงกลม */}
        <div className="relative h-[180px] w-[180px] shrink-0">

          {/* รูปโปรไฟล์จำลอง */}
          <div className="absolute inset-[17%] overflow-hidden rounded-full bg-white">
            <img
              src={profileicon}
              alt="ตัวอย่างรูปโปรไฟล์"
              className="h-full w-full object-cover"
            />
          </div>

          {/* รูปกรอบรางวัลซ้อนทับ */}
          <img
            key={`${month}-${index}`}
            src={frames[index]}
            alt={`กรอบโปรไฟล์รางวัลอันดับ ${index + 1}`}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
          />

        </div>

        {/* ปุ่มถัดไป */}
        <button
          type="button"
          onClick={next}
          aria-label="กรอบถัดไป"
          className="absolute right-2 z-20 rounded-full bg-white p-2 shadow-sm hover:bg-[#FFE8E2]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>

      {/* ชื่อรางวัล */}
      <p className="text-sm font-bold text-[#684B50]">
        {MEDALS[index]} กรอบรางวัล TOP {index + 1}
      </p>

      {/* ตัวอย่างแท็กหลังชื่อ */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold text-[#684B50]">
          Reader
        </span>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold ${activeTitle.className}`}
          aria-label={`ตัวอย่างแท็กฉายา ${activeTitle.name}`}
        >
          <activeTitle.Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {activeTitle.name}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground">
        ตัวอย่างกรอบและแท็กที่ผู้ชนะจะได้รับหลังสิ้นเดือน
      </p>

      {/* จุดเลือกสไลด์ */}
      <div className="flex items-center justify-center gap-2">
        {frames.map((_, itemIndex) => (
          <button
            key={itemIndex}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`ดูกรอบอันดับ ${itemIndex + 1}`}
            aria-current={
              itemIndex === index ? "true" : undefined
            }
            className={`h-2 rounded-full transition-all ${
              index === itemIndex
                ? "w-6 bg-[#D99BA0]"
                : "w-2 bg-[#E8D5D0]"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
