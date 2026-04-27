import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Cat,
  PlusCircle,
  BarChart3,
  Globe,
  Eye,
  EyeOff,
  Cookie,
  Droplet,
  Utensils,
} from "lucide-react";

const STORAGE_KEY = "nyan-note-prototype-v1";
const ANONYMOUS_OWNER_ID_KEY = "nyan-note-anonymous-owner-id-v1";

const FIREBASE_CONFIG = {
  apiKey: "ここに取得した値",
  authDomain: "neko222-ym.firebaseapp.com",
  projectId: "neko222-ym",
  storageBucket: "neko222-ym.firebasestorage.app",
  messagingSenderId: "694032444792",
  appId: "1:694032444792:web:b367c565ad0d475978ec8d",
  measurementId: "G-KQGVBJPPDK",
};

function createAnonymousOwnerId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `anon-${Date.now().toString(36)}-${rand}`;
}

function getOrCreateAnonymousOwnerId() {
  try {
    const existing = localStorage.getItem(ANONYMOUS_OWNER_ID_KEY);
    if (existing) return existing;
    const created = createAnonymousOwnerId();
    localStorage.setItem(ANONYMOUS_OWNER_ID_KEY, created);
    return created;
  } catch (_e) {
    return "anon-local-fallback";
  }
}

function hasFirebaseConfig(config) {
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  return required.every((key) => typeof config[key] === "string" && config[key].trim() !== "");
}

function createFirestoreGateway() {
  if (!hasFirebaseConfig(FIREBASE_CONFIG)) {
    return {
      enabled: false,
      db: null,
      auth: null,
      configStatus: "Firebase未設定",
      appInitStatus: "Firebase app 初期化失敗",
      firestoreInitStatus: "Firestore 初期化失敗",
      authInitStatus: "Firebase Auth 初期化失敗",
      initErrorMessage: "Firebase設定が未入力です",
      initErrorCode: "firebase/config-missing",
    };
  }

  try {
    const firebaseSdk = window.firebase;
    if (!firebaseSdk) {
      throw new Error("Firebase SDKが読み込まれていません");
    }
    firebaseSdk.apps.length ? firebaseSdk.app() : firebaseSdk.initializeApp(FIREBASE_CONFIG);
    const db = firebaseSdk.firestore();
    const auth = typeof firebaseSdk.auth === "function" ? firebaseSdk.auth() : null;
    return {
      enabled: true,
      db,
      auth,
      configStatus: "Firebase設定済み",
      appInitStatus: "Firebase app 初期化成功",
      firestoreInitStatus: "Firestore 初期化成功",
      authInitStatus: auth ? "Firebase Auth 初期化成功" : "Firebase Auth 未読込",
      initErrorMessage: "",
      initErrorCode: "",
    };
  } catch (e) {
    const details = getFirebaseErrorDetails(e);
    console.error("Firebase初期化エラー:", details, e);
    if (e && e.stack) console.error("Firebase初期化スタック:", e.stack);
    return {
      enabled: false,
      db: null,
      auth: null,
      configStatus: "Firebase設定済み",
      appInitStatus: "Firebase app 初期化失敗",
      firestoreInitStatus: "Firestore 初期化失敗",
      authInitStatus: "Firebase Auth 初期化失敗",
      initErrorMessage: details.message,
      initErrorCode: details.code,
    };
  }
}

function omitUndefinedFields(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function getFirebaseErrorDetails(error) {
  const code = error && typeof error.code === "string" ? error.code : "";
  const message = error instanceof Error ? error.message : "不明なFirebaseエラー";
  return { code, message };
}

function toFirestoreCatPayload(cat, ownerUid) {
  const now = new Date().toISOString();
  const payload = {
    ownerUid,
    name: cat.name,
    age: Number(cat.age),
    sex: cat.gender ?? cat.sex,
    region: cat.region,
    coatPattern: cat.coatPattern || "",
    currentWeightKg: cat.currentWeightKg === "" ? null : Number(cat.currentWeightKg),
    visibility: cat.visibility || "private",
    hasLocalImage: Boolean(cat.photoImage),
    createdAt: cat.createdAt || now,
    updatedAt: now,
  };
  return omitUndefinedFields(payload);
}

function toFirestoreRecordPayload(record, catId, ownerUid) {
  const now = new Date().toISOString();
  const payload = {
    ownerUid,
    catId: String(catId),
    date: record.date,
    foodGram: Number(record.foodTotal),
    dryRatio: Number(record.kibblePct),
    wetRatio: Number(record.wetPct),
    waterMl: Number(record.waterTotal),
    treatLevel: record.snack,
    poopCount: Number(record.poop),
    peeCount: Number(record.pee),
    weightKg: record.weightKg === "" ? null : Number(record.weightKg),
    visibility: record.isPrivate ? "private" : "public",
    createdAt: record.createdAt || now,
    updatedAt: now,
  };
  return omitUndefinedFields(payload);
}

const sampleCats = [
  {
    id: 1,
    name: "もなか",
    age: 3,
    gender: "♀",
    coatPattern: "茶白",
    photo: "🐱",
    color: "#E8B86D",
    region: "千葉県浦安市",
    currentWeightKg: 4.2,
    source: "sample",
  },
  {
    id: 2,
    name: "あんこ",
    age: 7,
    gender: "♂",
    coatPattern: "黒猫",
    photo: "🐈‍⬛",
    color: "#5C5048",
    region: "千葉県浦安市",
    currentWeightKg: 5.1,
    source: "sample",
  },
];

const sampleLogsByCat = {
  1: [
    {
      id: 1,
      date: todayKey(),
      foodTotal: 70,
      waterTotal: 190,
      kibblePct: 70,
      wetPct: 30,
      snack: "ふつう",
      poop: 1,
      pee: 3,
      weightKg: 4.2,
      isPrivate: false,
      source: "sample",
    },
    {
      id: 2,
      date: daysAgoKey(1),
      foodTotal: 66,
      waterTotal: 175,
      kibblePct: 65,
      wetPct: 35,
      snack: "少なめ",
      poop: 1,
      pee: 3,
      weightKg: 4.1,
      isPrivate: false,
      source: "sample",
    },
  ],
  2: [
    {
      id: 3,
      date: todayKey(),
      foodTotal: 82,
      waterTotal: 210,
      kibblePct: 75,
      wetPct: 25,
      snack: "少なめ",
      poop: 2,
      pee: 4,
      weightKg: 5.1,
      isPrivate: true,
      source: "sample",
    },
  ],
};

const communityCats = [
  { id: 101, name: "ミケ", anonymous: false, region: "東京都世田谷区", age: 5, food: 60, snack: "少なめ", poop: 1, pee: 3, photo: "🐈" },
  { id: 102, name: null, anonymous: true, region: "大阪府大阪市", age: 2, food: 80, snack: "ふつう", poop: 2, pee: 4, photo: "🐱" },
  { id: 103, name: "クロ", anonymous: false, region: "北海道札幌市", age: 9, food: 55, snack: "なし", poop: 1, pee: 2, photo: "🐈‍⬛" },
  { id: 104, name: "ココ", anonymous: false, region: "千葉県市川市", age: 4, food: 70, snack: "ふつう", poop: 2, pee: 3, photo: "🐱" },
  { id: 105, name: null, anonymous: true, region: "福岡県福岡市", age: 11, food: 50, snack: "少なめ", poop: 1, pee: 2, photo: "🐈" },
];

const palette = {
  paper: "#F5EFE0",
  paperDeep: "#EDE4CD",
  ink: "#3A2E27",
  inkSoft: "#6B5B4F",
  accent: "#C8553D",
  accentSoft: "#E8967A",
  leaf: "#7A8B5C",
  cream: "#FAF6EA",
  line: "#D9CCB0",
};

const fontDisplay = "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', serif";
const fontBody = "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif";

function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return toLocalDateKey(new Date());
}

function daysAgoKey(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalDateKey(d);
}

function buildInitialData() {
  return {
    cats: sampleCats,
    logsByCat: sampleLogsByCat,
    nextIds: { cat: 100, log: 500 },
  };
}

function newLogDraft(date = todayKey()) {
  return {
    date,
    foodTotal: 70,
    waterTotal: 180,
    kibblePct: 70,
    wetPct: 30,
    snack: "ふつう",
    poop: 1,
    pee: 3,
    weightKg: "",
    isPrivate: false,
  };
}

function parseWeight(weight) {
  if (weight === "" || weight === null || weight === undefined) return null;
  const num = typeof weight === "number" ? weight : Number(weight);
  if (!Number.isFinite(num)) return Number.NaN;
  return Math.round(num * 10) / 10;
}

function formatWeight(weight) {
  const parsed = parseWeight(weight);
  if (parsed === null || Number.isNaN(parsed)) return null;
  return parsed.toFixed(1);
}

function hasAtMostOneDecimal(weight) {
  if (weight === "" || weight === null || weight === undefined) return true;
  if (typeof weight === "number") return Number.isInteger(weight * 10);
  return /^\d+(\.\d)?$/.test(weight.trim());
}

const CAT_AVATAR_COLORS = ["#D9A86A", "#E0B77D", "#CFA06D", "#C4A07A", "#D6B088"];

function getCatAvatarColor(cat) {
  const rawId = typeof cat?.id === "number" ? cat.id : Number(cat?.id) || 0;
  const index = Math.abs(rawId) % CAT_AVATAR_COLORS.length;
  return CAT_AVATAR_COLORS[index];
}

function validateCatForm(form) {
  const errors = [];
  if (!form.name.trim()) errors.push("名前は必須です。");
  const ageNum = Number(form.age);
  if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 30) errors.push("年齢は0〜30の整数で入力してください。");
  if (!["♂", "♀"].includes(form.gender)) errors.push("性別は♂または♀を選択してください。");
  if (!form.region.trim()) errors.push("地域は必須です。");
  if (form.currentWeightKg !== "") {
    const weight = parseWeight(form.currentWeightKg);
    if (!hasAtMostOneDecimal(form.currentWeightKg) || Number.isNaN(weight) || weight <= 0 || weight >= 30) {
      errors.push("現在の体重は0より大きく30未満で入力してください（小数1桁）。");
    }
  }
  return errors;
}

function validateLogForm(form) {
  const errors = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errors.push("日付は必須です。");
  if (form.foodTotal < 0 || form.foodTotal > 150) errors.push("ごはん量は0〜150gで入力してください。");
  if (form.waterTotal < 0 || form.waterTotal > 500) errors.push("飲水量は0〜500mlで入力してください。");
  if (form.kibblePct < 0 || form.kibblePct > 100) errors.push("カリカリ比率は0〜100で入力してください。");
  if (form.wetPct < 0 || form.wetPct > 100) errors.push("ウェット比率は0〜100で入力してください。");
  if (form.kibblePct + form.wetPct !== 100) errors.push("カリカリとウェットの比率合計は100にしてください。");
  if (form.poop < 0 || form.poop > 20 || form.pee < 0 || form.pee > 20) errors.push("排泄回数は0〜20回で入力してください。");
  if (form.weightKg !== "") {
    const weight = parseWeight(form.weightKg);
    if (!hasAtMostOneDecimal(form.weightKg) || Number.isNaN(weight) || weight <= 0 || weight >= 30) {
      errors.push("今日の体重は0より大きく30未満で入力してください（小数1桁）。");
    }
  }
  return errors;
}

function normalizeLogsByCat(logsByCat) {
  if (!logsByCat || typeof logsByCat !== "object") return sampleLogsByCat;
  const normalized = {};
  for (const [catId, rows] of Object.entries(logsByCat)) {
    normalized[catId] = Array.isArray(rows)
      ? rows.map((row) => ({
          ...row,
          waterTotal: typeof row.waterTotal === "number" ? row.waterTotal : 0,
          weightKg: formatWeight(row.weightKg) ?? "",
        }))
      : [];
  }
  return normalized;
}

function normalizeCats(cats) {
  if (!Array.isArray(cats)) return sampleCats;
  return cats.map((cat) => ({
    ...cat,
    coatPattern: typeof cat.coatPattern === "string" ? cat.coatPattern : "",
    photoImage: typeof cat.photoImage === "string" ? cat.photoImage : "",
    currentWeightKg: formatWeight(cat.currentWeightKg) ?? "",
  }));
}

function hydrateLogDraft(log) {
  if (!log) return newLogDraft();
  return {
    ...newLogDraft(log.date),
    ...log,
    weightKg: formatWeight(log.weightKg) ?? "",
  };
}

function CatHealthApp() {
  const [localOwnerUid] = useState(() => getOrCreateAnonymousOwnerId());
  const [authOwnerUid, setAuthOwnerUid] = useState("");
  const [firestoreGateway] = useState(() => createFirestoreGateway());
  const [firebaseStatus, setFirebaseStatus] = useState(
    firestoreGateway.firestoreInitStatus === "Firestore 初期化成功" ? "Firebase保存可能" : "Firebase保存エラー",
  );
  const [firebaseDebug, setFirebaseDebug] = useState(() => ({
    configStatus: firestoreGateway.configStatus,
    appInitStatus: firestoreGateway.appInitStatus,
    firestoreInitStatus: firestoreGateway.firestoreInitStatus,
    authInitStatus: firestoreGateway.authInitStatus,
    authStatus: "未認証",
    lastCatSaveResult: "未実行",
    lastRecordSaveResult: "未実行",
    lastConnectionTestResult: "未実行",
    lastErrorCode: firestoreGateway.initErrorCode || "",
    lastErrorMessage: firestoreGateway.initErrorMessage || "",
  }));
  const ownerUid = authOwnerUid || localOwnerUid;
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return buildInitialData();
      const parsed = JSON.parse(raw);
      return {
        cats: normalizeCats(parsed.cats),
        logsByCat: normalizeLogsByCat(parsed.logsByCat),
        nextIds: parsed.nextIds || { cat: 100, log: 500 },
      };
    } catch (_e) {
      return buildInitialData();
    }
  });

  const [selectedCatId, setSelectedCatId] = useState(() => data.cats[0]?.id ?? null);
  const [message, setMessage] = useState("");

  const updateFirestoreSaveDebug = (target, ok, errorCode = "", errorMessage = "") => {
    const resultText = ok ? `${target}: 保存成功` : `${target}: 保存失敗`;
    const errorText = ok ? "" : errorMessage || "不明なFirestoreエラー";
    if (ok) {
      console.log(`[Firestore] ${resultText}`);
    } else {
      console.error(`[Firestore] ${resultText}`, { code: errorCode || "なし", message: errorText });
    }
    setFirebaseDebug((prev) => ({
      ...prev,
      lastCatSaveResult: target === "猫プロフィール" ? resultText : prev.lastCatSaveResult,
      lastRecordSaveResult: target === "日次記録" ? resultText : prev.lastRecordSaveResult,
      lastErrorCode: ok ? "" : errorCode,
      lastErrorMessage: errorText,
    }));
  };

  const saveCatToCloud = async (cat) => {
    if (!firestoreGateway.enabled || !firestoreGateway.db) {
      updateFirestoreSaveDebug("猫プロフィール", false, "firestore/not-initialized", "Firestore未初期化のため保存をスキップしました");
      return { ok: false };
    }
    try {
      const payload = toFirestoreCatPayload(cat, ownerUid);
      await firestoreGateway.db.collection("cats").doc(String(cat.id)).set(payload, { merge: true });
      setFirebaseStatus("Firebase保存可能");
      updateFirestoreSaveDebug("猫プロフィール", true);
      return { ok: true };
    } catch (e) {
      setFirebaseStatus("Firebase保存エラー");
      console.error("[Firestore] 猫プロフィール保存エラー詳細", e);
      if (e && e.stack) console.error("[Firestore] 猫プロフィール保存エラースタック", e.stack);
      const details = getFirebaseErrorDetails(e);
      updateFirestoreSaveDebug("猫プロフィール", false, details.code, details.message);
      return { ok: false };
    }
  };

  const deleteCatFromCloud = async (catId) => {
    if (!firestoreGateway.enabled || !firestoreGateway.db) return;
    try {
      await firestoreGateway.db.collection("cats").doc(String(catId)).delete();
      setFirebaseStatus("Firebase保存可能");
    } catch (_e) {
      setFirebaseStatus("Firebase保存エラー");
    }
  };

  const saveRecordToCloud = async (record, catId) => {
    if (!firestoreGateway.enabled || !firestoreGateway.db) {
      updateFirestoreSaveDebug("日次記録", false, "firestore/not-initialized", "Firestore未初期化のため保存をスキップしました");
      return { ok: false };
    }
    try {
      const payload = toFirestoreRecordPayload(record, catId, ownerUid);
      await firestoreGateway.db.collection("records").doc(String(record.id)).set(payload, { merge: true });
      setFirebaseStatus("Firebase保存可能");
      updateFirestoreSaveDebug("日次記録", true);
      return { ok: true };
    } catch (e) {
      setFirebaseStatus("Firebase保存エラー");
      console.error("[Firestore] 日次記録保存エラー詳細", e);
      if (e && e.stack) console.error("[Firestore] 日次記録保存エラースタック", e.stack);
      const details = getFirebaseErrorDetails(e);
      updateFirestoreSaveDebug("日次記録", false, details.code, details.message);
      return { ok: false };
    }
  };

  const runFirestoreConnectionTest = async () => {
    if (!firestoreGateway.enabled || !firestoreGateway.db) {
      const code = "firestore/not-initialized";
      const message = "Firestore未初期化のため接続テストを実行できません";
      console.error("[Firestore] 接続テスト失敗", { code, message });
      setFirebaseDebug((prev) => ({
        ...prev,
        lastConnectionTestResult: "Firestore接続テスト失敗",
        lastErrorCode: code,
        lastErrorMessage: message,
      }));
      setFirebaseStatus("Firebase保存エラー");
      return;
    }
    try {
      const payload = omitUndefinedFields({
        ownerUid,
        createdAt: new Date().toISOString(),
        message: "firestore test",
      });
      await firestoreGateway.db.collection("debug").doc(`test-${Date.now()}`).set(payload, { merge: true });
      console.log("[Firestore] 接続テスト成功", payload);
      setFirebaseDebug((prev) => ({
        ...prev,
        lastConnectionTestResult: "Firestore接続テスト成功",
        lastErrorCode: "",
        lastErrorMessage: "",
      }));
      setFirebaseStatus("Firebase保存可能");
    } catch (e) {
      const details = getFirebaseErrorDetails(e);
      console.error("[Firestore] 接続テスト失敗", details, e);
      if (e && e.stack) console.error("[Firestore] 接続テスト失敗スタック", e.stack);
      setFirebaseDebug((prev) => ({
        ...prev,
        lastConnectionTestResult: "Firestore接続テスト失敗",
        lastErrorCode: details.code,
        lastErrorMessage: details.message,
      }));
      setFirebaseStatus("Firebase保存エラー");
    }
  };

  const deleteRecordFromCloud = async (logId) => {
    if (!firestoreGateway.enabled || !firestoreGateway.db) return;
    try {
      await firestoreGateway.db.collection("records").doc(String(logId)).delete();
      setFirebaseStatus("Firebase保存可能");
    } catch (_e) {
      setFirebaseStatus("Firebase保存エラー");
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const runAnonymousAuth = async () => {
      if (!firestoreGateway.enabled || !firestoreGateway.auth) {
        setFirebaseDebug((prev) => ({
          ...prev,
          authStatus: "未認証",
        }));
        return;
      }
      setFirebaseDebug((prev) => ({
        ...prev,
        authStatus: "匿名ログイン中",
      }));
      try {
        const result = await firestoreGateway.auth.signInAnonymously();
        const uid = result?.user?.uid || firestoreGateway.auth.currentUser?.uid || "";
        if (!uid) {
          throw new Error("匿名ログインでuidを取得できませんでした");
        }
        setAuthOwnerUid(uid);
        setFirebaseDebug((prev) => ({
          ...prev,
          authStatus: "匿名ログイン済み",
          lastErrorCode: "",
          lastErrorMessage: "",
        }));
      } catch (e) {
        const details = getFirebaseErrorDetails(e);
        console.error("[Firebase Auth] 匿名ログイン失敗", details, e);
        if (e && e.stack) console.error("[Firebase Auth] 匿名ログイン失敗スタック", e.stack);
        setFirebaseDebug((prev) => ({
          ...prev,
          authStatus: "認証エラー",
          lastErrorCode: details.code,
          lastErrorMessage: details.message,
        }));
      }
    };
    runAnonymousAuth();
  }, [firestoreGateway]);

  useEffect(() => {
    if (!data.cats.length) {
      setSelectedCatId(null);
      return;
    }
    if (!data.cats.some((c) => c.id === selectedCatId)) {
      setSelectedCatId(data.cats[0].id);
    }
  }, [data.cats, selectedCatId]);

  const selectedCat = data.cats.find((c) => c.id === selectedCatId) || null;

  const todayLogByCat = useMemo(() => {
    const t = todayKey();
    const map = {};
    for (const cat of data.cats) {
      const list = data.logsByCat[cat.id] || [];
      const log = list.find((row) => row.date === t);
      map[cat.id] = log || null;
    }
    return map;
  }, [data]);

  const updateCats = (updater) => {
    setData((prev) => ({ ...prev, cats: updater(prev.cats) }));
  };

  const addCat = async (form) => {
    const errors = validateCatForm(form);
    if (errors.length) return { ok: false, errors };

    let createdCat = null;
    setData((prev) => {
      const id = prev.nextIds.cat + 1;
      createdCat = {
        id,
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        coatPattern: form.coatPattern.trim(),
        photo: "🐱",
        region: form.region.trim(),
        currentWeightKg: formatWeight(form.currentWeightKg) ?? "",
        photoImage: form.photoImage || "",
        source: "user",
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        cats: [...prev.cats, createdCat],
        nextIds: { ...prev.nextIds, cat: id },
      };
    });
    const cloudResult = createdCat ? await saveCatToCloud(createdCat) : { ok: false };
    if (cloudResult.ok) {
      setMessage("猫プロフィールを保存しました ✓ Firebaseにも保存済み");
    } else {
      setMessage("猫プロフィールを保存しました ✓ 端末には保存しましたが、Firebase保存に失敗しました");
    }
    return { ok: true };
  };

  const updateCat = async (catId, form) => {
    const errors = validateCatForm(form);
    if (errors.length) return { ok: false, errors };

    const target = data.cats.find((cat) => cat.id === catId);
    const updated = {
      ...target,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      coatPattern: form.coatPattern.trim(),
      photo: target?.photo || "🐱",
      photoImage: form.photoImage || "",
      region: form.region.trim(),
      currentWeightKg: formatWeight(form.currentWeightKg) ?? "",
      updatedAt: new Date().toISOString(),
    };
    updateCats((cats) => cats.map((cat) => (cat.id === catId ? updated : cat)));
    const cloudResult = await saveCatToCloud(updated);
    if (cloudResult.ok) {
      setMessage("猫プロフィールを保存しました ✓ Firebaseにも保存済み");
    } else {
      setMessage("猫プロフィールを保存しました ✓ 端末には保存しましたが、Firebase保存に失敗しました");
    }
    return { ok: true };
  };

  const deleteCat = (catId) => {
    if (!window.confirm("この猫プロフィールを削除しますか？\n関連する記録も削除されます。")) return;
    const relatedLogs = data.logsByCat[catId] || [];
    setData((prev) => {
      const nextCats = prev.cats.filter((c) => c.id !== catId);
      const nextLogs = { ...prev.logsByCat };
      delete nextLogs[catId];
      return { ...prev, cats: nextCats, logsByCat: nextLogs };
    });
    relatedLogs.forEach((log) => deleteRecordFromCloud(log.id));
    deleteCatFromCloud(catId);
    setMessage("猫プロフィールを削除しました。");
  };

  const saveLog = async (catId, draft, editingId) => {
    const normalizedDraft = { ...draft, weightKg: formatWeight(draft.weightKg) ?? "" };
    const errors = validateLogForm(normalizedDraft);
    if (errors.length) return { ok: false, errors };

    let recordForCloud = null;
    setData((prev) => {
      const rows = prev.logsByCat[catId] || [];
      const existingByDate = rows.find((r) => r.date === normalizedDraft.date);
      if (existingByDate && existingByDate.id !== editingId) {
        return prev;
      }
      let nextRows;
      if (editingId) {
        nextRows = rows.map((row) =>
          row.id === editingId
            ? { ...row, ...normalizedDraft, updatedAt: new Date().toISOString() }
            : row,
        );
        recordForCloud = nextRows.find((row) => row.id === editingId) || null;
      } else {
        const id = prev.nextIds.log + 1;
        recordForCloud = { id, ...normalizedDraft, source: "user", createdAt: new Date().toISOString() };
        nextRows = [...rows, recordForCloud];
        return {
          ...prev,
          logsByCat: {
            ...prev.logsByCat,
            [catId]: nextRows.sort((a, b) => b.date.localeCompare(a.date)),
          },
          nextIds: { ...prev.nextIds, log: id },
        };
      }

      return {
        ...prev,
        logsByCat: {
          ...prev.logsByCat,
          [catId]: nextRows.sort((a, b) => b.date.localeCompare(a.date)),
        },
      };
    });

    const rows = data.logsByCat[catId] || [];
    const duplicate = rows.find((r) => r.date === normalizedDraft.date && r.id !== editingId);
    if (duplicate) {
      return { ok: false, errors: ["同じ日付の記録が既にあります。編集から更新してください。"] };
    }

    const cloudResult = recordForCloud ? await saveRecordToCloud(recordForCloud, catId) : { ok: false };
    if (cloudResult.ok) {
      setMessage("今日の記録を保存しました ✓ Firebaseにも保存済み");
    } else {
      setMessage("今日の記録を保存しました ✓ 端末には保存しましたが、Firebase保存に失敗しました");
    }
    return { ok: true };
  };

  const deleteLog = (catId, logId) => {
    if (!window.confirm("この日次記録を削除しますか？")) return;
    setData((prev) => {
      const rows = prev.logsByCat[catId] || [];
      return {
        ...prev,
        logsByCat: {
          ...prev.logsByCat,
          [catId]: rows.filter((row) => row.id !== logId),
        },
      };
    });
    deleteRecordFromCloud(logId);
    setMessage("日次記録を削除しました。");
  };

  const deleteSampleOnly = () => {
    if (!window.confirm("サンプルデータのみ削除しますか？\n追加したデータは残ります。")) return;
    setData((prev) => {
      const cats = prev.cats.filter((c) => c.source !== "sample");
      const logsByCat = {};
      for (const cat of cats) {
        const rows = (prev.logsByCat[cat.id] || []).filter((r) => r.source !== "sample");
        logsByCat[cat.id] = rows;
      }
      return { ...prev, cats, logsByCat };
    });
    setMessage("サンプルデータのみ削除しました。");
  };

  const resetAllData = () => {
    if (!window.confirm("全データを初期状態にリセットしますか？")) return;
    const initial = buildInitialData();
    setData(initial);
    setSelectedCatId(initial.cats[0]?.id ?? null);
    localStorage.removeItem(STORAGE_KEY);
    setMessage("全データを初期化しました。");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.paper,
        backgroundImage: `radial-gradient(circle at 20% 10%, ${palette.paperDeep} 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${palette.paperDeep} 0%, transparent 40%)`,
        color: palette.ink,
        fontFamily: fontBody,
        paddingBottom: "100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.4,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
          mixBlendMode: "multiply",
          zIndex: 1,
        }}
      />

      <Header />

      <main style={{ position: "relative", zIndex: 2, padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>
        {message && (
          <div style={{ ...cardStyle, background: "#FFF7E8", fontSize: 12, padding: "10px 14px" }}>
            {message}
          </div>
        )}
        {tab === "home" && (
          <HomeView
            cats={data.cats}
            todayLogByCat={todayLogByCat}
            onPick={(c) => {
              setSelectedCatId(c.id);
              setTab("mycat");
            }}
            onAddCat={addCat}
            onUpdateCat={updateCat}
            onDeleteCat={deleteCat}
            onShowMessage={setMessage}
            onDeleteSampleOnly={deleteSampleOnly}
            onResetAllData={resetAllData}
            firebaseStatus={firebaseStatus}
            firebaseDebug={firebaseDebug}
            onRunFirestoreConnectionTest={runFirestoreConnectionTest}
          />
        )}
        {tab === "mycat" && <MyCatView cats={data.cats} logsByCat={data.logsByCat} />}
        {tab === "log" && selectedCat && (
          <LogView
            cat={selectedCat}
            logs={data.logsByCat[selectedCat.id] || []}
            saveLog={saveLog}
            deleteLog={deleteLog}
            cats={data.cats}
            setSelectedCat={(c) => setSelectedCatId(c.id)}
            onMoveHome={() => setTab("home")}
            onShowMessage={setMessage}
          />
        )}
        {tab === "log" && !selectedCat && <EmptyCatPrompt onMoveLog={() => setTab("home")} />}
        {tab === "community" && <CommunityView />}
        {tab === "stats" && <StatsView />}
      </main>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

function EmptyCatPrompt({ onMoveLog }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700 }}>猫プロフィールがありません</div>
      <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 6 }}>ホームタブから猫を追加してください。</div>
      <button
        onClick={onMoveLog}
        style={{
          marginTop: 10,
          border: `1px solid ${palette.line}`,
          background: "transparent",
          color: palette.ink,
          borderRadius: 8,
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        ホームへ
      </button>
    </div>
  );
}

function Header() {
  return (
    <header
      style={{
        padding: "28px 20px 16px",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: palette.ink,
        }}
      >
        にゃん
        <span style={{ color: palette.accent, margin: "0 4px" }}>•</span>
        ノート
      </div>
      <div
        style={{
          fontSize: 11,
          color: palette.inkSoft,
          letterSpacing: "0.3em",
          marginTop: 4,
          textTransform: "uppercase",
        }}
      >
        cat health journal
      </div>
      <div
        style={{
          height: 1,
          background: `repeating-linear-gradient(90deg, ${palette.line} 0, ${palette.line} 6px, transparent 6px, transparent 12px)`,
          margin: "16px auto 0",
          maxWidth: 240,
        }}
      />
    </header>
  );
}

function HomeView({
  cats,
  todayLogByCat,
  onPick,
  onAddCat,
  onUpdateCat,
  onDeleteCat,
  onShowMessage,
  onDeleteSampleOnly,
  onResetAllData,
  firebaseStatus,
  firebaseDebug,
  onRunFirestoreConnectionTest,
}) {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const [showAdd, setShowAdd] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [errors, setErrors] = useState([]);
  const editFormRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "♀",
    coatPattern: "",
    photoImage: "",
    region: "",
    currentWeightKg: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      age: "",
      gender: "♀",
      coatPattern: "",
      photoImage: "",
      region: "",
      currentWeightKg: "",
    });
    setErrors([]);
  };

  const beginEdit = (cat) => {
    setEditingCatId(cat.id);
    setShowAdd(false);
    setErrors([]);
    onShowMessage("編集フォームを表示しました。");
    setForm({
      name: cat.name,
      age: String(cat.age),
      gender: cat.gender,
      coatPattern: cat.coatPattern ?? "",
      photoImage: cat.photoImage || "",
      region: cat.region,
      currentWeightKg: cat.currentWeightKg ?? "",
    });
  };

  useEffect(() => {
    if (!editingCatId || !editFormRef.current) return;
    const topPadding = 28;
    const targetTop = editFormRef.current.getBoundingClientRect().top + window.scrollY - topPadding;
    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  }, [editingCatId]);

  const handlePhotoImageUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImageFile(file);
      setForm((prev) => ({ ...prev, photoImage: compressed }));
    } catch (_error) {
      setErrors((prev) => [...prev, "画像の読み込みに失敗しました。別の画像をお試しください。"]);
    }
  };

  const submit = async () => {
    const result = editingCatId ? await onUpdateCat(editingCatId, form) : await onAddCat(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setEditingCatId(null);
    setShowAdd(false);
    resetForm();
  };

  return (
    <div>
      <SectionLabel left="今日の記録" right={dateStr} />
      {cats.map((cat, i) => {
        const hasToday = Boolean(todayLogByCat[cat.id]);
        return (
          <div key={cat.id}>
            <button
              onClick={() => onPick(cat)}
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                gap: 16,
                width: "100%",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transform: i % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: getCatAvatarColor(cat),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  flexShrink: 0,
                  boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CatAvatar cat={cat} size={64} fontSize={36} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700 }}>
                  {cat.name} <span style={{ fontSize: 14, color: palette.accent }}>{cat.gender}</span>
                </div>
                <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 2 }}>
                  {cat.age}歳 · {cat.region}
                </div>
                {cat.coatPattern && (
                  <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 2 }}>毛色・柄 {cat.coatPattern}</div>
                )}
                {cat.currentWeightKg && (
                  <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 2 }}>体重 {cat.currentWeightKg}kg</div>
                )}
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: hasToday ? palette.leaf : palette.accent,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  {hasToday ? "✓ 今日の記録あり" : "◯ 今日の記録なし"}
                </div>
              </div>
              <div style={{ fontSize: 24, color: palette.inkSoft }}>›</div>
            </button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12, marginTop: -2 }}>
              <MiniButton onClick={() => beginEdit(cat)}>編集</MiniButton>
              <MiniButton onClick={() => onDeleteCat(cat.id)}>削除</MiniButton>
            </div>
          </div>
        );
      })}

      {(showAdd || editingCatId) && (
        <div ref={editFormRef} style={cardStyle}>
          <Label>{editingCatId ? "猫プロフィールを編集" : "猫プロフィールを追加"}</Label>
          <FormErrorList errors={errors} />
          <InputRow label="名前">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          </InputRow>
          <InputRow label="年齢">
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} style={inputStyle} />
          </InputRow>
          <InputRow label="性別">
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={inputStyle}>
              <option value="♀">♀</option>
              <option value="♂">♂</option>
            </select>
          </InputRow>
          <InputRow label="プロフィール画像">
            <div style={{ fontSize: 12, color: palette.ink, marginBottom: 6 }}>
              {form.photoImage ? "画像を変更する" : "新しい画像を選択"}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handlePhotoImageUpload(file);
                e.target.value = "";
              }}
              style={inputStyle}
            />
            {form.photoImage ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: palette.inkSoft }}>画像を設定済み</div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={form.photoImage}
                    alt="現在のプロフィール画像プレビュー"
                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `1px solid ${palette.line}` }}
                  />
                  <MiniButton onClick={() => setForm((prev) => ({ ...prev, photoImage: "" }))}>画像を削除</MiniButton>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: palette.inkSoft, marginTop: 6 }}>画像未設定</div>
            )}
          </InputRow>
          <InputRow label="毛色・柄（任意）">
            <input
              value={form.coatPattern}
              onChange={(e) => setForm({ ...form, coatPattern: e.target.value })}
              style={inputStyle}
              placeholder="例: 茶白、キジトラ、三毛"
            />
          </InputRow>
          <InputRow label="地域">
            <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={inputStyle} />
          </InputRow>
          <InputRow label="現在の体重(kg)">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="29.9"
              value={form.currentWeightKg}
              onChange={(e) => setForm({ ...form, currentWeightKg: e.target.value })}
              style={inputStyle}
            />
          </InputRow>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <MiniButton onClick={submit}>{editingCatId ? "更新" : "追加"}</MiniButton>
            <MiniButton
              onClick={() => {
                setEditingCatId(null);
                setShowAdd(false);
                resetForm();
              }}
            >
              キャンセル
            </MiniButton>
          </div>
        </div>
      )}

      {!showAdd && !editingCatId && (
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingCatId(null);
            resetForm();
          }}
          style={{
            ...cardStyle,
            width: "100%",
            border: `2px dashed ${palette.line}`,
            background: "transparent",
            cursor: "pointer",
            color: palette.inkSoft,
            fontFamily: fontBody,
            fontSize: 14,
            padding: 24,
          }}
        >
          + 新しい猫ちゃんを登録
        </button>
      )}

      <div style={devMenuCardStyle}>
        <button type="button" onClick={() => setShowDevMenu((prev) => !prev)} style={devMenuToggleStyle}>
          開発用メニュー {showDevMenu ? "▲" : "▼"}
        </button>
        {showDevMenu && (
          <>
            <div style={{ ...cardStyle, borderStyle: "dashed", marginTop: 10 }}>
              <Label>データ管理</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <MiniButton onClick={onDeleteSampleOnly}>サンプルだけ削除</MiniButton>
                <MiniButton onClick={onResetAllData}>全データをリセット</MiniButton>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "12px 14px", marginTop: -4 }}>
              <div style={{ fontSize: 11, color: palette.inkSoft, letterSpacing: "0.05em", marginBottom: 4 }}>Firebase診断</div>
              <div style={{ fontSize: 12, color: palette.ink }}>
                Firebase接続状態:{" "}
                <span style={{ color: firebaseStatus === "Firebase保存エラー" ? palette.accent : palette.inkSoft }}>{firebaseStatus}</span>
              </div>
              <div style={{ fontSize: 11, color: palette.inkSoft, marginTop: 6 }}>Firebase: {firebaseDebug.configStatus}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>Firebase app: {firebaseDebug.appInitStatus}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>Firestore: {firebaseDebug.firestoreInitStatus}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>Firebase Auth: {firebaseDebug.authInitStatus}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>認証状態: {firebaseDebug.authStatus}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>最後の猫プロフィール保存結果: {firebaseDebug.lastCatSaveResult}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>最後の日次記録保存結果: {firebaseDebug.lastRecordSaveResult}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>Firestore接続テスト: {firebaseDebug.lastConnectionTestResult}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>最後のFirebaseエラーコード: {firebaseDebug.lastErrorCode || "なし"}</div>
              <div style={{ fontSize: 11, color: palette.inkSoft }}>
                最後のFirebaseエラーメッセージ: {firebaseDebug.lastErrorMessage || "なし"}
              </div>
              <div style={{ marginTop: 8 }}>
                <MiniButton onClick={onRunFirestoreConnectionTest}>Firestore接続テスト</MiniButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MyCatView({ cats, logsByCat }) {
  if (!cats.length) {
    return (
      <div>
        <SectionLabel left="わが家の猫たち" />
        <div style={cardStyle}>猫を登録してください</div>
      </div>
    );
  }

  const getLatestLog = (catId) => {
    const rows = logsByCat[catId] || [];
    if (!rows.length) return null;
    return [...rows].sort((a, b) => b.date.localeCompare(a.date))[0];
  };

  return (
    <div>
      <SectionLabel left="わが家の猫たち" right={`${cats.length}匹`} />
      {cats.map((cat, i) => {
        const latestLog = getLatestLog(cat.id);
        return (
          <div
            key={cat.id}
            style={{
              ...cardStyle,
              transform: i % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: getCatAvatarColor(cat),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  flexShrink: 0,
                  boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CatAvatar cat={cat} size={64} fontSize={34} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700 }}>
                  {cat.name} <span style={{ fontSize: 14, color: palette.accent }}>{cat.gender}</span>
                </div>
                <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 2 }}>
                  {cat.age}歳 · {cat.region}
                </div>
                <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 2 }}>毛色・柄 {cat.coatPattern?.trim() || "未設定"}</div>
                <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 2 }}>現在の体重 {cat.currentWeightKg || "未入力"}{cat.currentWeightKg ? "kg" : ""}</div>
              </div>
            </div>
            <div style={{ borderTop: `1px dashed ${palette.line}`, marginTop: 10, paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 4 }}>最新の日次記録</div>
              {latestLog ? (
                <div style={{ fontSize: 12, color: palette.ink, lineHeight: 1.7 }}>
                  {latestLog.date} / ごはん量 {latestLog.foodTotal}g / 飲水量 {latestLog.waterTotal}ml / おやつ量 {latestLog.snack}
                  <br />
                  うんち回数 {latestLog.poop}回 / おしっこ回数 {latestLog.pee}回
                  {latestLog.weightKg !== "" && latestLog.weightKg != null ? ` / 体重 ${Number(latestLog.weightKg).toFixed(1)}kg` : ""}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: palette.accent, fontWeight: 700 }}>まだ記録がありません</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SevenDayStatusCard({ cat, points }) {
  const maxFood = Math.max(...points.map((p) => p.foodTotal || 0), 1);
  const maxWater = Math.max(...points.map((p) => p.waterTotal || 0), 1);
  const weightPoints = points.filter((p) => p.weightKg !== null);
  const maxWeight = Math.max(...weightPoints.map((p) => p.weightKg), 1);

  return (
    <div style={{ ...cardStyle, marginTop: 12 }}>
      <Label>7日間のようす</Label>
      <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 10 }}>{cat.name} の過去7日間</div>
      <div style={{ display: "grid", gap: 10 }}>
        {points.map((point) => {
          if (!point.hasRecord) {
            return (
              <div
                key={point.date}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr",
                  alignItems: "center",
                  gap: 10,
                  paddingBottom: 6,
                  borderBottom: `1px dashed ${palette.line}`,
                }}
              >
                <div style={{ fontSize: 11, color: palette.inkSoft }}>{point.date.slice(5)}</div>
                <div style={{ fontSize: 12, color: palette.accent, fontWeight: 700 }}>未記録</div>
              </div>
            );
          }

          return (
            <div
              key={point.date}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 10,
                paddingBottom: 6,
                borderBottom: `1px dashed ${palette.line}`,
              }}
            >
              <div style={{ fontSize: 11, color: palette.inkSoft, paddingTop: 2 }}>{point.date.slice(5)}</div>
              <div style={{ display: "grid", gap: 4 }}>
                <TrendRow label="ごはん" value={`${point.foodTotal}g`} ratio={point.foodTotal / maxFood} color={palette.accentSoft} />
                <TrendRow label="飲水量" value={`${point.waterTotal}ml`} ratio={point.waterTotal / maxWater} color={palette.leaf} />
                {point.weightKg !== null && (
                  <TrendRow label="体重" value={`${point.weightKg.toFixed(1)}kg`} ratio={point.weightKg / maxWeight} color={palette.inkSoft} />
                )}
                <div style={{ fontSize: 11, color: palette.ink }}>うんち回数 {point.poop}回 / おしっこ回数 {point.pee}回</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendRow({ label, value, ratio, color }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 52px", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 11, color: palette.inkSoft }}>{label}</div>
      <div style={{ height: 8, background: "#EFE6D0", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.max(0, Math.min(1, ratio)) * 100}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>
      <div style={{ fontSize: 11, textAlign: "right", color: palette.ink }}>{value}</div>
    </div>
  );
}

function LogView({ cat, logs, saveLog, deleteLog, cats, setSelectedCat, onMoveHome, onShowMessage }) {
  const [draft, setDraft] = useState(newLogDraft());
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const logFormRef = useRef(null);

  const scrollToLogForm = () => {
    if (!logFormRef.current) return;
    const topPadding = 24;
    const targetTop = logFormRef.current.getBoundingClientRect().top + window.scrollY - topPadding;
    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const today = logs.find((l) => l.date === todayKey());
    setDraft(hydrateLogDraft(today));
    setEditingId(today?.id || null);
    setErrors([]);
  }, [cat.id, logs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToLogForm();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cat.id]);

  const setKibble = (v) => {
    const next = Math.max(0, Math.min(100, Number.isFinite(v) ? Math.round(v) : 0));
    setDraft({ ...draft, kibblePct: next, wetPct: 100 - next });
  };
  const setFoodTotal = (v) => {
    const next = Math.max(0, Math.min(150, Number.isFinite(v) ? Math.round(v) : 0));
    setDraft({ ...draft, foodTotal: next });
  };
  const setWaterTotal = (v) => {
    const next = Math.max(0, Math.min(500, Number.isFinite(v) ? Math.round(v) : 0));
    setDraft({ ...draft, waterTotal: next });
  };

  const onSubmit = async () => {
    const result = await saveLog(cat.id, draft, editingId);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    setLastSaved({ ...draft, catName: cat.name, catPhoto: cat.photo });
    setEditingId(null);
    setDraft(newLogDraft());
  };

  const startEdit = (log) => {
    setDraft(hydrateLogDraft(log));
    setEditingId(log.id);
    setErrors([]);
    if (onShowMessage) onShowMessage("記録フォームを表示しました。");
    window.setTimeout(() => {
      scrollToLogForm();
    }, 0);
  };

  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const dailyPoints = useMemo(() => {
    const points = [];
    for (let i = 6; i >= 0; i -= 1) {
      const key = daysAgoKey(i);
      const hit = logs.find((row) => row.date === key);
      points.push({
        date: key,
        hasRecord: Boolean(hit),
        foodTotal: hit?.foodTotal ?? 0,
        waterTotal: hit?.waterTotal ?? 0,
        weightKg: hit?.weightKg === "" || hit?.weightKg == null ? null : Number(hit.weightKg),
        poop: hit?.poop ?? 0,
        pee: hit?.pee ?? 0,
      });
    }
    return points;
  }, [logs]);

  return (
    <div>
      <SectionLabel left="きょうの記録" right="🖋" />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c)}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: 999,
              border: cat.id === c.id ? `2px solid ${palette.accent}` : `1px solid ${palette.line}`,
              background: cat.id === c.id ? palette.cream : "transparent",
              fontFamily: fontBody,
              fontSize: 13,
              cursor: "pointer",
              color: palette.ink,
            }}
          >
            <span style={{ marginRight: 6, display: "inline-flex", verticalAlign: "middle" }}>
              <CatAvatar cat={c} size={18} fontSize={12} />
            </span>
            {c.name}
          </button>
        ))}
      </div>

      <div ref={logFormRef} style={cardStyle}>
        <Label>📅 記録日</Label>
        <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={inputStyle} />
      </div>

      <div style={cardStyle}>
        <Label>🍚 一日のごはんの量</Label>
        <StepNumberInput
          value={draft.foodTotal}
          unit="g"
          min={0}
          max={150}
          step={5}
          color={palette.accent}
          onChange={setFoodTotal}
        />

        <div style={{ marginTop: 20 }}>
          <Label>カリカリ / ウェット の比率</Label>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: palette.inkSoft, marginBottom: 6 }}>
            <span>カリカリ {draft.kibblePct}%</span>
            <span>ウェット {draft.wetPct}%</span>
          </div>
          <RatioBar kibble={draft.kibblePct} wet={draft.wetPct} />
          <RatioSelector value={draft.kibblePct} onChange={setKibble} />
        </div>
      </div>

      <div style={cardStyle}>
        <Label>💧 一日の飲水量</Label>
        <StepNumberInput
          value={draft.waterTotal}
          unit="ml"
          min={0}
          max={500}
          step={5}
          color={palette.leaf}
          onChange={setWaterTotal}
        />
      </div>

      <div style={cardStyle}>
        <Label>⚖️ 今日の体重（任意）</Label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="29.9"
          value={draft.weightKg}
          onChange={(e) => setDraft({ ...draft, weightKg: e.target.value })}
          style={inputStyle}
          placeholder="例: 4.2"
        />
      </div>

      <div style={cardStyle}>
        <Label>🍪 おやつの量</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["なし", "少なめ", "ふつう", "多め"].map((opt) => (
            <Pill key={opt} active={draft.snack === opt} onClick={() => setDraft({ ...draft, snack: opt })}>
              {opt}
            </Pill>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <Label>💩 うんち回数 / 💧 おしっこ回数</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
          <Counter label="うんち回数" value={draft.poop} unit="回" setValue={(v) => setDraft({ ...draft, poop: v })} />
          <Counter label="おしっこ回数" value={draft.pee} unit="回" setValue={(v) => setDraft({ ...draft, pee: v })} />
        </div>
      </div>

      <div style={cardStyle}>
        <button
          onClick={() => setDraft({ ...draft, isPrivate: !draft.isPrivate })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: palette.ink }}>
            {draft.isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            {draft.isPrivate ? "名前を伏せて共有" : "名前ありで共有"}
          </span>
          <span
            style={{
              width: 44,
              height: 26,
              borderRadius: 999,
              background: draft.isPrivate ? palette.inkSoft : palette.leaf,
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: draft.isPrivate ? 21 : 3,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: palette.cream,
                transition: "left 0.2s",
              }}
            />
          </span>
        </button>
        <div style={{ fontSize: 11, color: palette.inkSoft, marginTop: 8 }}>
          {draft.isPrivate ? "他のユーザーには地域と健康データだけが見えます" : "他の飼い主さんに名前と一緒にシェアされます"}
        </div>
      </div>

      <FormErrorList errors={errors} />
      <div style={{ ...cardStyle, marginTop: 8 }}>
        <Label>入力内容の確認</Label>
        <div style={{ fontSize: 12, color: palette.inkSoft, lineHeight: 1.8 }}>
          📅 {draft.date}
          <br />
          ごはん量 {draft.foodTotal}g（カリカリ{draft.kibblePct}% / ウェット{draft.wetPct}%）
          <br />
          飲水量 {draft.waterTotal}ml
          <br />
          体重 {draft.weightKg === "" ? "未入力" : `${Number(draft.weightKg).toFixed(1)}kg`}
          <br />
          おやつ量 {draft.snack}
          <br />
          うんち回数 {draft.poop}回 / おしっこ回数 {draft.pee}回
          <br />
          👀 {draft.isPrivate ? "名前を伏せて共有" : "名前ありで共有"}
        </div>
      </div>
      <button
        onClick={onSubmit}
        style={{
          width: "100%",
          padding: "16px",
          background: palette.ink,
          color: palette.cream,
          border: "none",
          borderRadius: 14,
          fontFamily: fontDisplay,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.1em",
          cursor: "pointer",
          marginTop: 8,
          boxShadow: "0 4px 0 rgba(58,46,39,0.3)",
        }}
      >
        {editingId ? "✓ 日次記録を更新" : "✓ 日次記録を保存"}
      </button>

      {lastSaved && (
        <div style={{ ...cardStyle, background: palette.cream, marginTop: 10 }}>
          <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16 }}>
            {lastSaved.catPhoto} {lastSaved.catName} の記録を保存しました
          </div>
          <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 6 }}>
            {lastSaved.date} / ごはん量 {lastSaved.foodTotal}g / 飲水量 {lastSaved.waterTotal}ml / おやつ量 {lastSaved.snack} / うんち回数 {lastSaved.poop}回 / おしっこ回数 {lastSaved.pee}回
            {lastSaved.weightKg !== "" ? ` / 体重 ${Number(lastSaved.weightKg).toFixed(1)}kg` : ""}
          </div>
          <button
            onClick={onMoveHome}
            style={{
              marginTop: 10,
              width: "100%",
              borderRadius: 10,
              border: `1px solid ${palette.line}`,
              background: "transparent",
              color: palette.ink,
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ホーム画面へ戻る
          </button>
        </div>
      )}

      {editingId && (
        <button
          onClick={() => {
            setEditingId(null);
            setDraft(newLogDraft());
            setErrors([]);
            if (onShowMessage) onShowMessage("記録フォームを表示しました。");
            window.setTimeout(() => {
              scrollToLogForm();
            }, 0);
          }}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: 8,
            background: "transparent",
            color: palette.inkSoft,
            border: `1px solid ${palette.line}`,
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          新規記録モードに戻す
        </button>
      )}

      <div style={{ ...cardStyle, marginTop: 12 }}>
        <Label>記録一覧</Label>
        {sortedLogs.length === 0 && <div style={{ fontSize: 12, color: palette.inkSoft }}>まだ記録がありません。</div>}
        {sortedLogs.map((row) => (
          <div key={row.id} style={{ borderTop: `1px dashed ${palette.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700 }}>{row.date}</div>
              <span style={{ fontSize: 11, color: palette.inkSoft }}>{row.isPrivate ? "匿名共有" : "名前公開"}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              <Tag>ごはん量 {row.foodTotal}g</Tag>
              <Tag>飲水量 {row.waterTotal}ml</Tag>
              {row.weightKg !== "" && <Tag>体重 {Number(row.weightKg).toFixed(1)}kg</Tag>}
              <Tag>比率 {row.kibblePct}:{row.wetPct}</Tag>
              <Tag>おやつ量 {row.snack}</Tag>
              <Tag>うんち回数 {row.poop}回</Tag>
              <Tag>おしっこ回数 {row.pee}回</Tag>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <MiniButton onClick={() => startEdit(row)}>編集</MiniButton>
              <MiniButton onClick={() => deleteLog(cat.id, row.id)}>削除</MiniButton>
            </div>
          </div>
        ))}
      </div>

      <SevenDayStatusCard cat={cat} points={dailyPoints} />
    </div>
  );
}

function CommunityView() {
  const [filter, setFilter] = useState("全国");
  const filters = ["全国", "近く", "千葉県"];

  const filtered = useMemo(() => {
    if (filter === "近く" || filter === "千葉県") return communityCats.filter((c) => c.region.includes("千葉"));
    return communityCats;
  }, [filter]);

  return (
    <div>
      <SectionLabel left="ほかの猫ちゃん" right={`${filtered.length}匹`} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {filters.map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Pill>
        ))}
      </div>

      {filtered.map((cat, i) => (
        <div
          key={cat.id}
          style={{
            ...cardStyle,
            display: "flex",
            gap: 14,
            transform: i % 3 === 0 ? "rotate(-0.3deg)" : i % 3 === 1 ? "rotate(0.3deg)" : "none",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: palette.cream,
              border: `1px solid ${palette.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              flexShrink: 0,
            }}
          >
            {cat.photo}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700 }}>{cat.anonymous ? "ひみつの猫さん" : cat.name}</span>
              {cat.anonymous && <EyeOff size={12} color={palette.inkSoft} />}
            </div>
            <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 8 }}>
              {cat.region} · {cat.age}歳
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 11, color: palette.ink, flexWrap: "wrap" }}>
              <Tag>ごはん量 {cat.food}g</Tag>
              <Tag>おやつ量 {cat.snack}</Tag>
              <Tag>うんち回数 {cat.poop}回</Tag>
              <Tag>おしっこ回数 {cat.pee}回</Tag>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsView() {
  const [scope, setScope] = useState("全国");
  const scopes = ["千葉県", "関東", "全国"];

  const data =
    scope === "全国"
      ? { count: 12483, avgFood: 68, avgPoop: 1.4, avgPee: 3.1, popularRatio: { kibble: 65, wet: 35 } }
      : scope === "関東"
      ? { count: 4218, avgFood: 70, avgPoop: 1.3, avgPee: 3.2, popularRatio: { kibble: 68, wet: 32 } }
      : { count: 612, avgFood: 72, avgPoop: 1.5, avgPee: 3.0, popularRatio: { kibble: 62, wet: 38 } };

  return (
    <div>
      <SectionLabel left="統計" right="🌏" />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {scopes.map((s) => (
          <Pill key={s} active={scope === s} onClick={() => setScope(s)}>
            {s}
          </Pill>
        ))}
      </div>

      <div style={{ ...cardStyle, padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: palette.inkSoft, letterSpacing: "0.2em" }}>登録されている猫</div>
        <div style={{ fontFamily: fontDisplay, fontSize: 44, fontWeight: 700, color: palette.accent, lineHeight: 1.1 }}>
          {data.count.toLocaleString()}
          <span style={{ fontSize: 18, color: palette.ink, marginLeft: 4 }}>匹</span>
        </div>
        <div style={{ fontSize: 11, color: palette.inkSoft, marginTop: 4 }}>{scope}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label="平均ごはん" value={`${data.avgFood}g`} hint="1日あたり" />
        <StatCard label="平均うんち" value={`${data.avgPoop}回`} hint="1日あたり" />
        <StatCard label="平均おしっこ" value={`${data.avgPee}回`} hint="1日あたり" />
        <StatCard label="多い比率" value={`${data.popularRatio.kibble}:${data.popularRatio.wet}`} hint="カリカリ:ウェット" />
      </div>

      <div style={cardStyle}>
        <Label>みんなのごはん比率</Label>
        <RatioBar kibble={data.popularRatio.kibble} wet={data.popularRatio.wet} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: palette.inkSoft,
            marginTop: 6,
          }}
        >
          <span>カリカリ {data.popularRatio.kibble}%</span>
          <span>ウェット {data.popularRatio.wet}%</span>
        </div>
      </div>

      <div style={{ ...cardStyle, background: palette.cream, borderStyle: "dashed" }}>
        <div style={{ fontSize: 12, color: palette.inkSoft, lineHeight: 1.7 }}>
          💡 <b style={{ color: palette.ink }}>もなかちゃん</b>のごはんは{scope}平均より少し多めです。おやつの頻度は平均的でバランスがいいですね。
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { key: "home", icon: Home, label: "ホーム" },
    { key: "mycat", icon: Cat, label: "わが家" },
    { key: "log", icon: PlusCircle, label: "記録", primary: true },
    { key: "community", icon: Globe, label: "みんな" },
    { key: "stats", icon: BarChart3, label: "統計" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: palette.ink,
        borderRadius: 999,
        padding: "8px 12px",
        display: "flex",
        gap: 4,
        boxShadow: "0 8px 24px rgba(58,46,39,0.35)",
        zIndex: 10,
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.key;
        return (
          <button
            key={it.key}
            onClick={() => setTab(it.key)}
            style={{
              border: "none",
              background: active ? palette.accent : "transparent",
              color: active ? palette.cream : "#B0A091",
              padding: "10px 12px",
              borderRadius: 999,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              transition: "all 0.2s",
              minWidth: 52,
            }}
          >
            <Icon size={it.primary ? 22 : 18} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const cardStyle = {
  background: palette.cream,
  border: `1px solid ${palette.line}`,
  borderRadius: 14,
  padding: 18,
  marginBottom: 12,
  boxShadow: "0 2px 0 rgba(58,46,39,0.06), 0 8px 16px -8px rgba(58,46,39,0.15)",
};

const inputStyle = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  display: "block",
  boxSizing: "border-box",
  border: `1px solid ${palette.line}`,
  borderRadius: 8,
  background: "#fff",
  padding: "8px 10px",
  fontFamily: fontBody,
  fontSize: 13,
  color: palette.ink,
};

const devMenuCardStyle = {
  ...cardStyle,
  padding: 10,
};

const devMenuToggleStyle = {
  width: "100%",
  border: `1px solid ${palette.line}`,
  background: palette.cream,
  color: palette.inkSoft,
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 12,
  fontFamily: fontBody,
  fontWeight: 600,
  letterSpacing: "0.03em",
  textAlign: "left",
  cursor: "pointer",
};

function SectionLabel({ left, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        margin: "8px 4px 12px",
      }}
    >
      <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>— {left}</span>
      {right && <span style={{ fontSize: 11, color: palette.inkSoft }}>{right}</span>}
    </div>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: palette.inkSoft,
        marginBottom: 10,
        letterSpacing: "0.05em",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function InputRow({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function FormErrorList({ errors }) {
  if (!errors?.length) return null;
  return (
    <div style={{ background: "#FFF2F0", border: "1px solid #F2C4BC", color: "#A53C27", borderRadius: 8, fontSize: 12, padding: 8, marginBottom: 8 }}>
      {errors.map((e) => (
        <div key={e}>・{e}</div>
      ))}
    </div>
  );
}

function MiniButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${palette.line}`,
        background: palette.cream,
        color: palette.ink,
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 11,
        fontFamily: fontBody,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? palette.accent : palette.line}`,
        background: active ? palette.accent : "transparent",
        color: active ? palette.cream : palette.ink,
        fontFamily: fontBody,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        background: palette.cream,
        border: `1px solid ${palette.line}`,
        borderRadius: 6,
        padding: "3px 8px",
        fontSize: 11,
      }}
    >
      {children}
    </span>
  );
}

function StepNumberInput({ value, unit, min, max, step, color, onChange }) {
  const safeValue = Number.isFinite(value) ? value : min;
  const changeByStep = (delta) => onChange(Math.max(min, Math.min(max, safeValue + delta)));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: 700, color }}>{safeValue}</span>
        <span style={{ fontSize: 14, color: palette.inkSoft }}>{unit}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => changeByStep(-step)} style={counterBtn} aria-label={`${unit}を減らす`}>
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isNaN(parsed)) return;
            onChange(Math.max(min, Math.min(max, parsed)));
          }}
          style={{ ...inputStyle, textAlign: "center", fontWeight: 700, fontSize: 16, maxWidth: 120 }}
        />
        <button onClick={() => changeByStep(step)} style={counterBtn} aria-label={`${unit}を増やす`}>
          +
        </button>
      </div>
      <div style={{ fontSize: 11, color: palette.inkSoft, marginTop: 6 }}>
        {`±${step}${unit}ずつ調整できます`}
      </div>
    </div>
  );
}

function Counter({ label, value, setValue, unit }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setValue(Math.max(0, value - 1))} style={counterBtn}>
          −
        </button>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 54, justifyContent: "center" }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, textAlign: "center" }}>{value}</div>
          {unit && <div style={{ fontSize: 12, color: palette.inkSoft }}>{unit}</div>}
        </div>
        <button onClick={() => setValue(Math.min(20, value + 1))} style={counterBtn}>
          +
        </button>
      </div>
    </div>
  );
}

function RatioSelector({ value, onChange }) {
  const options = [
    { label: "カリカリだけ", kibble: 100, wet: 0 },
    { label: "カリカリ多め", kibble: 75, wet: 25 },
    { label: "半々", kibble: 50, wet: 50 },
    { label: "ウェット多め", kibble: 25, wet: 75 },
    { label: "ウェットだけ", kibble: 0, wet: 100 },
  ];
  const safe = Number.isFinite(value) ? value : 0;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((opt) => (
          <Pill key={opt.label} active={safe === opt.kibble} onClick={() => onChange(opt.kibble)}>
            {opt.label}
          </Pill>
        ))}
      </div>
      {!options.some((opt) => opt.kibble === safe) && (
        <div style={{ fontSize: 11, color: palette.inkSoft, marginTop: 8 }}>既存データの比率: カリカリ {safe}% / ウェット {100 - safe}%</div>
      )}
    </div>
  );
}

async function compressImageFile(file) {
  const readAsDataUrl = () =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("画像読み込みに失敗しました。"));
      reader.readAsDataURL(file);
    });

  const dataUrl = await readAsDataUrl();
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("画像の解析に失敗しました。"));
    el.src = dataUrl;
  });

  const maxSide = 320;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.75);
}

function CatAvatar({ cat, size = 64, fontSize = 34 }) {
  if (cat?.photoImage) {
    return (
      <img
        src={cat.photoImage}
        alt={`${cat.name}のプロフィール画像`}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }
  return <Cat size={Math.round(size * 0.65)} color={palette.ink} strokeWidth={1.8} />;
}

const counterBtn = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: `1px solid ${palette.line}`,
  background: palette.cream,
  fontSize: 18,
  cursor: "pointer",
  color: palette.ink,
};

function BigStat({ label, value, icon, small }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: palette.inkSoft, marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: fontDisplay, fontSize: small ? 20 : 28, fontWeight: 700, color: palette.ink }}>{value}</div>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, color: palette.accent }}>{value}</div>
      <div style={{ fontSize: 10, color: palette.inkSoft, marginTop: 2 }}>{hint}</div>
    </div>
  );
}

function RatioBar({ kibble, wet }) {
  return (
    <div
      style={{
        display: "flex",
        height: 14,
        borderRadius: 999,
        overflow: "hidden",
        border: `1px solid ${palette.line}`,
        background: palette.cream,
      }}
    >
      <div
        style={{
          width: `${kibble}%`,
          background: `repeating-linear-gradient(45deg, ${palette.accent}, ${palette.accent} 4px, ${palette.accentSoft} 4px, ${palette.accentSoft} 8px)`,
          transition: "width 0.3s",
        }}
      />
      <div
        style={{
          width: `${wet}%`,
          background: palette.leaf,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<CatHealthApp />);
