
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import UserAvatar from "../components/UserAvatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { Button } from "../components/ui/button";

// รูปกรอบโปรไฟล์เดิม
import firstLogin from "../assets/pink-cloud-circle-frame-2026.png";
import reviewFive from "../assets/red-fire-abstract-frame.png";
import toponeNOV from "../assets/blue-and-orange-fish-frame.png";
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png";
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png";
import toponeDEC from "../assets/red-cat-yarn-frame.png.png";
import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png";
import topthreeDEC from "../assets/golden-thorn-vines-frame.png";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .replace(/\/+$/, "") + "/api/auth";

const STORAGE_BUCKET = "review-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const PROFILE_FIELDS =
  "User_Name, User_Avatar_URL, Active_Frame_RewardsID";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const frameItems = [
  {
    id: 1,
    code: "FRAME_01",
    title: "การเริ่มต้น",
    description: "ล็อกอินครั้งแรก",
    image: firstLogin,
  },
  {
    id: 2,
    code: "FRAME_02",
    title: "เปลวเพลิงนักรีวิว",
    description: "รีวิวครบ 5 ครั้ง",
    image: reviewFive,
  },
  {
    id: 3,
    code: "FRAME_03",
    title: "ปลาทองกับสองเรา",
    description: "นักรีวิวอันดับ 1 เดือนพฤศจิกายน",
    image: toponeNOV,
  },
  {
    id: 4,
    code: "FRAME_04",
    title: "กระต่ายน้อยคอยรัก",
    description: "นักรีวิวอันดับ 2 เดือนพฤศจิกายน",
    image: toptwoNOV,
  },
  {
    id: 5,
    code: "FRAME_05",
    title: "วิ่งสิ!เจ้าหนูน้อย",
    description: "นักรีวิวอันดับ 3 เดือนพฤศจิกายน",
    image: topthreeNOV,
  },
  {
    id: 6,
    code: "FRAME_06",
    title: "เจ้าเหมียวเปลวเพลิง",
    description: "นักรีวิวอันดับ 1 เดือนธันวาคม",
    image: toponeDEC,
  },
  {
    id: 7,
    code: "FRAME_07",
    title: "มงกุฎดอกไม้",
    description: "นักรีวิวอันดับ 2 เดือนธันวาคม",
    image: toptwoDEC,
  },
  {
    id: 8,
    code: "FRAME_08",
    title: "สายฟ้าฟาดใจ",
    description: "นักรีวิวอันดับ 3 เดือนธันวาคม",
    image: topthreeDEC,
  },
];

function getOwnedProfileImagePath(imageUrl, userId) {
  if (!imageUrl || !userId) return null;

  try {
    const parsedUrl = new URL(imageUrl);

    const bucketPath =
      `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    const index = parsedUrl.pathname.indexOf(bucketPath);

    if (index === -1) return null;

    const filePath = decodeURIComponent(
      parsedUrl.pathname.slice(index + bucketPath.length)
    );

    if (!filePath.startsWith(`${userId}/profile-`)) {
      return null;
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) return null;

    if (
      new URL(data.publicUrl).origin !== parsedUrl.origin
    ) {
      return null;
    }

    return filePath;
  } catch {
    return null;
  }
}

// รูปโปรไฟล์พร้อมกรอบ
function FrameAvatar({
  avatarUrl,
  username,
  frame,
  size = 110,
}) {
  return (
    <UserAvatar
      avatarUrl={avatarUrl}
      userName={username || "นักอ่าน"}
      frameImage={frame?.image || null}
      size={size}
      frameScale={1.18}
    />
  );
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [authUser, setAuthUser] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] =
    useState("");

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [earnedFrames, setEarnedFrames] = useState([]);
  const [loadingFrames, setLoadingFrames] = useState(true);
  const [frameError, setFrameError] = useState("");

  const [frameDialogOpen, setFrameDialogOpen] =
    useState(false);

  const [selectedFrameId, setSelectedFrameId] =
    useState(null);

  const [frameSaving, setFrameSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  // =============================================
  // โหลดโปรไฟล์
  // =============================================

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!active) return;

        if (!user) {
          navigate("/settings/profile", {
            replace: true,
          });
          return;
        }

        const { data: profile, error } =
          await supabase
            .from("User")
            .select(PROFILE_FIELDS)
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        if (!profile) {
          throw new Error("ไม่พบข้อมูลโปรไฟล์ผู้ใช้");
        }

        const currentName =
          profile.User_Name ||
          user.user_metadata?.username ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "นักอ่าน";

        if (active) {
          setAuthUser(user);
          setProfileData(profile);
          setUsername(currentName);
          setOriginalUsername(currentName);
          setAvatarUrl(profile.User_Avatar_URL || null);
        }
      } catch (error) {
        console.error("[EditProfile] Load:", error);

        if (active) {
          setErrorMessage(
            error.message || "โหลดข้อมูลไม่สำเร็จ"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  // =============================================
  // โหลดกรอบที่ได้รับจาก Backend
  // =============================================

  const loadFrames = async () => {
    setLoadingFrames(true);
    setFrameError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error("กรุณาเข้าสู่ระบบ");
      }

      const response = await fetch(
        `${API_URL}/rewards`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "โหลดกรอบไม่สำเร็จ"
        );
      }

      setEarnedFrames(
        Array.isArray(result.frames)
          ? result.frames
          : []
      );
    } catch (error) {
      console.error("[EditProfile] Frames:", error);

      setFrameError(
        error.message || "โหลดกรอบไม่สำเร็จ"
      );
    } finally {
      setLoadingFrames(false);
    }
  };

  useEffect(() => {
    loadFrames();
  }, []);

  // =============================================
  // สถานะกรอบ
  // =============================================

  const availableFrames = frameItems.map((frame) => {
    const status = earnedFrames.find(
      (item) => Number(item.id) === frame.id
    );

    return {
      ...frame,
      unlocked: Boolean(status?.unlocked),
      unlockedAt: status?.unlockedAt || null,
    };
  });

  const activeFrameId =
    profileData?.Active_Frame_RewardsID == null
      ? null
      : Number(profileData.Active_Frame_RewardsID);

  const activeFrame =
    availableFrames.find(
      (frame) =>
        frame.id === activeFrameId &&
        frame.unlocked
    ) || null;

  const selectedFrame =
    availableFrames.find(
      (frame) => frame.id === selectedFrameId
    ) || null;

  const unlockedFrames = availableFrames.filter(
    (frame) => frame.unlocked
  );

  const lockedFrames = availableFrames.filter(
    (frame) => !frame.unlocked
  );

  const openFrameDialog = () => {
    setSelectedFrameId(activeFrameId);
    setFrameError("");
    setFrameDialogOpen(true);
    loadFrames();
  };

  // =============================================
  // บันทึกกรอบที่เลือก
  // =============================================

  const handleApplyFrame = async () => {
    if (frameSaving || loadingFrames || frameError) return;

    if (
      selectedFrameId !== null &&
      !availableFrames.some(
        (frame) =>
          frame.id === selectedFrameId &&
          frame.unlocked
      )
    ) {
      setFrameError("กรอบนี้ยังไม่ได้ปลดล็อก");
      return;
    }

    setFrameSaving(true);
    setFrameError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบ");
      }

      // ตรวจสอบสิทธิ์จาก Backend อีกครั้ง
      const response = await fetch(
        `${API_URL}/rewards`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "ตรวจสอบสิทธิ์กรอบไม่สำเร็จ"
        );
      }

      if (
        selectedFrameId !== null &&
        !result.frames?.some(
          (frame) =>
            Number(frame.id) === selectedFrameId &&
            frame.unlocked === true
        )
      ) {
        throw new Error("ยังไม่มีสิทธิ์ใช้กรอบนี้");
      }

      const { data: updated, error } =
        await supabase
          .from("User")
          .update({
            Active_Frame_RewardsID: selectedFrameId,
          })
          .eq("auth_user_id", session.user.id)
          .select(PROFILE_FIELDS)
          .maybeSingle();

      if (error) throw error;

      if (!updated) {
        throw new Error("ไม่สามารถบันทึกกรอบได้");
      }

      setProfileData(updated);
      setFrameDialogOpen(false);

      setSuccessMessage(
        selectedFrameId === null
          ? "ยกเลิกการใช้กรอบแล้ว"
          : "เปลี่ยนกรอบโปรไฟล์เรียบร้อยแล้ว"
      );
    } catch (error) {
      console.error(
        "[EditProfile] Save frame:",
        error
      );

      setFrameError(
        error.message || "บันทึกกรอบไม่สำเร็จ"
      );
    } finally {
      setFrameSaving(false);
    }
  };

  // =============================================
  // รูปโปรไฟล์
  // =============================================

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        "รองรับเฉพาะ JPG, PNG และ WEBP"
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("รูปต้องมีขนาดไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setRemoveAvatar(false);
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setRemoveAvatar(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const displayedAvatar = removeAvatar
    ? null
    : previewUrl || avatarUrl;

  const hasChanges =
    username.trim() !== originalUsername ||
    Boolean(selectedFile) ||
    (removeAvatar && Boolean(avatarUrl));

  const uploadAvatar = async (file, userId) => {
    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    const extension = extensions[file.type];

    if (!extension) {
      throw new Error("ชนิดไฟล์ไม่รองรับ");
    }

    const filePath =
      `${userId}/profile-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("ไม่สามารถสร้าง URL รูปได้");
    }

    return {
      publicUrl: data.publicUrl,
      filePath,
    };
  };

  // =============================================
  // บันทึกชื่อและรูป
  // =============================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving || loading || !authUser || !profileData) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const cleanName = username.trim();

    if (!cleanName) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    if (cleanName.length > 40) {
      setErrorMessage(
        "ชื่อผู้ใช้ต้องไม่เกิน 40 ตัวอักษร"
      );
      return;
    }

    const nameChanged =
      cleanName !== originalUsername;

    const avatarChanged =
      Boolean(selectedFile) ||
      (removeAvatar && Boolean(avatarUrl));

    if (!nameChanged && !avatarChanged) return;

    setSaving(true);

    let uploadedPath = null;
    let profileSaved = false;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (
        !session?.user?.id ||
        session.user.id !== authUser.id
      ) {
        throw new Error("เซสชันหมดอายุ");
      }

      let nextAvatarUrl = avatarUrl;

      if (selectedFile) {
        const result = await uploadAvatar(
          selectedFile,
          session.user.id
        );

        nextAvatarUrl = result.publicUrl;
        uploadedPath = result.filePath;
      }

      if (removeAvatar) {
        nextAvatarUrl = null;
      }

      const updates = {};

      if (nameChanged) {
        updates.User_Name = cleanName;
      }

      if (avatarChanged) {
        updates.User_Avatar_URL = nextAvatarUrl;
      }

      // ไม่แก้ Active_Frame_RewardsID
      const { data: updated, error } =
        await supabase
          .from("User")
          .update(updates)
          .eq("auth_user_id", session.user.id)
          .select(PROFILE_FIELDS)
          .maybeSingle();

      if (error) throw error;

      if (!updated) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      profileSaved = true;

      setProfileData(updated);
      setUsername(updated.User_Name);
      setOriginalUsername(updated.User_Name);
      setAvatarUrl(updated.User_Avatar_URL || null);
      setSelectedFile(null);
      setRemoveAvatar(false);

      if (nameChanged) {
        const { error: authError } =
          await supabase.auth.updateUser({
            data: {
              username: cleanName,
              User_Name: cleanName,
            },
          });

        if (authError) {
          console.warn(
            "[EditProfile] Sync name:",
            authError
          );
        }
      }

      if (avatarChanged && avatarUrl) {
        const oldPath = getOwnedProfileImagePath(
          avatarUrl,
          session.user.id
        );

        if (oldPath && oldPath !== uploadedPath) {
          const { error: removeError } =
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([oldPath]);

          if (removeError) {
            console.warn(
              "[EditProfile] Remove old image:",
              removeError
            );
          }
        }
      }

      navigate("/settings/profile", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "[EditProfile] Save:",
        error
      );

      if (uploadedPath && !profileSaved) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadedPath]);
      }

      setErrorMessage(
        error.message || "บันทึกข้อมูลไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8">

      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#946B69] hover:text-[#684B50]"
      >
        <ArrowLeft size={17} />
        กลับไปหน้าโปรไฟล์
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#49332F]">
          แก้ไขโปรไฟล์
        </h1>
        <p className="mt-1 text-sm text-[#98777A]">
          เปลี่ยนชื่อ รูปโปรไฟล์ และกรอบตกแต่งของคุณ
        </p>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-[#F1DFD7] bg-[#FFFAF7] shadow-[0_12px_35px_rgba(100,61,56,0.07)]">

        <div className="h-24 bg-gradient-to-r from-[#E9B9AD] via-[#F4D4C9] to-[#F9E7DE]" />

        {loading ? (
          <div className="flex min-h-72 items-center justify-center gap-2 text-[#946B69]">
            <Loader2 className="animate-spin" size={20} />
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="px-5 pb-7 sm:px-8"
          >
            {/* รูปโปรไฟล์ */}
            <div className="-mt-12 mb-6 flex flex-col items-center">
              <div className="relative">
                <div className="rounded-full border-2 border-[#FFFAF7] bg-[#FFFAF7] shadow-md">
                  <FrameAvatar
                    avatarUrl={displayedAvatar}
                    username={username}
                    frame={activeFrame}
                    size={110}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={saving || !authUser}
                  aria-label="เปลี่ยนรูปโปรไฟล์"
                  className="absolute bottom-1 right-1 z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#A76F71] text-white shadow-md hover:bg-[#915C60] disabled:opacity-50"
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={saving}
                />
              </div>

              <p className="mt-3 text-xs text-[#98777A]">
                JPG, PNG หรือ WEBP ไม่เกิน 5 MB
              </p>

              {selectedFile && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-emerald-700">
                    <Check size={14} />
                    เลือกรูปใหม่แล้ว
                  </span>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-semibold text-[#A76F71] underline"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}

              {avatarUrl &&
                !selectedFile &&
                !removeAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={saving}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                    ลบรูปโปรไฟล์
                  </button>
                )}

              {removeAvatar && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-[#A76F71]">
                    จะใช้รูปเริ่มต้นหลังบันทึก
                  </p>
                  <button
                    type="button"
                    onClick={() => setRemoveAvatar(false)}
                    className="mt-1 text-xs font-semibold text-[#A76F71] underline"
                  >
                    ยกเลิกการลบรูป
                  </button>
                </div>
              )}
            </div>

            {/* ชื่อผู้ใช้ */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="flex items-center gap-2 text-sm font-semibold text-[#684B50]"
              >
                <UserRound size={16} />
                ชื่อผู้ใช้
              </label>

              <input
                id="username"
                type="text"
                value={username}
                maxLength={40}
                disabled={saving || !authUser}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setSuccessMessage("");
                }}
                placeholder="กรอกชื่อผู้ใช้"
                className="w-full rounded-xl border border-[#E8D5D0] bg-white px-4 py-3 text-sm text-[#684B50] outline-none focus:border-[#D99BA0] focus:ring-2 focus:ring-[#F9DFE0]"
              />

              <p className="text-right text-xs text-[#B18A8D]">
                {username.length}/40 ตัวอักษร
              </p>
            </div>

            {/* ส่วนเลือกกรอบโปรไฟล์ */}
            <div className="mt-6 border-t border-[#F1DFD7] pt-6">
              <h2 className="mb-3 text-sm font-bold text-[#684B50]">
                กรอบโปรไฟล์ที่ใช้งาน
              </h2>

              <button
                type="button"
                onClick={openFrameDialog}
                disabled={saving || !authUser}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#E8D5D0] bg-white p-3 text-left transition hover:border-[#D99BA0] hover:bg-[#FFF7F3] disabled:opacity-50"
              >
                <div className="shrink-0">
                  <FrameAvatar
                    avatarUrl={displayedAvatar}
                    username={username}
                    frame={activeFrame}
                    size={76}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#674B45]">
                    {activeFrame?.title || "ไม่ใช้กรอบ"}
                  </p>

                  <p className="mt-1 text-xs text-[#A18C85]">
                    กดเพื่อเลือกกรอบโปรไฟล์
                  </p>

                  <p className="mt-1 text-[11px] text-[#B18A8D]">
                    ได้รับแล้ว {unlockedFrames.length}/
                    {availableFrames.length} กรอบ
                  </p>
                </div>

                <ChevronRight
                  size={19}
                  className="shrink-0 text-[#A76F71]"
                />
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

            {/* ปุ่มบันทึก */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate("/settings/profile")
                }
                disabled={saving}
                className="rounded-xl border border-[#E8D5D0] bg-white px-5 py-3 text-sm font-semibold text-[#80676A] hover:bg-[#FFF1EE]"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  !authUser ||
                  !profileData ||
                  !hasChanges
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A76F71] px-6 py-3 text-sm font-semibold text-white hover:bg-[#915C60] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =====================================
          POPUP เลือกกรอบโปรไฟล์
         ===================================== */}

      <Dialog
        open={frameDialogOpen}
        onOpenChange={(open) => {
          if (!frameSaving) {
            setFrameDialogOpen(open);
          }
        }}
      >
        <DialogContent className="!fixed !left-1/2 !top-1/2 !w-[calc(100vw-24px)] !max-w-[920px] !-translate-x-1/2 !-translate-y-1/2 flex max-h-[90dvh] flex-col overflow-hidden rounded-[24px] border border-[#F1DFD7] bg-[#FFFAF7] p-0 sm:!w-[calc(100vw-64px)] sm:!max-w-[920px] md:!max-w-[920px] lg:!max-w-[920px]">
          <DialogHeader className="shrink-0 border-b border-[#F1DFD7] px-5 py-5 pr-12 sm:px-7">
            <DialogTitle className="text-xl font-bold text-[#49332F]">
              เลือกกรอบโปรไฟล์
            </DialogTitle>

            <DialogDescription className="text-sm text-[#98777A]">
              เลือกกรอบที่คุณได้รับเพื่อใช้ตกแต่งรูปโปรไฟล์
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-7">
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

              {/* ฝั่งซ้าย: รายการกรอบ */}
              <div className="min-w-0 w-full space-y-6">

                {/* กรอบที่ได้รับ */}
                <section>
                  <h3 className="mb-3 text-sm font-bold text-[#674B45]">
                    กรอบที่ได้รับแล้ว
                  </h3>

                  {loadingFrames ? (
                    <div className="flex items-center gap-2 py-5 text-sm text-[#98777A]">
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      กำลังโหลดกรอบ...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">

                      {/* ไม่ใช้กรอบ */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFrameId(null)
                        }
                        className={`relative flex flex-col items-center rounded-xl border-2 p-2 transition ${
                          selectedFrameId === null
                            ? "border-[#A76F71] bg-[#FFF0EB]"
                            : "border-[#F1E6E1] bg-white hover:border-[#D9AAA5]"
                        }`}
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7ECE7]">
                          <X
                            size={24}
                            className="text-[#A88C84]"
                          />
                        </div>

                        <span className="mt-2 text-center text-[11px] font-semibold text-[#674B45]">
                          ไม่ใช้กรอบ
                        </span>

                        {selectedFrameId === null && (
                          <Check
                            size={15}
                            className="absolute right-1 top-1 text-[#A76F71]"
                          />
                        )}
                      </button>

                      {unlockedFrames.map((frame) => (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() =>
                            setSelectedFrameId(frame.id)
                          }
                          className={`relative flex flex-col items-center rounded-xl border-2 p-2 transition ${
                            selectedFrameId === frame.id
                              ? "border-[#A76F71] bg-[#FFF0EB]"
                              : "border-[#F1E6E1] bg-white hover:border-[#D9AAA5]"
                          }`}
                        >
                          <FrameAvatar
                            avatarUrl={displayedAvatar}
                            username={username}
                            frame={frame}
                            size={68}
                          />

                          <span className="mt-2 line-clamp-2 text-center text-[11px] font-semibold text-[#674B45]">
                            {frame.title}
                          </span>

                          {selectedFrameId === frame.id && (
                            <Check
                              size={15}
                              className="absolute right-1 top-1 text-[#A76F71]"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* กรอบที่ยังไม่ได้รับ */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#674B45]">
                    <LockKeyhole size={15} />
                    กรอบที่ยังไม่ได้รับ
                  </h3>

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {lockedFrames.map((frame) => (
                      <div
                        key={frame.id}
                        title={frame.description}
                        className="relative flex flex-col items-center rounded-xl border border-[#F1E6E1] bg-[#F6F2EF] p-2"
                      >
                        <div className="relative opacity-50 grayscale">
                          <FrameAvatar
                            avatarUrl={displayedAvatar}
                            username={username}
                            frame={frame}
                            size={68}
                          />
                        </div>

                        <div className="absolute right-1 top-1 rounded-full bg-white p-1 shadow-sm">
                          <LockKeyhole
                            size={12}
                            className="text-[#9D8B85]"
                          />
                        </div>

                        <span className="mt-2 line-clamp-2 text-center text-[11px] font-semibold text-[#9D8B85]">
                          {frame.title}
                        </span>

                        <span className="mt-1 text-center text-[10px] leading-snug text-[#A99B95]">
                          {frame.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* ฝั่งขวา: ตัวอย่างขนาดใหญ่ */}
              <aside className="min-w-0">
                <div className="rounded-2xl border border-[#F1DFD7] bg-white p-5 md:sticky md:top-0">

                  <h3 className="mb-4 text-center text-sm font-bold text-[#674B45]">
                    ตัวอย่างกรอบโปรไฟล์
                  </h3>

                  <div className="flex min-h-[190px] items-center justify-center rounded-xl bg-[#FFF7F3] p-4">
                    <FrameAvatar
                      avatarUrl={displayedAvatar}
                      username={username}
                      frame={selectedFrame}
                      size={160}
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-[#674B45]">
                      {selectedFrame?.title ||
                        "ไม่ใช้กรอบ"}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-[#A18C85]">
                      {selectedFrame?.description ||
                        "แสดงรูปโปรไฟล์แบบปกติ"}
                    </p>
                  </div>

                  {selectedFrameId === activeFrameId && (
                    <div className="mt-3 flex justify-center">
                      <span className="rounded-full bg-[#E8F5EA] px-3 py-1 text-[11px] font-semibold text-[#4B8655]">
                        กำลังใช้งาน
                      </span>
                    </div>
                  )}
                </div>
              </aside>
            </div>

            {frameError && (
              <div
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
              >
                {frameError}
              </div>
            )}
          </div>

          {/* ปุ่มล่าง Popup */}
          <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t border-[#F1DFD7] bg-white px-5 py-4 sm:px-7">
            <Button
              type="button"
              variant="outline"
              disabled={frameSaving}
              onClick={() => setFrameDialogOpen(false)}
              className="rounded-xl border-[#E8D5D0] text-[#80676A]"
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              onClick={handleApplyFrame}
              disabled={
                frameSaving ||
                loadingFrames ||
                Boolean(frameError) ||
                selectedFrameId === activeFrameId
              }
              className="rounded-xl bg-[#A76F71] text-white hover:bg-[#915C60]"
            >
              {frameSaving ? (
                <>
                  <Loader2
                    size={15}
                    className="mr-2 animate-spin"
                  />
                  กำลังบันทึก...
                </>
              ) : (
                "ใช้กรอบนี้"
              )}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </main>
  );
}
