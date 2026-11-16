import UserAvatar from "../UserAvatar";

// รูปโปรไฟล์พร้อมกรอบ
export default function FrameAvatar({
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

