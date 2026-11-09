
const API_BASE = (
  import.meta.env?.VITE_RECOMMENDER_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function requireArray(name, value) {
  if (!Array.isArray(value)) {
    throw new Error(
      `ข้อมูล ${name} ต้องเป็น Array (ค่าปัจจุบัน: ${
        value === undefined
          ? "undefined"
          : value === null
            ? "null"
            : typeof value
      })`
    );
  }

  if (
    ["preferences", "pool", "swiped", "likes"].includes(name) &&
    value.some(
      (item) =>
        item === null ||
        typeof item !== "object" ||
        Array.isArray(item)
    )
  ) {
    throw new Error(`ข้อมูล ${name} ต้องเป็น Array ของ object เท่านั้น`);
  }

  return value;
}

function formatErrorDetail(data) {
  const detail = data?.detail ?? data?.message ?? data?.error;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item?.loc)
          ? item.loc.join(".")
          : "request";

        return `${field}: ${
          item?.msg || item?.type || "invalid value"
        }`;
      })
      .join("; ");
  }

  if (typeof detail === "string" && detail) return detail;
  if (detail != null) return JSON.stringify(detail);

  return "ไม่มีรายละเอียดข้อผิดพลาดจากเซิร์ฟเวอร์";
}

async function recommendationRequest(
  path,
  body,
  apiBase = API_BASE
) {
  const base = apiBase.replace(/\/+$/, "");

  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let payload = null;

  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    // Non-JSON backend error
  }

  if (!response.ok) {
    const detail = formatErrorDetail(payload);

    const note =
      response.status === 422
        ? " | ตรวจ Request Payload และเปิด /health ที่พอร์ต 8000 เพื่อยืนยันว่าใช้ Python API เวอร์ชันเดียวกับ Frontend"
        : "";

    throw new Error(
      `Python Recommendation API ${path} ตอบ HTTP ${response.status}: ${detail}${note}`
    );
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(
      `Python Recommendation API ${path} ส่ง JSON ไม่ถูกต้อง`
    );
  }

  return payload;
}

// ใช้ User_Preferences ล่าสุดในการเลือกหนังสือถัดไป
export async function getNextBook({
  apiBase = API_BASE,
  preferences,
  swiped,
  pool,
  selectedCategories,
  selectedSubcategories,
}) {
  const body = {
    preferences: requireArray("preferences", preferences),
    swiped: requireArray("swiped", swiped),
    pool: requireArray("pool", pool),
    selected_categories: requireArray(
      "selectedCategories",
      selectedCategories
    ),
    selected_subcategories: requireArray(
      "selectedSubcategories",
      selectedSubcategories
    ),
  };

  return recommendationRequest("/next-book", body, apiBase);
}

// จัดอันดับหนังสือที่กดถูกใจโดยใช้ User_Preferences
export async function getFinalRecommendations({
  apiBase = API_BASE,
  preferences,
  likes,
  swiped,
  pool,
  selectedCategories,
  selectedSubcategories,
}) {
  const body = {
    preferences: requireArray("preferences", preferences),
    likes: requireArray("likes", likes),
    swiped: requireArray("swiped", swiped),
    pool: requireArray("pool", pool),
    selected_categories: requireArray(
      "selectedCategories",
      selectedCategories
    ),
    selected_subcategories: requireArray(
      "selectedSubcategories",
      selectedSubcategories
    ),
  };

  return recommendationRequest("/recommend", body, apiBase);
}
