import { useEffect, useState } from "react";

export default function UserAvatar({
  avatarUrl,
  src,
  userName,
  name,
  frameImage,
  size = 60,
  frameScale = 1.18,
  className = "",
  style = {},
}) {
  const imageSrc = avatarUrl || src;
  const displayName = userName || name || "ผู้ใช้";

  const [imageError, setImageError] = useState(false);

  // รีเซ็ตสถานะเมื่อเปลี่ยนรูปโปรไฟล์
  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  const avatarSize =
    typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: avatarSize,
        height: avatarSize,
        minWidth: avatarSize,
        minHeight: avatarSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "visible",
        ...style,
      }}
    >
      {/* รูปโปรไฟล์ */}
      {imageSrc && !imageError ? (
        <img
          src={imageSrc}
          alt={`รูปโปรไฟล์ของ ${displayName}`}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
          }}
        />
      ) : (
        // กรณีไม่มีรูปโปรไฟล์
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "600",
            color: "#64748B",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* กรอบโปรไฟล์ */}
      {frameImage && (
        <img
          src={frameImage}
          alt=""
          aria-hidden="true"
          draggable="false"
          style={{
            position: "absolute",
            width: `${frameScale * 100}%`,
            height: `${frameScale * 100}%`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            objectFit: "contain",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}