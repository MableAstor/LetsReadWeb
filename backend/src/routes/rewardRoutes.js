
import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "./authRoutes.js";

const router = express.Router();

const PAGE_SIZE = 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// ==================== REWARDS ====================

const rewardDefinitions = [
  {
    code: "FIRST_REVIEW",
    name: "รีวิวครั้งแรก",
    description: "เขียนรีวิวหนังสือเป็นครั้งแรก",
    target: 1,
    metric: "reviews",
  },
  {
    code: "REVIEW_50",
    name: "รีวิวครบ 50",
    description: "เขียนรีวิวหนังสือครบ 50 ครั้ง",
    target: 50,
    metric: "reviews",
  },
  {
    code: "FIRST_SHELF",
    name: "เก็บหนังสือเข้าชั้นครั้งแรก",
    description: "บันทึกหนังสือจาก Feed ลงใน Saved Books เป็นครั้งแรก",
    target: 1,
    metric: "savedReviews",
  },
  {
    code: "FIRST_SWIPE",
    name: "First Swipe",
    description: "ปัดหนังสือเป็นครั้งแรก",
    target: 1,
    metric: "swipes",
  },
  {
    code: "SWIPE_50",
    name: "Book Explorer",
    description: "ปัดหนังสือครบ 50 ครั้ง",
    target: 50,
    metric: "swipes",
  },
];

// ==================== FRAMES ====================

const frameDefinitions = [
  {
    id: 1,
    code: "FRAME_01",
    title: "การเริ่มต้น",
    description: "ล็อกอินครั้งแรก",
    condition: "firstLogin",
  },
  {
    id: 2,
    code: "FRAME_02",
    title: "เปลวเพลิงนักรีวิว",
    description: "รีวิวครบ 5 ครั้ง",
    condition: "reviewCount",
    target: 5,
  },
  {
    id: 3,
    code: "FRAME_03",
    title: "ปลาทองกับสองเรา",
    description: "นักรีวิวอันดับ 1 ในเดือนพฤศจิกายน",
    condition: "monthlyRank",
    year: 2026,
    month: 11,
    rank: 1,
  },
  {
    id: 4,
    code: "FRAME_04",
    title: "กระต่ายน้อยคอยรัก",
    description: "นักรีวิวอันดับ 2 ในเดือนพฤศจิกายน",
    condition: "monthlyRank",
    year: 2026,
    month: 11,
    rank: 2,
  },
  {
    id: 5,
    code: "FRAME_05",
    title: "วิ่งสิ!เจ้าหนูน้อย",
    description: "นักรีวิวอันดับ 3 ในเดือนพฤศจิกายน",
    condition: "monthlyRank",
    year: 2026,
    month: 11,
    rank: 3,
  },
  {
    id: 6,
    code: "FRAME_06",
    title: "เจ้าเหมียวเปลวเพลิง",
    description: "นักรีวิวอันดับ 1 ในเดือนธันวาคม",
    condition: "monthlyRank",
    year: 2026,
    month: 12,
    rank: 1,
  },
  {
    id: 7,
    code: "FRAME_07",
    title: "มงกุฎดอกไม้",
    description: "นักรีวิวอันดับ 2 ในเดือนธันวาคม",
    condition: "monthlyRank",
    year: 2026,
    month: 12,
    rank: 2,
  },
  {
    id: 8,
    code: "FRAME_08",
    title: "สายฟ้าฟาดใจ",
    description: "นักรีวิวอันดับ 3 ในเดือนธันวาคม",
    condition: "monthlyRank",
    year: 2026,
    month: 12,
    rank: 3,
  },
];

// ==================== TITLES ====================

const TITLE_NAMES = [
  "ราชานักรีวิว",
  "ยอดนักรีวิว",
  "ดาวรุ่งนักรีวิว",
];

const TITLE_COLORS = ["gold", "silver", "bronze"];

const MONTHS = [
  { year: 2026, month: 10, code: "OCT", th: "ตุลาคม" },
  { year: 2026, month: 11, code: "NOV", th: "พฤศจิกายน" },
  { year: 2026, month: 12, code: "DEC", th: "ธันวาคม" },
];

const titleDefinitions = MONTHS.flatMap((period) =>
  [1, 2, 3].map((rank) => ({
    id: `TOP_${rank}_${period.code}_${period.year}`,
    name: `TITLE_TOP_${rank}_${period.code}_${period.year}`,
    title: TITLE_NAMES[rank - 1],
    description: `อันดับ ${rank} เดือน${period.th} ${period.year}`,
    requirement: `จบเดือน${period.th}ด้วยอันดับ ${rank}`,
    color: TITLE_COLORS[rank - 1],
    year: period.year,
    month: period.month,
    rank,
  }))
);

// ==================== HELPERS ====================

async function getRewardUser(req) {
  const token = req.headers.authorization?.match(
    /^Bearer (.+)$/
  )?.[1];

  if (!token) {
    const error = new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    error.statusCode = 401;
    throw error;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    const authError = new Error(
      "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
    );
    authError.statusCode = 401;
    throw authError;
  }

  return getOrCreateUserProfile(data.user);
}

async function getRewardCatalog(definitions) {
  const names = definitions.map((item) => item.name);

  const { data, error } = await supabaseAdmin
    .from("Rewards")
    .select("RewardsID, Rewards_Name")
    .in("Rewards_Name", names);

  if (error) throw error;

  const map = new Map(
    (data || []).map((item) => [
      item.Rewards_Name,
      item.RewardsID,
    ])
  );

  const missing = names.filter((name) => !map.has(name));

  if (missing.length) {
    throw new Error(
      `ไม่พบรายการใน Rewards: ${missing.join(", ")}`
    );
  }

  return map;
}

async function getEarnedRewardIds(userId) {
  const { data, error } = await supabaseAdmin
    .from("User_Rewards")
    .select("RewardsID")
    .eq("UserID", userId);

  if (error) throw error;

  return new Set(
    (data || []).map((item) => String(item.RewardsID))
  );
}

async function grantReward(userId, rewardId) {
  const { data: existing, error: checkError } =
    await supabaseAdmin
      .from("User_Rewards")
      .select("UserID, RewardsID")
      .eq("UserID", userId)
      .eq("RewardsID", rewardId)
      .maybeSingle();

  if (checkError) throw checkError;

  if (existing) return false;

  const { error } = await supabaseAdmin
    .from("User_Rewards")
    .insert({
      UserID: userId,
      RewardsID: rewardId,
    });

  if (error?.code === "23505") return false;
  if (error) throw error;

  return true;
}

async function getUserActivityCounts(userId) {
  const results = await Promise.all([
    supabaseAdmin
      .from("Reviews")
      .select("ReviewsID", { count: "exact", head: true })
      .eq("UserID", userId),

    supabaseAdmin
      .from("Saved_Reviews")
      .select("ReviewsID", { count: "exact", head: true })
      .eq("UserID", userId),

    supabaseAdmin
      .from("Swipe_History")
      .select("Swipe_HistoryID", { count: "exact", head: true })
      .eq("UserID", userId),
  ]);

  for (const result of results) {
    if (result.error) throw result.error;
  }

  return {
    reviews: results[0].count || 0,
    savedReviews: results[1].count || 0,
    swipes: results[2].count || 0,
  };
}

async function checkAndGrantRewards(userId) {
  const counts = await getUserActivityCounts(userId);
  const catalog = await getRewardCatalog(rewardDefinitions);
  const earned = await getEarnedRewardIds(userId);
  const newlyUnlocked = [];

  for (const reward of rewardDefinitions) {
    const rewardId = catalog.get(reward.name);
    const count = counts[reward.metric] || 0;

    if (count >= reward.target && !earned.has(String(rewardId))) {
      const inserted = await grantReward(userId, rewardId);
      earned.add(String(rewardId));

      if (inserted) {
        newlyUnlocked.push({
          ...reward,
          RewardsID: rewardId,
          unlocked: true,
        });
      }
    }
  }

  return {
    counts,
    newlyUnlocked,
    rewards: rewardDefinitions.map((reward) => ({
      ...reward,
      RewardsID: catalog.get(reward.name),
      unlocked: earned.has(String(catalog.get(reward.name))),
      progress: Math.min(
        counts[reward.metric] || 0,
        reward.target
      ),
    })),
  };
}

// ==================== MONTHLY RANKING ====================

function getBangkokMonthRange(year, month) {
  return {
    start: new Date(
      Date.UTC(year, month - 1, 1) - BANGKOK_OFFSET_MS
    ).toISOString(),
    end: new Date(
      Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS
    ).toISOString(),
  };
}

function isMonthFinished(year, month) {
  const { end } = getBangkokMonthRange(year, month);
  return Date.now() >= new Date(end).getTime();
}

async function getMonthlyReviewRanking(year, month) {
  const period = getBangkokMonthRange(year, month);

  const { data: users, error: usersError } =
    await supabaseAdmin
      .from("User")
      .select("UserID, User_Name")
      .order("UserID", { ascending: true });

  if (usersError) throw usersError;

  const reviewCountMap = new Map();
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("Reviews")
      .select("ReviewsID, UserID, Created_At")
      .gte("Created_At", period.start)
      .lt("Created_At", period.end)
      .order("Created_At", { ascending: true })
      .order("ReviewsID", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    const rows = data || [];

    for (const review of rows) {
      const id = String(review.UserID);
      reviewCountMap.set(
        id,
        (reviewCountMap.get(id) || 0) + 1
      );
    }

    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return (users || [])
    .map((user) => ({
      UserID: user.UserID,
      name: user.User_Name || "ผู้ใช้",
      reviews: reviewCountMap.get(String(user.UserID)) || 0,
    }))
    .sort((a, b) => {
      if (a.reviews !== b.reviews) {
        return b.reviews - a.reviews;
      }

      const nameCompare = a.name.localeCompare(b.name, "th");

      if (nameCompare !== 0) return nameCompare;

      return String(a.UserID).localeCompare(
        String(b.UserID),
        undefined,
        { numeric: true }
      );
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
}

// ==================== FRAMES ====================

async function getEarnedFrames(userId) {
  const { data, error } = await supabaseAdmin
    .from("User_Frames")
    .select("UserID, FrameID, Unlocked_At")
    .eq("UserID", userId);

  if (error) throw error;
  return data || [];
}

async function grantFrame(userId, frameId) {
  const { data: existing, error: checkError } =
    await supabaseAdmin
      .from("User_Frames")
      .select("UserID, FrameID, Unlocked_At")
      .eq("UserID", userId)
      .eq("FrameID", frameId)
      .maybeSingle();

  if (checkError) throw checkError;
  if (existing) return false;

  const { error } = await supabaseAdmin
    .from("User_Frames")
    .insert({
      UserID: userId,
      FrameID: frameId,
    });

  if (error?.code === "23505") return false;
  if (error) throw error;

  return true;
}

async function checkAndGrantFrames(userId, counts) {
  const earnedRows = await getEarnedFrames(userId);
  const earnedIds = new Set(
    earnedRows.map((row) => Number(row.FrameID))
  );

  const newlyUnlockedFrames = [];
  const rankingCache = new Map();

  for (const frame of frameDefinitions) {
    if (earnedIds.has(frame.id)) continue;

    let eligible = false;

    if (frame.condition === "firstLogin") {
      eligible = true;
    } else if (frame.condition === "reviewCount") {
      eligible = counts.reviews >= frame.target;
    } else if (
      frame.condition === "monthlyRank" &&
      isMonthFinished(frame.year, frame.month)
    ) {
      const key = `${frame.year}-${frame.month}`;

      if (!rankingCache.has(key)) {
        rankingCache.set(
          key,
          await getMonthlyReviewRanking(frame.year, frame.month)
        );
      }

      const winner = rankingCache
        .get(key)
        .find((user) => user.rank === frame.rank);

      eligible =
        winner?.reviews > 0 &&
        String(winner.UserID) === String(userId);
    }

    if (!eligible) continue;

    const inserted = await grantFrame(userId, frame.id);
    earnedIds.add(frame.id);

    if (inserted) {
      newlyUnlockedFrames.push({
        id: frame.id,
        code: frame.code,
        title: frame.title,
        description: frame.description,
        unlocked: true,
      });
    }
  }

  const finalRows = await getEarnedFrames(userId);
  const earnedMap = new Map(
    finalRows.map((row) => [Number(row.FrameID), row])
  );

  return {
    frames: frameDefinitions.map((frame) => {
      const row = earnedMap.get(frame.id);

      return {
        id: frame.id,
        code: frame.code,
        title: frame.title,
        description: frame.description,
        unlocked: Boolean(row),
        unlockedAt: row?.Unlocked_At || null,
      };
    }),
    newlyUnlockedFrames,
  };
}

// ==================== TITLES ====================

async function getActiveTitleInfo(profile, earnedIds, catalog) {
  const selectedId = profile.Active_Title_RewardsID;

  if (
    selectedId == null ||
    !earnedIds.has(String(selectedId))
  ) {
    return {
      activeTitleId: null,
      activeTitle: null,
    };
  }

  const selected = titleDefinitions.find(
    (title) =>
      String(catalog.get(title.name)) === String(selectedId)
  );

  return {
    activeTitleId: selected?.id || null,
    activeTitle: selected
      ? {
          id: selected.id,
          name: selected.title,
          color: selected.color,
        }
      : null,
  };
}

async function checkAndGrantTitles(userId) {
  const catalog = await getRewardCatalog(titleDefinitions);
  const earnedIds = await getEarnedRewardIds(userId);
  const rankingCache = new Map();
  const newlyUnlockedTitles = [];

  for (const title of titleDefinitions) {
    const rewardId = catalog.get(title.name);

    if (
      earnedIds.has(String(rewardId)) ||
      !isMonthFinished(title.year, title.month)
    ) {
      continue;
    }

    const key = `${title.year}-${title.month}`;

    if (!rankingCache.has(key)) {
      rankingCache.set(
        key,
        await getMonthlyReviewRanking(title.year, title.month)
      );
    }

    const winner = rankingCache
      .get(key)
      .find(
        (user) =>
          user.rank === title.rank &&
          user.reviews > 0
      );

    if (
      winner &&
      String(winner.UserID) === String(userId)
    ) {
      const inserted = await grantReward(userId, rewardId);
      earnedIds.add(String(rewardId));

      if (inserted) {
        newlyUnlockedTitles.push(title.id);
      }
    }
  }

  const { data: profile, error } = await supabaseAdmin
    .from("User")
    .select("Active_Title_RewardsID")
    .eq("UserID", userId)
    .single();

  if (error) throw error;

  const active = await getActiveTitleInfo(
    profile,
    earnedIds,
    catalog
  );

  return {
    titles: titleDefinitions.map((title) => ({
      id: title.id,
      name: title.title,
      description: title.description,
      requirement: title.requirement,
      color: title.color,
      unlocked: earnedIds.has(
        String(catalog.get(title.name))
      ),
    })),
    activeTitleId: active.activeTitleId,
    newlyUnlockedTitles,
  };
}

async function checkAllUnlocks(profile) {
  const rewardResult = await checkAndGrantRewards(
    profile.UserID
  );

  const frameResult = await checkAndGrantFrames(
    profile.UserID,
    rewardResult.counts
  );

  const titleResult = await checkAndGrantTitles(
    profile.UserID
  );

  return {
    ...rewardResult,
    ...frameResult,
    ...titleResult,
  };
}

// ==================== API: GET REWARDS ====================

router.get("/rewards", async (req, res) => {
  try {
    const profile = await getRewardUser(req);
    const result = await checkAllUnlocks(profile);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[REWARDS] Fetch error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถดึงข้อมูลได้",
    });
  }
});

// ==================== API: CHECK REWARDS ====================

router.post("/rewards/check", async (req, res) => {
  try {
    const profile = await getRewardUser(req);
    const result = await checkAllUnlocks(profile);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[REWARDS CHECK] Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถตรวจสอบข้อมูลได้",
    });
  }
});

// ==================== API: SELECT TITLE ====================

router.put("/rewards/active-title", async (req, res) => {
  try {
    const profile = await getRewardUser(req);
    const titleId = req.body?.titleId;

    if (
      titleId !== null &&
      (
        typeof titleId !== "string" ||
        !titleDefinitions.some((title) => title.id === titleId)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "แท็กไม่ถูกต้อง",
      });
    }

    const selectedTitle = titleDefinitions.find(
      (title) => title.id === titleId
    );

    let rewardId = null;

    if (selectedTitle) {
      const catalog = await getRewardCatalog(
        titleDefinitions
      );

      rewardId = catalog.get(selectedTitle.name);

      const earned = await getEarnedRewardIds(
        profile.UserID
      );

      if (!earned.has(String(rewardId))) {
        return res.status(403).json({
          success: false,
          message: "ยังไม่ได้รับแท็กนี้",
        });
      }
    }

    const { error } = await supabaseAdmin
      .from("User")
      .update({
        Active_Title_RewardsID: rewardId,
      })
      .eq("UserID", profile.UserID);

    if (error) throw error;

    return res.json({
      success: true,
      activeTitleId: selectedTitle?.id || null,
    });
  } catch (error) {
    console.error("[TITLES] Save error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "บันทึกแท็กไม่สำเร็จ",
    });
  }
});

// ==================== API: PUBLIC PROFILE ====================

router.get("/public-profile/:userId", async (req, res) => {
  try {
    const textId = String(req.params.userId || "");

    if (!/^\d+$/.test(textId)) {
      return res.status(400).json({
        success: false,
        message: "รหัสผู้ใช้ไม่ถูกต้อง",
      });
    }

    const userId = Number(textId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "รหัสผู้ใช้ไม่ถูกต้อง",
      });
    }

    // 1. ข้อมูลโปรไฟล์
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("User")
        .select(
          "UserID, User_Name, User_Avatar_URL, Active_Frame_RewardsID, Active_Title_RewardsID"
        )
        .eq("UserID", userId)
        .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบโปรไฟล์ผู้ใช้นี้",
      });
    }

    // 2. รีวิว
    const { data: reviewRows, error: reviewError } =
      await supabaseAdmin
        .from("Reviews")
        .select(`
          ReviewsID,
          UserID,
          BooksID,
          Book_Title,
          Main_Category,
          Sub_Category,
          Review_Text,
          Rating,
          Image_URL,
          Created_At
        `)
        .eq("UserID", userId)
        .order("Created_At", { ascending: false });

    if (reviewError) throw reviewError;

    const reviewList = reviewRows || [];
    const reviewIds = reviewList.map(
      (review) => review.ReviewsID
    );

    // 3. รูปปกหนังสือ
    const bookIds = [
      ...new Set(
        reviewList
          .map((review) => review.BooksID)
          .filter((id) => id != null)
      ),
    ];

    let books = [];

    if (bookIds.length) {
      const { data, error } = await supabaseAdmin
        .from("Books")
        .select("BooksID, Books_Cover")
        .in("BooksID", bookIds);

      if (error) throw error;
      books = data || [];
    }

    const coverMap = new Map(
      books.map((book) => [
        String(book.BooksID),
        book.Books_Cover,
      ])
    );

    // 4. Likes
    let likes = [];

    if (reviewIds.length) {
      const { data, error } = await supabaseAdmin
        .from("Review_Likes")
        .select("ReviewsID, UserID")
        .in("ReviewsID", reviewIds);

      if (error) throw error;
      likes = data || [];
    }

    const likeCountMap = new Map();

    for (const like of likes) {
      const key = String(like.ReviewsID);

      likeCountMap.set(
        key,
        (likeCountMap.get(key) || 0) + 1
      );
    }

    // 5. ผู้เข้าชม
    let viewerUserId = null;

    const token = req.headers.authorization?.match(
      /^Bearer (.+)$/
    )?.[1];

    if (token) {
      const { data: authData, error: authError } =
        await supabase.auth.getUser(token);

      if (!authError && authData?.user) {
        const { data, error } = await supabaseAdmin
          .from("User")
          .select("UserID")
          .eq("auth_user_id", authData.user.id)
          .maybeSingle();

        if (error) throw error;
        viewerUserId = data?.UserID ?? null;
      }
    }

    const likedReviewIds = new Set();
    const savedReviewIds = new Set();

    if (viewerUserId != null && reviewIds.length) {
      for (const like of likes) {
        if (
          String(like.UserID) === String(viewerUserId)
        ) {
          likedReviewIds.add(String(like.ReviewsID));
        }
      }

      const { data, error } = await supabaseAdmin
        .from("Saved_Reviews")
        .select("ReviewsID")
        .eq("UserID", viewerUserId)
        .in("ReviewsID", reviewIds);

      if (error) throw error;

      for (const saved of data || []) {
        savedReviewIds.add(String(saved.ReviewsID));
      }
    }

    // 6. รางวัลที่ได้รับ
    const earnedIds = await getEarnedRewardIds(userId);

    let rewardCatalog = [];

    if (earnedIds.size) {
      const { data, error } = await supabaseAdmin
        .from("Rewards")
        .select("RewardsID, Rewards_Name")
        .in("RewardsID", [...earnedIds]);

      if (error) throw error;
      rewardCatalog = data || [];
    }

    const rewardIdByName = new Map(
      rewardCatalog.map((reward) => [
        reward.Rewards_Name,
        reward.RewardsID,
      ])
    );

    const rewards = rewardDefinitions
      .filter((reward) =>
        rewardIdByName.has(reward.name)
      )
      .map((reward) => ({
        ...reward,
        RewardsID: rewardIdByName.get(reward.name),
        unlocked: true,
      }));

    // 7. แท็กฉายาที่ได้รับ
    const titles = titleDefinitions
      .filter((title) =>
        rewardIdByName.has(title.name)
      )
      .map((title) => ({
        id: title.id,
        name: title.title,
        description: title.description,
        requirement: title.requirement,
        color: title.color,
        unlocked: true,
      }));

    // 8. แท็กที่เลือกใช้งาน
    const activeRewardId = profile.Active_Title_RewardsID;

    const selectedTitle =
      activeRewardId != null &&
      earnedIds.has(String(activeRewardId))
        ? titleDefinitions.find(
            (title) =>
              String(rewardIdByName.get(title.name)) ===
              String(activeRewardId)
          )
        : null;

    const activeTitleId = selectedTitle?.id || null;

    const activeTitle = selectedTitle
      ? {
          id: selectedTitle.id,
          name: selectedTitle.title,
          color: selectedTitle.color,
        }
      : null;

    // 9. กรอบที่ได้รับ
    const earnedFrames = await getEarnedFrames(userId);

    const frameMap = new Map(
      earnedFrames.map((frame) => [
        Number(frame.FrameID),
        frame,
      ])
    );

    const frames = frameDefinitions
      .filter((frame) => frameMap.has(frame.id))
      .map((frame) => ({
        id: frame.id,
        code: frame.code,
        title: frame.title,
        description: frame.description,
        unlocked: true,
        unlockedAt:
          frameMap.get(frame.id)?.Unlocked_At || null,
      }));

    // 10. รวมข้อมูลรีวิว
    // ประกาศ activeTitle ก่อน เพื่อป้องกัน ReferenceError
    const reviews = reviewList.map((review) => {
      const key = String(review.ReviewsID);

      return {
        ...review,
        User_Name: profile.User_Name || "ผู้ใช้",
        User_Avatar_URL:
          profile.User_Avatar_URL || null,
        Active_Frame_RewardsID:
          profile.Active_Frame_RewardsID ?? null,
        Active_Title_Id: activeTitleId,
        Active_Title: activeTitle,
        Books_Cover:
          coverMap.get(String(review.BooksID)) || null,
        Like_Count: likeCountMap.get(key) || 0,
        Liked_By_Me: likedReviewIds.has(key),
        Saved_By_Me: savedReviewIds.has(key),
      };
    });

    return res.status(200).json({
      success: true,
      profile: {
        ...profile,
        activeTitleId,
        activeTitle,
      },
      rewards,
      frames,
      titles,
      activeTitleId,
      activeTitle,
      reviews,
    });
  } catch (error) {
    console.error("[PUBLIC PROFILE] Error:", error);

    return res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดโปรไฟล์ได้",
      error: error.message,
    });
  }
});

export default router;
