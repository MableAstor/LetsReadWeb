import { ArrowLeft, Camera, Check, ChevronRight, Loader2, Save, Trash2, UserRound } from "lucide-react";
import FrameAvatar from "./FrameAvatar";
import FrameSelector from "./FrameSelector";
import ProfileTitleSelector from "../ProfileTitleSelector";

export default function EditProfileView({ model }) {
  const {navigate, fileInputRef, authUser, profileData, username, setUsername,
  avatarUrl, selectedFile, setSelectedFile, removeAvatar, setRemoveAvatar,
  loadingFrames, frameError, frameDialogOpen, setFrameDialogOpen,
  selectedFrameId, setSelectedFrameId, frameSaving, loading, saving,
  errorMessage, setErrorMessage, successMessage, setSuccessMessage,
  activeTitleId, previewTitles, titleSaving, titleError, handleApplyTitle, activeFrameId,
  activeFrame, selectedFrame, unlockedFrames, lockedFrames,
  availableFrames, openFrameDialog, handleApplyFrame,
  handleImageChange, handleRemoveAvatar, displayedAvatar, hasChanges, handleSave } = model;
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

            {/* ============================= */}
            {/* เลือกแท็กฉายา */}
            {/* ============================= */}
            <ProfileTitleSelector
              username={username}
              titles={previewTitles}
              activeTitleId={activeTitleId}
              onApply={handleApplyTitle}
              saving={titleSaving}
              error={titleError}
            />

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

      <FrameSelector model={model} />
    </main>
  );
}
