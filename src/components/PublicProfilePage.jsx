import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Trophy,
    Medal,
    BookOpen,
    Loader2,
    Heart,
    Star,
    Bookmark,
    CalendarDays,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import UserAvatar from "./UserAvatar";

// ======================================================
// รูปเหรียญรางวัล
// ======================================================

import newReader from "../assets/cute-mouse-holding-book.png";
import reviewer from "../assets/magic-book-with-sparkle.png";
import proReviewer from "../assets/smart-blue-dinosaur-with-tie.png";
import discoverer from "../assets/magic-magnifying-glass.png";
import proDiscoverer from "../assets/green-dragon-with-magnifying-glass.png";

// ======================================================
// รูปกรอบโปรไฟล์
// ======================================================

import firstLogin from "../assets/pink-cloud-circle-frame-2026.png";
import reviewFive from "../assets/red-fire-abstract-frame.png";
import toponeNOV from "../assets/blue-and-orange-fish-frame.png";
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png";
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png";
import toponeDEC from "../assets/red-cat-yarn-frame.png.png";
import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png";
import topthreeDEC from "../assets/golden-thorn-vines-frame.png";

import PublicProfileSkeleton from "../components/skeleton/PublicProfileSkeleton";

// ======================================================
// API URL
// ======================================================

const API_URL =
    (import.meta.env.VITE_API_URL || "http://localhost:5000")
        .replace(/\/+$/, "") + "/api/auth";

// ======================================================
// รายการเหรียญรางวัล
// ======================================================

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

// ======================================================
// รูปกรอบตาม FrameID
// ======================================================

const FRAME_IMAGES = {
    1: firstLogin,
    2: reviewFive,
    3: toponeNOV,
    4: toptwoNOV,
    5: topthreeNOV,
    6: toponeDEC,
    7: toptwoDEC,
    8: topthreeDEC,
};

// ======================================================
// จัดรูปแบบวันที่
// ======================================================

function formatReviewDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ======================================================
// PUBLIC PROFILE PAGE
// ======================================================

export default function PublicProfilePage() {
    const navigate = useNavigate();
    const { userId } = useParams();

    // ข้อมูลโปรไฟล์
    const [profile, setProfile] = useState(null);

    // ข้อมูลรางวัล
    const [rewards, setRewards] = useState([]);

    // รีวิวทั้งหมดของเจ้าของโปรไฟล์
    const [reviews, setReviews] = useState([]);

    // Loading และ Error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ======================================================
    // โหลดข้อมูล Public Profile
    // ======================================================

    useEffect(() => {
        let active = true;

        async function loadPublicProfile() {
            try {
                setLoading(true);
                setError("");

                // ตรวจสอบ Session ของผู้เข้าชม
                // หาก Login อยู่ จะส่ง Token เพื่อแสดงสถานะ Like / Save

                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                const headers = {};

                if (session?.access_token) {
                    headers.Authorization =
                        `Bearer ${session.access_token}`;
                }

                // เรียก API ด้วย UserID จาก URL
                const response = await fetch(
                    `${API_URL}/public-profile/${encodeURIComponent(userId)}`,
                    {
                        method: "GET",
                        headers,
                    }
                );

                const result = await response
                    .json()
                    .catch(() => ({}));

                if (!response.ok || result.success === false) {
                    throw new Error(
                        result.message || "ไม่สามารถโหลดโปรไฟล์ได้"
                    );
                }

                if (!active) return;

                setProfile(result.profile || null);

                setRewards(
                    Array.isArray(result.rewards)
                        ? result.rewards
                        : []
                );

                setReviews(
                    Array.isArray(result.reviews)
                        ? result.reviews
                        : []
                );

            } catch (err) {
                console.error(
                    "[Public Profile] Load error:",
                    err
                );

                if (active) {
                    setError(
                        err.message || "ไม่สามารถโหลดโปรไฟล์ได้"
                    );
                }

            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (userId) {
            loadPublicProfile();
        } else {
            setLoading(false);
            setError("ไม่พบรหัสผู้ใช้");
        }

        return () => {
            active = false;
        };
    }, [userId]);

    // ======================================================
    // กำลังโหลด
    // ======================================================

    if (loading) {
  return <PublicProfileSkeleton />;
}

    // ======================================================
    // ไม่พบโปรไฟล์
    // ======================================================

    if (error || !profile) {
        return (
            <main className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8E9E1]">
                    <BookOpen
                        size={30}
                        className="text-[#B77C69]"
                    />
                </div>

                <h2 className="text-lg font-bold text-[#674B45]">
                    ไม่พบโปรไฟล์นักอ่าน
                </h2>

                <p className="mt-2 text-sm text-[#A18C85]">
                    {error || "ไม่พบข้อมูลสมาชิกที่คุณกำลังค้นหา"}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-5 rounded-xl bg-[#A76F71] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#915C60]"
                >
                    กลับหน้าก่อนหน้า
                </button>
            </main>
        );
    }

    // ======================================================
    // เตรียมข้อมูลสำหรับแสดงผล
    // ======================================================

    const username = profile.User_Name || "นักอ่าน";

    const avatarUrl = profile.User_Avatar_URL || null;

    // กรอบที่เจ้าของโปรไฟล์กำลังใช้งาน
    const activeFrameId = Number(
        profile.Active_Frame_RewardsID
    );

    const activeFrameImage =
        FRAME_IMAGES[activeFrameId] || null;

    // แสดงเฉพาะเหรียญที่ปลดล็อกแล้ว
    const unlockedRewards = rewardItems.filter((item) =>
        rewards.some(
            (reward) =>
                reward.code === item.code &&
                reward.unlocked === true
        )
    );

    // ======================================================
    // RENDER
    // ======================================================

    return (
        <main className="mx-auto w-full max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-8">

            {/* กลับหน้าก่อนหน้า */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="กลับหน้าก่อนหน้า"
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EEDCD3] bg-[#FFFAF7] text-[#946B69] shadow-sm transition hover:bg-white"
            >
                <ArrowLeft size={19} />
            </button>

            {/* ==================================================
          PROFILE INFORMATION
         ================================================== */}

            <section className="overflow-hidden rounded-[28px] border border-[#F1DFD7] bg-[#FFFAF7] shadow-[0_12px_35px_rgba(100,61,56,0.07)]">

                <div className="h-24 bg-gradient-to-r from-[#E9B9AD] via-[#F4D4C9] to-[#F9E7DE] sm:h-32" />

                <div className="relative px-5 pb-7 sm:px-8 sm:pb-8">
                    <div className="-mt-12 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">

                        {/* รูปโปรไฟล์พร้อมกรอบที่กำลังใช้งาน */}
                        <div className="relative z-10 shrink-0 rounded-full border-[5px] border-[#FFFAF7] bg-[#FFFAF7] shadow-md">
                            <UserAvatar
                                avatarUrl={avatarUrl}
                                userName={username}
                                frameImage={activeFrameImage}
                                size={100}
                                frameScale={1.3}
                            />
                        </div>

                        {/* ชื่อผู้ใช้ */}
                        <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">
                            <p className="mb-1 text-[10px] font-bold tracking-[2px] text-[#B78A7D]">
                                READER PROFILE
                            </p>

                            <h1 className="break-words text-2xl font-extrabold text-[#49332F]">
                                {username}
                            </h1>

                            <p className="mt-1 text-xs text-[#A18C85]">
                                สมาชิกชุมชนนักอ่าน Let Read
                            </p>
                        </div>

                        {/* จำนวนรีวิวและรางวัล */}
                        <div className="flex gap-2 sm:mb-2">

                            <div className="rounded-xl border border-[#EEDDD4] bg-white px-4 py-2 text-center">
                                <p className="text-lg font-extrabold text-[#A76F71]">
                                    {reviews.length}
                                </p>

                                <p className="text-[10px] text-[#A18C85]">
                                    รีวิว
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#EEDDD4] bg-white px-4 py-2 text-center">
                                <p className="text-lg font-extrabold text-[#A76F71]">
                                    {unlockedRewards.length}
                                </p>

                                <p className="text-[10px] text-[#A18C85]">
                                    รางวัล
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ==================================================
          ACHIEVEMENTS / REWARDS
         ================================================== */}

            <section className="mt-8">

                <div className="mb-4">
                    <p className="mb-1 text-[10px] font-bold tracking-[2px] text-[#B78A7D]">
                        ACHIEVEMENTS
                    </p>

                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#49332F]">
                        <Trophy
                            size={21}
                            className="text-[#B77C69]"
                        />
                        รางวัลที่ได้รับ
                    </h2>

                    <p className="mt-1 text-xs text-[#A18C85]">
                        ความสำเร็จที่สะสมจากการใช้งาน Let Read
                    </p>
                </div>

                <div className="rounded-[26px] border border-[#F0DDD3] bg-[#FFF8F3] p-4 shadow-sm sm:p-6">

                    {/* หัวตู้โชว์ */}
                    <div className="mb-4 flex items-center gap-3 border-b border-[#EEDDD4] pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6DED2] text-[#A76F71]">
                            <Medal size={21} />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-[#674B45]">
                                ตู้โชว์เหรียญรางวัล
                            </p>

                            <p className="text-xs text-[#A18C85]">
                                เหรียญที่ปลดล็อกแล้ว
                            </p>
                        </div>
                    </div>

                    {unlockedRewards.length === 0 ? (
                        <div className="py-8 text-center">
                            <Trophy
                                size={34}
                                className="mx-auto mb-3 text-[#D8B7A8]"
                            />

                            <p className="text-sm text-[#A18C85]">
                                ยังไม่มีรางวัลที่ปลดล็อก
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-5">

                            {unlockedRewards.map((reward) => (
                                <div
                                    key={reward.code}
                                    className="flex w-[112px] flex-col items-center text-center sm:w-[130px]"
                                >
                                    <div className="flex h-[88px] w-[88px] items-center justify-center sm:h-[104px] sm:w-[104px]">
                                        <img
                                            src={reward.image}
                                            alt={reward.title}
                                            loading="lazy"
                                            className="h-full w-full object-contain drop-shadow-sm"
                                        />
                                    </div>

                                    <p className="mt-2 text-xs font-bold leading-relaxed text-[#674B45] sm:text-sm">
                                        {reward.title}
                                    </p>

                                    <p className="mt-1 text-[10px] leading-relaxed text-[#A18C85]">
                                        {reward.description}
                                    </p>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </section>

            {/* ==================================================
          MEMBER REVIEWS - MY READING JOURNAL
         ================================================== */}

            <section className="mt-8">

                {/* ส่วนหัว */}
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="mb-1 text-[10px] font-bold tracking-[2px] text-[#B78A7D]">
                            MY READING JOURNAL
                        </p>

                        <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#49332F]">
                            <BookOpen
                                size={22}
                                className="text-[#B77C69]"
                            />
                            รีวิวของ {username}
                        </h2>

                        <p className="mt-1 text-xs text-[#A18C85]">
                            ทุกเรื่องราวและความประทับใจที่เคยแบ่งปัน
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-[#F0DDD3] bg-[#FFF8F3] px-4 py-3">
                        <span className="text-2xl font-extrabold text-[#A76F71]">
                            {reviews.length}
                        </span>

                        <span className="text-[9px] font-bold tracking-wider text-[#B18A83]">
                            REVIEWS
                        </span>
                    </div>
                </div>

                {/* กล่องรวบรวมรีวิว */}
                <div className="overflow-hidden rounded-[26px] border border-[#F0DDD3] bg-[#FFF8F3] p-4 shadow-[0_8px_25px_rgba(100,61,56,0.05)] sm:p-6">

                    {/* หัวข้อภายในกล่อง */}
                    <div className="mb-5 flex items-center justify-between border-b border-[#EEDDD4] pb-4">
                        <div>
                            <h3 className="text-sm font-bold text-[#674B45]">
                                บันทึกการอ่าน
                            </h3>

                            <p className="mt-1 text-[11px] text-[#A18C85]">
                                รีวิวหนังสือที่สมาชิกเคยแบ่งปัน
                            </p>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[#A76F71] shadow-sm">
                            เรียงจากล่าสุด
                        </span>
                    </div>

                    {/* ไม่มีรีวิว */}
                    {reviews.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8D1C6] bg-white/70 px-4 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8E9E1]">
                                <BookOpen
                                    size={30}
                                    className="text-[#B77C69]"
                                />
                            </div>

                            <h3 className="text-sm font-bold text-[#674B45]">
                                ยังไม่มีรีวิวในบันทึก
                            </h3>

                            <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#A18C85]">
                                สมาชิกคนนี้ยังไม่ได้เขียนรีวิวหนังสือ
                            </p>
                        </div>

                    ) : (

                        /* รายการรีวิว */
                        <div className="flex flex-col gap-4">

                            {reviews.map((review) => {
                                const rating = Math.max(
                                    0,
                                    Math.min(5, Number(review.Rating) || 0)
                                );

                                const reviewDate = formatReviewDate(
                                    review.Created_At
                                );

                                return (
                                    <article
                                        key={review.ReviewsID}
                                        className="group rounded-2xl border border-[#F0E6E0] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                                    >
                                        <div className="flex gap-3 sm:gap-4">

                                            {/* รูปจากรีวิวก่อน ถ้าไม่มีใช้รูปปกหนังสือ */}
                                            <div className="h-[118px] w-[82px] shrink-0 overflow-hidden rounded-xl bg-[#F8EDE7] sm:h-[136px] sm:w-[94px]">
                                                {(review.Image_URL || review.Books_Cover) ? (
                                                    <img
                                                        src={review.Image_URL || review.Books_Cover}
                                                        alt={review.Book_Title || "รูปหนังสือ"}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                        onError={(event) => {
                                                            // ถ้ารูปจากรีวิวโหลดไม่ได้ ให้ลองใช้รูปปกจาก Books
                                                            if (
                                                                review.Image_URL &&
                                                                review.Books_Cover &&
                                                                event.currentTarget.src !== review.Books_Cover
                                                            ) {
                                                                event.currentTarget.src = review.Books_Cover;
                                                            } else {
                                                                event.currentTarget.style.display = "none";
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <BookOpen
                                                            size={30}
                                                            className="text-[#C6A69A]"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* รายละเอียดหนังสือ */}
                                            <div className="min-w-0 flex-1">

                                                {/* ชื่อหนังสือ */}
                                                <h3 className="line-clamp-2 text-sm font-extrabold leading-relaxed text-[#49332F] sm:text-base">
                                                    {review.Book_Title || "ไม่ระบุชื่อหนังสือ"}
                                                </h3>

                                                {/* หมวดหมู่ */}
                                                <div className="mt-2 flex flex-wrap gap-1.5">

                                                    {review.Main_Category && (
                                                        <span className="rounded-full bg-[#F8E9E1] px-2.5 py-1 text-[10px] font-semibold text-[#A76F71]">
                                                            {review.Main_Category}
                                                        </span>
                                                    )}

                                                    {review.Sub_Category && (
                                                        <span className="line-clamp-1 rounded-full bg-[#F4F0EB] px-2.5 py-1 text-[10px] font-medium text-[#927A70]">
                                                            {review.Sub_Category}
                                                        </span>
                                                    )}

                                                </div>

                                                {/* คะแนน */}
                                                <div className="mt-2 flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={13}
                                                            className={
                                                                star <= rating
                                                                    ? "fill-[#D9AD62] text-[#D9AD62]"
                                                                    : "fill-[#F0E8E2] text-[#F0E8E2]"
                                                            }
                                                        />
                                                    ))}

                                                    <span className="ml-1 text-[11px] font-bold text-[#967A6F]">
                                                        {rating.toFixed(1)}
                                                    </span>
                                                </div>

                                                {/* วันที่ */}
                                                {reviewDate && (
                                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#B09A91]">
                                                        <CalendarDays size={12} />
                                                        {reviewDate}
                                                    </div>
                                                )}

                                            </div>
                                        </div>

                                        {/* ข้อความรีวิว */}
                                        {review.Review_Text && (
                                            <div className="mt-3 border-t border-[#F3EAE5] pt-3">
                                                <p className="line-clamp-3 text-xs leading-[1.9] text-[#80665E]">
                                                    {review.Review_Text}
                                                </p>
                                            </div>
                                        )}

                                        {/* จำนวน Like และสถานะ Save */}
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F7EFEB] pt-3">
                                            <div className="flex items-center gap-1.5 text-[11px] text-[#A18C85]">
                                                <Heart
                                                    size={14}
                                                    className="text-[#C98787]"
                                                />

                                                <span>
                                                    {(review.Like_Count || 0).toLocaleString("th-TH")} Likes
                                                </span>
                                            </div>

                                            {review.Saved_By_Me && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#F8EDE7] px-2.5 py-1 text-[10px] font-semibold text-[#A76F71]">
                                                    <Bookmark size={11} />
                                                    บันทึกไว้แล้ว
                                                </span>
                                            )}
                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </div>
            </section>

        </main>
    );
}