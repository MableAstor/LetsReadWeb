
import { useEffect, useState } from "react";
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
} from "lucide-react";

import { supabase } from "../lib/supabase";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    "",
  ) + "/api/auth";

// รายการรางวัล
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

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // สถานะข้อมูลรางวัล
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [rewardError, setRewardError] = useState("");

  // โหลดข้อมูลผู้ใช้และโปรไฟล์
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
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
        console.error("[Profile] Load profile error:", error);

        if (active) {
          setProfileData({});
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // โหลดข้อมูลรางวัลจาก Backend
  useEffect(() => {
    let active = true;

    const loadRewards = async () => {
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
          method: "GET",
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
        console.error("[Profile] Load rewards error:", error);

        if (active) {
          setRewardError(
            error.message || "ไม่สามารถโหลดข้อมูลรางวัลได้"
          );
        }
      } finally {
        if (active) {
          setLoadingRewards(false);
        }
      }
    };

    loadRewards();

    return () => {
      active = false;
    };
  }, []);

  // ตรวจสอบชื่อผู้ใช้
  const username =
    profileData?.User_Name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "นักอ่าน";

  const avatarUrl = profileData?.User_Avatar_URL || null;

  return (
    <main className="mx-auto w-full max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-8">

      {/* ปุ่มกลับ */}
      <button
        type="button"
        onClick={() => navigate("/settings")}
        aria-label="กลับไปหน้าตั้งค่า"
        title="กลับไปหน้าตั้งค่า"
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EEDCD3]/80 bg-[#FFFAF7]/80 text-[#946B69] shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A76F71] active:scale-95"
      >
        <ArrowLeft size={19} strokeWidth={1.8} />
      </button>

      {/* ส่วนแสดงโปรไฟล์ */}
      <section className="overflow-hidden rounded-[28px] border border-[#F1DFD7] bg-[#FFFAF7] shadow-[0_12px_35px_rgba(100,61,56,0.07)]">
        <div className="h-20 bg-gradient-to-r from-[#E9B9AD] via-[#F4D4C9] to-[#F9E7DE] sm:h-28" />

        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">

            {/* รูปโปรไฟล์ */}
            <div className="relative z-10 shrink-0 rounded-full border-[5px] border-[#FFFAF7] bg-[#FFFAF7] shadow-md">
              <UserAvatar
                avatarUrl={avatarUrl}
                userName={username}
                size={100}
              />
            </div>

            {/* ข้อมูลผู้ใช้ */}
            <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="break-words text-2xl font-extrabold tracking-tight text-[#49332F]">
                {username}
              </h1>
            </div>

            {/* ปุ่มไปหน้า EditPage */}
            <button
              type="button"
              onClick={() => navigate("/settings/profile/edit")}
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
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#49332F]">
            <Trophy size={19} className="text-[#B77C69]" />
            รางวัลของฉัน
          </h2>
        </div>

        <div className="min-h-[180px] rounded-[24px] border border-[#F1DFD7] bg-white p-5 shadow-sm">
          {loadingRewards ? (
            <p className="text-center text-sm text-[#907772]">
              กำลังโหลดข้อมูลรางวัล...
            </p>
          ) : rewardError ? (
            <p className="text-center text-sm text-red-500">
              ไม่สามารถโหลดข้อมูลรางวัลได้
            </p>
          ) : (
            <div className="flex flex-wrap gap-5">
              {rewardItems
                .filter((reward) =>
                  earnedRewards.some(
                    (item) =>
                      item.code === reward.code &&
                      item.unlocked === true
                  )
                )
                .map((reward) => (
                  <div
                    key={reward.code}
                    className="flex w-20 flex-col items-center text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F1DFD7] bg-[#FFFAF7] p-2">
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <p className="mt-2 text-xs font-semibold text-[#674B45]">
                      {reward.title}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* ส่วนรีวิวของฉัน */}
      <section className="mt-7">
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#49332F]">
            <Trophy size={19} className="text-[#B77C69]" />
            รีวิวของฉัน
          </h2>
        </div>

        {/* กรอบแสดงประวัติรายการรีวิว */}
        <div className="min-h-[180px] rounded-[24px] border border-[#F1DFD7] bg-white shadow-sm">
        </div>
      </section>

    </main>
  );
}
