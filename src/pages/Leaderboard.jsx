import React, { useState } from 'react';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const isMonthly = period === 'monthly';

  // รายชื่ออันดับจำลองสำหรับแสดงในหน้า Leaderboard
  const rankList = [
    { rank: 1, name: 'Reader_No1', reviews: isMonthly ? 45 : 320, badge: '🥇' },
    { rank: 2, name: 'BookWorm_A', reviews: isMonthly ? 38 : 290, badge: '🥈' },
    { rank: 3, name: 'NovelLover', reviews: isMonthly ? 30 : 255, badge: '🥉' },
    { rank: 4, name: 'BookieBook', reviews: isMonthly ? 25 : 180 },
    { rank: 5, name: 'StoryTeller', reviews: isMonthly ? 20 : 150 },
    { rank: 6, name: 'USERNAME (คุณ)', reviews: isMonthly ? 17 : 129, isCurrentUser: true },
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center pb-20 px-4 font-sans text-gray-800">
      
      {/* 1. แท็บเลือกระหว่าง Review Feed กับ Trophy & Leaderboard */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          className="py-2.5 bg-white text-xs font-bold rounded-xl shadow-sm text-gray-500 hover:text-black transition cursor-pointer text-center"
        >
          Review Feed
        </button>
        <button
          type="button"
          className="py-2.5 bg-white text-xs font-bold rounded-xl shadow-sm text-black border border-gray-200 text-center"
        >
          Trophy & Leaderboard
        </button>
      </div>

      {/* 2. แท็บเลือกช่วงเวลา (Monthly vs Yearly) */}
      <div className="w-full grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={() => setPeriod('monthly')}
          className={`py-2 px-3 rounded-xl text-center transition cursor-pointer shadow-sm ${
            isMonthly ? 'bg-white border-2 border-orange-200' : 'bg-white/70 hover:bg-white'
          }`}
        >
          <div className="text-xs font-bold text-black">Monthly</div>
          <div className="text-[10px] text-gray-500 mt-0.5">เหลืออีก 5 วัน 24 ชั่วโมง 10 นาที</div>
        </button>

        <button
          type="button"
          onClick={() => setPeriod('yearly')}
          className={`py-2 px-3 rounded-xl text-center transition cursor-pointer shadow-sm ${
            !isMonthly ? 'bg-white border-2 border-purple-200' : 'bg-white/70 hover:bg-white'
          }`}
        >
          <div className="text-xs font-bold text-black">Yearly</div>
          <div className="text-[10px] text-gray-500 mt-0.5">เหลืออีก 116 วัน 24 ชั่วโมง 10 นาที</div>
        </button>
      </div>

      {/* 3. กล่องของรางวัล TOP 1-3 (ตามดีไซน์รูปภาพ) */}
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm mt-4 relative pb-12">
        <h2 className="text-sm font-bold text-center text-black mb-5">
          ของรางวัลสำหรับ TOP 1-3 {isMonthly ? 'ประจำเดือนนี้' : 'ประจำปี'}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* ซ้าย: เฟรมรูป */}
          <div className="flex flex-col items-center text-center sm:w-1/2">
            <div className="relative w-24 h-24 flex items-center justify-center mb-2">
              <div
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-gray-50 ${
                  isMonthly ? 'border-orange-400' : 'border-indigo-300'
                } shadow-md`}
              >
                <span className="text-2xl">{isMonthly ? '🔥' : '👑'}</span>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-800 leading-tight">
              เฟรมลิมิเต็ด{isMonthly ? 'ประจำเดือน' : 'ประจำปี'}<br />
              เฉพาะ{isMonthly ? 'เดือนนี้' : 'ปีนี้'}เท่านั้น!!<br />
              <span className="font-normal text-gray-500">สำหรับนักรีวิวยอดเยี่ยม</span>
            </p>
          </div>

          {/* ขวา: แท็กชื่อ TOP 1-3 */}
          <div className="flex flex-col gap-2 sm:w-1/2 w-full">
            <p className="text-[10px] text-gray-500 text-center sm:text-left">
              พร้อมกับแท็กหลังชื่อสุดเก๋ ติดท้ายอวดความเจ๋ง
            </p>

            <div className="flex items-center gap-2 bg-[#ffdf9e] px-3 py-1.5 rounded-full text-xs font-bold text-gray-900">
              <span>🥇 1</span>
              <span>นักรีวิว TOP 1 {isMonthly ? 'ประจำเดือน' : 'ประจำปี'}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#fbe7b3] px-3 py-1.5 rounded-full text-xs font-bold text-gray-900">
              <span>🥈 2</span>
              <span>นักรีวิว TOP 2 {isMonthly ? 'ประจำเดือน' : 'ประจำปี'}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#faecc7] px-3 py-1.5 rounded-full text-xs font-bold text-gray-900">
              <span>🥉 3</span>
              <span>นักรีวิว TOP 3 {isMonthly ? 'ประจำเดือน' : 'ประจำปี'}</span>
            </div>
          </div>
        </div>

        {/* แถบลำดับของคุณ (#6) ลอยทับล่างสุด */}
        <div className="absolute -bottom-5 left-4 right-4 bg-[#fce49b] rounded-2xl p-2.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 px-2 py-0.5 rounded-lg text-center">
              <span className="block text-[8px] text-gray-500 font-medium">ลำดับของคุณ</span>
              <span className="text-xs font-black text-black">#6</span>
            </div>
            <span className="font-bold text-xs tracking-wider text-black">USERNAME</span>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-bold text-gray-900">
              รีวิวอีก {isMonthly ? '3' : '21'} เรื่อง
            </div>
            <div className="text-[10px] font-bold text-green-700">
              ↑ เพื่อขึ้น อันดับ 5
            </div>
          </div>
        </div>
      </div>

      {/* 4. ตารางจัดอันดับ (Leaderboard List) ต่อด้านล่าง */}
      <div className="w-full mt-10 bg-white rounded-3xl p-5 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-gray-500 mb-3 px-2">
          ตารางอันดับนักรีวิว
        </h3>

        {rankList.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition ${
              user.isCurrentUser ? 'bg-[#fff5d6] border border-amber-300 font-bold' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-black text-center text-gray-600">
                {user.badge || `#${user.rank}`}
              </span>
              <span className="text-xs text-gray-800">{user.name}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {user.reviews} รีวิว
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}