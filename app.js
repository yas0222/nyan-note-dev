import React, { useMemo, useState } from "react";
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

const myCats = [
  {
    id: 1,
    name: "もなか",
    age: 3,
    gender: "♀",
    photo: "🐱",
    color: "#E8B86D",
    region: "千葉県浦安市",
  },
  {
    id: 2,
    name: "あんこ",
    age: 7,
    gender: "♂",
    photo: "🐈‍⬛",
    color: "#5C5048",
    region: "千葉県浦安市",
  },
];

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

function CatHealthApp() {
  const [tab, setTab] = useState("home");
  const [selectedCat, setSelectedCat] = useState(myCats[0]);
  const [todayLog, setTodayLog] = useState({
    foodTotal: 70,
    kibblePct: 70,
    wetPct: 30,
    snack: "ふつう",
    poop: 1,
    pee: 3,
    isPrivate: false,
  });

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
        {tab === "home" && (
          <HomeView
            cats={myCats}
            onPick={(c) => {
              setSelectedCat(c);
              setTab("mycat");
            }}
          />
        )}
        {tab === "mycat" && <MyCatView cat={selectedCat} log={todayLog} />}
        {tab === "log" && (
          <LogView
            cat={selectedCat}
            log={todayLog}
            setLog={setTodayLog}
            cats={myCats}
            setSelectedCat={setSelectedCat}
          />
        )}
        {tab === "community" && <CommunityView />}
        {tab === "stats" && <StatsView />}
      </main>

      <BottomNav tab={tab} setTab={setTab} />
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

function HomeView({ cats, onPick }) {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div>
      <SectionLabel left="今日の記録" right={dateStr} />
      {cats.map((cat, i) => (
        <button
          key={cat.id}
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
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: cat.color,
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
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: palette.leaf,
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              ✓ 今日の記録あり
            </div>
          </div>
          <div style={{ fontSize: 24, color: palette.inkSoft }}>›</div>
        </button>
      ))}

      <button
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
            background: cat.color,
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
        <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, marginTop: 12 }}>
          {cat.name}
        </div>
        <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 4, letterSpacing: "0.1em" }}>
          {cat.age}さい · {cat.gender} · {cat.region}
        </div>
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
          <BigStat label="うんち / おしっこ" value={`${log.poop} / ${log.pee}回`} icon={<Droplet size={16} />} small />
        </div>
      </div>
    </div>
  );
}

function LogView({ cat, log, setLog, cats, setSelectedCat }) {
  const setKibble = (v) => setLog({ ...log, kibblePct: v, wetPct: 100 - v });

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
        <Label>🍚 一日のエサの量</Label>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: 700, color: palette.accent }}>
            {log.foodTotal}
          </span>
          <span style={{ fontSize: 14, color: palette.inkSoft }}>g</span>
        </div>
        <input
          type="range"
          min={0}
          max={150}
          value={log.foodTotal}
          onChange={(e) => setLog({ ...log, foodTotal: +e.target.value })}
          style={{ width: "100%", accentColor: palette.accent }}
        />

        <div style={{ marginTop: 20 }}>
          <Label>カリカリ / ウェット の比率</Label>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: palette.inkSoft, marginBottom: 6 }}>
            <span>カリカリ {log.kibblePct}%</span>
            <span>ウェット {log.wetPct}%</span>
          </div>
          <RatioBar kibble={log.kibblePct} wet={log.wetPct} />
          <input
            type="range"
            min={0}
            max={100}
            value={log.kibblePct}
            onChange={(e) => setKibble(+e.target.value)}
            style={{ width: "100%", accentColor: palette.leaf, marginTop: 8 }}
          />
        </div>
      </div>

      <div style={cardStyle}>
        <Label>🍪 おやつの量</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["なし", "少なめ", "ふつう", "多め"].map((opt) => (
            <Pill key={opt} active={log.snack === opt} onClick={() => setLog({ ...log, snack: opt })}>
              {opt}
            </Pill>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <Label>💩 うんち / 💧 おしっこ の回数</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
          <Counter label="うんち" value={log.poop} setValue={(v) => setLog({ ...log, poop: v })} />
          <Counter label="おしっこ" value={log.pee} setValue={(v) => setLog({ ...log, pee: v })} />
        </div>
      </div>

      <div style={cardStyle}>
        <button
          onClick={() => setLog({ ...log, isPrivate: !log.isPrivate })}
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
            {log.isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            {log.isPrivate ? "名前を伏せて共有" : "名前ありで共有"}
          </span>
          <span
            style={{
              width: 44,
              height: 26,
              borderRadius: 999,
              background: log.isPrivate ? palette.inkSoft : palette.leaf,
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: log.isPrivate ? 21 : 3,
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
          {log.isPrivate
            ? "他のユーザーには地域と健康データだけが見えます"
            : "他の飼い主さんに名前と一緒にシェアされます"}
        </div>
      </div>

      <button
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
        ✓ 今日の記録を保存
      </button>
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
              <span style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700 }}>
                {cat.anonymous ? "ひみつの猫さん" : cat.name}
              </span>
              {cat.anonymous && <EyeOff size={12} color={palette.inkSoft} />}
            </div>
            <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 8 }}>
              {cat.region} · {cat.age}歳
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 11, color: palette.ink, flexWrap: "wrap" }}>
              <Tag>🍚 {cat.food}g</Tag>
              <Tag>🍪 {cat.snack}</Tag>
              <Tag>💩 {cat.poop}</Tag>
              <Tag>💧 {cat.pee}</Tag>
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
      <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>
        — {left}
      </span>
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

function Counter({ label, value, setValue }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: palette.inkSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setValue(Math.max(0, value - 1))} style={counterBtn}>
          −
        </button>
        <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, minWidth: 32, textAlign: "center" }}>
          {value}
        </div>
        <button onClick={() => setValue(value + 1)} style={counterBtn}>
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
      <div style={{ fontFamily: fontDisplay, fontSize: small ? 20 : 28, fontWeight: 700, color: palette.ink }}>
        {value}
      </div>
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
