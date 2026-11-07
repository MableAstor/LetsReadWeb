import { useEffect, useState } from "react";

import { ArrowUp, Crown, Trophy } from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// ======================================================
// ตรวจสอบเดือนปัจจุบันตามเวลาไทย
// ใช้ตรวจจับเมื่อเปลี่ยนเดือนเพื่อโหลด Leaderboard ใหม่
// ======================================================

function getBangkokMonthKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  return `${year}-${month}`;
}

export default function LeaderboardPage() {
  // ข้อมูล Leaderboard จาก Backend
  const [leaderboardData, setLeaderboardData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Countdown ถึงสิ้นเดือน
  const [countdown, setCountdown] = useState("");

  const rankList = leaderboardData?.rankings || [];
  const currentUser = leaderboardData?.currentUser || null;
  const previousRank = leaderboardData?.previousRank || null;

  const reviewsNeeded =
    Number(leaderboardData?.reviewsNeeded) || 0;

  // ======================================================
  // โหลด Leaderboard จาก Backend
  // GET /api/auth/leaderboard
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      setErrorMessage("");
      setLeaderboardData(null);

      try {
        // ตรวจสอบ Session ของผู้ใช้
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.access_token) {
          throw new Error(
            "กรุณาเข้าสู่ระบบก่อนดูตารางอันดับ"
          );
        }

        // เรียก API Leaderboard รายเดือน
        const response = await fetch(
          `${API_URL}/leaderboard`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "โหลดตารางอันดับไม่สำเร็จ"
          );
        }

        if (!cancelled) {
          setLeaderboardData(result);
        }
      } catch (error) {
        console.error("[Leaderboard] Load error:", error);

        if (!cancelled) {
          setLeaderboardData(null);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "เกิดข้อผิดพลาดในการโหลดตารางอันดับ"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ======================================================
  // ตรวจจับการเปลี่ยนเดือน
  // หากขึ้นเดือนใหม่ ให้โหลด Leaderboard ใหม่อัตโนมัติ
  // ======================================================

  useEffect(() => {
    let lastMonthKey = getBangkokMonthKey();

    const timerId = window.setInterval(() => {
      const nextMonthKey = getBangkokMonthKey();

      if (nextMonthKey !== lastMonthKey) {
        lastMonthKey = nextMonthKey;

        setReloadKey((key) => key + 1);

        console.log(
          "[Leaderboard] New month detected. Reloading rankings..."
        );
      }
    }, 30_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  // ======================================================
  // Countdown ถึงสิ้นเดือนตามเวลาไทย
  // ======================================================

  useEffect(() => {
    function formatRemainingTime(endDate) {
      const remaining = Math.max(
        0,
        endDate.getTime() - Date.now()
      );

      const days = Math.floor(
        remaining / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (remaining % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (remaining % (1000 * 60 * 60)) /
          (1000 * 60)
      );

      return `เหลืออีก ${days} วัน ${hours} ชั่วโมง ${minutes} นาที`;
    }

    function updateCountdown() {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "numeric",
      }).formatToParts(new Date());

      const year = Number(
        parts.find((part) => part.type === "year")?.value
      );

      const month = Number(
        parts.find((part) => part.type === "month")?.value
      );

      // เวลาเริ่มต้นวันที่ 1 ของเดือนถัดไป เวลาไทย
      const nextMonthTime =
        Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS;

      const endOfMonth = new Date(nextMonthTime);

      setCountdown(formatRemainingTime(endOfMonth));
    }

    updateCountdown();

    const timer = window.setInterval(
      updateCountdown,
      60_000
    );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // ======================================================
  // ของรางวัล TOP 1–3
  // คงการออกแบบเดิมไว้
  // ======================================================

  const rewardBadges = [
    {
      rank: 1,
      medal: "🥇",
      color: "bg-[#ffdf9e]",
    },
    {
      rank: 2,
      medal: "🥈",
      color: "bg-[#fbe7b3]",
    },
    {
      rank: 3,
      medal: "🥉",
      color: "bg-[#faecc7]",
    },
  ];

  return (
    <main
      className="
        relative mx-auto flex
        w-full max-w-xl min-w-0
        flex-col gap-4
        px-3 pt-4
        pb-[220px]
        text-foreground
        sm:px-4 sm:pt-6
        lg:pb-28
      "
    >
      {/* สถานะการโหลดและข้อผิดพลาด */}
      {loading && (
        <p className="py-3 text-center text-sm text-muted-foreground">
          กำลังโหลดตารางอันดับ...
        </p>
      )}

      {!loading && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-2 text-sm font-semibold underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* ======================================================
          1. Monthly Countdown
         ====================================================== */}

      <div className="w-full shrink-0">
        <div
          className="
            flex min-h-[68px] w-full
            flex-col items-center justify-center
            gap-1 rounded-xl border border-purple-300
            bg-white px-3 py-3 text-center shadow-sm
          "
        >
          <span className="text-sm font-bold text-gray-900">
            Monthly
          </span>

          <span className="text-[10px] leading-snug text-gray-500">
            {countdown}
          </span>
        </div>
      </div>

      {/* ======================================================
          2. Top 1–3 Rewards
         ====================================================== */}

      <Card
        className="
          w-full min-w-0 gap-4
          rounded-2xl border-0
          bg-card py-5 shadow-sm
          sm:rounded-3xl sm:py-6
        "
      >
        <CardHeader className="px-4 sm:px-6">
          <CardTitle
            className="
              text-center text-sm
              font-bold leading-relaxed
              sm:text-base
            "
          >
            ของรางวัลสำหรับ TOP 1-3

            <span className="block">
              ประจำเดือนนี้
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div
            className="
              grid grid-cols-1
              items-center gap-5
              sm:grid-cols-2 sm:gap-6
            "
          >
            {/* Limited Frame */}
            <div className="flex min-w-0 flex-col items-center text-center">
              <div
                className="
                  flex h-24 w-24
                  items-center justify-center
                  rounded-full border-4
                  border-indigo-300
                  bg-muted/40 shadow-md
                  sm:h-28 sm:w-28
                "
              >
                <Crown className="h-12 w-12 text-amber-500" />
              </div>

              <p className="mt-3 text-xs font-bold leading-relaxed">
                เฟรมลิมิเต็ดประจำเดือน

                <span className="block">
                  เฉพาะเดือนนี้เท่านั้น!!
                </span>
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                สำหรับนักรีวิวยอดเยี่ยม
              </p>
            </div>

            {/* Reward Badges */}
            <div className="flex min-w-0 flex-col gap-2.5">
              <p className="mb-1 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-left">
                พร้อมกับแท็กหลังชื่อสุดเก๋
                ติดท้ายอวดความเจ๋ง
              </p>

              {rewardBadges.map((item) => (
                <Badge
                  key={item.rank}
                  variant="secondary"
                  className={`
                    flex min-h-10 w-full
                    items-center justify-start
                    gap-2 rounded-full
                    border-0 px-3 py-2
                    text-left text-[11px]
                    font-bold text-gray-900
                    whitespace-normal shadow-xs
                    sm:text-xs
                    ${item.color}
                  `}
                >
                  <span className="shrink-0 text-base">
                    {item.medal}
                  </span>

                  <span className="min-w-0 leading-snug">
                    นักรีวิว TOP {item.rank} ประจำเดือน
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          3. Leaderboard Rankings
         ====================================================== */}

      <Card
        className="
          w-full min-w-0 gap-3
          rounded-2xl border-0
          bg-card py-4 shadow-sm
          sm:rounded-3xl sm:py-5
        "
      >
        <CardHeader className="px-4 sm:px-6">
          <CardTitle
            className="
              flex items-center gap-2
              text-sm font-bold
              sm:text-base
            "
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            ตารางอันดับนักรีวิว
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 px-3 sm:px-5">
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              กำลังโหลดอันดับ...
            </p>
          ) : errorMessage ? null : rankList.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              ยังไม่มีข้อมูลอันดับ
            </p>
          ) : (
            rankList.map((user) => (
              <div
                key={user.UserID ?? user.rank}
                className={`
                  flex w-full min-w-0
                  items-center justify-between
                  gap-2 rounded-xl
                  px-3 py-3 transition-colors
                  sm:gap-3 sm:px-4
                  ${
                    user.isCurrentUser
                      ? "border border-amber-300 bg-[#fff5d6]"
                      : "hover:bg-muted/50"
                  }
                `}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  <span
                    className="
                      flex w-7 shrink-0
                      items-center justify-center
                      text-sm font-bold text-gray-600
                    "
                  >
                    {user.rank === 1
                      ? "🥇"
                      : user.rank === 2
                        ? "🥈"
                        : user.rank === 3
                          ? "🥉"
                          : `#${user.rank}`}
                  </span>

                  <span
                    className={`
                      min-w-0 truncate
                      text-xs sm:text-sm
                      ${
                        user.isCurrentUser
                          ? "font-bold text-gray-900"
                          : "text-foreground"
                      }
                    `}
                    title={user.name}
                  >
                    {user.name}
                    {user.isCurrentUser ? " (คุณ)" : ""}
                  </span>
                </div>

                <span
                  className="
                    shrink-0 text-right
                    text-xs font-medium
                    text-gray-500 sm:text-sm
                  "
                >
                  {user.reviews} รีวิว
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ======================================================
          4. Floating Current User Ranking
          Mobile: above Bottom Navigation
          Desktop: bottom of viewport
         ====================================================== */}

      {!loading && !errorMessage && currentUser && (
        <Card
          className="
            fixed
            bottom-[calc(88px+env(safe-area-inset-bottom))]
            left-1/2 z-40
            w-[calc(100%-2rem)]
            max-w-xl
            -translate-x-1/2

            rounded-2xl
            border border-amber-200
            bg-[#fce49b]
            py-0 text-gray-900
            shadow-lg

            lg:bottom-4
          "
        >
          <CardContent
            className="
              flex min-w-0
              items-center justify-between
              gap-2 px-3 py-3
              sm:gap-4 sm:px-4
            "
          >
            {/* User Rank */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div
                className="
                  shrink-0 rounded-xl
                  bg-white/90 px-3 py-1.5
                  text-center shadow-xs
                "
              >
                <span className="block text-[9px] font-medium text-gray-500">
                  ลำดับของคุณ
                </span>

                <span className="block text-sm font-black">
                  #{currentUser.rank}
                </span>
              </div>

              <span className="min-w-0 truncate text-xs font-bold sm:text-sm">
                {currentUser.name}
              </span>
            </div>

            {/* Reviews Needed */}
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-bold sm:text-xs">
                {currentUser.rank === 1
                  ? "คุณอยู่อันดับ 1 แล้ว"
                  : `รีวิวอีก ${reviewsNeeded} เรื่อง`}
              </p>

              <div
                className="
                  flex items-center
                  justify-end gap-1
                  text-[10px] font-bold
                  text-emerald-700 sm:text-xs
                "
              >
                {currentUser.rank !== 1 && (
                  <>
                    <ArrowUp className="h-3 w-3" />

                    <span>
                      เพื่อขึ้นอันดับ {previousRank?.rank ?? 1}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}