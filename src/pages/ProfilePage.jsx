import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

import newReader from "../assets/cute-mouse-holding-book.png";
import reviewer from "../assets/magic-book-with-sparkle.png";
import proReviewer from "../assets/smart-blue-dinosaur-with-tie.png";
import discoverer from "../assets/magic-magnifying-glass.png";
import proDiscoverer from "../assets/green-dragon-with-magnifying-glass.png";

import firstLogin from "../assets/pink-cloud-circle-frame-2026.png"
import reviewFive from "../assets/red-fire-abstract-frame.png"
import toponeNOV from "../assets/blue-and-orange-fish-frame.png"
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png"
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png"
import toponeDEC from "../assets/red-cat-yarn-frame.png.png" 
import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png"
import topthreeDEC from "../assets/golden-thorn-vines-frame.png"

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
} from "lucide-react";

import { supabase } from "../lib/supabase";

// ======================================================
// API URL
// ======================================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/auth";

// ======================================================
// STORAGE
// ใช้ Bucket เดิมของระบบรีวิว
// ======================================================

const STORAGE_BUCKET = "review-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

    const bucketPath =
      `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    const pathIndex = parsedUrl.pathname.indexOf(bucketPath);

    if (pathIndex === -1) return null;

    const filePath = decodeURIComponent(
      parsedUrl.pathname.slice(
        pathIndex + bucketPath.length
      )
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

        const { data: profile, error: profileError } =
          await supabase
            .from("User")
            .select(
              "User_Name, User_Avatar_URL, Active_Frame_RewardsID"
            )
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
          setEarnedFrames(
           Array.isArray(result.frames)
             ? result.frames
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

  // ======================================================
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
    (item) => Number(item.id) === Number(frame.id)
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
      Number(frame.id) ===
        Number(profileData?.Active_Frame_RewardsID)
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
      setProfileError(
        "รองรับเฉพาะไฟล์ JPG, PNG และ WEBP"
      );

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
      uploadedPath =
        `${session.user.id}/profile-${crypto.randomUUID()}.${extension}`;

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
      const { data: updatedProfile, error: updateError } =
        await supabase
          .from("User")
          .update({
            User_Avatar_URL: publicUrl,
          })
          .eq("auth_user_id", session.user.id)
          .select(
            "User_Name, User_Avatar_URL, Active_Frame_RewardsID"
          )
          .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error(
          "ไม่สามารถบันทึกรูปโปรไฟล์ได้ ไม่พบข้อมูลผู้ใช้"
        );
      }

      // อัปเดตข้อมูลบนหน้าเว็บ
      const oldPath = getOwnedProfileImagePath(
        profileData?.User_Avatar_URL,
        session.user.id
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
            removeError
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
            cleanupError
          );
        }
      }

      setProfileError(
        error.message || "ไม่สามารถเปลี่ยนรูปโปรไฟล์ได้"
      );
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
      "ต้องการลบรูปโปรไฟล์และกลับไปใช้รูปเริ่มต้นหรือไม่?"
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
      const { data: updatedProfile, error: updateError } =
        await supabase
          .from("User")
          .update({
            User_Avatar_URL: null,
          })
          .eq("auth_user_id", session.user.id)
          .select(
            "User_Name, User_Avatar_URL, Active_Frame_RewardsID"
          )
          .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error("ไม่พบข้อมูลโปรไฟล์ผู้ใช้");
      }

      setProfileData(updatedProfile);

      // ลบไฟล์ Storage เฉพาะรูปโปรไฟล์ของผู้ใช้
      const oldPath = getOwnedProfileImagePath(
        avatarUrl,
        session.user.id
      );

      if (oldPath) {
        const { error: removeError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([oldPath]);

        if (removeError) {
          console.error(
            "[Profile] Delete avatar file error:",
            removeError
          );
        }
      }

      setProfileMessage("ลบรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (error) {
      console.error("[Profile] Delete avatar error:", error);

      setProfileError(
        error.message || "ไม่สามารถลบรูปโปรไฟล์ได้"
      );
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
      .select(
        "User_Name, User_Avatar_URL, Active_Frame_RewardsID"
      )
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
        "ไม่พบข้อมูลผู้ใช้ที่อัปเดตได้ หรือไม่มีสิทธิ์เข้าถึงข้อมูล"
      );
    }

    setProfileData(updateResult.data);

    setProfileMessage(
      `เลือกกรอบ "${frame.title}" เรียบร้อยแล้ว`
    );
  } catch (error) {
    console.error("[Profile] Select frame error:", error);

    setProfileError(
      error.message || "ไม่สามารถเลือกกรอบรูปได้"
    );
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

      const { data: updatedProfile, error: updateError } =
        await supabase
          .from("User")
          .update({
            Active_Frame_RewardsID: null,
          })
          .eq("auth_user_id", session.user.id)
          .select(
            "User_Name, User_Avatar_URL, Active_Frame_RewardsID"
          )
          .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error("ไม่สามารถยกเลิกกรอบรูปได้");
      }

      setProfileData(updatedProfile);

      setProfileMessage("ยกเลิกการใช้กรอบรูปแล้ว");
    } catch (error) {
      console.error("[Profile] Remove frame error:", error);

      setProfileError(
        error.message || "ไม่สามารถยกเลิกกรอบรูปได้"
      );
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
    <main className="mx-auto w-full max-w-4xl px-4 pb-10">

      {/* ======================================================
          โปรไฟล์ผู้ใช้
         ====================================================== */}

      <section className="rounded-3xl border border-[#F0E1DA] bg-[#FFF8F5] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">

         {/* รูปโปรไฟล์และกรอบที่เลือก */}
<div className="relative h-32 w-32 shrink-0">
  <UserAvatar
    avatarUrl={avatarPreview || avatarUrl}
    userName={username}
    frameImage={activeFrame?.image}
    size={128}
    frameScale={1}
  />
</div>

          {/* ข้อมูลผู้ใช้ */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[#352923]">
              {username}
            </h1>

            <p className="mt-1 break-all text-sm text-gray-500">
              {user?.email || "กำลังโหลดข้อมูล..."}
            </p>

            <p className="mt-2 text-sm text-[#A56B57]">
              Let's Read Member
            </p>

            {activeFrame && (
              <p className="mt-2 text-xs font-semibold text-[#A56B57]">
                กรอบที่ใช้งาน: {activeFrame.title}
              </p>
            )}
          </div>

          {/* ปุ่มจัดการรูปโปรไฟล์ */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:flex-col sm:items-stretch">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarSaving || avatarDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#A36D70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#8F5C60] disabled:opacity-50"
            >
              <Camera size={15} />
              เปลี่ยนรูป
            </button>

            {avatarUrl && !avatarFile && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarDeleting || avatarSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} />
                {avatarDeleting ? "กำลังลบ..." : "ลบรูป"}
              </button>
            )}
          </div>
        </div>

        {/* แสดง Preview และปุ่มบันทึกรูป */}
        {avatarFile && (
          <div className="mt-5 rounded-2xl border border-[#EEDCD3] bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-[#674B45]">
              ตัวอย่างรูปโปรไฟล์
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full border-4 border-[#E8CFC4] object-cover"
                />
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={avatarSaving}
                  className="rounded-full bg-[#A36D70] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8F5C60] disabled:opacity-50"
                >
                  {avatarSaving ? "กำลังบันทึก..." : "บันทึกรูป"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelAvatar}
                  disabled={avatarSaving}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ข้อความแจ้งเตือน */}
        {profileError && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {profileError}
          </p>
        )}

        {profileMessage && !profileError && (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {profileMessage}
          </p>
        )}

        <p className="mt-4 text-center text-[11px] text-[#9B8583] sm:text-left">
          รองรับ JPG, PNG และ WEBP ขนาดไม่เกิน 5 MB
        </p>
      </section>

      {/* ======================================================
          กรอบโปรไฟล์ของฉัน
          ทั้งหมด 8 แบบ ไม่ผูกกับ Rewards
         ====================================================== */}

      <section className="mt-7">
        <div className="mb-4 flex items-center gap-2">
          <Bookmark size={22} className="text-[#C68A45]" />

          <h2 className="text-lg font-bold text-[#352923]">
            กรอบโปรไฟล์ของฉัน
          </h2>
        </div>

        <div className="rounded-2xl border border-[#F0E1DA] bg-white p-4 sm:p-5">
          <p className="mb-4 text-xs text-[#9B8583]">
            ปลดล็อกกรอบรูปจากการทำกิจกรรมใน Let's Read
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                  className={`
                    flex flex-col items-center
                    rounded-2xl border p-4 text-center
                    transition
                    ${
                      isActive
                        ? "border-[#C68A45] bg-[#FFF7E8] shadow-sm"
                        : "border-[#F3E8E3] bg-[#FFFAF8]"
                    }
                    ${
                      frame.unlocked
                        ? "cursor-pointer hover:border-[#D6B4A5]"
                        : "cursor-not-allowed opacity-70"
                    }
                  `}
                >
                  {/* ตัวอย่างกรอบ */}
                  <div className="relative mb-4 h-28 w-28">

                    {/* กรอบตัวอย่างแบบ Gradient */}
                    <div
                      className={`
                        absolute inset-0 rounded-full p-1
                        ${frame.frameClass || "bg-[#F3D5C9]"}
                      `}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-white">
                        <UserRound
                          size={27}
                          className="text-[#865B4D]"
                        />
                      </div>
                    </div>

                    {/* รูปกรอบตัวอย่าง (เพิ่มภายหลังได้) */}
                    {frame.image && (
                      <img
                        src={frame.image}
                        alt={frame.title}
                        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
                      />
                    )}
                  </div>

                  <p className="text-xs font-bold text-[#674B45]">
                    {frame.title}
                  </p>

                  <p className="mt-1 text-[10px] text-[#A18C85]">
                    {frame.description}
                  </p>

                  <span
                    className={`
                      mt-3 inline-flex items-center gap-1
                      rounded-full px-3 py-1 text-[10px]
                      ${
                        isActive
                          ? "bg-[#E5F5E8] text-[#438450]"
                          : frame.unlocked
                            ? "bg-[#F3EBE8] text-[#A36D70]"
                            : "bg-gray-100 text-gray-400"
                      }
                    `}
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

          {/* ยกเลิกกรอบรูป */}
          {activeFrame && (
            <div className="mt-4 flex justify-center border-t border-[#F5EAE5] pt-4">
              <button
                type="button"
                onClick={handleRemoveFrame}
                disabled={frameSaving}
                className="text-xs font-semibold text-[#A36D70] underline disabled:opacity-50"
              >
                {frameSaving ? "กำลังบันทึก..." : "ไม่ใช้กรอบรูป"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          รางวัลของฉัน
         ====================================================== */}

      <section className="mt-7">
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={22} className="text-[#C68A45]" />

          <h2 className="text-lg font-bold text-[#352923]">
            รางวัลของฉัน
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F0E1DA] bg-white">
          <div className="flex items-center justify-between bg-[#FFF3EC] px-5 py-4">
            <div>
              <p className="font-semibold text-[#674B45]">
                My Rewards Collection
              </p>

              <p className="mt-1 text-xs text-[#9B8583]">
                สะสมรางวัลจากการอ่านและร่วมกิจกรรม
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#C68A45]">
              <Trophy size={24} />
            </div>
          </div>

          {/* สถานะการโหลดรางวัล */}
          {loadingRewards && (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              กำลังโหลดข้อมูลรางวัล...
            </p>
          )}

          {/* กรณีโหลดรางวัลไม่สำเร็จ */}
          {!loadingRewards && rewardError && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-red-500">
                {rewardError}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-semibold text-[#B46F62] underline"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {/* แสดงรายการรางวัล */}
          {!loadingRewards && !rewardError && (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              {displayedRewards.map((reward) => {
                const rewardStatus = earnedRewards.find(
                  (item) => item.code === reward.code
                );

                const isUnlocked = Boolean(
                  rewardStatus?.unlocked
                );

                return (
                  <div
                    key={reward.code}
                    className="flex flex-col items-center rounded-2xl border border-[#F3E8E3] bg-[#FFFAF8] px-3 py-5 text-center transition hover:border-[#E8CFC4] hover:shadow-sm"
                  >
                    <div className="mb-4 flex h-28 w-28 items-center justify-center">
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-[#674B45]">
                      {reward.title}
                    </h3>

                    <p className="mt-2 min-h-10 text-xs leading-relaxed text-[#A18C85]">
                      {reward.description}
                    </p>

                    {/* สถานะการปลดล็อก */}
                    <span
                      className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] ${
                        isUnlocked
                          ? "bg-[#E5F5E8] text-[#438450]"
                          : "bg-[#F3EBE8] text-[#A18C85]"
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Trophy size={11} />
                          ปลดล็อกแล้ว
                        </>
                      ) : (
                        <>
                          <LockKeyhole size={11} />
                          ยังไม่ปลดล็อก
                        </>
                      )}
                    </span>

                    {/* แสดงความคืบหน้าของรางวัล */}
                    {rewardStatus && !isUnlocked && (
                      <p className="mt-2 text-[10px] text-[#A18C85]">
                        ความคืบหน้า {rewardStatus.progress}/
                        {rewardStatus.target}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ปุ่มดูรางวัลทั้งหมด */}
          <div className="border-t border-[#F5EAE5] px-4 py-3">
            <button
              type="button"
              onClick={() =>
                setShowAllRewards(!showAllRewards)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-[#B46F62] transition hover:bg-[#FFF5F1]"
            >
              {showAllRewards ? (
                <>
                  แสดงน้อยลง
                  <ChevronUp size={17} />
                </>
              ) : (
                <>
                  ดูรางวัลทั้งหมด
                  <ChevronDown size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          ตั้งค่าแอปพลิเคชัน
         ====================================================== */}

      <section className="mt-7">
        <h2 className="mb-4 text-lg font-bold text-[#352923]">
          ตั้งค่าแอปพลิเคชัน
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[#F0E1DA] bg-white">
          {settingItems.map(
            ({ title, description, path, Icon }, index) => (
              <Link
                key={`${title}-${index}`}
                to={path}
                className="flex items-center gap-4 border-b border-[#F5EAE5] p-4 no-underline transition last:border-b-0 hover:bg-[#FFF8F5] sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBEAE4] text-[#A66B57]">
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#352923]">
                    {title}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {description}
                  </p>
                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-gray-400"
                />
              </Link>
            )
          )}
        </div>
      </section>
    </main>
  );
}