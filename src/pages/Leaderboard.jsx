
import { useState } from "react";
import { ArrowUp, Crown, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("monthly");
  const isMonthly = period === "monthly";

  // Mock leaderboard data
  const rankList = [
    {
      rank: 1,
      name: "Reader_No1",
      reviews: isMonthly ? 45 : 320,
      badge: "🥇",
    },
    {
      rank: 2,
      name: "BookWorm_A",
      reviews: isMonthly ? 38 : 290,
      badge: "🥈",
    },
    {
      rank: 3,
      name: "NovelLover",
      reviews: isMonthly ? 30 : 255,
      badge: "🥉",
    },
    {
      rank: 4,
      name: "BookieBook",
      reviews: isMonthly ? 25 : 180,
    },
    {
      rank: 5,
      name: "StoryTeller",
      reviews: isMonthly ? 20 : 150,
    },
    {
      rank: 6,
      name: "USERNAME (คุณ)",
      reviews: isMonthly ? 17 : 129,
      isCurrentUser: true,
    },
  ];

  const currentUser = rankList.find(
    (user) => user.isCurrentUser
  );

  const previousRank = rankList.find(
    (user) => user.rank === currentUser.rank - 1
  );

  const reviewsNeeded = previousRank
    ? Math.max(
        0,
        previousRank.reviews - currentUser.reviews
      )
    : 0;

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
      {/* 1. Monthly / Yearly Tabs */}
      <div className="w-full shrink-0">
        <Tabs
          value={period}
          onValueChange={setPeriod}
          className="w-full"
        >
          <TabsList
            className="
              grid !h-auto w-full
              grid-cols-2 gap-2
              bg-transparent p-0
              shadow-none
            "
          >
            <TabsTrigger
              value="monthly"
              className="
                !h-auto min-h-[68px] min-w-0
                flex flex-col items-center justify-center
                gap-1 rounded-xl border
                border-transparent
                bg-white px-2 py-3
                text-center whitespace-normal
                shadow-sm
                data-[state=active]:border-orange-300
                data-[state=active]:bg-white
                data-[state=active]:shadow-sm
                sm:px-3
              "
            >
              <span className="text-xs font-bold text-gray-900 sm:text-sm">
                Monthly
              </span>

              <span className="text-center text-[10px] leading-snug text-gray-500">
                เหลืออีก 5 วัน 24 ชั่วโมง 10 นาที
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="yearly"
              className="
                !h-auto min-h-[68px] min-w-0
                flex flex-col items-center justify-center
                gap-1 rounded-xl border
                border-transparent
                bg-white px-2 py-3
                text-center whitespace-normal
                shadow-sm
                data-[state=active]:border-purple-300
                data-[state=active]:bg-white
                data-[state=active]:shadow-sm
                sm:px-3
              "
            >
              <span className="text-xs font-bold text-gray-900 sm:text-sm">
                Yearly
              </span>

              <span className="text-center text-[10px] leading-snug text-gray-500">
                เหลืออีก 116 วัน 24 ชั่วโมง 10 นาที
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2. Top 1–3 Rewards */}
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
              {isMonthly ? "ประจำเดือนนี้" : "ประจำปี"}
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
                className={`
                  flex h-24 w-24
                  items-center justify-center
                  rounded-full border-4
                  bg-muted/40 shadow-md
                  sm:h-28 sm:w-28
                  ${
                    isMonthly
                      ? "border-orange-400"
                      : "border-indigo-300"
                  }
                `}
              >
                {isMonthly ? (
                  <span className="text-4xl">🔥</span>
                ) : (
                  <Crown className="h-12 w-12 text-amber-500" />
                )}
              </div>

              <p className="mt-3 text-xs font-bold leading-relaxed">
                เฟรมลิมิเต็ด
                {isMonthly ? "ประจำเดือน" : "ประจำปี"}

                <span className="block">
                  เฉพาะ
                  {isMonthly ? "เดือนนี้" : "ปีนี้"}
                  เท่านั้น!!
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
                    นักรีวิว TOP {item.rank}
                    {isMonthly
                      ? " ประจำเดือน"
                      : " ประจำปี"}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Leaderboard Rankings */}
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
          {rankList.map((user) => (
            <div
              key={user.rank}
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
                  {user.badge || `#${user.rank}`}
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
          ))}
        </CardContent>
      </Card>

      {/* 4. Floating Current User Ranking */}
      {/* Mobile: above Bottom Navigation */}
      {/* Desktop: bottom of viewport */}
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
              USERNAME
            </span>
          </div>

          {/* Reviews Needed */}
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-bold sm:text-xs">
              รีวิวอีก {reviewsNeeded} เรื่อง
            </p>

            <div
              className="
                flex items-center
                justify-end gap-1
                text-[10px] font-bold
                text-emerald-700 sm:text-xs
              "
            >
              <ArrowUp className="h-3 w-3" />
              <span>
                เพื่อขึ้นอันดับ {previousRank?.rank ?? 1}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
