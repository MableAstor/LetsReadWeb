import { supabase } from "../lib/supabase";

export const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .replace(/\/+$/, "") + "/api/auth";

export const STORAGE_BUCKET = "review-images";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const PROFILE_FIELDS =
  "User_Name, User_Avatar_URL, Active_Frame_RewardsID";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


export function getOwnedProfileImagePath(imageUrl, userId) {
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


export const uploadAvatar = async (file, userId) => {
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
