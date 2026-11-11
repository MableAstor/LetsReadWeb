import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import UserAvatar from "../components/UserAvatar";

import newReader from "../assets/cute-mouse-holding-book.png";

import reviewer from "../assets/magic-book-with-sparkle.png";

import proReviewer from "../assets/smart-blue-dinosaur-with-tie.png";

import discoverer from "../assets/magic-magnifying-glass.png";
import proDiscoverer from "../assets/green-dragon-with-magnifying-glass.png";
import firstLogin from "../assets/pink-cloud-circle-frame-2026.png";
import reviewFive from "../assets/red-fire-abstract-frame.png";
import toponeNOV from "../assets/blue-and-orange-fish-frame.png";
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png";
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png";

import toponeDEC from "../assets/red-cat-yarn-frame.png.png";

import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png";

import topthreeDEC from "../assets/golden-thorn-vines-frame.png";

import {
  UserRound,
  BookOpen,
  Palette,
  Bell,
  ShieldCheck,
  Info,
  ChevronRight,
  Trophy,
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  Bookmark,
  Camera,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { supabase } from "../lib/supabase";

// ======================================================

// API URL

// ======================================================

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    "",
  ) + "/api/auth";

// ======================================================

// STORAGE

// ใช้ Bucket เดิมของระบบรีวิว

// ======================================================

const STORAGE_BUCKET = "review-images";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ======================================================

// รายการตั้งค่า

// ======================================================

const settingItems = [
  {
    title: "โปรไฟล์ผู้ใช้",

    description: "จัดการชื่อและข้อมูลส่วนตัว",

    path: "/settings/account",

    Icon: UserRound,
  },

  {
    title: "การตั้งค่าการอ่านและระบบแนะนำ",

    description: "ปรับความสนใจและหมวดหนังสือ",

    path: "/settings/reading",

    Icon: BookOpen,
  },

  {
    title: "ธีมและการแสดงผล",

    description: "ตั้งค่าธีมและขนาดตัวอักษร",

    path: "/settings/appearance",

    Icon: Palette,
  },

  {
    title: "การแจ้งเตือน",

    description: "จัดการการแจ้งเตือนของเว็บไซต์",

    path: "/settings/notifications",

    Icon: Bell,
  },

  {
    title: "บัญชีและความปลอดภัย",

    description: "จัดการรหัสผ่านและออกจากระบบ",

    path: "/settings/profile",

    Icon: ShieldCheck,
  },

  {
    title: "เกี่ยวกับแอป",

    description: "ข้อมูลและรายละเอียด Let's Read",

    path: "/settings/about",

    Icon: Info,
  },
];

// ======================================================

// รายการรางวัล

// ระบบรางวัลแยกจากระบบกรอบรูป

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

// PROFILE FRAMES

//

// กรอบรูปทั้ง 8 แบบเป็นอิสระจากระบบ Rewards

//

// id: รหัสกรอบรูป

// unlocked: สถานะการปลดล็อก

// frameClass: รูปแบบกรอบชั่วคราว

// image: รองรับการใส่รูปภาพภายหลัง

//

// เมื่อมีรูปภาพแล้ว สามารถเพิ่ม image: frameImage

// ลงในรายการแต่ละกรอบได้เลย

// ======================================================

const frameItems = [
  {
    id: 1,

    code: "FRAME_01",

    title: "การเริ่มต้น",

    description: "ล็อกอินครั้งแรก",

    unlocked: false,

    image: firstLogin,
  },

  {
    id: 2,

    code: "FRAME_02",

    title: "เปลวเพลิงนักรีวิว",

    description: "รีวิวครบ 5 ครั้ง",

    unlocked: false,

    image: reviewFive,
  },

  {
    id: 3,

    code: "FRAME_03",

    title: "ปลาทองกับสองเรา",

    description: "นักรีวิวอันดับ 1 ในเดือนพฤศจิกายน",

    unlocked: false,

    image: toponeNOV,
  },

  {
    id: 4,

    code: "FRAME_04",

    title: "กระต่ายน้อยคอยรัก",

    description: "นักรีวิวอันดับ 2 ในเดือนพฤศจิกายน",

    unlocked: false,

    image: toptwoNOV,
  },

  {
    id: 5,

    code: "FRAME_05",

    title: "วิ่งสิ!เจ้าหนูน้อย",

    description: "นักรีวิวอันดับ 3 ในเดือนพฤศจิกายน",

    unlocked: false,

    image: topthreeNOV,
  },

  {
    id: 6,

    code: "FRAME_06",

    title: "เจ้าเหมียวเปลวเพลิง",

    description: "นักรีวิวอันดับ 1 ในเดือนธันวาคม",

    unlocked: false,

    image: toponeDEC,
  },

  {
    id: 7,

    code: "FRAME_07",

    title: "มงกุฎดอกไม้",

    description: "นักรีวิวอันดับ 2 ในเดือนธันวาคม",

    unlocked: false,

    image: toptwoDEC,
  },

  {
    id: 8,

    code: "FRAME_08",

    title: "สายฟ้าฟาดใจ",

    description: "นักรีวิวอันดับ 3 ในเดือนธันวาคม",

    unlocked: false,

    image: topthreeDEC,
  },
];

// ======================================================

// ดึง Path ของรูปโปรไฟล์จาก Public URL

// ตรวจสอบให้แน่ใจว่าเป็นไฟล์โปรไฟล์ของเจ้าของบัญชี

// ======================================================

function getOwnedProfileImagePath(imageUrl, userId) {
  if (!imageUrl || !userId) return null;

  try {
    const parsedUrl = new URL(imageUrl);

    const bucketPath = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    const pathIndex = parsedUrl.pathname.indexOf(bucketPath);

    if (pathIndex === -1) return null;

    const filePath = decodeURIComponent(
      parsedUrl.pathname.slice(pathIndex + bucketPath.length),
    );

    if (!filePath.startsWith(`${userId}/profile-`)) {
      return null;
    }

    return filePath;
  } catch (error) {
    console.error("[Profile] Invalid image URL:", error);

    return null;
  }
}

// ======================================================

// PROFILE PAGE

// ======================================================

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [profileData, setProfileData] = useState(null);

  const [showAllRewards, setShowAllRewards] = useState(false);

  // ======================================================

  // สถานะข้อมูลรางวัล

  // ======================================================

  const [earnedRewards, setEarnedRewards] = useState([]);

  const [earnedFrames, setEarnedFrames] = useState([]);

  const [loadingRewards, setLoadingRewards] = useState(true);

  const [rewardError, setRewardError] = useState("");

  // ======================================================

  // สถานะรูปโปรไฟล์

  // ======================================================

  const [avatarFile, setAvatarFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);

  const [avatarSaving, setAvatarSaving] = useState(false);

  const [avatarDeleting, setAvatarDeleting] = useState(false);

  const avatarInputRef = useRef(null);

  // ======================================================

  // สถานะกรอบรูป

  // ======================================================

  const [frameSaving, setFrameSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");

  const [profileError, setProfileError] = useState("");

  // ======================================================

  // โหลดข้อมูลผู้ใช้และ Profile จากตาราง User

  // ======================================================

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

        if (!authUser) return;

        const { data: profile, error: profileError } = await supabase

          .from("User")

          .select("User_Name, User_Avatar_URL, Active_Frame_RewardsID")

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

  // ======================================================

  // โหลด Preview รูปโปรไฟล์

  // ======================================================

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);

      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);

    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  // ======================================================

  // โหลดข้อมูลรางวัลจาก Backend

  // ======================================================

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
          throw new Error(result.message || "ไม่สามารถโหลดข้อมูลรางวัลได้");
        }

        if (active) {
          setEarnedRewards(Array.isArray(result.rewards) ? result.rewards : []);

          setEarnedFrames(Array.isArray(result.frames) ? result.frames : []);
        }
      } catch (error) {
        console.error("[Profile] Load rewards error:", error);

        if (active) {
          setRewardError(error.message || "ไม่สามารถโหลดข้อมูลรางวัลได้");
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

  // =====================================================
  // ตรวจสอบชื่อผู้ใช้
  // ======================================================

  const username =
    profileData?.User_Name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "นักอ่าน";

  const avatarUrl = profileData?.User_Avatar_URL || null;

  // ======================================================

  // ตรวจสอบกรอบรูปที่ปลดล็อกแล้ว

  // แยกจากระบบ Rewards

  // ======================================================

  const availableFrames = frameItems.map((frame) => {
    const frameStatus = earnedFrames.find(
      (item) => Number(item.id) === Number(frame.id),
    );

    return {
      ...frame,

      unlocked: Boolean(frameStatus?.unlocked),

      unlockedAt: frameStatus?.unlockedAt || null,
    };
  });

  // กรอบที่กำลังใช้งาน

  const activeFrame = availableFrames.find(
    (frame) =>
      frame.unlocked &&
      Number(frame.id) === Number(profileData?.Active_Frame_RewardsID),
  );

  // ======================================================

  // เลือกไฟล์รูปโปรไฟล์

  // ======================================================

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfileError("");

    setProfileMessage("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setProfileError("รองรับเฉพาะไฟล์ JPG, PNG และ WEBP");

      event.target.value = "";

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setProfileError("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB");

      event.target.value = "";

      return;
    }

    setAvatarFile(file);
  };

  // ======================================================

  // บันทึกรูปโปรไฟล์

  // Upload -> Get Public URL -> Update User

  // ======================================================

  const handleSaveAvatar = async () => {
    if (!avatarFile || avatarSaving) return;

    setAvatarSaving(true);

    setProfileError("");

    setProfileMessage("");

    let uploadedPath = null;

    try {
      const {
        data: { session },

        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนเปลี่ยนรูป");
      }

      const extensionByType = {
        "image/jpeg": "jpg",

        "image/png": "png",

        "image/webp": "webp",
      };

      const extension = extensionByType[avatarFile.type];

      if (!extension) {
        throw new Error("ชนิดไฟล์รูปภาพไม่รองรับ");
      }

      // สร้าง Path ของไฟล์ใหม่

      uploadedPath = `${session.user.id}/profile-${crypto.randomUUID()}.${extension}`;

      // อัปโหลดรูปไปยัง Bucket เดิม

      const { error: uploadError } = await supabase.storage

        .from(STORAGE_BUCKET)

        .upload(uploadedPath, avatarFile, {
          cacheControl: "3600",

          upsert: false,

          contentType: avatarFile.type,
        });

      if (uploadError) throw uploadError;

      // สร้าง Public URL

      const { data } = supabase.storage

        .from(STORAGE_BUCKET)

        .getPublicUrl(uploadedPath);

      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        throw new Error("ไม่สามารถสร้าง URL รูปโปรไฟล์ได้");
      }

      // บันทึก URL ลงตาราง User

      const { data: updatedProfile, error: updateError } = await supabase

        .from("User")

        .update({
          User_Avatar_URL: publicUrl,
        })

        .eq("auth_user_id", session.user.id)

        .select("User_Name, User_Avatar_URL, Active_Frame_RewardsID")

        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error("ไม่สามารถบันทึกรูปโปรไฟล์ได้ ไม่พบข้อมูลผู้ใช้");
      }

      // อัปเดตข้อมูลบนหน้าเว็บ

      const oldPath = getOwnedProfileImagePath(
        profileData?.User_Avatar_URL,

        session.user.id,
      );

      setProfileData(updatedProfile);

      setAvatarFile(null);

      setProfileMessage("เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");

      // ลบรูปโปรไฟล์เก่า เฉพาะไฟล์ที่เป็นของตัวเอง

      if (oldPath && oldPath !== uploadedPath) {
        const { error: removeError } = await supabase.storage

          .from(STORAGE_BUCKET)

          .remove([oldPath]);

        if (removeError) {
          console.error(
            "[Profile] Remove old avatar error:",

            removeError,
          );
        }
      }
    } catch (error) {
      console.error("[Profile] Upload avatar error:", error);

      // หากบันทึก URL ไม่สำเร็จ ให้พยายามลบไฟล์ใหม่ที่อัปโหลดไว้

      if (uploadedPath && user?.id) {
        const { error: cleanupError } = await supabase.storage

          .from(STORAGE_BUCKET)

          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "[Profile] Cleanup image error:",

            cleanupError,
          );
        }
      }

      setProfileError(error.message || "ไม่สามารถเปลี่ยนรูปโปรไฟล์ได้");
    } finally {
      setAvatarSaving(false);

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  // ======================================================

  // ยกเลิกการเลือกรูป

  // ======================================================

  const handleCancelAvatar = () => {
    setAvatarFile(null);

    setProfileError("");

    setProfileMessage("");

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  // ======================================================

  // ลบรูปโปรไฟล์

  // ======================================================

  const handleRemoveAvatar = async () => {
    if (!avatarUrl || avatarDeleting) return;

    const confirmed = window.confirm(
      "ต้องการลบรูปโปรไฟล์และกลับไปใช้รูปเริ่มต้นหรือไม่?",
    );

    if (!confirmed) return;

    setAvatarDeleting(true);

    setProfileError("");

    setProfileMessage("");

    try {
      const {
        data: { session },

        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนลบรูป");
      }

      // ลบ URL จากตาราง User ก่อน

      const { data: updatedProfile, error: updateError } = await supabase

        .from("User")

        .update({
          User_Avatar_URL: null,
        })

        .eq("auth_user_id", session.user.id)

        .select("User_Name, User_Avatar_URL, Active_Frame_RewardsID")

        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error("ไม่พบข้อมูลโปรไฟล์ผู้ใช้");
      }

      setProfileData(updatedProfile);

      // ลบไฟล์ Storage เฉพาะรูปโปรไฟล์ของผู้ใช้

      const oldPath = getOwnedProfileImagePath(
        avatarUrl,

        session.user.id,
      );

      if (oldPath) {
        const { error: removeError } = await supabase.storage

          .from(STORAGE_BUCKET)

          .remove([oldPath]);

        if (removeError) {
          console.error(
            "[Profile] Delete avatar file error:",

            removeError,
          );
        }
      }

      setProfileMessage("ลบรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (error) {
      console.error("[Profile] Delete avatar error:", error);

      setProfileError(error.message || "ไม่สามารถลบรูปโปรไฟล์ได้");
    } finally {
      setAvatarDeleting(false);
    }
  };

  // ======================================================

  // เลือกกรอบรูป

  // บันทึก Frame ID ลง User.Active_Frame_RewardsID

  // ======================================================

  const handleSelectFrame = async (frame) => {
    if (!frame.unlocked || frameSaving) return;

    setFrameSaving(true);

    setProfileError("");

    setProfileMessage("");

    try {
      const {
        data: { session },

        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนเลือกกรอบรูป");
      }

      const updateResult = await supabase

        .from("User")

        .update({
          Active_Frame_RewardsID: frame.id,
        })

        .eq("auth_user_id", session.user.id)

        .select("User_Name, User_Avatar_URL, Active_Frame_RewardsID")

        .maybeSingle();

      // แสดงผลตอบกลับจริงจาก Supabase

      console.log("[Profile] Frame update result:", updateResult);

      console.log("[Profile] Auth User ID:", session.user.id);

      console.log("[Profile] Selected Frame ID:", frame.id);

      if (updateResult.error) {
        throw updateResult.error;
      }

      if (!updateResult.data) {
        throw new Error(
          "ไม่พบข้อมูลผู้ใช้ที่อัปเดตได้ หรือไม่มีสิทธิ์เข้าถึงข้อมูล",
        );
      }

      setProfileData(updateResult.data);

      setProfileMessage(`เลือกกรอบ "${frame.title}" เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("[Profile] Select frame error:", error);

      setProfileError(error.message || "ไม่สามารถเลือกกรอบรูปได้");
    } finally {
      setFrameSaving(false);
    }
  };

  // ======================================================

  // ยกเลิกการใช้กรอบรูป

  // ======================================================

  const handleRemoveFrame = async () => {
    if (frameSaving) return;

    setFrameSaving(true);

    setProfileError("");

    setProfileMessage("");

    try {
      const {
        data: { session },

        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบก่อน");
      }

      const { data: updatedProfile, error: updateError } = await supabase

        .from("User")

        .update({
          Active_Frame_RewardsID: null,
        })

        .eq("auth_user_id", session.user.id)

        .select("User_Name, User_Avatar_URL, Active_Frame_RewardsID")

        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error("ไม่สามารถยกเลิกกรอบรูปได้");
      }

      setProfileData(updatedProfile);

      setProfileMessage("ยกเลิกการใช้กรอบรูปแล้ว");
    } catch (error) {
      console.error("[Profile] Remove frame error:", error);

      setProfileError(error.message || "ไม่สามารถยกเลิกกรอบรูปได้");
    } finally {
      setFrameSaving(false);
    }
  };

  // ======================================================

  // แสดงรางวัล 4 รายการแรก หรือทั้งหมด

  // ======================================================

  const displayedRewards = showAllRewards
    ? rewardItems
    : rewardItems.slice(0, 4);

  // ======================================================

  // RENDER

  // ======================================================

  return (
    <main className="mx-auto w-full max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-8">
      <button
        type="button"
        onClick={() => navigate("/settings")}
        aria-label="กลับไปหน้าตั้งค่า"
        title="กลับไปหน้าตั้งค่า"
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EEDCD3]/80 bg-[#FFFAF7]/80 text-[#946B69] shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A76F71] active:scale-95"
      >
        <ArrowLeft size={19} strokeWidth={1.8} />
      </button>

      <section className="overflow-hidden rounded-[28px] border border-[#F1DFD7] bg-[#FFFAF7] shadow-[0_12px_35px_rgba(100,61,56,0.07)]">
        <div className="h-20 bg-gradient-to-r from-[#E9B9AD] via-[#F4D4C9] to-[#F9E7DE] sm:h-28" />

        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative z-10 shrink-0 rounded-full border-[5px] border-[#FFFAF7] bg-[#FFFAF7] shadow-md">
              <UserAvatar
                avatarUrl={avatarPreview || avatarUrl}
                userName={username}
                frameImage={activeFrame?.image}
                size={100}
                frameScale={1}
              />
            </div>

            <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="break-words text-2xl font-extrabold tracking-tight text-[#49332F]">
                {username}
              </h1>

              <p className="mt-1 break-all text-xs text-[#907772] sm:text-sm">
                {user?.email || "กำลังโหลดข้อมูล..."}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-[#F8E8E1] px-3 py-1 text-[11px] font-semibold text-[#9D625D]">
                Let's Read Member
              </span>
            </div>
          </div>

          {activeFrame && (
            <p className="mt-3 text-center text-xs text-[#A16A62] sm:text-left">
              กรอบที่ใช้งาน: {activeFrame.title}
            </p>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarSaving || avatarDeleting}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#A76F71] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#915C60] disabled:opacity-50"
            >
              <Camera size={16} />
              เปลี่ยนรูปโปรไฟล์
            </button>

            {avatarUrl && !avatarFile && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarDeleting || avatarSaving}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#EDD5D0] bg-white px-4 py-2 text-sm font-medium text-[#A76F71] hover:bg-[#FFF1EE] disabled:opacity-50"
              >
                <Trash2 size={15} />
                {avatarDeleting ? "กำลังลบ..." : "ลบรูป"}
              </button>
            )}
          </div>

          {avatarFile && (
            <div className="mt-4 rounded-2xl border border-[#EBD9D1] bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-[#674B45]">
                ตัวอย่างรูปโปรไฟล์
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="ตัวอย่างรูปโปรไฟล์"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={avatarSaving}
                  className="rounded-xl bg-[#A76F71] px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {avatarSaving ? "กำลังบันทึก..." : "บันทึกรูป"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelAvatar}
                  disabled={avatarSaving}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {profileError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
            >
              {profileError}
            </p>
          )}

          {profileMessage && !profileError && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700"
            >
              {profileMessage}
            </p>
          )}

          <p className="mt-3 text-center text-[11px] text-[#A58B85] sm:text-left">
            รองรับ JPG, PNG และ WEBP ขนาดไม่เกิน 5 MB
          </p>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#49332F]">
              <Bookmark size={19} className="text-[#B77C69]" />
              กรอบโปรไฟล์
            </h2>
            <p className="mt-1 text-xs text-[#9A817C]">
              สะสมกรอบจากกิจกรรมต่าง ๆ
            </p>
          </div>
          <span className="rounded-full bg-[#FFF8F4] px-3 py-1 text-xs text-[#986B63]">
            {availableFrames.filter((f) => f.unlocked).length}/
            {availableFrames.length}
          </span>
        </div>

        <div className="rounded-[24px] border border-[#F1DFD7] bg-white p-3 shadow-sm sm:p-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {availableFrames.map((frame) => {
              const isActive =
                frame.unlocked &&
                Number(frame.id) ===
                  Number(profileData?.Active_Frame_RewardsID);

              return (
                <button
                  key={frame.code}
                  type="button"
                  disabled={!frame.unlocked || frameSaving}
                  onClick={() => handleSelectFrame(frame)}
                  className={`flex min-w-0 flex-col items-center rounded-2xl border px-2 py-4 text-center transition sm:px-3 ${isActive ? "border-[#C88F79] bg-[#FFF5EF] shadow-sm" : "border-[#F1E6E1] bg-[#FFFCFA]"} ${frame.unlocked ? "hover:border-[#C88F79]" : "opacity-75"}`}
                >
                  <div className="relative mb-3 h-[90px] w-[90px] max-w-full sm:h-28 sm:w-28">
                    <div className="absolute inset-[12%] flex items-center justify-center rounded-full bg-[#F7ECE7]">
                      <UserRound size={27} className="text-[#A88C84]" />
                    </div>
                    {frame.image && (
                      <img
                        src={frame.image}
                        alt=""
                        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                      />
                    )}
                  </div>

                  <p className="min-h-9 text-xs font-bold leading-snug text-[#674B45]">
                    {frame.title}
                  </p>
                  <p className="mt-1 min-h-8 text-[10px] leading-relaxed text-[#A18C85]">
                    {frame.description}
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${isActive ? "bg-[#E8F5EA] text-[#4B8655]" : frame.unlocked ? "bg-[#F8E9E3] text-[#A36D70]" : "bg-[#F3F1F0] text-[#A7A09D]"}`}
                  >
                    {isActive ? (
                      "กำลังใช้งาน"
                    ) : frame.unlocked ? (
                      "เลือกกรอบนี้"
                    ) : (
                      <>
                        <LockKeyhole size={10} />
                        ยังไม่ปลดล็อก
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {activeFrame && (
            <div className="mt-4 border-t border-[#F1E6E1] pt-3 text-center">
              <button
                type="button"
                onClick={handleRemoveFrame}
                disabled={frameSaving}
                className="text-xs font-semibold text-[#A36D70] underline disabled:opacity-50"
              >
                {frameSaving ? "กำลังบันทึก..." : "ยกเลิกการใช้กรอบรูป"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#49332F]">
            <Trophy size={19} className="text-[#B77C69]" />
            รางวัลของฉัน
          </h2>
          <p className="mt-1 text-xs text-[#9A817C]">
            ทุกความสำเร็จจากการอ่านและค้นพบหนังสือ
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#F1DFD7] bg-white shadow-sm">
          {loadingRewards && (
            <p className="p-6 text-center text-sm text-[#907772]">
              กำลังโหลดข้อมูลรางวัล...
            </p>
          )}

          {!loadingRewards && rewardError && (
            <div className="p-5 text-center">
              <p className="text-sm text-red-500">{rewardError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-semibold text-[#A36D70] underline"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {!loadingRewards && !rewardError && (
            <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4 sm:p-5">
              {displayedRewards.map((reward) => {
                const status = earnedRewards.find(
                  (item) => item.code === reward.code,
                );
                const unlocked = Boolean(status?.unlocked);
                return (
                  <div
                    key={reward.code}
                    className="flex min-w-0 flex-col items-center rounded-2xl border border-[#F1E6E1] bg-[#FFFCFA] p-3 text-center"
                  >
                    <img
                      src={reward.image}
                      alt={reward.title}
                      className="mb-2 h-20 w-20 object-contain sm:h-24 sm:w-24"
                    />
                    <h3 className="text-xs font-bold text-[#674B45]">
                      {reward.title}
                    </h3>
                    <p className="mt-1 flex-1 text-[10px] leading-relaxed text-[#A18C85]">
                      {reward.description}
                    </p>
                    <span
                      className={`mt-3 rounded-full px-2.5 py-1 text-[10px] ${unlocked ? "bg-[#E8F5EA] text-[#4B8655]" : "bg-[#F3F1F0] text-[#A7A09D]"}`}
                    >
                      {unlocked ? "ปลดล็อกแล้ว" : "ยังไม่ปลดล็อก"}
                    </span>
                    {status && !unlocked && (
                      <p className="mt-2 text-[10px] text-[#A18C85]">
                        {status.progress}/{status.target}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAllRewards(!showAllRewards)}
            className="flex w-full items-center justify-center gap-2 border-t border-[#F1E6E1] py-3 text-sm font-semibold text-[#A36D70] hover:bg-[#FFF8F5]"
          >
            {showAllRewards ? "แสดงน้อยลง" : "ดูรางวัลทั้งหมด"}
            {showAllRewards ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
