
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

import newReader from "../assets/cute-mouse-holding-book.png";
import reviewer from "../assets/magic-book-with-sparkle.png";
import proReviewer from "../assets/smart-blue-dinosaur-with-tie.png";
import discoverer from "../assets/magic-magnifying-glass.png";
import proDiscoverer from "../assets/green-dragon-with-magnifying-glass.png";

import {
  Trophy,
  ArrowLeft,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Medal,
  X,
  Loader2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .replace(/\/+$/, "") + "/api/auth";

const rewardItems = [
  {
    code: "FIRST_SHELF",
    title: "นักอ่านหน้าใหม่",
    description: "บันทึกรีวิวหนังสือจาก Feed เป็นครั้งแรก",
    image: newReader,
  },
  {
    code: "FIRST_REVIEW",
    title: "นักรีวิว",
    description: "เขียนรีวิวหนังสือเป็นครั้งแรก",
    image: reviewer,
  },
  {
    code: "REVIEW_50",
    title: "นักรีวิวมือโปร",
    description: "เขียนรีวิวครบ 50 ครั้ง",
    image: proReviewer,
  },
  {
    code: "FIRST_SWIPE",
    title: "นักค้นหา",
    description: "ค้นหาหนังสือครั้งแรก",
    image: discoverer,
  },
  {
    code: "SWIPE_50",
    title: "นักค้นพบ",
    description: "ค้นหาหนังสือครบ 50 ครั้ง",
    image: proDiscoverer,
  },
];

const STORAGE_PREFIX = "letsread-reward-order-v1";

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readSavedOrder(userId) {
  if (!userId) return [];

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (code) => typeof code === "string"
    );
  } catch {
    return [];
  }
}

function mergeRewardOrder(savedOrder, availableCodes) {
  const allowed = new Set(availableCodes);

  return [
    ...new Set([
      ...savedOrder.filter((code) => allowed.has(code)),
      ...availableCodes,
    ]),
  ];
}


function RewardCard({
  reward,
  index,
  editing,
  total,
  onMove,
  onDetails,
}) {
  return (
    <div className="group relative flex w-[112px] shrink-0 flex-col items-center text-center sm:w-[130px]">
      {editing && (
        <span className="absolute left-1 top-0 z-10 rounded-full bg-[#A76F71] px-2 py-0.5 text-[10px] font-bold text-white">
          {index + 1}
        </span>
      )}

      <button
        type="button"
        onClick={() => {
          if (!editing) onDetails(reward);
        }}
        disabled={editing}
        aria-label={`ดูรายละเอียดรางวัล ${reward.title}`}
        className="flex w-full flex-col items-center rounded-xl p-2 transition hover:bg-[#FFF7F2] disabled:cursor-default disabled:hover:bg-transparent"
      >
        {/* รูปเหรียญ ไม่มีกรอบวงกลม */}
        <div className="flex h-[88px] w-[88px] items-center justify-center sm:h-[104px] sm:w-[104px]">
          <img
            src={reward.image}
            alt={reward.title}
            className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        <p className="mt-2 line-clamp-2 min-h-[36px] text-xs font-bold leading-[18px] text-[#674B45] sm:text-sm">
          {reward.title}
        </p>

        {!editing && (
          <span className="mt-1 text-[10px] text-[#B18A83]">
            ดูรายละเอียด
          </span>
        )}
      </button>

      {editing && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            aria-label={`เลื่อน ${reward.title} ไปทางซ้าย`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8E8E2] text-[#946B69] transition hover:bg-[#EED5CB] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="min-w-4 text-center text-xs font-bold text-[#A76F71]">
            {index + 1}
          </span>

          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            aria-label={`เลื่อน ${reward.title} ไปทางขวา`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8E8E2] text-[#946B69] transition hover:bg-[#EED5CB] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}


export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const [earnedRewards, setEarnedRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [rewardError, setRewardError] = useState("");

  const [rewardOrder, setRewardOrder] = useState([]);
  const [editingRewards, setEditingRewards] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  const [selectedReward, setSelectedReward] = useState(null);

  // โหลดโปรไฟล์
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!active) return;

        setUser(authUser);

        if (!authUser) {
          setProfileData({});
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("User")
            .select("User_Name, User_Avatar_URL")
            .eq("auth_user_id", authUser.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (active) {
          setProfileData(profile || {});
        }
      } catch (error) {
        console.error("[Profile] Load profile:", error);

        if (active) setProfileData({});
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // โหลดรางวัล
  useEffect(() => {
    let active = true;

    async function loadRewards() {
      try {
        setLoadingRewards(true);
        setRewardError("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.access_token) {
          throw new Error("กรุณาเข้าสู่ระบบเพื่อดูรางวัล");
        }

        const response = await fetch(`${API_URL}/rewards`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "ไม่สามารถโหลดข้อมูลรางวัลได้"
          );
        }

        if (active) {
          setEarnedRewards(
            Array.isArray(result.rewards)
              ? result.rewards
              : []
          );
        }
      } catch (error) {
        console.error("[Profile] Load rewards:", error);

        if (active) {
          setRewardError(
            error.message || "ไม่สามารถโหลดข้อมูลรางวัลได้"
          );
        }
      } finally {
        if (active) setLoadingRewards(false);
      }
    }

    loadRewards();

    return () => {
      active = false;
    };
  }, []);

  // โหลดลำดับที่เคยบันทึกเมื่อบัญชีพร้อม
  useEffect(() => {
    if (!user?.id) {
      setRewardOrder([]);
      return;
    }

    setRewardOrder(readSavedOrder(user.id));
  }, [user?.id]);

  const username =
    profileData?.User_Name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "นักอ่าน";

  const avatarUrl = profileData?.User_Avatar_URL || null;

  // รางวัลที่ปลดล็อกจริงเท่านั้น
  const unlockedRewards = useMemo(() => {
    const unlockedCodes = new Set(
      earnedRewards
        .filter((reward) => reward.unlocked === true)
        .map((reward) => reward.code)
    );

    return rewardItems.filter((reward) =>
      unlockedCodes.has(reward.code)
    );
  }, [earnedRewards]);

  // จัดลำดับตามที่ผู้ใช้เลือก
  const orderedRewards = useMemo(() => {
    const codes = unlockedRewards.map(
      (reward) => reward.code
    );

    const mergedOrder = mergeRewardOrder(
      rewardOrder,
      codes
    );

    const rewardMap = new Map(
      unlockedRewards.map((reward) => [
        reward.code,
        reward,
      ])
    );

    return mergedOrder
      .map((code) => rewardMap.get(code))
      .filter(Boolean);
  }, [rewardOrder, unlockedRewards]);

  const startEditingRewards = () => {
    setRewardOrder(
      orderedRewards.map((reward) => reward.code)
    );
    setOrderMessage("");
    setEditingRewards(true);
  };

  const moveReward = (index, direction) => {
    const nextIndex = index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= orderedRewards.length
    ) {
      return;
    }

    const nextOrder = orderedRewards.map(
      (reward) => reward.code
    );

    [nextOrder[index], nextOrder[nextIndex]] = [
      nextOrder[nextIndex],
      nextOrder[index],
    ];

    setRewardOrder(nextOrder);
  };

  const saveRewardOrder = () => {
    if (!user?.id) {
      setOrderMessage("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    try {
      localStorage.setItem(
        getStorageKey(user.id),
        JSON.stringify(
          orderedRewards.map((reward) => reward.code)
        )
      );

      setEditingRewards(false);
      setOrderMessage("บันทึกลำดับรางวัลเรียบร้อยแล้ว");
    } catch (error) {
      console.error("[Profile] Save reward order:", error);
      setOrderMessage("บันทึกลำดับไม่สำเร็จ");
    }
  };

  const cancelEditingRewards = () => {
    setRewardOrder(readSavedOrder(user?.id));
    setEditingRewards(false);
    setOrderMessage("");
  };

  const resetRewardOrder = () => {
    setRewardOrder(
      unlockedRewards.map((reward) => reward.code)
    );
    setOrderMessage("");
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-8">

      {/* กลับไปหน้าตั้งค่า */}
      <button
        type="button"
        onClick={() => navigate("/settings")}
        aria-label="กลับไปหน้าตั้งค่า"
        title="กลับไปหน้าตั้งค่า"
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EEDCD3]/80 bg-[#FFFAF7]/80 text-[#946B69] shadow-sm transition hover:bg-white"
      >
        <ArrowLeft size={19} strokeWidth={1.8} />
      </button>

      {/* โปรไฟล์ */}
      <section className="overflow-hidden rounded-[28px] border border-[#F1DFD7] bg-[#FFFAF7] shadow-[0_12px_35px_rgba(100,61,56,0.07)]">
        <div className="h-20 bg-gradient-to-r from-[#E9B9AD] via-[#F4D4C9] to-[#F9E7DE] sm:h-28" />

        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">

            <div className="relative z-10 shrink-0 rounded-full border-[5px] border-[#FFFAF7] bg-[#FFFAF7] shadow-md">
              <UserAvatar
                avatarUrl={avatarUrl}
                userName={username}
                size={100}
              />
            </div>

            <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="break-words text-2xl font-extrabold tracking-tight text-[#49332F]">
                {username}
              </h1>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/settings/profile/edit")
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#A76F71] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#915C60] sm:mb-2"
            >
              <Pencil size={16} />
              แก้ไขโปรไฟล์
            </button>
          </div>
        </div>
      </section>

      {/* รางวัลของฉัน */}
      <section className="mt-7">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#49332F]">
              <Trophy
                size={20}
                className="text-[#B77C69]"
              />
              รางวัลของฉัน
            </h2>

            <p className="mt-1 text-xs text-[#A18C85]">
              เก็บสะสมความสำเร็จจากการอ่านและรีวิว
            </p>
          </div>

          {!loadingRewards &&
            !rewardError &&
            unlockedRewards.length > 1 &&
            !editingRewards && (
              <button
                type="button"
                onClick={startEditingRewards}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E8D5D0] bg-white px-4 py-2.5 text-xs font-bold text-[#946B69] transition hover:bg-[#FFF4EF]"
              >
                <Pencil size={14} />
                จัดเรียงรางวัล
              </button>
            )}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#F1DFD7] bg-white shadow-sm">

          {/* หัวตู้โชว์ */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1E3DC] bg-gradient-to-r from-[#FFF5ED] to-[#FFFAF7] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6DED2] text-[#A76F71]">
                <Medal size={21} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#674B45]">
                  ตู้โชว์เหรียญรางวัล
                </p>
                <p className="text-xs text-[#A18C85]">
                  ความสำเร็จของคุณ
                </p>
              </div>
            </div>

            {!loadingRewards && !rewardError && (
              <div className="rounded-full border border-[#ECD4C8] bg-white px-3 py-1.5 text-xs font-bold text-[#A76F71]">
                {unlockedRewards.length}/{rewardItems.length} รางวัล
              </div>
            )}
          </div>

          <div className="min-h-[190px] p-4 sm:p-6">
            {loadingRewards ? (
              <div className="flex min-h-[140px] items-center justify-center gap-2 text-sm text-[#907772]">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                กำลังโหลดข้อมูลรางวัล...
              </div>
            ) : rewardError ? (
              <div
                role="alert"
                className="py-10 text-center text-sm text-red-500"
              >
                {rewardError}
              </div>
            ) : orderedRewards.length === 0 ? (
              <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
                <Trophy
                  size={38}
                  className="mb-3 text-[#D8B7A8]"
                />

                <p className="text-sm font-bold text-[#674B45]">
                  ยังไม่มีรางวัลในตู้โชว์
                </p>

                <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#A18C85]">
                  เริ่มอ่าน ค้นหาหนังสือ และเขียนรีวิว
                  เพื่อสะสมรางวัลแรกของคุณ
                </p>
              </div>
            ) : (
              <>
                {editingRewards && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#F1DED4] bg-[#FFF8F3] p-3 text-xs leading-relaxed text-[#946B69]">
                    <Sparkles
                      size={16}
                      className="mt-0.5 shrink-0"
                    />
                    กดลูกศรซ้ายหรือขวาใต้เหรียญเพื่อเปลี่ยนลำดับ
                    แล้วกดบันทึกเมื่อจัดเรียงเสร็จ
                  </div>
                )}

                
<div
  className="
    flex w-full gap-3
    overflow-x-auto overflow-y-hidden
    scroll-smooth
    snap-x snap-mandatory
    overscroll-x-contain
    pb-4
    sm:gap-5
    [&::-webkit-scrollbar]:h-[5px]
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-track]:bg-[#F9EEE9]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-[#DDBDB2]
  "
>
  {orderedRewards.map((reward, index) => (
    <div key={reward.code} className="shrink-0 snap-start">
      <RewardCard
        reward={reward}
        index={index}
        total={orderedRewards.length}
        editing={editingRewards}
        onMove={moveReward}
        onDetails={setSelectedReward}
      />
    </div>
  ))}
</div>


                {editingRewards && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1E3DC] pt-4">
                    <button
                      type="button"
                      onClick={resetRewardOrder}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#946B69] hover:text-[#684B50]"
                    >
                      <RotateCcw size={15} />
                      คืนค่าลำดับเดิม
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingRewards}
                        className="rounded-xl border border-[#E8D5D0] bg-white px-4 py-2.5 text-xs font-bold text-[#946B69] hover:bg-[#FFF4EF]"
                      >
                        ยกเลิก
                      </button>

                      <button
                        type="button"
                        onClick={saveRewardOrder}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#A76F71] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#915C60]"
                      >
                        <Check size={15} />
                        บันทึกลำดับ
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {orderMessage && (
              <p
                role="status"
                className="mt-4 text-center text-xs font-semibold text-[#946B69]"
              >
                {orderMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* รีวิวของฉัน */}
      <section className="mt-7">
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#49332F]">
            <Trophy size={19} className="text-[#B77C69]" />
            รีวิวของฉัน
          </h2>
        </div>

        <div className="min-h-[180px] rounded-[24px] border border-[#F1DFD7] bg-white shadow-sm" />
      </section>

      {/* Popup รายละเอียดรางวัล */}
      {selectedReward && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E2020]/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReward(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-detail-title"
            className="relative w-full max-w-sm rounded-[26px] border border-[#F1DFD7] bg-[#FFFAF7] p-6 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedReward(null)}
              aria-label="ปิดรายละเอียด"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#946B69] hover:bg-[#F6E7DF]"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-3 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE9D9] to-[#FFF9F4] ring-2 ring-[#EED7CA]">
              <img
                src={selectedReward.image}
                alt={selectedReward.title}
                className="h-28 w-28 object-contain"
              />
            </div>

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#EAF5E9] px-3 py-1 text-xs font-bold text-[#55845B]">
              <Check size={13} />
              ได้รับรางวัลแล้ว
            </div>

            <h3
              id="reward-detail-title"
              className="mt-3 text-xl font-extrabold text-[#49332F]"
            >
              {selectedReward.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[#98777A]">
              {selectedReward.description}
            </p>

            <button
              type="button"
              onClick={() => setSelectedReward(null)}
              className="mt-6 w-full rounded-xl bg-[#A76F71] px-4 py-3 text-sm font-bold text-white hover:bg-[#915C60]"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
