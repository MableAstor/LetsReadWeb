import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getOrCreateUserProfile } from "./authRoutes.js";

const router = express.Router();

const PAGE_SIZE = 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// ======================================================
// รายการรางวัลเดิม
// ชื่อ name ต้องตรงกับ Rewards.Rewards_Name
// ======================================================

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

// ======================================================
// รายการกรอบโปรไฟล์ 8 แบบ
// กรอบแยกจากระบบ Rewards
// ======================================================

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

// ======================================================
// ตรวจสอบผู้ใช้จาก Access Token
// ======================================================

async function getRewardUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    const authError = new Error(
      "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
    );

    authError.statusCode = 401;
    throw authError;
  }

  return getOrCreateUserProfile(data.user);
}

// ======================================================
// ดึงรายการรางวัลจากตาราง Rewards
// ======================================================

async function getRewardCatalog() {
  const rewardNames = rewardDefinitions.map(
    (reward) => reward.name
  );

  const { data, error } = await supabaseAdmin
    .from("Rewards")
    .select("RewardsID, Rewards_Name")
    .in("Rewards_Name", rewardNames);

  if (error) throw error;

  const rewardMap = new Map(
    (data || []).map((reward) => [
      reward.Rewards_Name,
      reward.RewardsID,
    ])
  );

  const missingRewards = rewardDefinitions.filter(
    (reward) => !rewardMap.has(reward.name)
  );

  if (missingRewards.length > 0) {
    throw new Error(
      `ไม่พบรายการรางวัลในตาราง Rewards: ${
        missingRewards
          .map((reward) => reward.name)
          .join(", ")
      }`
    );
  }

  return rewardMap;
}

// ======================================================
// นับจำนวนกิจกรรมของผู้ใช้
// ======================================================

async function getUserActivityCounts(userId) {
  const [
    reviewsResult,
    savedReviewsResult,
    swipesResult,
  ] = await Promise.all([
    // นับจำนวนรีวิว
    supabaseAdmin
      .from("Reviews")
      .select("ReviewsID", {
        count: "exact",
        head: true,
      })
      .eq("UserID", userId),

    // นับจำนวนรีวิวที่บันทึกไว้
    supabaseAdmin
      .from("Saved_Reviews")
      .select("ReviewsID", {
        count: "exact",
        head: true,
      })
      .eq("UserID", userId),

    // นับจำนวนครั้งที่ปัดหนังสือ
    supabaseAdmin
      .from("Swipe_History")
      .select("Swipe_HistoryID", {
        count: "exact",
        head: true,
      })
      .eq("UserID", userId),
  ]);

  if (reviewsResult.error) {
    throw reviewsResult.error;
  }

  if (savedReviewsResult.error) {
    throw savedReviewsResult.error;
  }

  if (swipesResult.error) {
    throw swipesResult.error;
  }

  return {
    reviews: reviewsResult.count || 0,
    savedReviews: savedReviewsResult.count || 0,
    swipes: swipesResult.count || 0,
  };
}

// ======================================================
// บันทึกรางวัลให้ผู้ใช้
// ======================================================

async function grantReward(userId, rewardId) {
  const { data: existing, error: checkError } =
    await supabaseAdmin
      .from("User_Rewards")
      .select("UserID, RewardsID")
      .eq("UserID", userId)
      .eq("RewardsID", rewardId)
      .limit(1)
      .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    return {
      inserted: false,
      record: existing,
    };
  }

  const { data: newReward, error: insertError } =
    await supabaseAdmin
      .from("User_Rewards")
      .insert({
        UserID: userId,
        RewardsID: rewardId,
      })
      .select("UserID, RewardsID")
      .single();

  if (insertError?.code === "23505") {
    return {
      inserted: false,
      record: {
        UserID: userId,
        RewardsID: rewardId,
      },
    };
  }

  if (insertError) throw insertError;

  return {
    inserted: true,
    record: newReward,
  };
}

// ======================================================
// ตรวจสอบและปลดล็อกรางวัลเดิม
// ======================================================

async function checkAndGrantRewards(userId) {
  const counts = await getUserActivityCounts(userId);
  const rewardMap = await getRewardCatalog();

  const { data: earnedRewards, error: rewardError } =
    await supabaseAdmin
      .from("User_Rewards")
      .select("UserID, RewardsID")
      .eq("UserID", userId);

  if (rewardError) throw rewardError;

  const earnedIds = new Set(
    (earnedRewards || []).map((reward) =>
      String(reward.RewardsID)
    )
  );

  const newlyUnlocked = [];

  for (const reward of rewardDefinitions) {
    const currentCount = counts[reward.metric];
    const rewardId = rewardMap.get(reward.name);

    const alreadyEarned = earnedIds.has(
      String(rewardId)
    );

    if (currentCount >= reward.target && !alreadyEarned) {
      const grantResult = await grantReward(
        userId,
        rewardId
      );

      earnedIds.add(String(rewardId));

      if (grantResult.inserted) {
        newlyUnlocked.push({
          ...reward,
          RewardsID: rewardId,
          unlocked: true,
        });
      }
    }
  }

  const rewards = rewardDefinitions.map((reward) => {
    const rewardId = rewardMap.get(reward.name);

    const isUnlocked = earnedIds.has(
      String(rewardId)
    );

    const progress = counts[reward.metric];

    return {
      ...reward,
      RewardsID: rewardId,
      unlocked: isUnlocked,
      progress: Math.min(progress, reward.target),
    };
  });

  return {
    counts,
    rewards,
    newlyUnlocked,
  };
}

// ======================================================
// คำนวณช่วงเวลาเดือนตามเวลาไทย
// ======================================================

function getBangkokMonthRange(year, month) {
  const startTime =
    Date.UTC(year, month - 1, 1) -
    BANGKOK_OFFSET_MS;

  const endTime =
    Date.UTC(year, month, 1) -
    BANGKOK_OFFSET_MS;

  return {
    start: new Date(startTime).toISOString(),
    end: new Date(endTime).toISOString(),
  };
}

// ======================================================
// ตรวจสอบว่าเดือนสิ้นสุดแล้วหรือยัง
// ======================================================

function isMonthFinished(year, month) {
  const range = getBangkokMonthRange(year, month);

  return Date.now() >= new Date(range.end).getTime();
}

// ======================================================
// ดึงอันดับรีวิวประจำเดือน
//
// ใช้กติกาเดียวกับ leaderboardRoutes.js
// 1. รีวิวมากกว่าอยู่ก่อน
// 2. หากเท่ากันเรียงตามชื่อภาษาไทย
// 3. หากชื่อเท่ากันเรียงตาม UserID
// 4. รวมผู้ใช้ทุกคน แม้มีรีวิว 0 ครั้ง
// ======================================================

async function getMonthlyReviewRanking(year, month) {
  const period = getBangkokMonthRange(year, month);

  // ดึงรายชื่อผู้ใช้
  const { data: users, error: usersError } =
    await supabaseAdmin
      .from("User")
      .select("UserID, User_Name")
      .order("UserID", { ascending: true });

  if (usersError) throw usersError;

  // ดึงรีวิวทั้งหมดภายในเดือนนั้น
  const reviewRows = [];
  let offset = 0;

  while (true) {
    const { data: page, error: reviewsError } =
      await supabaseAdmin
        .from("Reviews")
        .select("ReviewsID, UserID, Created_At")
        .gte("Created_At", period.start)
        .lt("Created_At", period.end)
        .order("Created_At", { ascending: true })
        .order("ReviewsID", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

    if (reviewsError) throw reviewsError;

    const rows = page || [];

    reviewRows.push(...rows);

    if (rows.length < PAGE_SIZE) break;

    offset += PAGE_SIZE;
  }

  // นับจำนวนรีวิวของแต่ละคน
  const reviewCountMap = new Map();

  for (const review of reviewRows) {
    const userId = String(review.UserID);

    reviewCountMap.set(
      userId,
      (reviewCountMap.get(userId) || 0) + 1
    );
  }

  // เรียงอันดับด้วยกติกาเดียวกับ Leaderboard
  // รวมผู้ใช้ทุกคน แม้จะไม่มีรีวิวในเดือนนั้น
  const rankedUsers = (users || [])
    .map((user) => ({
      UserID: user.UserID,
      name: user.User_Name || "ผู้ใช้",
      reviews:
        reviewCountMap.get(String(user.UserID)) || 0,
    }))
    .sort((a, b) => {
      // รีวิวมากกว่าอยู่ก่อน
      if (b.reviews !== a.reviews) {
        return b.reviews - a.reviews;
      }

      // หากจำนวนรีวิวเท่ากัน เรียงตามชื่อ
      const nameComparison = a.name.localeCompare(
        b.name,
        "th"
      );

      if (nameComparison !== 0) {
        return nameComparison;
      }

      // หากชื่อเท่ากัน เรียงตาม UserID
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

  return rankedUsers;
}

// ======================================================
// ดึงกรอบที่ผู้ใช้ปลดล็อกแล้ว
// ======================================================

async function getEarnedFrames(userId) {
  const { data, error } = await supabaseAdmin
    .from("User_Frames")
    .select("UserID, FrameID, Unlocked_At")
    .eq("UserID", userId);

  if (error) throw error;

  return data || [];
}

// ======================================================
// บันทึกกรอบที่ปลดล็อกให้ผู้ใช้
// ======================================================

async function grantFrame(userId, frameId) {
  const { data: existing, error: checkError } =
    await supabaseAdmin
      .from("User_Frames")
      .select("UserID, FrameID, Unlocked_At")
      .eq("UserID", userId)
      .eq("FrameID", frameId)
      .limit(1)
      .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    return {
      inserted: false,
      record: existing,
    };
  }

  const { data: newFrame, error: insertError } =
    await supabaseAdmin
      .from("User_Frames")
      .insert({
        UserID: userId,
        FrameID: frameId,
      })
      .select("UserID, FrameID, Unlocked_At")
      .single();

  // ป้องกันการบันทึกซ้ำเมื่อมีคำขอพร้อมกัน
  if (insertError?.code === "23505") {
    return {
      inserted: false,
      record: {
        UserID: userId,
        FrameID: frameId,
      },
    };
  }

  if (insertError) throw insertError;

  return {
    inserted: true,
    record: newFrame,
  };
}

// ======================================================
// ตรวจสอบและปลดล็อกกรอบโปรไฟล์ทั้ง 8 แบบ
// ======================================================

async function checkAndGrantFrames(userId, counts) {
  const earnedRows = await getEarnedFrames(userId);

  const earnedIds = new Set(
    earnedRows.map((frame) => Number(frame.FrameID))
  );

  const newlyUnlockedFrames = [];

  // ฟังก์ชันกลางสำหรับปลดล็อกกรอบ
  const unlockFrame = async (frame) => {
    if (earnedIds.has(frame.id)) return;

    const result = await grantFrame(
      userId,
      frame.id
    );

    earnedIds.add(frame.id);

    if (result.inserted) {
      newlyUnlockedFrames.push({
        id: frame.id,
        code: frame.code,
        title: frame.title,
        description: frame.description,
        unlocked: true,
      });
    }
  };

  // --------------------------------------------------
  // FRAME 1: ล็อกอินครั้งแรก
  // ปลดล็อกเมื่อผู้ใช้เข้าสู่ระบบและเรียกตรวจสอบครั้งแรก
  // --------------------------------------------------

  const firstLoginFrame = frameDefinitions.find(
    (frame) => frame.condition === "firstLogin"
  );

  if (firstLoginFrame) {
    await unlockFrame(firstLoginFrame);
  }

  // --------------------------------------------------
  // FRAME 2: รีวิวครบ 5 ครั้ง
  // --------------------------------------------------

  const reviewFiveFrame = frameDefinitions.find(
    (frame) =>
      frame.condition === "reviewCount" &&
      frame.target === 5
  );

  if (
    reviewFiveFrame &&
    counts.reviews >= reviewFiveFrame.target
  ) {
    await unlockFrame(reviewFiveFrame);
  }

  // --------------------------------------------------
  // FRAME 3-8: อันดับนักรีวิวรายเดือน
  // ตรวจสอบหลังสิ้นเดือนเท่านั้น
  // --------------------------------------------------

  const monthlyFrames = frameDefinitions.filter(
    (frame) => frame.condition === "monthlyRank"
  );

  // Cache ผลอันดับ ป้องกันการคำนวณเดือนเดิมซ้ำ
  const rankingCache = new Map();

  for (const frame of monthlyFrames) {
    const { year, month, rank } = frame;

    // กรอบนี้ปลดล็อกไปแล้ว ไม่ต้องคำนวณซ้ำ
    if (earnedIds.has(frame.id)) {
      continue;
    }

    // เดือนยังไม่สิ้นสุด ยังไม่ปลดล็อก
    if (!isMonthFinished(year, month)) {
      continue;
    }

    const cacheKey = `${year}-${month}`;

    if (!rankingCache.has(cacheKey)) {
      const ranking = await getMonthlyReviewRanking(
        year,
        month
      );

      rankingCache.set(cacheKey, ranking);
    }

    const ranking = rankingCache.get(cacheKey);

    const winner = ranking.find(
      (user) => user.rank === rank
    );

    if (!winner) {
      continue;
    }

    if (String(winner.UserID) === String(userId)) {
      await unlockFrame(frame);
    }
  }

  // --------------------------------------------------
  // โหลดข้อมูลกรอบล่าสุดจากฐานข้อมูล
  // --------------------------------------------------

  const finalEarnedRows = await getEarnedFrames(userId);

  const earnedFrameMap = new Map(
    finalEarnedRows.map((frame) => [
      Number(frame.FrameID),
      frame,
    ])
  );

  const frames = frameDefinitions.map((frame) => {
    const earnedFrame = earnedFrameMap.get(frame.id);

    return {
      id: frame.id,
      code: frame.code,
      title: frame.title,
      description: frame.description,
      unlocked: Boolean(earnedFrame),
      unlockedAt: earnedFrame?.Unlocked_At || null,
    };
  });

  return {
    frames,
    newlyUnlockedFrames,
  };
}


// Title tags are catalogued as Rewards and owned permanently in User_Rewards.
// Do not award a monthly rank to users with zero reviews.
const titleDefinitions = [
  ...[1, 2, 3].map((rank) => ({
    id: `TOP_${rank}_OCT_2026`,
    name: `TITLE_TOP_${rank}_OCT_2026`,
    title: ["ราชานักรีวิว", "ยอดนักรีวิว", "ดาวรุ่งนักรีวิว"][rank - 1],
    description: `อันดับ ${rank} เดือนตุลาคม 2026`,
    requirement: `จบเดือนตุลาคมด้วยอันดับ ${rank}`,
    color: ["gold", "silver", "bronze"][rank - 1],
    year: 2026, month: 10, rank,
  })),
  ...[11, 12].flatMap((month) => [1, 2, 3].map((rank) => ({
    id: `TOP_${rank}_${month === 11 ? "NOV" : "DEC"}_2026`,
    name: `TITLE_TOP_${rank}_${month === 11 ? "NOV" : "DEC"}_2026`,
    title: ["ราชานักรีวิว", "ยอดนักรีวิว", "ดาวรุ่ง นักรีวิว"][rank - 1].replace("ดาวรุ่ง นัก", "ดาวรุ่งนัก"),
    description: `อันดับ ${rank} เดือน${month === 11 ? "พฤศจิกายน" : "ธันวาคม"} 2026`,
    requirement: `จบเดือนด้วยอันดับ ${rank}`,
    color: ["gold", "silver", "bronze"][rank - 1],
    year: 2026, month, rank,
  }))),
];

async function checkAndGrantTitles(userId) {
  const names = titleDefinitions.map((item) => item.name);
  const { data: catalog, error: catalogError } = await supabaseAdmin
    .from("Rewards").select("RewardsID, Rewards_Name").in("Rewards_Name", names);
  if (catalogError) throw catalogError;
  const byName = new Map((catalog || []).map((r) => [r.Rewards_Name, r.RewardsID]));
  const missing = names.filter((name) => !byName.has(name));
  if (missing.length) throw new Error(`กรุณาเพิ่มแท็กใน Rewards ก่อน: ${missing.join(", ")}`);

  const { data: earned, error: earnedError } = await supabaseAdmin
    .from("User_Rewards").select("RewardsID").eq("UserID", userId);
  if (earnedError) throw earnedError;
  const earnedIds = new Set((earned || []).map((r) => String(r.RewardsID)));
  const cache = new Map();
  const newlyUnlockedTitles = [];
  for (const title of titleDefinitions) {
    const rewardId = byName.get(title.name);
    if (earnedIds.has(String(rewardId)) || !isMonthFinished(title.year, title.month)) continue;
    const key = `${title.year}-${title.month}`;
    if (!cache.has(key)) cache.set(key, await getMonthlyReviewRanking(title.year, title.month));
    const winner = cache.get(key).find((u) => u.rank === title.rank && u.reviews > 0);
    if (winner && String(winner.UserID) === String(userId)) {
      const result = await grantReward(userId, rewardId);
      earnedIds.add(String(rewardId));
      if (result.inserted) newlyUnlockedTitles.push(title.id);
    }
  }
  const { data: user, error: userError } = await supabaseAdmin
    .from("User").select("Active_Title_RewardsID").eq("UserID", userId).single();
  if (userError) throw userError;
  const activeId = user.Active_Title_RewardsID;
  return {
    titles: titleDefinitions.map((title) => ({
      id: title.id, name: title.title, description: title.description,
      requirement: title.requirement, color: title.color,
      unlocked: earnedIds.has(String(byName.get(title.name))),
    })),
    activeTitleId: titleDefinitions.find((t) =>
      String(byName.get(t.name)) === String(activeId) && earnedIds.has(String(activeId))
    )?.id || null,
    newlyUnlockedTitles,
  };
}

// Changing the active title does not remove any earned rewards.
router.put("/rewards/active-title", async (req, res) => {
  try {
    const profile = await getRewardUser(req);
    const id = req.body?.titleId;
    if (id !== null && (typeof id !== "string" || !titleDefinitions.some((t) => t.id === id))) {
      return res.status(400).json({ success: false, message: "แท็กไม่ถูกต้อง" });
    }
    const title = titleDefinitions.find((t) => t.id === id);
    let rewardId = null;
    if (title) {
      const { data: catalog, error: catalogError } = await supabaseAdmin
        .from("Rewards").select("RewardsID").eq("Rewards_Name", title.name).single();
      if (catalogError) throw catalogError;
      rewardId = catalog.RewardsID;
      const { data: owned, error: ownedError } = await supabaseAdmin
        .from("User_Rewards").select("RewardsID")
        .eq("UserID", profile.UserID).eq("RewardsID", rewardId).maybeSingle();
      if (ownedError) throw ownedError;
      if (!owned) return res.status(403).json({ success: false, message: "ยังไม่ได้รับแท็กนี้" });
    }
    const { error } = await supabaseAdmin.from("User")
      .update({ Active_Title_RewardsID: rewardId }).eq("UserID", profile.UserID);
    if (error) throw error;
    return res.json({ success: true, activeTitleId: title?.id || null });
  } catch (error) {
    console.error("[TITLES] Save:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

// ======================================================
// ตรวจสอบทั้ง Rewards และ Profile Frames
// ======================================================

async function checkAllUnlocks(userProfile) {
  const rewardResult = await checkAndGrantRewards(
    userProfile.UserID
  );

  const frameResult = await checkAndGrantFrames(
    userProfile.UserID,
    rewardResult.counts
  );

  const titleResult = await checkAndGrantTitles(userProfile.UserID);

  return {
    ...titleResult,
    counts: rewardResult.counts,
    rewards: rewardResult.rewards,
    newlyUnlocked: rewardResult.newlyUnlocked,
    frames: frameResult.frames,
    newlyUnlockedFrames: frameResult.newlyUnlockedFrames,
  };
}

// ======================================================
// GET REWARDS + PROFILE FRAMES
// GET /api/auth/rewards
// ======================================================

router.get("/rewards", async (req, res) => {
  console.log("🟢 NEW TITLE REWARDS ROUTE CALLED");

  try {
    const userProfile = await getRewardUser(req);

    const result = await checkAllUnlocks(userProfile);

    return res.status(200).json({
      success: true,
      counts: result.counts,
      rewards: result.rewards,
      newlyUnlocked: result.newlyUnlocked,
      frames: result.frames,
      newlyUnlockedFrames: result.newlyUnlockedFrames,
      titles: result.titles,
      activeTitleId: result.activeTitleId,
      newlyUnlockedTitles: result.newlyUnlockedTitles,
    });
  } catch (error) {
    console.error("[REWARDS] Fetch error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถดึงข้อมูลได้",
    });
  }
});

// ======================================================
// POST REWARDS CHECK
// POST /api/auth/rewards/check
// ======================================================

router.post("/rewards/check", async (req, res) => {
  try {
    const userProfile = await getRewardUser(req);

    const result = await checkAllUnlocks(userProfile);

    return res.status(200).json({
      success: true,
      counts: result.counts,
      rewards: result.rewards,
      newlyUnlocked: result.newlyUnlocked,
      frames: result.frames,
      newlyUnlockedFrames: result.newlyUnlockedFrames,
      titles: result.titles,
      activeTitleId: result.activeTitleId,
      newlyUnlockedTitles: result.newlyUnlockedTitles,
    });
  } catch (error) {
    console.error("[REWARDS CHECK] Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "ไม่สามารถตรวจสอบข้อมูลได้",
    });
  }
});

export default router;