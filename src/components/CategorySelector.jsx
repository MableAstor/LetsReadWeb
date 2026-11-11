import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const API_BASE = (
  import.meta.env.VITE_RECOMMENDER_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const BACKEND_API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Extract FastAPI validation details, including the path of a missing field.
function describeApiError(payload, status, service) {
  const detail = payload?.detail ?? payload?.message ?? payload?.error;
  const message = Array.isArray(detail)
    ? detail.map((item) => {
        const location = Array.isArray(item?.loc) ? item.loc.join(".") : "request";
        return `${location}: ${item?.msg || "invalid value"}`;
      }).join("; ")
    : typeof detail === "string"
      ? detail
      : detail != null
        ? JSON.stringify(detail)
        : "ไม่พบรายละเอียดเพิ่มเติม";

  return `${service} HTTP ${status}: ${message}`;
}

// The server rebuilds/reads *persisted* User_Preferences from Swipe_History.
// Empty [] is valid for a new user. Never replace a failed request with [].
async function loadUserPreferences(accessToken) {
  const response = await fetch(`${BACKEND_API_URL}/api/swipes/rebuild-preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({}),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success !== true) {
    if (response.status === 404) {
      throw new Error("ไม่พบ /api/swipes/rebuild-preferences ใน Express Backend — กรุณาใช้ swipeRoutes.js เวอร์ชันใหม่");
    }
    throw new Error(describeApiError(payload, response.status, "โหลด User_Preferences ไม่สำเร็จ:"));
  }
  if (!Array.isArray(payload.preferences)) {
    throw new Error("Backend ต้องส่ง preferences เป็น Array (ผู้ใช้ใหม่ต้องเป็น [])");
  }

  // Python matches category *names*, not just numeric IDs.
  payload.preferences.forEach((row, index) => {
    const kind = String(row?.type ?? row?.kind ?? "").toLowerCase();
    const typedLabel = ["main", "category", "categorise", "sub", "subcategory", "subcategorise"]
      .includes(kind) && typeof row?.label === "string" && row.label.trim();
    const hasMainName = ["Categorise_Name", "category", "categories", "main_category", "main_categories"]
      .some((key) => Boolean(row?.[key]));
    const hasSubName = ["Subcategorise_Name", "subcategory", "subcategories", "sub_category"]
      .some((key) => Boolean(row?.[key]));
    if (!row || typeof row !== "object" || Array.isArray(row) ||
        !(typedLabel || hasMainName || hasSubName)) {
      throw new Error(`User_Preferences[${index}] ไม่มีชื่อหมวด (Categorise_Name / Subcategorise_Name หรือ type + label)`);
    }
  });
  return payload.preferences;
}

// Supabase embeds may return a related row as an object or an array.
function asRows(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function cleanLabels(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}


export default function CategoryCard({ onSearch, maxSelect = 5 }) {
  const navigate = useNavigate();
  const [mainList, setMainList] = useState([]);
  const [subList, setSubList] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searching, setSearching] = useState(false);
  const searchingRef = useRef(false);

  // Load both category lists from the actual Supabase tables.
  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setLoadingCategories(true);

      const [mainResult, subResult] = await Promise.all([
        supabase
          .from("Categorise")
          .select("CategoriseID, Categorise_Name")
          .order("Categorise_Name"),
        supabase
          .from("Subcategorise")
          .select("SubcategoriseID, Subcategorise_Name")
          .order("Subcategorise_Name"),
      ]);

      if (cancelled) return;

      if (mainResult.error) {
        console.error("Load main categories error:", mainResult.error);
        toast.error("โหลดหมวดหลักไม่สำเร็จ กรุณาตรวจสอบ Supabase/RLS");
        setMainList([]);
      } else {
        setMainList(
          (mainResult.data ?? [])
            .map((row) => row.Categorise_Name)
            .filter(Boolean)
        );
      }

      if (subResult.error) {
        console.error("Load subcategories error:", subResult.error);
        toast.warning("โหลดหมวดรองไม่สำเร็จ ระบบอาจยังคำนวณได้เฉพาะหมวดหลัก");
        setSubList([]);
      } else {
        const loadedSubcategories = (subResult.data ?? [])
          .map((row) => row.Subcategorise_Name)
          .filter(Boolean);
        setSubList(loadedSubcategories);
        if (loadedSubcategories.length === 0) {
          console.warn(
            "No subcategories returned. Check whether public.Subcategorise contains rows and whether SELECT is allowed by RLS."
          );
        }
      }

      setLoadingCategories(false);
    }

    fetchCategories().catch((error) => {
      if (cancelled) return;
      console.error("Unexpected category loading error:", error);
      toast.error("เกิดข้อผิดพลาดขณะโหลดหมวดหมู่");
      setMainList([]);
      setSubList([]);
      setLoadingCategories(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCategory = (tag, type) => {
    const selected = type === "main" ? mainCategories : subCategories;
    const setSelected = type === "main" ? setMainCategories : setSubCategories;

    if (selected.includes(tag)) {
      setSelected((previous) => previous.filter((item) => item !== tag));
      return;
    }

    if (selected.length >= maxSelect) {
      toast.warning(`เลือกได้สูงสุด ${maxSelect} หมวดหมู่เท่านั้นค่ะ`);
      return;
    }

    setSelected((previous) => [...previous, tag]);
  };

  const handleFindBook = async () => {
    if (mainCategories.length === 0) {
      toast.warning("กรุณาเลือกหมวดหลักอย่างน้อย 1 หมวดก่อนค้นหานะคะ");
      return;
    }
    if (searchingRef.current) return;
    searchingRef.current = true;
    setSearching(true);
    try {
      // Authenticate before requesting private preferences from Express.
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("กรุณาเข้าสู่ระบบก่อนค้นหาหนังสือ");

      const preferences = await loadUserPreferences(accessToken);

      // Read all pages: Supabase may cap a SELECT response at 1,000 rows.
      const data = [];
      const pageSize = 500;
      for (let start = 0; ; start += pageSize) {
        const { data: page, error } = await supabase
          .from("Books")
          .select(`
            BooksID,
            Books_title,
            Books_Cover,
            Book_Synopsis,
            Book_Categorise (
              Categorise (CategoriseID, Categorise_Name)
            ),
            Book_Subcategorise (
              Subcategorise (SubcategoriseID, Subcategorise_Name)
            )
          `)
          .order("BooksID", { ascending: true })
          .range(start, start + pageSize - 1);

        if (error) {
          throw new Error(`โหลดหนังสือหรือความสัมพันธ์หมวดหมู่ไม่สำเร็จ: ${error.message}`);
        }
        data.push(...(page ?? []));
        if (!page || page.length < pageSize) break;
      }

      // Keep the real category and subcategory labels on every book sent to Python.
      const allBooks = (data ?? []).map((book) => {
        const categoryRows = asRows(book.Book_Categorise).flatMap((relation) =>
          asRows(relation?.Categorise)
        );
        const subcategoryRows = asRows(book.Book_Subcategorise).flatMap((relation) =>
          asRows(relation?.Subcategorise)
        );

        const categories = cleanLabels(categoryRows.map((row) => row.Categorise_Name));
        const subcategories = cleanLabels(
          subcategoryRows.map((row) => row.Subcategorise_Name)
        );
        const categoryIds = [...new Set(categoryRows.map((row) => row.CategoriseID).filter((id) => id != null))];
        const subcategoryIds = [...new Set(subcategoryRows.map((row) => row.SubcategoriseID).filter((id) => id != null))];

        return {
          id: book.BooksID,
          title: book.Books_title,
          image: book.Books_Cover,
          synopsis: book.Book_Synopsis ?? "",
          category: categories.join(" • "),
          categories,
          categoryIds,
          subcategories,
          subCategory: subcategories.join(" • "),
          subcategoryIds,
        };
      });

      const booksWithSubcategories = allBooks.filter(
        (book) => book.subcategories.length > 0
      ).length;
      const subcategoryCoverage = allBooks.length
        ? booksWithSubcategories / allBooks.length
        : 0;

      console.info("[Supabase] Books loaded:", allBooks.length);
      console.info("[Supabase] Books with subcategories:", booksWithSubcategories);
      console.info(
        "[Supabase] Subcategory coverage:",
        `${(subcategoryCoverage * 100).toFixed(1)}%`
      );
      console.info("[Supabase] Sample mapped book ID:", allBooks[0]?.id ?? null);

      if (allBooks.length > 0 && booksWithSubcategories === 0) {
        toast.warning(
          "อ่านหนังสือได้ แต่ยังไม่พบหมวดรอง ตรวจสอบ Policy SELECT ของ Subcategorise และ Book_Subcategorise ก่อนทดสอบสูตร 60/40"
        );
      } else if (allBooks.length > 0 && subcategoryCoverage < 0.7) {
        toast.warning(
          `หนังสือที่มีหมวดรองมี ${(subcategoryCoverage * 100).toFixed(1)}% ระบบ Python อาจใช้เฉพาะหมวดหลักจนกว่าข้อมูลจะครบ`
        );
      }

      // These choices define the initial preference profile; they are NOT a hard filter for the whole swipe session.
      // The Python engine selects the first book from the complete catalogue.
      if (allBooks.length === 0) {
        toast.info("ยังไม่มีหนังสือในฐานข้อมูลสำหรับแนะนำค่ะ");
        return;
      }

      const exactSeedMatches = allBooks.filter((book) => {
        const matchesMain = book.categories.some((category) =>
          mainCategories.includes(category)
        );
        const matchesSub =
          subCategories.length === 0 ||
          book.subcategories.some((subcategory) => subCategories.includes(subcategory));
        return matchesMain && matchesSub;
      }).length;

      // Python v3 expects preferences/user_preferences, including [] for new users.
      // Likes/Dislikes no longer construct the user's preference profile.
      const initialResponse = await fetch(`${API_BASE}/next-book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          preferences,
          user_preferences: preferences, // Compatibility with Python v3.2 variants.
          swiped: [],
          pool: allBooks,
          selected_categories: mainCategories,
          selected_subcategories: subCategories,
        }),
      });
      const initialPayload = await initialResponse.json().catch(() => null);
      if (!initialResponse.ok) {
        throw new Error(describeApiError(initialPayload, initialResponse.status, "Python /next-book"));
      }

      const initialBook = initialPayload?.book;
      if (!initialBook) {
        toast.error("Python ยังเลือกหนังสือเริ่มต้นไม่ได้ กรุณาตรวจข้อมูลหมวดหมู่");
        return;
      }

      onSearch?.({ main: mainCategories, sub: subCategories });
      toast.success(
        `สร้างโปรไฟล์เริ่มต้นแล้ว · คลัง ${allBooks.length} เล่ม · พบหนังสือตรงหมวดที่เลือก ${exactSeedMatches} เล่ม`
      );

      navigate("/swipeforbooks", {
        state: {
          // Keep the full catalogue. Swipe asks Python for each next book dynamically.
          bookList: allBooks,
          initialBook,
          recommendationPool: allBooks,
          selectedCategories: [...mainCategories],
          selectedSubcategories: [...subCategories],
          initialSelectionMetadata: initialPayload?.metadata ?? null,
        },
      });
    } catch (error) {
      console.error("[CATEGORY] Search failed:", error);
      toast.error(error?.message || "เกิดข้อผิดพลาดขณะค้นหาหนังสือ");
    } finally {
      searchingRef.current = false;
      setSearching(false);
    }
  };

  const renderCategories = (list, selected, type) =>
    list.map((tag) => {
      const isActive = selected.includes(tag);
      return (
        <Badge
          key={tag}
          variant="outline"
          role="button"
          tabIndex={0}
          aria-pressed={isActive}
          onClick={() => toggleCategory(tag, type)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleCategory(tag, type);
            }
          }}
          className={`inline-flex min-h-9 max-w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-medium leading-snug whitespace-normal transition-all select-none sm:min-h-9 sm:px-4 sm:text-xs ${
            isActive
              ? "border-[#1D77FF] bg-[#1D77FF] text-white hover:bg-blue-600"
              : "border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {isActive && <Check className="h-3 w-3 shrink-0" />}
          <span className="break-words text-center">{tag}</span>
        </Badge>
      );
    });

  return (
    <Card className="mx-auto w-full max-w-2xl min-w-0 gap-0 rounded-2xl border-0 bg-white py-0 shadow-sm sm:rounded-3xl">
      <CardHeader className="px-4 pt-5 pb-3 sm:px-7 sm:pt-7">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900 sm:text-base">
          <BookOpen className="h-4 w-4 text-[#1D77FF]" /> เลือกหมวดหมู่หนังสือ
        </CardTitle>
      </CardHeader>

      <CardContent className="min-w-0 space-y-6 px-4 pb-4 sm:space-y-7 sm:px-7">
        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-gray-900 sm:text-sm">
              เลือกหมวดหลัก (1 - {maxSelect} หมวด)
            </h2>
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {mainCategories.length}/{maxSelect}
            </Badge>
          </div>

          {loadingCategories ? (
            <p className="text-sm text-gray-500">กำลังโหลดหมวดหมู่จากฐานข้อมูล...</p>
          ) : mainList.length === 0 ? (
            <p className="text-sm text-red-500">
              ไม่มีหมวดหลักให้เลือก กรุณาตรวจสอบฐานข้อมูลหรือสิทธิ์ RLS
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {renderCategories(mainList, mainCategories, "main")}
            </div>
          )}
        </section>

        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-gray-900 sm:text-sm">
              เลือกหมวดรอง (ไม่บังคับ)
            </h2>
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {subCategories.length}/{maxSelect}
            </Badge>
          </div>

          {loadingCategories ? (
            <p className="text-sm text-gray-500">กำลังโหลดหมวดรอง...</p>
          ) : subList.length === 0 ? (
            <p className="text-sm text-amber-700">
              ยังไม่มีข้อมูลหมวดรองให้เลือก ตรวจสอบ Subcategorise และ RLS
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {renderCategories(subList, subCategories, "sub")}
            </div>
          )}
        </section>
      </CardContent>

      <CardFooter className="flex justify-center px-4 pt-2 pb-5 sm:px-7 sm:pb-7">
        <Button
          type="button"
          onClick={handleFindBook}
          disabled={loadingCategories || searching || mainList.length === 0}
          className="h-10 w-full rounded-full bg-[#1D77FF] px-8 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 sm:w-auto sm:min-w-40"
        >
          <Search className="h-4 w-4" />
          {searching ? "กำลังค้นหา..." : "Find a Book"}
        </Button>
      </CardFooter>
    </Card>
  );
}
