import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const PAGE_SIZE = 500;
const CHUNK_SIZE = 150;
const DISLIKE_WEIGHT = 0.75;
const SMOOTHING = 2;
const SWIPE_FIELDS = "Swipe_HistoryID, Swipe_Action, Created_At, UserID, BooksID, SessionsID, Request_ID";

const chunks = (items, size = CHUNK_SIZE) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

function assertNoError(error) {
  if (error) throw error;
}

async function fetchPages(makeQuery) {
  const result = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await makeQuery().range(start, start + PAGE_SIZE - 1);
    assertNoError(error);
    result.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return result;
}

async function fetchAllSwipes(userId) {
  return fetchPages(() => supabaseAdmin
    .from("Swipe_History")
    .select("Swipe_HistoryID, BooksID, Swipe_Action")
    .eq("UserID", userId)
    .order("Swipe_HistoryID", { ascending: true }));
}

async function fetchMappings(table, field, ids) {
  const rows = [];
  for (const batch of chunks(ids)) {
    rows.push(...await fetchPages(() => supabaseAdmin
      .from(table)
      .select(`BooksID, ${field}`)
      .in("BooksID", batch)
      .order("BooksID", { ascending: true })
      .order(field, { ascending: true })));
  }
  return rows;
}

async function fetchNameMap(table, idField, labelField, ids) {
  const names = new Map();
  for (const batch of chunks([...new Set(ids)])) {
    const rows = await fetchPages(() => supabaseAdmin
      .from(table)
      .select(`${idField}, ${labelField}`)
      .in(idField, batch)
      .order(idField, { ascending: true }));
    rows.forEach((row) => {
      const label = row[labelField];
      if (typeof label === "string" && label.trim()) {
        names.set(String(row[idField]), label.trim());
      }
    });
  }
  return names;
}

async function existingPreferences(userId) {
  const rows = await fetchPages(() => supabaseAdmin
    .from("User_Preferences")
    .select("User_PreferencesID, UserID, Preference_Value, CategoriseID, SubcategoriseID, SessionsID")
    .eq("UserID", userId)
    .order("User_PreferencesID", { ascending: true }));
  return rows;
}

async function hydratePreferences(rows) {
  const mainIDs = rows.map((row) => row.CategoriseID).filter((id) => id != null);
  const subIDs = rows.map((row) => row.SubcategoriseID).filter((id) => id != null);
  const [mains, subs] = await Promise.all([
    fetchNameMap("Categorise", "CategoriseID", "Categorise_Name", mainIDs),
    fetchNameMap("Subcategorise", "SubcategoriseID", "Subcategorise_Name", subIDs),
  ]);
  return rows.flatMap((row) => {
    const hasMain = row.CategoriseID != null;
    const hasSub = row.SubcategoriseID != null;
    if (hasMain === hasSub) return []; // invalid/ambiguous row
    const type = hasMain ? "main" : "sub";
    const id = hasMain ? row.CategoriseID : row.SubcategoriseID;
    const label = (hasMain ? mains : subs).get(String(id));
    // Never silently use an ID in place of a missing category name.
    if (!label) {
      throw new Error(`User_Preferences references missing ${type} category ID ${id}`);
    }
    return [{
      type,
      label,
      ...(hasMain ? { Categorise_Name: label } : { Subcategorise_Name: label }),
      Preference_Value: Number(row.Preference_Value) || 0,
      CategoriseID: hasMain ? id : null,
      SubcategoriseID: hasSub ? id : null,
    }];
  });
}

function tally(history, mappings, idField) {
  const byBook = new Map();
  for (const row of mappings) {
    if (row.BooksID == null || row[idField] == null) continue;
    const key = String(row.BooksID);
    if (!byBook.has(key)) byBook.set(key, new Set());
    byBook.get(key).add(String(row[idField]));
  }
  const totals = new Map();
  for (const swipe of history) {
    const ids = [...(byBook.get(String(swipe.BooksID)) ?? [])];
    for (const id of ids) {
      const score = totals.get(id) ?? { likes: 0, dislikes: 0 };
      score[swipe.Swipe_Action === "like" ? "likes" : "dislikes"] += 1 / ids.length;
      totals.set(id, score);
    }
  }
  return totals;
}

function preferenceScore({ likes, dislikes }) {
  const weightedDislike = dislikes * DISLIKE_WEIGHT;
  return Number(((likes - weightedDislike) / (likes + weightedDislike + SMOOTHING)).toFixed(4));
}

async function savePreferences(userId, desired, existing) {
  const keyOf = (row) => row.CategoriseID != null ? `main:${row.CategoriseID}` : `sub:${row.SubcategoriseID}`;
  const previous = new Map(existing.filter((r) => (r.CategoriseID == null) !== (r.SubcategoriseID == null))
    .map((r) => [keyOf(r), r]));
  // Preserve User_PreferencesID and SessionsID; do not delete historical rows.
  for (const row of desired) {
    const old = previous.get(keyOf(row));
    if (old) {
      const { data, error } = await supabaseAdmin.from("User_Preferences")
        .update({ Preference_Value: row.Preference_Value })
        .eq("User_PreferencesID", old.User_PreferencesID)
        .eq("UserID", userId)
        .select("User_PreferencesID");
      assertNoError(error);
      if (!data?.length) throw new Error("Preference update did not affect a row");
    } else {
      const { error } = await supabaseAdmin.from("User_Preferences").insert({
        UserID: userId,
        CategoriseID: row.CategoriseID,
        SubcategoriseID: row.SubcategoriseID,
        Preference_Value: row.Preference_Value,
        SessionsID: null,
      });
      assertNoError(error);
    }
  }
}

async function rebuildUserPreferences(userId) {
  const existing = await existingPreferences(userId);
  const history = (await fetchAllSwipes(userId)).filter((row) =>
    row.BooksID != null && ["like", "dislike"].includes(String(row.Swipe_Action).trim().toLowerCase()))
    .map((row) => ({ ...row, Swipe_Action: String(row.Swipe_Action).trim().toLowerCase() }));
  if (!history.length) {
    return { preferences: await hydratePreferences(existing), swipeCount: 0,
      updatedCount: 0, skipped: true };
  }
  const bookIDs = [...new Set(history.map((row) => row.BooksID))];
  const [mainMap, subMap] = await Promise.all([
    fetchMappings("Book_Categorise", "CategoriseID", bookIDs),
    fetchMappings("Book_Subcategorise", "SubcategoriseID", bookIDs),
  ]);
  const mainScores = tally(history, mainMap, "CategoriseID");
  const subScores = tally(history, subMap, "SubcategoriseID");
  if (!mainScores.size && !subScores.size) {
    throw new Error("Swipe books have no category mappings; check Book_Categorise and Book_Subcategorise");
  }
  const [mainNames, subNames] = await Promise.all([
    fetchNameMap("Categorise", "CategoriseID", "Categorise_Name", [...mainScores.keys()]),
    fetchNameMap("Subcategorise", "SubcategoriseID", "Subcategorise_Name", [...subScores.keys()]),
  ]);
  const desired = [
    ...[...mainScores].map(([id, counts]) => ({ type: "main", label: mainNames.get(id) ?? id,
      CategoriseID: Number(id), SubcategoriseID: null, Preference_Value: preferenceScore(counts) })),
    ...[...subScores].map(([id, counts]) => ({ type: "sub", label: subNames.get(id) ?? id,
      CategoriseID: null, SubcategoriseID: Number(id), Preference_Value: preferenceScore(counts) })),
  ];
  await savePreferences(userId, desired, existing);
  // Return the same post-persistence profile that Python will actually use.
  const persisted = await existingPreferences(userId);
  return { preferences: await hydratePreferences(persisted), swipeCount: history.length,
    updatedCount: desired.length, skipped: false };
}

async function findRequest(userId, requestId) {
  const { data, error } = await supabaseAdmin.from("Swipe_History")
    .select(SWIPE_FIELDS).eq("UserID", userId).eq("Request_ID", requestId).maybeSingle();
  assertNoError(error);
  return data;
}

const validPositiveInt = (value) => value != null && value !== "" &&
  Number.isSafeInteger(Number(value)) && Number(value) > 0;
const validUUID = (value) => typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

router.post("/rebuild-preferences", requireAuth, async (req, res) => {
  try {
    const result = await rebuildUserPreferences(req.userProfile.UserID);
    return res.json({ success: true, preferencesUpdated: !result.skipped,
      preferences: result.preferences,
      preferenceSummary: { swipeCount: result.swipeCount, updatedCount: result.updatedCount } });
  } catch (error) {
    console.error("[PREFERENCES] rebuild:", error);
    return res.status(500).json({ success: false, message: "ไม่สามารถคำนวณ User_Preferences ได้" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userProfile.UserID;
    const action = typeof req.body?.action === "string" ? req.body.action.trim().toLowerCase() : "";
    const { bookId, sessionId, requestId } = req.body ?? {};
    if (!["like", "dislike"].includes(action) || !validUUID(requestId) ||
        !validPositiveInt(bookId) || !validPositiveInt(sessionId)) {
      return res.status(400).json({ success: false,
        message: "ต้องส่ง action (like/dislike), requestId (UUID), bookId และ sessionId ที่ถูกต้อง" });
    }
    let swipe = await findRequest(userId, requestId);
    let duplicate = !!swipe;
    if (swipe && (Number(swipe.BooksID) !== Number(bookId) ||
                  Number(swipe.SessionsID) !== Number(sessionId) ||
                  String(swipe.Swipe_Action).trim().toLowerCase() !== action)) {
      return res.status(409).json({ success: false, message: "Request_ID นี้ถูกใช้กับ Swipe รายการอื่นแล้ว" });
    }
    if (!swipe) {
      const { data: session, error: sessionError } = await supabaseAdmin.from("Sessions")
        .select("SessionsID, Ended_At").eq("SessionsID", Number(sessionId))
        .eq("UserID", userId).maybeSingle();
      assertNoError(sessionError);
      if (!session) return res.status(404).json({ success: false, message: "ไม่พบ Session ของผู้ใช้นี้" });
      if (session.Ended_At != null) return res.status(409).json({ success: false, message: "Session นี้ปิดแล้ว" });
      const { data, error } = await supabaseAdmin.from("Swipe_History").insert({
        UserID: userId, SessionsID: Number(sessionId), BooksID: Number(bookId),
        Swipe_Action: action, Request_ID: requestId,
      }).select(SWIPE_FIELDS).single();
      if (error?.code === "23505") { // concurrent retry with the same Request_ID
        swipe = await findRequest(userId, requestId);
        if (!swipe) throw error;
        if (Number(swipe.BooksID) !== Number(bookId) || Number(swipe.SessionsID) !== Number(sessionId) ||
            String(swipe.Swipe_Action).trim().toLowerCase() !== action) {
          return res.status(409).json({ success: false, message: "Request_ID นี้ถูกใช้กับ Swipe รายการอื่นแล้ว" });
        }
        duplicate = true;
      } else {
        assertNoError(error);
        swipe = data;
      }
    }
    try {
      const result = await rebuildUserPreferences(userId);
      return res.status(200).json({ success: true, swipeSaved: true, duplicate,
        swipe, preferencesUpdated: !result.skipped, preferences: result.preferences,
        preferenceSummary: { swipeCount: result.swipeCount, updatedCount: result.updatedCount } });
    } catch (error) {
      console.error("[PREFERENCES] after swipe:", error);
      // 200 because Swipe_History was saved. Client must retry with SAME requestId.
      return res.status(200).json({ success: true, swipeSaved: true, duplicate,
        swipe, preferencesUpdated: false, preferences: [],
        preferenceError: "คำนวณ Preference ไม่สำเร็จ กรุณาลองใหม่ด้วยรายการเดิม" });
    }
  } catch (error) {
    console.error("[SWIPE] save:", error);
    return res.status(500).json({ success: false, swipeSaved: false,
      message: "บันทึก Swipe ไม่สำเร็จ กรุณาลองใหม่" });
  }
});

export default router;
