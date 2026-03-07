import { useState } from "react";

const CRITERIA = {
  location: {
    label: "Location",
    icon: "📍",
    options: [
      { label: "Dartmouth Lancaster", value: 10 },
      { label: "Halifax West", value: 8 },
      { label: "Dartmouth North", value: 8 },
      { label: "Dartmouth Downtown", value: 6 },
      { label: "Halifax North", value: 5 },
      { label: "Halifax", value: 3 },
    ],
  },
  orientation: {
    label: "Orientation",
    icon: "🧭",
    options: [
      { label: "South-facing", value: 10 },
      { label: "East-facing", value: 5 },
      { label: "West-facing", value: 5 },
      { label: "North-facing", value: -5 },
    ],
  },
  power: {
    label: "Power Source",
    icon: "⚡",
    options: [
      { label: "Dual: Electricity & Propane", value: 10 },
      { label: "Dual: Electricity & Oil", value: 7 },
      { label: "Oil only", value: 5 },
      { label: "Solely Electricity", value: 0 },
    ],
  },
  heating: {
    label: "Heating",
    icon: "🔥",
    options: [
      { label: "Electricity + Propane Fireplace", value: 10 },
      { label: "Electricity + Heat Pump", value: 7 },
      { label: "Electricity only", value: 0 },
    ],
  },
  driveway: {
    label: "Driveway",
    icon: "🚗",
    options: [
      { label: "Paved", value: 10 },
      { label: "Pavers", value: 7 },
      { label: "Gravelled", value: 5 },
    ],
  },
  garage: {
    label: "Garage",
    icon: "🏠",
    options: [
      { label: "Double Attached", value: 10 },
      { label: "Double", value: 8 },
      { label: "Single Attached", value: 5 },
      { label: "Single", value: 3 },
    ],
  },
  fence: {
    label: "Fence",
    icon: "🌿",
    options: [
      { label: "Wood Fence", value: 7 },
      { label: "Chain Link", value: 3 },
      { label: "No Fence", value: -5 },
    ],
  },
  roof: {
    label: "Roof Last Updated",
    icon: "🏗️",
    options: [
      { label: "Within 1 year", value: 10 },
      { label: "Within 5 years", value: 7 },
      { label: "Within 8 years", value: 5 },
      { label: "Around 10 years", value: 1 },
    ],
  },
  fireplace: {
    label: "Fireplace",
    icon: "🕯️",
    options: [
      { label: "Propane Fireplace", value: 5 },
      { label: "Conventional", value: 3 },
      { label: "Electric", value: 3 },
      { label: "None", value: -5 },
    ],
  },
};

const BASE_PRICE = 580000;
const MAX_SCORE = 82;
const MIN_SCORE = -3;

function formatCAD(n) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

function getScoreColor(pct) {
  if (pct >= 80) return "#5cb85c";
  if (pct >= 60) return "#a8c44a";
  if (pct >= 40) return "#f0a500";
  return "#e05555";
}

function getScoreLabel(pct, answered, total) {
  if (answered < total) return `${answered}/${total} answered`;
  if (pct >= 80) return "Excellent Match";
  if (pct >= 60) return "Good Match";
  if (pct >= 40) return "Fair Match";
  return "Below Average";
}

export default function HouseHuntScorer() {
  const [address, setAddress] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [scores, setScores] = useState({});
  const [saved, setSaved] = useState([]);
  const [activeTab, setActiveTab] = useState("score");

  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const answered = Object.keys(scores).length;
  const total = Object.keys(CRITERIA).length;

  const normalized = Math.max(0, (totalScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE));
  const offerPct = 0.83 + normalized * 0.19;
  const pct = normalized * 100;
  const color = getScoreColor(pct);

  const entered = parseFloat((listPrice || "").replace(/,/g, "")) || null;
  const baseOffer = Math.round((BASE_PRICE * offerPct) / 1000) * 1000;
  const adjustedOffer = entered ? Math.round((entered * offerPct) / 1000) * 1000 : null;
  const displayOffer = adjustedOffer || baseOffer;

  const handleSave = () => {
    if (!address) return;
    setSaved(prev => [
      {
        address,
        score: totalScore,
        pct: Math.round(pct),
        offer: displayOffer,
        list: entered,
        label: getScoreLabel(pct, answered, total),
        color,
        date: new Date().toLocaleDateString("en-CA"),
        breakdown: { ...scores },
      },
      ...prev,
    ]);
    setAddress("");
    setListPrice("");
    setScores({});
  };

  const circumference = 2 * Math.PI * 52;
  const dash = (Math.min(100, pct) / 100) * circumference;

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.logoWrap}>
          <div style={s.logoBox}>HRM</div>
          <div>
            <div style={s.appTitle}>House Hunt Scorer</div>
            <div style={s.appSub}>Halifax · Dartmouth Region</div>
          </div>
        </div>
        <div style={s.marketChip}>
          2-yr avg sold price &nbsp;<strong style={{ color: "#c9a84c" }}>$547K–$580K</strong>
        </div>
      </header>

      <div style={s.layout}>
        {/* ── Left: Criteria ── */}
        <div style={s.left}>
          {/* Property details */}
          <div style={s.card}>
            <div style={s.cardTitle}>🏡 Property Details</div>
            <input
              style={s.input}
              placeholder="Address (e.g. 42 Maple Dr, Dartmouth)"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <input
              style={s.input}
              placeholder="Listing price in CAD (optional)"
              value={listPrice}
              onChange={e => setListPrice(e.target.value)}
            />
          </div>

          {/* Criteria cards */}
          {Object.entries(CRITERIA).map(([key, cat]) => (
            <div key={key} style={s.card}>
              <div style={s.cardTitle}>
                {cat.icon} {cat.label}
                {scores[key] !== undefined && (
                  <span style={{
                    marginLeft: "auto",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: scores[key] > 0 ? "#5cb85c" : scores[key] < 0 ? "#e05555" : "#888",
                  }}>
                    {scores[key] > 0 ? `+${scores[key]}` : scores[key]}
                  </span>
                )}
              </div>
              <div style={s.optGrid}>
                {cat.options.map(opt => {
                  const sel = scores[key] === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setScores(p => ({ ...p, [key]: opt.value }))}
                      style={{ ...s.optBtn, ...(sel ? s.optBtnSel : {}) }}
                    >
                      <span style={s.optText}>{opt.label}</span>
                      <span style={{
                        ...s.optVal,
                        color: opt.value > 0 ? "#5cb85c" : opt.value < 0 ? "#e05555" : "#667",
                      }}>
                        {opt.value > 0 ? `+${opt.value}` : opt.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            style={{ ...s.saveBtn, opacity: address ? 1 : 0.4, cursor: address ? "pointer" : "default" }}
            onClick={handleSave}
            disabled={!address}
          >
            💾 Save Property
          </button>
        </div>

        {/* ── Right: Score + Offer ── */}
        <div style={s.right}>

          {/* Gauge card */}
          <div style={s.card}>
            <div style={s.cardTitle}>📊 Score</div>
            <div style={s.gaugeWrap}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="none" stroke="#1e2e3e" strokeWidth="10" />
                <circle
                  cx="65" cy="65" r="52"
                  fill="none"
                  stroke={answered === 0 ? "#2a3a4a" : color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${answered === 0 ? 0 : dash} ${circumference}`}
                  transform="rotate(-90 65 65)"
                  style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.3s" }}
                />
                <text x="65" y="60" textAnchor="middle" fill={answered === 0 ? "#445" : color} fontSize="28" fontWeight="bold" fontFamily="Georgia">
                  {answered === 0 ? "—" : totalScore}
                </text>
                <text x="65" y="78" textAnchor="middle" fill="#556677" fontSize="11" fontFamily="Georgia">
                  / {MAX_SCORE}
                </text>
              </svg>
            </div>
            <div style={{ ...s.matchLabel, color: answered === 0 ? "#556" : color }}>
              {getScoreLabel(pct, answered, total)}
            </div>

            {/* Mini breakdown bars */}
            {answered > 0 && (
              <div style={{ marginTop: 14 }}>
                {Object.entries(CRITERIA).map(([key, cat]) => {
                  const v = scores[key];
                  if (v === undefined) return null;
                  const maxV = Math.max(...cat.options.map(o => o.value));
                  const barPct = maxV > 0 ? Math.max(0, v / maxV) * 100 : 0;
                  return (
                    <div key={key} style={s.miniRow}>
                      <span style={s.miniLabel}>{cat.icon}</span>
                      <div style={s.miniBarBg}>
                        <div style={{
                          ...s.miniBarFill,
                          width: `${barPct}%`,
                          background: v < 0 ? "#e05555" : v === 0 ? "#445" : color,
                        }} />
                      </div>
                      <span style={{ ...s.miniVal, color: v > 0 ? "#5cb85c" : v < 0 ? "#e05555" : "#667" }}>
                        {v > 0 ? `+${v}` : v}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Offer card */}
          <div style={{ ...s.card, ...s.offerCard }}>
            <div style={s.cardTitle}>💰 Suggested Offer</div>
            <div style={s.offerBig}>{formatCAD(displayOffer)}</div>
            <div style={s.offerSub}>
              {Math.round(offerPct * 100)}% of market value
            </div>

            {entered && (
              <>
                <div style={s.divider} />
                <div style={s.offerRow}>
                  <span style={s.offerRowLbl}>List Price</span>
                  <span style={s.offerRowVal}>{formatCAD(entered)}</span>
                </div>
                <div style={s.offerRow}>
                  <span style={s.offerRowLbl}>Difference</span>
                  <span style={{
                    ...s.offerRowVal,
                    color: adjustedOffer < entered ? "#5cb85c" : "#e05555",
                    fontWeight: "bold",
                  }}>
                    {adjustedOffer < entered
                      ? `${formatCAD(entered - adjustedOffer)} under list`
                      : `${formatCAD(adjustedOffer - entered)} over list`}
                  </span>
                </div>
              </>
            )}

            <div style={s.offerNote}>
              Based on 2-year HRM sold avg ($547K–$580K).<br />
              Score adjusts offer ±19% from market baseline.
            </div>
          </div>

          {/* Saved properties */}
          {saved.length > 0 && (
            <div style={s.card}>
              <div style={s.cardTitle}>🗂 Saved Properties</div>
              {saved.map((h, i) => (
                <div key={i} style={s.savedItem}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={s.savedAddr}>{h.address}</div>
                    <div style={{ ...s.savedScore, color: h.color }}>{h.score}</div>
                  </div>
                  <div style={s.savedMeta}>
                    <span style={{ color: h.color }}>{h.label}</span>
                    <span style={s.savedDot}>·</span>
                    <span>Offer: <strong style={{ color: "#c9a84c" }}>{formatCAD(h.offer)}</strong></span>
                    {h.list && (
                      <>
                        <span style={s.savedDot}>·</span>
                        <span>List: {formatCAD(h.list)}</span>
                      </>
                    )}
                  </div>
                  <div style={s.savedDate}>{h.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "#0d1a26",
    minHeight: "100vh",
    color: "#ddd5c5",
  },
  header: {
    background: "linear-gradient(135deg, #152030 0%, #0d1a26 100%)",
    borderBottom: "1px solid #c9a84c33",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 14 },
  logoBox: {
    width: 44, height: 44,
    borderRadius: 8,
    background: "linear-gradient(135deg, #c9a84c, #7a5c10)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "bold", fontSize: 13, color: "#fff", letterSpacing: 1,
  },
  appTitle: { fontSize: 20, color: "#ddd5c5", letterSpacing: 0.5 },
  appSub: { fontSize: 11, color: "#c9a84c", letterSpacing: 2, textTransform: "uppercase", marginTop: 1 },
  marketChip: {
    fontSize: 12, color: "#8899aa",
    background: "#ffffff0d",
    border: "1px solid #ffffff15",
    padding: "6px 14px", borderRadius: 20,
  },
  layout: {
    display: "flex", gap: 18, padding: 18,
    maxWidth: 1060, margin: "0 auto",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  left: { flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 12 },
  right: { flex: "0 1 290px", display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 80 },
  card: {
    background: "#152030",
    borderRadius: 12,
    padding: "14px 16px",
    border: "1px solid #1e2f40",
  },
  cardTitle: {
    fontSize: 11, fontWeight: "bold",
    color: "#c9a84c", letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
    display: "flex", alignItems: "center", gap: 6,
  },
  input: {
    width: "100%", background: "#0d1a26",
    border: "1px solid #1e2f40",
    borderRadius: 8, padding: "9px 12px",
    color: "#ddd5c5", fontSize: 13,
    marginBottom: 8, outline: "none",
    boxSizing: "border-box",
    fontFamily: "Georgia, serif",
  },
  optGrid: { display: "flex", flexDirection: "column", gap: 5 },
  optBtn: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#0d1a26",
    border: "1px solid #1e2f40",
    borderRadius: 7, padding: "8px 11px",
    cursor: "pointer", color: "#ddd5c5",
    transition: "border-color 0.15s, background 0.15s",
  },
  optBtnSel: {
    background: "#1a2d40",
    borderColor: "#c9a84c",
    boxShadow: "0 0 0 1px #c9a84c22",
  },
  optText: { fontSize: 12 },
  optVal: { fontSize: 12, fontFamily: "monospace", fontWeight: "bold" },
  saveBtn: {
    background: "linear-gradient(135deg, #c9a84c, #7a5c10)",
    border: "none", borderRadius: 10,
    padding: "13px 20px", color: "#fff",
    fontSize: 14, fontWeight: "bold",
    letterSpacing: 0.5, fontFamily: "Georgia, serif",
    transition: "opacity 0.2s",
  },
  gaugeWrap: { display: "flex", justifyContent: "center", marginBottom: 6 },
  matchLabel: { textAlign: "center", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  miniRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  miniLabel: { fontSize: 13, width: 20 },
  miniBarBg: { flex: 1, height: 4, background: "#1e2f40", borderRadius: 2, overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: 2, transition: "width 0.4s ease, background 0.3s" },
  miniVal: { fontSize: 10, fontFamily: "monospace", fontWeight: "bold", width: 24, textAlign: "right" },
  offerCard: {},
  offerBig: { fontSize: 30, fontWeight: "bold", color: "#c9a84c", marginBottom: 2 },
  offerSub: { fontSize: 11, color: "#556677", marginBottom: 6 },
  divider: { height: 1, background: "#1e2f40", margin: "10px 0" },
  offerRow: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 },
  offerRowLbl: { color: "#667788" },
  offerRowVal: { fontFamily: "monospace" },
  offerNote: {
    fontSize: 10, color: "#445566", lineHeight: 1.6,
    marginTop: 10, borderTop: "1px solid #1e2f40", paddingTop: 10,
  },
  savedItem: {
    borderBottom: "1px solid #1e2f40", paddingBottom: 10, marginBottom: 10,
  },
  savedAddr: { fontSize: 12, color: "#ddd5c5", flex: 1, marginRight: 8 },
  savedScore: { fontSize: 20, fontWeight: "bold", fontFamily: "monospace" },
  savedMeta: { fontSize: 11, color: "#667788", marginTop: 3, display: "flex", flexWrap: "wrap", gap: 4 },
  savedDot: { color: "#334455" },
  savedDate: { fontSize: 10, color: "#334455", marginTop: 2 },
};
