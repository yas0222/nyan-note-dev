import React, { useEffect, useMemo, useState } from "react";
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoKey(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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

  const selectedDisplayLog = selectedCat ? todayLogByCat[selectedCat.id] || newLogDraft() : newLogDraft();

  const updateCats = (updater) => {
    setData((prev) => ({ ...prev, cats: updater(prev.cats) }));
  };

  const addCat = (form) => {
    const errors = validateCatForm(form);
    if (errors.length) return { ok: false, errors };

    setData((prev) => {
      const id = prev.nextIds.cat + 1;
      return {
        ...prev,
        cats: [
          ...prev.cats,
          {
            id,
            name: form.name.trim(),
            age: Number(form.age),
            gender: form.gender,
            coatPattern: form.coatPattern.trim(),
            photo: form.photo.trim() || "🐱",
            region: form.region.trim(),
            currentWeightKg: formatWeight(form.currentWeightKg) ?? "",
            source: "user",
          },
        ],
        nextIds: { ...prev.nextIds, cat: id },
      };
    });
    setMessage("猫プロフィールを追加しました。");
    return { ok: true };
  };

  const updateCat = (catId, form) => {
    const errors = validateCatForm(form);
    if (errors.length) return { ok: false, errors };

    updateCats((cats) =>
      cats.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              name: form.name.trim(),
              age: Number(form.age),
              gender: form.gender,
              coatPattern: form.coatPattern.trim(),
              photo: form.photo.trim() || "🐱",
              region: form.region.trim(),
              currentWeightKg: formatWeight(form.currentWeightKg) ?? "",
            }
          : cat,
      ),
    );
    setMessage("猫プロフィールを更新しました。");
    return { ok: true };
  };

  const deleteCat = (catId) => {
    if (!window.confirm("この猫プロフィールを削除しますか？\n関連する記録も削除されます。")) return;
    setData((prev) => {
      const nextCats = prev.cats.filter((c) => c.id !== catId);
      const nextLogs = { ...prev.logsByCat };
      delete nextLogs[catId];
      return { ...prev, cats: nextCats, logsByCat: nextLogs };
    });
    setMessage("猫プロフィールを削除しました。");
  };

  const saveLog = (catId, draft, editingId) => {
    const normalizedDraft = { ...draft, weightKg: formatWeight(draft.weightKg) ?? "" };
    const errors = validateLogForm(normalizedDraft);
    if (errors.length) return { ok: false, errors };

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
            ? { ...row, ...normalizedDraft }
            : row,
        );
      } else {
        const id = prev.nextIds.log + 1;
        nextRows = [...rows, { id, ...normalizedDraft, source: "user" }];
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

    setMessage(editingId ? "日次記録を更新しました。" : "日次記録を追加しました。");
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
            onDeleteSampleOnly={deleteSampleOnly}
            onResetAllData={resetAllData}
          />
        )}
        {tab === "mycat" && selectedCat && <MyCatView cat={selectedCat} log={selectedDisplayLog} />}
        {tab === "mycat" && !selectedCat && <EmptyCatPrompt onMoveLog={() => setTab("home")} />}
        {tab === "log" && selectedCat && (
          <LogView
            cat={selectedCat}
            logs={data.logsByCat[selectedCat.id] || []}
            saveLog={saveLog}
            deleteLog={deleteLog}
            cats={data.cats}
            setSelectedCat={(c) => setSelectedCatId(c.id)}
            onMoveHome={() => setTab("home")}
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

function HomeView({ cats, todayLogByCat, onPick, onAddCat, onUpdateCat, onDeleteCat, onDeleteSampleOnly, onResetAllData }) {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const [showAdd, setShowAdd] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "♀",
    coatPattern: "",
    photo: "🐱",
    region: "",
    currentWeightKg: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      age: "",
      gender: "♀",
      coatPattern: "",
      photo: "🐱",
      region: "",
      currentWeightKg: "",
    });
    setErrors([]);
  };

  const beginEdit = (cat) => {
    setEditingCatId(cat.id);
    setShowAdd(false);
    setErrors([]);
    setForm({
      name: cat.name,
      age: String(cat.age),
      gender: cat.gender,
      coatPattern: cat.coatPattern ?? "",
      photo: cat.photo,
      region: cat.region,
      currentWeightKg: cat.currentWeightKg ?? "",
    });
  };

  const submit = () => {
    const result = editingCatId ? onUpdateCat(editingCatId, form) : onAddCat(form);
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
                {cat.photo}
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
        <div style={cardStyle}>
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
          <InputRow label="写真(絵文字)">
            <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} style={inputStyle} />
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

      <div style={{ ...cardStyle, borderStyle: "dashed" }}>
        <Label>データ管理</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <MiniButton onClick={onDeleteSampleOnly}>サンプルだけ削除</MiniButton>
          <MiniButton onClick={onResetAllData}>全データをリセット</MiniButton>
        </div>
      </div>
    </div>
  );
}

function MyCatView({ cat, log }) {
  return (
    <div>
      <SectionLabel left={`${cat.name}の手帳`} right="きょう" />

      <div style={{ ...cardStyle, textAlign: "center", padding: "32px 20px" }}>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: getCatAvatarColor(cat),
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            boxShadow: "inset 0 -8px 16px rgba(0,0,0,0.12)",
          }}
        >
          {cat.photo}
        </div>
        <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, marginTop: 12 }}>{cat.name}</div>
        <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 4, letterSpacing: "0.1em" }}>
          {cat.age}さい · {cat.gender} · {cat.region}
        </div>
        <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 4 }}>毛色・柄 {cat.coatPattern?.trim() || "未設定"}</div>
        {cat.currentWeightKg && <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 6 }}>現在の体重 {cat.currentWeightKg}kg</div>}
      </div>

      <SectionLabel left="ごはん" />
      <div style={cardStyle}>
        <BigStat label="合計" value={`${log.foodTotal}g`} icon={<Utensils size={16} />} />
        <RatioBar kibble={log.kibblePct} wet={log.wetPct} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={cardStyle}>
          <BigStat label="おやつ" value={log.snack} icon={<Cookie size={16} />} small />
        </div>
        <div style={cardStyle}>
          <BigStat label="飲水量" value={`${log.waterTotal} ml`} icon={<Droplet size={16} />} small />
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 12 }}>
        <BigStat label="排泄" value={`うんち回数 ${log.poop}回 / おしっこ回数 ${log.pee}回`} icon={<Droplet size={16} />} small />
      </div>
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

function LogView({ cat, logs, saveLog, deleteLog, cats, setSelectedCat, onMoveHome }) {
  const [draft, setDraft] = useState(newLogDraft());
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const today = logs.find((l) => l.date === todayKey());
    setDraft(hydrateLogDraft(today));
    setEditingId(today?.id || null);
    setErrors([]);
  }, [cat.id, logs]);

  const setKibble = (v) => setDraft({ ...draft, kibblePct: v, wetPct: 100 - v });

  const onSubmit = () => {
    const result = saveLog(cat.id, draft, editingId);
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
            <span style={{ marginRight: 6 }}>{c.photo}</span>
            {c.name}
          </button>
        ))}
      </div>

      <div style={cardStyle}>
        <Label>📅 記録日</Label>
        <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={inputStyle} />
      </div>

      <div style={cardStyle}>
        <Label>🍚 一日のエサの量</Label>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: 700, color: palette.accent }}>{draft.foodTotal}</span>
          <span style={{ fontSize: 14, color: palette.inkSoft }}>g</span>
        </div>
        <input
          type="range"
          min={0}
          max={150}
          value={draft.foodTotal}
          onChange={(e) => setDraft({ ...draft, foodTotal: +e.target.value })}
          style={{ width: "100%", accentColor: palette.accent }}
        />

        <div style={{ marginTop: 20 }}>
          <Label>カリカリ / ウェット の比率</Label>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: palette.inkSoft, marginBottom: 6 }}>
            <span>カリカリ {draft.kibblePct}%</span>
            <span>ウェット {draft.wetPct}%</span>
          </div>
          <RatioBar kibble={draft.kibblePct} wet={draft.wetPct} />
          <input
            type="range"
            min={0}
            max={100}
            value={draft.kibblePct}
            onChange={(e) => setKibble(+e.target.value)}
            style={{ width: "100%", accentColor: palette.leaf, marginTop: 8 }}
          />
        </div>
      </div>

      <div style={cardStyle}>
        <Label>💧 一日の飲水量</Label>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: 700, color: palette.leaf }}>{draft.waterTotal}</span>
          <span style={{ fontSize: 14, color: palette.inkSoft }}>ml</span>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          value={draft.waterTotal}
          onChange={(e) => setDraft({ ...draft, waterTotal: +e.target.value })}
          style={{ width: "100%", accentColor: palette.leaf }}
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
        <Label>みんなのエサ比率</Label>
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
  border: `1px solid ${palette.line}`,
  borderRadius: 8,
  background: "#fff",
  padding: "8px 10px",
  fontFamily: fontBody,
  fontSize: 13,
  color: palette.ink,
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
