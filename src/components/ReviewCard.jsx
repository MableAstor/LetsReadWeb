
import profileicon from "../assets/profile-icon.png";

export default function ReviewCard({ review }) {
  if (!review) return null;

  const rating = Math.min(
    5,
    Math.max(0, Number(review.Rating) || 0)
  );

  return (
    <div className="w-full max-w-2xl mx-auto border border-gray-300 rounded-lg bg-white p-3">
      {/* ข้อมูลผู้รีวิว */}
      <div className="flex flex-row items-center mb-3">
        <img
          src={profileicon}
          alt="Profile Icon"
          className="h-8 w-8 mr-2"
        />

        <p className="font-bold">
          {review.User_Name || "Reader"}
        </p>

        {review.Created_At && (
          <span className="ml-auto text-xs text-gray-500">
            {new Date(review.Created_At).toLocaleDateString("th-TH")}
          </span>
        )}
      </div>

      {/* เนื้อหารีวิว */}
      <div className="flex flex-col border border-gray-300 rounded-lg p-3 w-full">
        <div className="flex flex-row flex-wrap gap-2 items-center">
          <p className="font-bold break-words">
            {review.Book_Title || "Untitled book"}
          </p>

          <div
            className="text-xl text-yellow-400"
            aria-label={`คะแนน ${rating} จาก 5 ดาว`}
          >
            {"★".repeat(rating)}
            <span className="text-gray-300">
              {"★".repeat(5 - rating)}
            </span>
          </div>

          {review.Main_Category && (
            <span className="inline-flex items-center border border-black rounded-full px-3 py-1 text-sm">
              {review.Main_Category}
            </span>
          )}

          {review.Sub_Category && (
            <span className="inline-flex items-center border border-black rounded-full px-3 py-1 text-sm">
              {review.Sub_Category}
            </span>
          )}
        </div>

        <p className="text-sm mt-2 whitespace-pre-wrap break-words">
          {review.Review_Text}
        </p>

        {/* รูปภาพจาก Supabase Storage */}
        {review.Image_URL && (
          <img
            src={review.Image_URL}
            alt={`รูปประกอบรีวิว ${review.Book_Title || "หนังสือ"}`}
            loading="lazy"
            className="mt-3 w-full max-h-[400px] rounded-lg object-contain bg-gray-50"
            onError={(e) => {
              console.error(
                "[ReviewCard] โหลดรูปไม่สำเร็จ:",
                review.Image_URL
              );
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      {/* ปุ่มเดิม */}
      <div className="mt-4 flex items-center gap-6 border-t border-gray-200 pt-3">
        <button
          type="button"
          className="text-gray-600 hover:text-black"
        >
          ♡ Like
        </button>

        <button
          type="button"
          className="text-gray-600 hover:text-black"
        >
          ↗ Share
        </button>

        <button
          type="button"
          className="text-gray-600 hover:text-black"
        >
          🔖 Save
        </button>
      </div>
    </div>
  );
}
