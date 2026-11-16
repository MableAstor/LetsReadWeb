
import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const PAGE_SIZE = 500;
const CHUNK_SIZE = 150;
const DISLIKE_WEIGHT = 0.75;
const SMOOTHING = 2;

const SWIPE_FIELDS =
  "Swipe_HistoryID, Swipe_Action, Created_At, UserID, BooksID, SessionsID, Request_ID";

const chunks = (items, size = CHUNK_SIZE) =>
  Array.from(
    { length: Math.ceil(items.length / size) },
    (_, i) => items.slice(i * size, (i + 1) * size)
  );

const preferenceKey = (type, id) =>
  `${type}:${String(id)}`;

function assertNoError(error) {
  if (error) throw error;
}

async function fetchPages(makeQuery) {
  const result = [];

  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await makeQuery().range(
      start,
      start + PAGE_SIZE - 1
    );

    assertNoError(error);
    result.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) break;
  }

  return result;
}

async function fetchAllSwipes(userId) {
  return fetchPages(() =>
    supabaseAdmin
      .from("Swipe_History")
      .select("Swipe_HistoryID, BooksID, Swipe_Action")
      .eq("UserID", userId)
      .order("Swipe_HistoryID", { ascending: true })
  );
}

async function fetchMappings(table, field, ids) {
  const rows = [];

  for (const batch of chunks(ids)) {
    rows.push(
      ...(await fetchPages(() =>
        supabaseAdmin
          .from(table)
          .select(`BooksID, ${field}`)
          .in("BooksID", batch)
          .order("BooksID", { ascending: true })
          .order(field, { ascending: true })
      ))
    );
  }

  return rows;
}

async function fetchNameMap(
  table,
  idField,
  labelField,
  ids
) {
  const names = new Map();

  for (const batch of chunks([...new Set(ids)])) {
    const rows = await fetchPages(() =>
      supabaseAdmin
        .from(table)
        .select(`${idField}, ${labelField}`)
        .in(idField, batch)
        .order(idField, { ascending: true })
    );

    rows.forEach((row) => {
      const label = row[labelField];

      if (
        typeof label === "string" &&
        label.trim()
      ) {
        names.set(
          String(row[idField]),
          label.trim()
        );
      }
    });
  }

  return names;
}

async function existingPreferences(userId) {
  return fetchPages(() =>
    supabaseAdmin
      .from("User_Preferences")
      .select(
        "User_PreferencesID, UserID, Preference_Value, CategoriseID, SubcategoriseID, SessionsID"
      )
      .eq("UserID", userId)
      .order("User_PreferencesID", { ascending: true })
  );
}

async function hydratePreferences(rows) {
  const mainIDs = rows
    .map((row) => row.CategoriseID)
    .filter((id) => id != null);

  const subIDs = rows
    .map((row) => row.SubcategoriseID)
    .filter((id) => id != null);

  const [mains, subs] = await Promise.all([
    fetchNameMap(
      "Categorise",
      "CategoriseID",
      "Categorise_Name",
      mainIDs
    ),
    fetchNameMap(
      "Subcategorise",
      "SubcategoriseID",
      "Subcategorise_Name",
      subIDs
    ),
  ]);

  return rows.flatMap((row) => {
    const hasMain = row.CategoriseID != null;
    const hasSub = row.SubcategoriseID != null;

    if (hasMain === hasSub) return [];

    const type = hasMain ? "main" : "sub";
    const id = hasMain
      ? row.CategoriseID
      : row.SubcategoriseID;

    const label = (hasMain ? mains : subs).get(
      String(id)
    );

    if (!label) {
      throw new Error(
        `User_Preferences references missing ${type} category ID ${id}`
      );
    }

    return [
      {
        type,
        label,
        ...(hasMain
          ? { Categorise_Name: label }
          : { Subcategorise_Name: label }),
        Preference_Value:
          Number(row.Preference_Value) || 0,
        CategoriseID: hasMain ? id : null,
        SubcategoriseID: hasSub ? id : null,
      },
    ];
  });
}

function tally(history, mappings, idField) {
  const byBook = new Map();

  for (const row of mappings) {
    if (
      row.BooksID == null ||
      row[idField] == null
    ) {
      continue;
    }

    const key = String(row.BooksID);

    if (!byBook.has(key)) {
      byBook.set(key, new Set());
    }

    byBook.get(key).add(String(row[idField]));
  }

  const totals = new Map();

  for (const swipe of history) {
    const ids = [
      ...(byBook.get(String(swipe.BooksID)) ?? []),
    ];

    for (const id of ids) {
      const score = totals.get(id) ?? {
        likes: 0,
        dislikes: 0,
      };

      score[
        swipe.Swipe_Action === "like"
          ? "likes"
          : "dislikes"
      ] += 1 / ids.length;

      totals.set(id, score);
    }
  }

  return totals;
}

function preferenceScore({ likes, dislikes }) {
  const weightedDislike =
    dislikes * DISLIKE_WEIGHT;

  return Number(
    (
      (likes - weightedDislike) /
      (likes + weightedDislike + SMOOTHING)
    ).toFixed(4)
  );
}

// บันทึกเฉพาะคะแนนที่เปลี่ยน
// ใช้ existingRows ที่โหลดไว้แล้ว
async function savePreferenceRows(
  userId,
  preferenceRows,
  existingRows
) {
  const existingByKey = new Map();

  for (const row of existingRows) {
    const hasMain = row.CategoriseID != null;
    const hasSub = row.SubcategoriseID != null;

    if (hasMain === hasSub) continue;

    existingByKey.set(
      preferenceKey(
        hasMain ? "main" : "sub",
        hasMain
          ? row.CategoriseID
          : row.SubcategoriseID
      ),
      row
    );
  }

  const operations = [];
  const seen = new Set();

  for (const preference of preferenceRows) {
    const type = preference.type;

    const id =
      type === "main"
        ? preference.CategoriseID
        : preference.SubcategoriseID;

    const key = preferenceKey(type, id);

    if (seen.has(key)) continue;
    seen.add(key);

    const existing = existingByKey.get(key);
    const value = Number(
      preference.Preference_Value
    );

    if (existing) {
      // คะแนนเท่าเดิม ไม่ต้อง UPDATE
      if (
        Number(existing.Preference_Value) === value
      ) {
        continue;
      }

      operations.push({
        kind: "update",
        id: existing.User_PreferencesID,
        value,
      });
    } else {
      operations.push({
        kind: "insert",
        value: {
          UserID: userId,
          Preference_Value: value,
          CategoriseID:
            type === "main"
              ? preference.CategoriseID
              : null,
          SubcategoriseID:
            type === "sub"
              ? preference.SubcategoriseID
              : null,
          SessionsID: null,
        },
      });
    }
  }

  const WRITE_CONCURRENCY = 6;

  for (
    const batch of chunks(
      operations,
      WRITE_CONCURRENCY
    )
  ) {
    const results = await Promise.all(
      batch.map((operation) => {
        if (operation.kind === "update") {
          return supabaseAdmin
            .from("User_Preferences")
            .update({
              Preference_Value: operation.value,
            })
            .eq(
              "User_PreferencesID",
              operation.id
            )
            .eq("UserID", userId);
        }

        return supabaseAdmin
          .from("User_Preferences")
          .insert(operation.value);
      })
    );

    for (const result of results) {
      assertNoError(result.error);
    }
  }

  return operations.length;
}

async function rebuildUserPreferences(userId) {
  const startedAt = performance.now();

  const timings = {};
let checkpoint = performance.now();

const mark = (name) => {
  timings[name] = Number(
    (performance.now() - checkpoint).toFixed(2)
  );
  checkpoint = performance.now();
};

  // อ่าน Preferences และ Swipe History พร้อมกัน
  const [existing, allSwipes] =
    await Promise.all([
      existingPreferences(userId),
      fetchAllSwipes(userId),
    ]);

    mark("readHistoryAndPreferences");

  const history = allSwipes
    .filter(
      (row) =>
        row.BooksID != null &&
        ["like", "dislike"].includes(
          String(row.Swipe_Action)
            .trim()
            .toLowerCase()
        )
    )
    .map((row) => ({
      ...row,
      Swipe_Action: String(
        row.Swipe_Action
      )
        .trim()
        .toLowerCase(),
    }));

  if (!history.length) {
    return {
      preferences:
        await hydratePreferences(existing),
      swipeCount: 0,
      updatedCount: 0,
      skipped: true,
    };
  }

  const bookIDs = [
    ...new Set(
      history.map((row) => row.BooksID)
    ),
  ];

  const [mainMap, subMap] =
    await Promise.all([
      fetchMappings(
        "Book_Categorise",
        "CategoriseID",
        bookIDs
      ),
      fetchMappings(
        "Book_Subcategorise",
        "SubcategoriseID",
        bookIDs
      ),
    ]);

    mark("readBookMappings");

  const mainScores = tally(
    history,
    mainMap,
    "CategoriseID"
  );

  const subScores = tally(
    history,
    subMap,
    "SubcategoriseID"
  );

  if (
    !mainScores.size &&
    !subScores.size
  ) {
    throw new Error(
      "Swipe books have no category mappings; check Book_Categorise and Book_Subcategorise"
    );
  }

  const [mainNames, subNames] =
    await Promise.all([
      fetchNameMap(
        "Categorise",
        "CategoriseID",
        "Categorise_Name",
        [...mainScores.keys()]
      ),
      fetchNameMap(
        "Subcategorise",
        "SubcategoriseID",
        "Subcategorise_Name",
        [...subScores.keys()]
      ),
    ]);

    mark("readCategoryNames");

  const desired = [
    ...[...mainScores].map(
      ([id, counts]) => ({
        type: "main",
        label: mainNames.get(id) ?? id,
        CategoriseID: Number(id),
        SubcategoriseID: null,
        Preference_Value:
          preferenceScore(counts),
      })
    ),

    ...[...subScores].map(
      ([id, counts]) => ({
        type: "sub",
        label: subNames.get(id) ?? id,
        CategoriseID: null,
        SubcategoriseID: Number(id),
        Preference_Value:
          preferenceScore(counts),
      })
    ),
  ];

  const writeCount =
    await savePreferenceRows(
      userId,
      desired,
      existing
    );

    mark("writePreferences");

  // ใช้ค่าที่คำนวณแล้วสร้าง Response
  // ไม่ต้อง SELECT User_Preferences ซ้ำ
  const desiredByKey = new Map(
    desired.map((row) => [
      preferenceKey(
        row.type,
        row.type === "main"
          ? row.CategoriseID
          : row.SubcategoriseID
      ),
      row,
    ])
  );

  const preferences = existing.flatMap(
    (row) => {
      const hasMain =
        row.CategoriseID != null;
      const hasSub =
        row.SubcategoriseID != null;

      if (hasMain === hasSub) return [];

      const type = hasMain
        ? "main"
        : "sub";

      const id = hasMain
        ? row.CategoriseID
        : row.SubcategoriseID;

      const key = preferenceKey(
        type,
        id
      );

      const updated =
        desiredByKey.get(key);

      if (updated) {
        desiredByKey.delete(key);

        return [
          {
            type,
            label: updated.label,
            ...(hasMain
              ? {
                  Categorise_Name:
                    updated.label,
                }
              : {
                  Subcategorise_Name:
                    updated.label,
                }),
            Preference_Value:
              updated.Preference_Value,
            CategoriseID:
              hasMain ? id : null,
            SubcategoriseID:
              hasSub ? id : null,
          },
        ];
      }

      // เก็บ Preferences เดิมที่ไม่ได้ถูกคำนวณใหม่
      return [
        {
          ...row,
          type,
          _needsHydration: true,
        },
      ];
    }
  );

  // เพิ่ม Preferences ใหม่ที่ยังไม่มีในฐานข้อมูลเดิม
  for (const updated of desiredByKey.values()) {
    preferences.push({
      type: updated.type,
      label: updated.label,
      ...(updated.type === "main"
        ? {
            Categorise_Name:
              updated.label,
          }
        : {
            Subcategorise_Name:
              updated.label,
          }),
      Preference_Value:
        updated.Preference_Value,
      CategoriseID:
        updated.CategoriseID,
      SubcategoriseID:
        updated.SubcategoriseID,
    });
  }

  // เติมชื่อหมวดหมู่ให้ข้อมูลเก่าที่ยังไม่ได้อัปเดต
  const legacyRows = preferences.filter(
    (row) => row._needsHydration
  );

  const hydratedLegacy =
    legacyRows.length
      ? await hydratePreferences(
          legacyRows
        )
      : [];

  const finalPreferences = preferences
    .filter(
      (row) => !row._needsHydration
    )
    .concat(hydratedLegacy);

    mark("buildResponse");
console.log("[PREFERENCES] stage timings (ms):", timings);

  console.info(
    `[PREFERENCES] rebuild ${Math.round(
      performance.now() - startedAt
    )}ms; ` +
      `swipes=${history.length}, ` +
      `categories=${desired.length}, ` +
      `writes=${writeCount}`
  );

  return {
    preferences: finalPreferences,
    swipeCount: history.length,
    updatedCount: desired.length,
    skipped: false,
  };
}

async function findRequest(
  userId,
  requestId
) {
  const { data, error } =
    await supabaseAdmin
      .from("Swipe_History")
      .select(SWIPE_FIELDS)
      .eq("UserID", userId)
      .eq("Request_ID", requestId)
      .maybeSingle();

  assertNoError(error);
  return data;
}

const validPositiveInt = (value) =>
  value != null &&
  value !== "" &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) > 0;

const validUUID = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

// Rebuild Preferences API
router.post(
  "/rebuild-preferences",
  requireAuth,
  async (req, res) => {
    try {
      const result =
        await rebuildUserPreferences(
          req.userProfile.UserID
        );

      return res.json({
        success: true,
        preferencesUpdated:
          !result.skipped,
        preferences:
          result.preferences,
        preferenceSummary: {
          swipeCount:
            result.swipeCount,
          updatedCount:
            result.updatedCount,
        },
      });
    } catch (error) {
      console.error(
        "[PREFERENCES] Rebuild error:",
        {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          stack: error?.stack,
        }
      );

      return res.status(500).json({
        success: false,
        message:
          "คำนวณ User Preferences ไม่สำเร็จ",
      });
    }
  }
);

// Save Swipe API
router.post(
  "/",
  requireAuth,
  async (req, res) => {
    const requestStart =
      performance.now();

    console.log(
      "[SWIPE] Request received"
    );

    res.on("finish", () => {
      console.log(
        "[SWIPE] Total request:",
        (
          performance.now() -
          requestStart
        ).toFixed(2),
        "ms",
        "Status:",
        res.statusCode
      );
    });

    try {
      const userId =
        req.userProfile.UserID;

      const action =
        typeof req.body?.action ===
        "string"
          ? req.body.action
              .trim()
              .toLowerCase()
          : "";

      const {
        bookId,
        sessionId,
        requestId,
      } = req.body ?? {};

      if (
        !["like", "dislike"].includes(
          action
        ) ||
        !validUUID(requestId) ||
        !validPositiveInt(bookId) ||
        !validPositiveInt(sessionId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "ต้องส่ง action (like/dislike), requestId (UUID), bookId และ sessionId ที่ถูกต้อง",
        });
      }

      let swipe = await findRequest(
        userId,
        requestId
      );

      let duplicate = !!swipe;

      if (
        swipe &&
        (
          Number(swipe.BooksID) !==
            Number(bookId) ||
          Number(swipe.SessionsID) !==
            Number(sessionId) ||
          String(swipe.Swipe_Action)
            .trim()
            .toLowerCase() !== action
        )
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Request_ID นี้ถูกใช้กับ Swipe รายการอื่นแล้ว",
        });
      }

      if (!swipe) {
        const {
          data: session,
          error: sessionError,
        } = await supabaseAdmin
          .from("Sessions")
          .select(
            "SessionsID, Ended_At"
          )
          .eq(
            "SessionsID",
            Number(sessionId)
          )
          .eq("UserID", userId)
          .maybeSingle();

        assertNoError(sessionError);

        if (!session) {
          return res.status(404).json({
            success: false,
            message:
              "ไม่พบ Session ของผู้ใช้นี้",
          });
        }

        if (
          session.Ended_At != null
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Session นี้ปิดแล้ว",
          });
        }

        const {
          data,
          error,
        } = await supabaseAdmin
          .from("Swipe_History")
          .insert({
            UserID: userId,
            SessionsID:
              Number(sessionId),
            BooksID:
              Number(bookId),
            Swipe_Action: action,
            Request_ID:
              requestId,
          })
          .select(SWIPE_FIELDS)
          .single();

        if (
          error?.code === "23505"
        ) {
          // Retry ด้วย Request_ID เดิม
          // ป้องกัน Swipe ซ้ำ
          swipe = await findRequest(
            userId,
            requestId
          );

          if (!swipe) {
            throw error;
          }

          if (
            Number(swipe.BooksID) !==
              Number(bookId) ||
            Number(swipe.SessionsID) !==
              Number(sessionId) ||
            String(swipe.Swipe_Action)
              .trim()
              .toLowerCase() !==
              action
          ) {
            return res
              .status(409)
              .json({
                success: false,
                message:
                  "Request_ID นี้ถูกใช้กับ Swipe รายการอื่นแล้ว",
              });
          }

          duplicate = true;
        } else {
          assertNoError(error);
          swipe = data;
        }
      }

      try {
        const result =
          await rebuildUserPreferences(
            userId
          );

        return res
          .status(200)
          .json({
            success: true,
            swipeSaved: true,
            duplicate,
            swipe,
            preferencesUpdated:
              !result.skipped,
            preferences:
              result.preferences,
            preferenceSummary: {
              swipeCount:
                result.swipeCount,
              updatedCount:
                result.updatedCount,
            },
          });
      } catch (error) {
        console.error(
          "[PREFERENCES] after swipe:",
          error
        );

        // Swipe บันทึกสำเร็จแล้ว
        // ต้อง Retry ด้วย Request_ID เดิม
        return res
          .status(200)
          .json({
            success: true,
            swipeSaved: true,
            duplicate,
            swipe,
            preferencesUpdated:
              false,
            preferences: [],
            preferenceError:
              "คำนวณ Preference ไม่สำเร็จ กรุณาลองใหม่ด้วยรายการเดิม",
          });
      }
    } catch (error) {
      console.error(
        "[SWIPE] save:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          swipeSaved: false,
          message:
            "บันทึก Swipe ไม่สำเร็จ กรุณาลองใหม่",
        });
    }
  }
);

export default router;
