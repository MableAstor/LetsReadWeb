import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  API_URL, STORAGE_BUCKET, MAX_IMAGE_SIZE, PROFILE_FIELDS,
  ALLOWED_IMAGE_TYPES, getOwnedProfileImagePath, uploadAvatar,
} from "../services/profileService";
// รูปกรอบโปรไฟล์เดิม
import firstLogin from "../assets/pink-cloud-circle-frame-2026.png";
import reviewFive from "../assets/red-fire-abstract-frame.png";
import toponeNOV from "../assets/blue-and-orange-fish-frame.png";
import toptwoNOV from "../assets/cute-bunnies-hug-frame.png";
import topthreeNOV from "../assets/running-dogs-and-paws-frame.png";
import toponeDEC from "../assets/red-cat-yarn-frame.png.png";
import toptwoDEC from "../assets/green-leaves-and-blue-clouds-frame.png";
import topthreeDEC from "../assets/golden-thorn-vines-frame.png";


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


export default function useEditProfile() {
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

  const [activeTitleId, setActiveTitleId] = useState(null);
  const [previewTitles, setPreviewTitles] = useState([]);
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadTitles() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const response = await fetch(`${API_URL}/rewards`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "โหลดแท็กไม่สำเร็จ");
        if (mounted) {
          setPreviewTitles(result.titles || []);
          setActiveTitleId(result.activeTitleId || null);
        }
      } catch (error) {
        if (mounted) setTitleError(error.message || "โหลดแท็กไม่สำเร็จ");
      }
    }
    loadTitles();
    return () => { mounted = false; };
  }, []);

  const handleApplyTitle = async (titleId) => {
    if (titleSaving) return false;
    setTitleSaving(true);
    setTitleError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("กรุณาเข้าสู่ระบบ");
      const response = await fetch(`${API_URL}/rewards/active-title`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titleId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "บันทึกแท็กไม่สำเร็จ");
      setActiveTitleId(result.activeTitleId);
      setSuccessMessage("บันทึกแท็กฉายาเรียบร้อยแล้ว");
      return true;
    } catch (error) {
      setTitleError(error.message || "บันทึกแท็กไม่สำเร็จ");
      return false;
    } finally {
      setTitleSaving(false);
    }
  };

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

  return {
    navigate, fileInputRef, authUser, profileData, username, setUsername,
    avatarUrl, selectedFile, setSelectedFile, removeAvatar, setRemoveAvatar,
    earnedFrames, loadingFrames, frameError, frameDialogOpen, setFrameDialogOpen,
    selectedFrameId, setSelectedFrameId, frameSaving, loading, saving,
    errorMessage, setErrorMessage, successMessage, setSuccessMessage,
    activeTitleId, previewTitles, titleSaving, titleError, handleApplyTitle,
    availableFrames, activeFrameId, activeFrame, selectedFrame,
    unlockedFrames, lockedFrames, openFrameDialog, handleApplyFrame,
    handleImageChange, handleRemoveAvatar, displayedAvatar, hasChanges,
    handleSave, frameItems,
  };
}
