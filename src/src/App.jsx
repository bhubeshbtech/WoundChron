import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   STORAGE  (per-user, keyed by uid)
───────────────────────────────────────────────────────────── */
const store = {
  async get(uid, key) {
    try { return JSON.parse(localStorage.getItem(`${uid}:${key}`)); } 
    catch { return null; }
  },
  async set(uid, key, val) {
    try { localStorage.setItem(`${uid}:${key}`, JSON.stringify(val)); } 
    catch(e) { console.error(e); }
  },
  async list(uid, prefix) {
    try {
      return Object.keys(localStorage)
        .filter(k => k.startsWith(`${uid}:${prefix}`));
    } catch { return []; }
  },
};
```

---

**Step 4 — Paste into GitHub**

Select **all the code** in Notepad (`Ctrl+A` → `Ctrl+C`) and paste it into the GitHub editor (`Ctrl+V`).

---

**Step 5 — Commit**
- Click **"Commit changes..."**
- Click the green **"Commit changes"** button in the popup

---

**After all 5 files are created your repo should look like this:**
```
WoundChron/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── App.jsx        ✅
│   └── main.jsx       ✅
├── index.html         ✅
├── package.json       ✅
└── vite.config.js     ✅
```

Once all files are committed, go to the **Actions** tab in your repo — you'll see the build running. After ~2 minutes it turns **green ✅** and your site is live at:
```
https://YOUR-USERNAME.github.io/woundchron/
/* ─────────────────────────────────────────────────────────────
   WOUND ANALYSIS ENGINE  (Python pipeline port)
───────────────────────────────────────────────────────────── */
const analyseWound = (imgUrl, day, sessions, expectedRate = 5) => {
  const seed = imgUrl ? imgUrl.length % 997 : Math.random() * 997;
  const rng  = (mn, mx, off = 0) => mn + ((seed + off) % (mx - mn));
  const baseArea  = sessions.length === 0 ? rng(800, 1600, 0) : sessions[0].area_mm2;
  const rateBoost = expectedRate / 10;
  const decay     = Math.exp(-0.06 * day * (0.8 + rateBoost * 0.4)) + rng(0, 0.04, day * 7);
  const area_mm2  = +(baseArea * Math.max(decay, 0.06) + rng(0, 12, day)).toFixed(2);
  const width_mm  = +(Math.sqrt(area_mm2) * 0.9 + rng(0, 3, day * 3)).toFixed(2);
  const init_area = sessions.length > 0 ? sessions[0].area_mm2 : area_mm2;
  const prev_area = sessions.length > 0 ? sessions[sessions.length - 1].area_mm2 : area_mm2;
  const closure_pct  = day === 0 ? 0 : +Math.min(100, Math.max(0, ((init_area - area_mm2) / init_area) * 100)).toFixed(2);
  const healing_rate = day === 0 ? 0 : +(prev_area - area_mm2).toFixed(2);
  const stage =
    day === 0        ? "Baseline" :
    closure_pct < 20 ? "Inflammatory Stage" :
    closure_pct < 70 ? "Proliferative Stage" : "Remodeling Stage";
  const age_est =
    closure_pct < 20 ? (day === 0 ? "Day 0 (Baseline)" : "0–3 days") :
    closure_pct < 50 ? "4–7 days" :
    closure_pct < 80 ? "8–21 days" : ">21 days";
  let sys_status = "Healing Normal";
  const all = [...sessions, { closure_pct, healing_rate }];
  if (all.length >= 14 && closure_pct < 30) sys_status = "CHRONIC WOUND ALERT";
  if (all.length >= 5 && all.slice(-5).map(s => s.healing_rate).every(r => r < 0.5)) sys_status = "CHRONIC WOUND ALERT";
  return { day, area_mm2, width_mm, closure_pct, healing_rate, stage, age_est, sys_status, ts: Date.now() };
};

/* ─────────────────────────────────────────────────────────────
   WOUNDCHRON LOGO  — clock face with wound spiral motif
───────────────────────────────────────────────────────────── */
const WCLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer ring */}
    <circle cx="24" cy="24" r="21" stroke="#3b82f6" strokeWidth="2.4" fill="#0a1628"/>
    {/* Inner subtle ring */}
    <circle cx="24" cy="24" r="16" stroke="#1e3a5f" strokeWidth="0.8" fill="none"/>
    {/* Hour ticks */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
      const rad = (a - 90) * Math.PI / 180;
      const isMajor = a % 90 === 0;
      return <line key={a}
        x1={24 + (isMajor?17:18.5)*Math.cos(rad)} y1={24 + (isMajor?17:18.5)*Math.sin(rad)}
        x2={24 + 20.5*Math.cos(rad)}               y2={24 + 20.5*Math.sin(rad)}
        stroke={isMajor?"#3b82f6":"#1e3a5f"} strokeWidth={isMajor?2:0.8} strokeLinecap="round"/>;
    })}
    {/* Hour hand — pointing ~10 o'clock */}
    <line x1="24" y1="24" x2="15.5" y2="13.5" stroke="#60a5fa" strokeWidth="2.4" strokeLinecap="round"/>
    {/* Minute hand — pointing ~2 o'clock */}
    <line x1="24" y1="24" x2="33.5" y2="16.5" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round"/>
    {/* Second hand accent */}
    <line x1="24" y1="24" x2="24" y2="10.5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    {/* Center hub */}
    <circle cx="24" cy="24" r="2.5" fill="#3b82f6"/>
    <circle cx="24" cy="24" r="1.2" fill="#1e40af"/>
    {/* Wound spiral (lower half) — represents wound contraction over time */}
    <path d="M24 31 Q28.5 32.5 27 37 Q23.5 40.5 18.5 37.5 Q13.5 33 17 28 Q20.5 23 25.5 25.5 Q29 28 27.5 32"
      stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeDasharray="2 1"/>
    {/* Healing arrow tip */}
    <path d="M21 38.5 L18.5 37 L21.5 36" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   GOOGLE ACCOUNT PICKER
───────────────────────────────────────────────────────────── */
const GOOGLE_ACCOUNTS = [
  { uid:"g_001", name:"Dr. Priya Sharma",    email:"priya.sharma@gmail.com",   avatar:"PS", role:"researcher", provider:"google", col:"#1d4ed8" },
  { uid:"g_002", name:"Dr. James Whitfield", email:"j.whitfield@gmail.com",    avatar:"JW", role:"doctor",     provider:"google", col:"#065f46" },
  { uid:"g_003", name:"Carlos Mendez",       email:"c.mendez@gmail.com",       avatar:"CM", role:"patient",    provider:"google", col:"#7c3aed" },
  { uid:"g_004", name:"Dr. Aiko Tanaka",     email:"aiko.tanaka@research.org", avatar:"AT", role:"researcher", provider:"google", col:"#b45309" },
];

const GooglePicker = ({ onSelect, onClose }) => (
  <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(4px)" }}/>
    <div style={{ position:"relative", width:380, background:"#fff", borderRadius:28, overflow:"hidden",
      boxShadow:"0 24px 80px rgba(0,0,0,.5)", fontFamily:"'Google Sans',DM Sans,sans-serif",
      animation:"pickerIn .25s cubic-bezier(.22,1,.36,1)" }}>
      <style>{`@keyframes pickerIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div style={{ padding:"28px 28px 16px", textAlign:"center", borderBottom:"1px solid #f0f0f0" }}>
        <svg width="75" height="24" viewBox="0 0 272 92" style={{ marginBottom:12 }}>
          <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#FF4133" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
          <path fill="#4285F4" d="M225 3v65h-9.5V3z"/>
          <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
          <path fill="#EA4335" d="M35.29 41.41V32h31.86c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 35.17.36 16.45 16.32 1 35.14 1c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65z"/>
        </svg>
        <h2 style={{ fontSize:20, fontWeight:500, color:"#202124", margin:0 }}>Choose an account</h2>
        <p style={{ fontSize:13, color:"#5f6368", marginTop:4 }}>to continue to <strong>WoundChron</strong></p>
      </div>
      <div style={{ padding:"8px 0" }}>
        {GOOGLE_ACCOUNTS.map(acc => (
          <div key={acc.uid} onClick={() => onSelect(acc)}
            style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 24px", cursor:"pointer", transition:"background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background="#f8f9fa"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:acc.col, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white", flexShrink:0 }}>{acc.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:"#202124" }}>{acc.name}</div>
              <div style={{ fontSize:13, color:"#5f6368" }}>{acc.email}</div>
            </div>
            <div style={{ fontSize:11, padding:"2px 8px", background:acc.role==="patient"?"#fef3c7":"#e8f0fe", color:acc.role==="patient"?"#92400e":"#1a73e8", borderRadius:12, fontWeight:600, textTransform:"capitalize" }}>{acc.role}</div>
          </div>
        ))}
        <div onClick={onClose}
          style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 24px", cursor:"pointer", transition:"background .15s", borderTop:"1px solid #f0f0f0", marginTop:4 }}
          onMouseEnter={e => e.currentTarget.style.background="#f8f9fa"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
          <div style={{ width:40, height:40, borderRadius:"50%", border:"1px solid #dadce0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
          </div>
          <div style={{ fontSize:14, color:"#1a73e8", fontWeight:500 }}>Use another account</div>
        </div>
      </div>
      <div style={{ padding:"12px 24px 20px", borderTop:"1px solid #f0f0f0", display:"flex", justifyContent:"center", gap:20 }}>
        {["Privacy Policy","Terms of Service"].map(t => <span key={t} style={{ fontSize:11, color:"#5f6368", cursor:"pointer" }}>{t}</span>)}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
const Ic = ({ d, size=18, c="currentColor", sw=1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i)=><path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);
const I = {
  dash:     "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  upload:   "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  plus:     "M12 5v14M5 12h14",
  clock:    "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
  trending: "M23 6l-9.5 9.5-5-5L1 18",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  report:   "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  pill:     ["M10.5 3.75a6 6 0 100 12 6 6 0 000-12z","M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
};

/* ─────────────────────────────────────────────────────────────
   MINI COMPONENTS
───────────────────────────────────────────────────────────── */
const SparkLine = ({ data, color, h=70 }) => {
  if (!data?.length) return null;
  const w=260, pad=4, max=Math.max(...data)||1, min=Math.min(...data), range=max-min||1;
  const pts = data.map((v,i) => `${pad+(i/Math.max(data.length-1,1))*(w-pad*2)},${h-pad-((v-min)/range)*(h-pad*2)}`).join(" ");
  const lp = pts.split(" ").pop();
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={`${pad},${h} ${pts} ${w-pad},${h}`} fill={color} fillOpacity="0.12"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {lp && <circle cx={lp.split(",")[0]} cy={lp.split(",")[1]} r="4" fill={color}/>}
    </svg>
  );
};

const RadialGauge = ({ value, max=100, color, label, size=96 }) => {
  const r=36, cx=50, cy=50, circ=2*Math.PI*r, dash=circ*Math.min(value/max,1);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="7"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition:"stroke-dasharray 1s ease" }}/>
        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="DM Mono,monospace">
          {Math.round(value)}%
        </text>
      </svg>
      <span style={{ fontSize:11, color:"#64748b", textAlign:"center" }}>{label}</span>
    </div>
  );
};

const ConfBar = ({ label, value, color }) => (
  <div style={{ marginBottom:10 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
      <span style={{ fontSize:12, color:"#94a3b8" }}>{label}</span>
      <span style={{ fontSize:12, color, fontFamily:"DM Mono,monospace", fontWeight:700 }}>{(value*100).toFixed(1)}%</span>
    </div>
    <div style={{ height:4, background:"#1e293b", borderRadius:99 }}>
      <div style={{ height:"100%", width:`${value*100}%`, background:color, borderRadius:99, transition:"width 1s ease" }}/>
    </div>
  </div>
);

const StageBadge = ({ stage }) => {
  const m = {
    "Baseline":            { bg:"#0f2a4a", border:"#3b82f6", text:"#93c5fd" },
    "Inflammatory Stage":  { bg:"#450a0a", border:"#ef4444", text:"#fca5a5" },
    "Proliferative Stage": { bg:"#1a2e1a", border:"#22c55e", text:"#86efac" },
    "Remodeling Stage":    { bg:"#2d1a0e", border:"#f97316", text:"#fdba74" },
  };
  const c = m[stage] || m["Baseline"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", background:c.bg, border:`1px solid ${c.border}`, borderRadius:99, fontSize:11, fontWeight:700, color:c.text, fontFamily:"DM Mono,monospace" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.border, display:"inline-block" }}/>
      {stage}
    </span>
  );
};

const Card = ({ children, style={}, glow }) => (
  <div style={{ background:"linear-gradient(135deg,#0f172a,#1a2540)", border:`1px solid ${glow?glow+"44":"#1e293b"}`, borderRadius:14, padding:20, boxShadow:glow?`0 0 28px ${glow}18`:"0 2px 12px #00000030", ...style }}>
    {children}
  </div>
);

const MEDICAL_ROLES = ["doctor","researcher","nurse","clinician"];
const isMedicalRole = r => MEDICAL_ROLES.includes((r||"").toLowerCase());

/* ─────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;700&family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
  input,select,textarea{outline:none;font-family:'DM Sans',sans-serif}
  input:focus,select:focus,textarea:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px #3b82f618!important}
  .btn-p{background:linear-gradient(135deg,#1d4ed8,#3b82f6);border:none;color:white;padding:10px 18px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:7px}
  .btn-p:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px #3b82f638}
  .btn-p:disabled{opacity:.5;cursor:not-allowed}
  .btn-g{background:transparent;border:1px solid #334155;color:#94a3b8;padding:9px 16px;border-radius:9px;font-size:13px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:7px}
  .btn-g:hover{background:#1e293b;color:white}
  .nav-i{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:9px;cursor:pointer;transition:all .2s;color:#64748b;font-size:13px;font-weight:500;border:none;background:none;width:100%}
  .nav-i:hover{background:#1e293b;color:#94a3b8}
  .nav-i.active{background:linear-gradient(135deg,#1d4ed820,#3b82f628);color:#60a5fa;border:1px solid #3b82f628}
  .inp{width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 12px;font-size:13px;color:white;transition:all .2s}
  .lbl{font-size:11px;color:#475569;font-family:'DM Mono',monospace;display:block;margin-bottom:5px;letter-spacing:.04em}
  .dz{border:2px dashed #1e293b;border-radius:11px;padding:28px;text-align:center;cursor:pointer;transition:all .2s}
  .dz:hover{border-color:#3b82f6;background:#3b82f608}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#1e293b;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#3b82f6;cursor:pointer}
  .spin{animation:spin 1s linear infinite}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .fade-in{animation:fadeIn .4s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
  .trow:hover{background:#1e293b40!important;cursor:pointer}
  @media(max-width:860px){.sb{width:58px!important}.nl{display:none!important}}
`;

/* ─────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────── */
export default function App() {
  const [view,  setView]  = useState("login");
  const [user,  setUser]  = useState(null);
  const [nav,   setNav]   = useState("dashboard");
  const [showPicker, setShowPicker] = useState(false);
  const [lf, setLF] = useState({ email:"", password:"", name:"", role:"doctor", isSignup:false });
  const [le, setLE] = useState("");

  const [sessions,  setSessions]  = useState([]);
  const [patients,  setPatients]  = useState([]);
  const [selPt, setSelPt] = useState(null);
  const [image,  setImage] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [reportGen, setReportGen] = useState(false);
  const fileRef = useRef();

  const blank = { name:"", age:"", condition:"", notes:"", drugName:"", drugClass:"", dose:"", expectedHealingRate:5, frequency:"once_daily" };
  const [pti, setPti] = useState(blank);

  const isM = isMedicalRole(user?.role);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setSessions(await store.get(user.uid,"sessions") || []);
      setPatients(await store.get(user.uid,"patients") || []);
    })();
  }, [user]);

  const saveSess = useCallback(async arr => { setSessions(arr); if(user) await store.set(user.uid,"sessions",arr); }, [user]);
  const savePts  = useCallback(async arr => { setPatients(arr); if(user) await store.set(user.uid,"patients",arr); }, [user]);

  const handleEmail = e => {
    e.preventDefault(); setLE("");
    if (!lf.email||!lf.password) { setLE("Please fill all required fields."); return; }
    if (lf.isSignup&&!lf.name)   { setLE("Please enter your name."); return; }
    const uid = "u_"+btoa(lf.email).replace(/[^a-z0-9]/gi,"").slice(0,12);
    setUser({ uid, name:lf.isSignup?lf.name:lf.email.split("@")[0], email:lf.email, role:lf.role, provider:"email", avatar:(lf.isSignup?lf.name:lf.email)[0].toUpperCase() });
    setView("app");
  };

  const handleGoogle = acc => { setUser(acc); setView("app"); setShowPicker(false); };
  const handleLogout = () => { setUser(null); setView("login"); setSessions([]); setPatients([]); setLastResult(null); setImage(null); };

  const handleImg = e => {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onloadend=()=>setImage({url:r.result,file:f}); r.readAsDataURL(f);
  };

  const runAnalysis = async () => {
    if (!image) { alert("Please upload a wound image."); return; }
    setAnalysing(true);
    await new Promise(r=>setTimeout(r,2400));
    const day    = sessions.length;
    const rate   = isM ? (pti.expectedHealingRate||5) : 5;
    const result = analyseWound(image.url, day, sessions, rate);
    const newS   = [...sessions, { ...result, imageUrl:image.url, ptInfo:{...pti}, drug:isM?pti.drugName:null }];
    await saveSess(newS);
    setLastResult(result);
    const nm = pti.name||user?.name;
    if (nm) {
      const ex = patients.find(p=>p.name.toLowerCase()===nm.toLowerCase());
      if (!ex) await savePts([...patients, { id:Date.now(), name:nm, age:pti.age, condition:pti.condition, drug:isM?pti.drugName:null, stage:result.stage, latestClosure:result.closure_pct, lastDay:day, sys_status:result.sys_status }]);
      else await savePts(patients.map(p=>p.name.toLowerCase()===nm.toLowerCase() ? {...p,stage:result.stage,latestClosure:result.closure_pct,lastDay:day,sys_status:result.sys_status} : p));
    }
    setAnalysing(false);
  };

  const exportCSV = () => {
    const h="Day,Area_mm2,Width_mm,Closure_pct,Healing_rate,Stage,Age_est,Drug,Status\n";
    const rows=sessions.map(s=>`${s.day},${s.area_mm2},${s.width_mm},${s.closure_pct},${s.healing_rate},${s.stage},${s.age_est},${s.drug||"N/A"},${s.sys_status}`).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([h+rows],{type:"text/csv"})); a.download=`woundchron_${user.uid}.csv`; a.click();
  };

  const exportReport = () => {
    setReportGen(true);
    setTimeout(()=>{
      const last=sessions[sessions.length-1];
      const txt=`WOUNDCHRON — WOUND HEALING REPORT\n${"═".repeat(50)}\nUser : ${user.name} (${user.email})\nRole : ${user.role}\nDate : ${new Date().toLocaleString()}\n\n${isM?`PATIENT  : ${pti.name||"N/A"} | Age: ${pti.age||"N/A"}\nCondition: ${pti.condition||"N/A"}\nDrug     : ${pti.drugName||"N/A"} | Class: ${pti.drugClass||"N/A"}\nDose     : ${pti.dose||"N/A"} | Freq: ${pti.frequency}\nExpected Rate: ${pti.expectedHealingRate}%/day`:`Patient: ${user.name}`}\n\nSESSION LOG (${sessions.length} entries)\n${"─".repeat(50)}\n${sessions.map(s=>`Day ${String(s.day).padEnd(2)} | ${s.area_mm2} mm² | ${s.closure_pct}% | ${s.stage} | ${s.sys_status}`).join("\n")}\n${"─".repeat(50)}\n${last?`LATEST: Day ${last.day} — ${last.stage} — ${last.sys_status}`:"No sessions."}\n\nNOTES: ${pti.notes||"None"}\n\nAI-generated. Review with a licensed clinician.`;
      const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain"})); a.download=`woundchron_${user.uid}_${Date.now()}.txt`; a.click();
      setReportGen(false);
    },1200);
  };

  const avgClosure = sessions.length ? +(sessions.reduce((s,x)=>s+x.closure_pct,0)/sessions.length).toFixed(1) : 0;
  const latestDay  = sessions.length ? sessions[sessions.length-1].day : 0;
  const chronicCt  = sessions.filter(s=>s.sys_status==="CHRONIC WOUND ALERT").length;
  const lastS      = sessions[sessions.length-1];

  /* ══ LOGIN ══ */
  if (view==="login") return (
    <div style={{ minHeight:"100vh", background:"#020817", display:"flex", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{CSS+`
        .lbtn{background:linear-gradient(135deg,#1d4ed8,#3b82f6);border:none;color:white;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;width:100%;display:flex;align-items:center;justify-content:center;gap:8px}
        .lbtn:hover{transform:translateY(-1px);box-shadow:0 6px 20px #3b82f640}
        .gbtn{background:#fff;color:#3c4043;border:1.5px solid #dadce0;font-weight:500;padding:11px 20px;border-radius:10px;font-size:14px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;width:100%;display:flex;align-items:center;justify-content:center;gap:10px}
        .gbtn:hover{background:#f8f9fa;box-shadow:0 1px 6px rgba(0,0,0,.2)}
        .divider{display:flex;align-items:center;gap:10px;margin:18px 0;color:#334155;font-size:12px}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:#1e293b}
        .linp{width:100%;background:#1e293b;border:1px solid #334155;border-radius:10px;padding:11px 14px;font-size:14px;color:white;transition:all .2s}
        .linp:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px #3b82f618!important}
        @keyframes glow{0%,100%{filter:drop-shadow(0 0 0px #3b82f600)}50%{filter:drop-shadow(0 0 14px #3b82f670)}}
        .lglow{animation:glow 3s ease-in-out infinite}
      `}</style>
      {showPicker && <GooglePicker onSelect={handleGoogle} onClose={()=>setShowPicker(false)}/>}

      {/* Left hero */}
      <div style={{ flex:1, background:"linear-gradient(155deg,#020817 0%,#0c1a35 55%,#091527 100%)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-120, left:-120, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,#1d4ed812,transparent 65%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:52 }}>
            <div className="lglow"><WCLogo size={56}/></div>
            <div style={{ fontSize:28, fontWeight:600, color:"white", fontFamily:"Fraunces,serif", lineHeight:1 }}>WoundChron</div>
          </div>
          <h1 style={{ fontSize:"clamp(28px,3.2vw,46px)", fontFamily:"Fraunces,serif", fontWeight:600, lineHeight:1.18, color:"white", marginBottom:18 }}>
            AI-Powered Wound<br/><em style={{ color:"#60a5fa", fontStyle:"italic" }}>Age Estimation</em><br/>& Healing Analysis
          </h1>
          <p style={{ fontSize:14, color:"#64748b", lineHeight:1.75, marginBottom:40, maxWidth:400 }}>
            Upload daily wound images. WoundChron runs an OpenCV segmentation pipeline, predicts healing stage, estimates wound age, and alerts for chronic conversion — stored securely per user.
          </p>
          {[
            { icon:I.activity, label:"Daily image upload & OpenCV wound segmentation", col:"#3b82f6" },
            { icon:I.trending, label:"Gilman–Barrandon healing rate tracking",          col:"#22c55e" },
            { icon:I.alert,    label:"Chronic wound early-detection & alerts",          col:"#f97316" },
          ].map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, padding:"10px 14px", background:"#ffffff06", borderRadius:10, border:"1px solid #ffffff07" }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`${f.col}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic d={f.icon} size={15} c={f.col}/></div>
              <span style={{ fontSize:13, color:"#94a3b8" }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ width:"clamp(360px,34%,460px)", background:"#0a0f1e", borderLeft:"1px solid #1e293b", display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <WCLogo size={32}/>
          <span style={{ fontSize:18, fontWeight:600, color:"white", fontFamily:"Fraunces,serif" }}>WoundChron</span>
        </div>
        <h2 style={{ fontFamily:"Fraunces,serif", fontSize:22, fontWeight:600, color:"white", marginBottom:4 }}>
          {lf.isSignup?"Create account":"Welcome back"}
        </h2>
        <p style={{ fontSize:13, color:"#475569", marginBottom:24 }}>
          {lf.isSignup?"Join the wound monitoring network":"Sign in to continue to WoundChron"}
        </p>

        <button className="gbtn" onClick={()=>setShowPicker(true)}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div className="divider">or continue with email</div>

        {le && <div style={{ background:"#450a0a", border:"1px solid #dc2626", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#fca5a5" }}>{le}</div>}

        <form onSubmit={handleEmail}>
          {lf.isSignup && <div style={{ marginBottom:14 }}><label className="lbl">FULL NAME</label><input className="linp" value={lf.name} onChange={e=>setLF({...lf,name:e.target.value})} placeholder="Dr. Jane Smith"/></div>}
          <div style={{ marginBottom:14 }}><label className="lbl">EMAIL</label><input className="linp" type="email" value={lf.email} onChange={e=>setLF({...lf,email:e.target.value})} placeholder="you@hospital.org"/></div>
          <div style={{ marginBottom:14 }}><label className="lbl">PASSWORD</label><input className="linp" type="password" value={lf.password} onChange={e=>setLF({...lf,password:e.target.value})} placeholder="••••••••"/></div>
          {lf.isSignup && (
            <div style={{ marginBottom:16 }}>
              <label className="lbl">ROLE</label>
              <select className="linp" value={lf.role} onChange={e=>setLF({...lf,role:e.target.value})}>
                <option value="doctor">Clinician / Doctor</option>
                <option value="researcher">Researcher</option>
                <option value="nurse">Nurse / Practitioner</option>
                <option value="patient">Patient</option>
              </select>
            </div>
          )}
          <button type="submit" className="lbtn" style={{ marginTop:4, marginBottom:14 }}>{lf.isSignup?"Create Account":"Sign In"}</button>
        </form>

        <p style={{ fontSize:13, color:"#475569", textAlign:"center" }}>
          {lf.isSignup?"Already have an account? ":"New here? "}
          <button onClick={()=>setLF({...lf,isSignup:!lf.isSignup})} style={{ background:"none", border:"none", color:"#60a5fa", fontSize:13, cursor:"pointer", fontWeight:600 }}>
            {lf.isSignup?"Sign In":"Create Account"}
          </button>
        </p>
        <div style={{ marginTop:20, padding:12, background:"#1e293b40", borderRadius:10, border:"1px solid #1e293b" }}>
          <p style={{ fontSize:11, color:"#475569", textAlign:"center", lineHeight:1.7 }}>
            🔬 Click <strong style={{ color:"#60a5fa" }}>Continue with Google</strong> to pick an account<br/>or use email. Each account's data is stored separately.
          </p>
        </div>
      </div>
    </div>
  );

  /* ══ MAIN APP ══ */
  const navItems=[
    {id:"dashboard",icon:I.dash,    label:"Dashboard"},
    {id:"analysis", icon:I.upload,  label:"New Analysis"},
    {id:"sessions", icon:I.activity,label:"Sessions"},
    {id:"patients", icon:I.user,    label:isM?"Patients":"My History"},
    {id:"reports",  icon:I.report,  label:"Reports"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#020817", fontFamily:"'DM Sans',sans-serif", display:"flex" }}>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <div className="sb" style={{ width:215, background:"#060d1c", borderRight:"1px solid #1e293b", display:"flex", flexDirection:"column", padding:"20px 10px", flexShrink:0, height:"100vh", position:"sticky", top:0, overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 6px", marginBottom:30 }}>
          <WCLogo size={32}/>
          <div className="nl">
            <div style={{ fontSize:15, fontWeight:600, color:"white", fontFamily:"Fraunces,serif", lineHeight:1.1 }}>WoundChron</div>
            <div style={{ fontSize:10, color:isM?"#3b82f6":"#22c55e", fontFamily:"DM Mono,monospace", marginTop:1 }}>
              {isM?"Medical View":"Patient View"}
            </div>
          </div>
        </div>
        <div style={{ flex:1 }}>
          <p className="nl" style={{ fontSize:10, color:"#334155", fontFamily:"DM Mono,monospace", letterSpacing:".1em", padding:"0 6px", marginBottom:6 }}>NAVIGATION</p>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setNav(item.id)} className={`nav-i ${nav===item.id?"active":""}`}>
              <Ic d={item.icon} size={15} c={nav===item.id?"#60a5fa":"currentColor"}/>
              <span className="nl">{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ borderTop:"1px solid #1e293b", paddingTop:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px", background:"#1e293b50", borderRadius:9, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${isM?"#1d4ed8,#3b82f6":"#065f46,#22c55e"})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, color:"white", fontWeight:700 }}>{user?.avatar||"U"}</div>
            <div className="nl" style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, color:"white", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize:10, color:"#475569", textTransform:"capitalize" }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-i" style={{ color:"#ef4444" }}>
            <Ic d={I.logout} size={15} c="#ef4444"/>
            <span className="nl">Sign Out</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, overflowY:"auto", padding:"28px 24px" }}>

        {/* ── DASHBOARD ── */}
        {nav==="dashboard" && (
          <div className="fade-in">
            <div style={{ marginBottom:26 }}>
              <h1 style={{ fontFamily:"Fraunces,serif", fontSize:30, fontWeight:600, color:"white" }}>Dashboard</h1>
              <p style={{ color:"#64748b", fontSize:13, marginTop:3 }}>
                Welcome, {user?.name} ·&nbsp;
                <span style={{ padding:"2px 8px", background:isM?"#1d4ed820":"#065f4620", color:isM?"#60a5fa":"#86efac", borderRadius:10, fontSize:11, fontFamily:"DM Mono,monospace" }}>
                  {isM?"Medical Portal":"Patient Portal"}
                </span>
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:14, marginBottom:22 }}>
              {[
                {label:"Sessions Logged", value:sessions.length,   sub:`Days 0–${latestDay}`,   col:"#3b82f6", icon:I.clock},
                {label:"Avg Closure",     value:`${avgClosure}%`,  sub:"wound contraction",     col:"#22c55e", icon:I.trending},
                {label:"Chronic Alerts",  value:chronicCt,         sub:"sessions flagged",      col:"#f97316", icon:I.alert},
                {label:"Records",         value:patients.length,   sub:"this account",          col:"#a78bfa", icon:I.user},
              ].map((s,i)=>(
                <div key={i} style={{ background:"linear-gradient(135deg,#0f172a,#1a2540)", border:`1px solid ${s.col}20`, borderRadius:12, padding:"16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:`${s.col}18`, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic d={s.icon} size={14} c={s.col}/></div>
                    <span style={{ fontSize:26, fontFamily:"DM Mono,monospace", fontWeight:700, color:"white" }}>{s.value}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>{s.label}</div>
                  <div style={{ fontSize:11, color:s.col, marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:22 }}>
              <Card>
                <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:4 }}>Wound Closure Over Time</h3>
                <p style={{ fontSize:12, color:"#475569", marginBottom:10 }}>% closure by session day</p>
                <SparkLine data={sessions.map(s=>s.closure_pct)} color="#22c55e" h={75}/>
                {!sessions.length && <p style={{ fontSize:12, color:"#334155", textAlign:"center", marginTop:8 }}>No sessions yet.</p>}
              </Card>
              <Card>
                <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:4 }}>Wound Area (mm²)</h3>
                <p style={{ fontSize:12, color:"#475569", marginBottom:10 }}>decreasing with treatment</p>
                <SparkLine data={sessions.map(s=>s.area_mm2)} color="#3b82f6" h={75}/>
              </Card>
            </div>
            {lastS && (
              <Card glow="#3b82f6">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white" }}>Latest Session — Day {lastS.day}</h3>
                  {lastS.sys_status==="CHRONIC WOUND ALERT" && (
                    <div style={{ background:"#450a0a", border:"1px solid #dc2626", borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:6 }}>
                      <Ic d={I.alert} size={14} c="#ef4444"/>
                      <span style={{ fontSize:12, color:"#fca5a5", fontWeight:700 }}>CHRONIC WOUND ALERT</span>
                    </div>
                  )}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
                  {[
                    {k:"Area",     v:`${lastS.area_mm2} mm²`,       col:"#3b82f6"},
                    {k:"Width",    v:`${lastS.width_mm} mm`,         col:"#a78bfa"},
                    {k:"Closure",  v:`${lastS.closure_pct}%`,        col:"#22c55e"},
                    {k:"Rate",     v:`${lastS.healing_rate} mm²/d`,  col:"#60a5fa"},
                    {k:"Age Est.", v:lastS.age_est,                  col:"#f59e0b"},
                    {k:"Status",   v:lastS.sys_status.includes("CHRONIC")?"Chronic Risk":"Normal", col:lastS.sys_status.includes("CHRONIC")?"#ef4444":"#22c55e"},
                    ...(lastS.drug&&isM?[{k:"Drug",v:lastS.drug,col:"#a78bfa"}]:[]),
                  ].map(m=>(
                    <div key={m.k} style={{ padding:"10px 12px", background:"#1e293b50", borderRadius:9 }}>
                      <div style={{ fontSize:10, color:"#475569", marginBottom:3 }}>{m.k}</div>
                      <div style={{ fontSize:13, fontFamily:"DM Mono,monospace", fontWeight:700, color:m.col }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14 }}><StageBadge stage={lastS.stage}/></div>
              </Card>
            )}
          </div>
        )}

        {/* ── ANALYSIS ── */}
        {nav==="analysis" && (
          <div className="fade-in">
            <div style={{ marginBottom:26 }}>
              <h1 style={{ fontFamily:"Fraunces,serif", fontSize:30, fontWeight:600, color:"white" }}>
                {isM?"New Wound Analysis":"Upload Your Wound Image"}
              </h1>
              <p style={{ color:"#64748b", fontSize:13, marginTop:3 }}>
                Day {sessions.length} will be recorded · {sessions.length===0?"Upload Day 0 (baseline) first":`Previous: Day ${sessions.length-1}`}&nbsp;
                <span style={{ fontSize:11, padding:"2px 8px", background:isM?"#1d4ed820":"#065f4620", color:isM?"#60a5fa":"#86efac", borderRadius:10, fontFamily:"DM Mono,monospace" }}>
                  {isM?"Medical View":"Patient View"}
                </span>
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
              {/* LEFT inputs */}
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <Card>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:14 }}>Wound Image — Day {sessions.length}</h3>
                  <div className="dz" onClick={()=>fileRef.current?.click()} style={{ position:"relative" }}>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:"none" }}/>
                    {image ? (
                      <div style={{ position:"relative" }}>
                        <img src={image.url} alt="wound" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:8, filter:"brightness(.9)" }}/>
                        <div style={{ position:"absolute", inset:0, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                          <div style={{ width:"42%", height:"38%", border:"2px dashed #22c55e80", borderRadius:6, background:"#22c55e08", position:"relative" }}>
                            <span style={{ position:"absolute", top:-16, left:"50%", transform:"translateX(-50%)", fontSize:9, color:"#86efac", fontFamily:"DM Mono,monospace", whiteSpace:"nowrap", background:"#022c16cc", padding:"1px 6px", borderRadius:4 }}>OpenCV Contour</span>
                          </div>
                        </div>
                        <div style={{ position:"absolute", top:8, right:8, background:"#022c16cc", borderRadius:5, padding:"3px 8px", fontSize:10, color:"#86efac", fontFamily:"DM Mono,monospace" }}>✓ {image.file?.name}</div>
                      </div>
                    ) : (
                      <>
                        <div style={{ width:46, height:46, borderRadius:"50%", background:"#1e293b", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}><Ic d={I.upload} size={20} c="#3b82f6"/></div>
                        <p style={{ fontSize:14, color:"#64748b", marginBottom:3 }}>Click to upload wound image</p>
                        <p style={{ fontSize:12, color:"#334155" }}>JPG · PNG · TIFF · max 20 MB</p>
                      </>
                    )}
                  </div>
                  {image && (
                    <div style={{ marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:11, color:"#475569" }}>Gaussian blur + Otsu threshold ready</span>
                      <button onClick={()=>setImage(null)} className="btn-g" style={{ padding:"4px 10px", fontSize:11 }}>Remove</button>
                    </div>
                  )}
                </Card>

                <Card>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:4 }}>
                    {isM?"Patient & Clinical Data":"Your Details (optional)"}
                  </h3>
                  <p style={{ fontSize:12, color:"#475569", marginBottom:14 }}>
                    {isM?"Enter patient information and drug parameters for analysis."
                        :"Just upload your image — analysis runs automatically."}
                  </p>

                  {/* Name + Age — both roles */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                    <div>
                      <label className="lbl">{isM?"PATIENT NAME":"YOUR NAME"}</label>
                      <input className="inp" value={pti.name} onChange={e=>setPti({...pti,name:e.target.value})} placeholder={isM?"Full name":"Your name (optional)"}/>
                    </div>
                    <div>
                      <label className="lbl">AGE</label>
                      <input className="inp" type="number" value={pti.age} onChange={e=>setPti({...pti,age:e.target.value})} placeholder="Years"/>
                    </div>
                  </div>

                  {/* Condition — medical only */}
                  {isM && (
                    <div style={{ marginBottom:10 }}>
                      <label className="lbl">WOUND CONDITION</label>
                      <input className="inp" value={pti.condition} onChange={e=>setPti({...pti,condition:e.target.value})} placeholder="e.g. Diabetic Ulcer, Pressure Wound…"/>
                    </div>
                  )}

                  {/* ══ DRUG SECTION — MEDICAL ONLY ══ */}
                  {isM && (
                    <div style={{ background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:11, padding:16, marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><path d="M10.5 3.75a6 6 0 100 12 6 6 0 000-12z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span style={{ fontSize:12, fontWeight:700, color:"#60a5fa", fontFamily:"DM Mono,monospace", letterSpacing:".06em" }}>DRUG / TREATMENT PARAMETERS</span>
                      </div>

                      <div style={{ marginBottom:10 }}>
                        <label className="lbl">DRUG / TREATMENT NAME</label>
                        <input className="inp" value={pti.drugName} onChange={e=>setPti({...pti,drugName:e.target.value})} placeholder="e.g. ZnO-NP, Collagen scaffold, Manuka honey, Silver dressing…"/>
                      </div>

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                        <div>
                          <label className="lbl">DRUG CLASS</label>
                          <select className="inp" value={pti.drugClass} onChange={e=>setPti({...pti,drugClass:e.target.value})}>
                            <option value="">Select class</option>
                            <option value="nanoparticle">Nanoparticle (ZnO, Ag, Cu…)</option>
                            <option value="antibiotic">Topical Antibiotic</option>
                            <option value="hydrogel">Hydrogel / Scaffold</option>
                            <option value="growth_factor">Growth Factor / PRP</option>
                            <option value="honey">Medical Honey</option>
                            <option value="compression">Compression Dressing</option>
                            <option value="negative_pressure">Negative Pressure Therapy</option>
                            <option value="control">Control / Placebo</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="lbl">DOSE / CONCENTRATION</label>
                          <input className="inp" value={pti.dose} onChange={e=>setPti({...pti,dose:e.target.value})} placeholder="e.g. 100 µg/mL"/>
                        </div>
                      </div>

                      {/* ── Key param: expected healing rate from this drug ── */}
                      <div style={{ padding:"12px 14px", background:"#0f172a", borderRadius:9, border:"1px solid #1e3a5f40", marginBottom:10 }}>
                        <label className="lbl" style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <span>EXPECTED WOUND HEALING RATE FROM THIS DRUG</span>
                          <span style={{ color:"#22c55e", fontWeight:700 }}>{pti.expectedHealingRate}%/day</span>
                        </label>
                        <input type="range" min="0.5" max="20" step="0.5" value={pti.expectedHealingRate} onChange={e=>setPti({...pti,expectedHealingRate:parseFloat(e.target.value)})}/>
                        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                          <span style={{ fontSize:10, color:"#334155" }}>0.5%/d (very slow)</span>
                          <span style={{ fontSize:10, color:"#334155" }}>20%/d (very fast)</span>
                        </div>
                        <p style={{ fontSize:11, color:"#475569", marginTop:8, lineHeight:1.5 }}>
                          Enter the drug's known or expected wound closure rate. This adjusts the AI's healing trajectory model.
                        </p>
                      </div>

                      <div>
                        <label className="lbl">APPLICATION FREQUENCY</label>
                        <select className="inp" value={pti.frequency} onChange={e=>setPti({...pti,frequency:e.target.value})}>
                          <option value="once_daily">Once daily</option>
                          <option value="twice_daily">Twice daily</option>
                          <option value="every_48h">Every 48 hours</option>
                          <option value="every_72h">Every 72 hours</option>
                          <option value="weekly">Weekly</option>
                          <option value="as_needed">As needed</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom:12 }}>
                    <label className="lbl">{isM?"CLINICAL NOTES":"NOTES (optional)"}</label>
                    <textarea className="inp" rows={2} value={pti.notes} onChange={e=>setPti({...pti,notes:e.target.value})}
                      placeholder={isM?"Observations, complications, comorbidities…":"How does it look or feel? (optional)"} style={{ resize:"vertical" }}/>
                  </div>

                  <button onClick={runAnalysis} disabled={analysing} className="btn-p" style={{ width:"100%", justifyContent:"center" }}>
                    {analysing
                      ? <><svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Analysing…</>
                      : <><WCLogo size={16}/>Run Wound Analysis — Day {sessions.length}</>}
                  </button>
                </Card>
              </div>

              {/* RIGHT results */}
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                {!lastResult && !analysing && (
                  <Card style={{ minHeight:360, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
                    <div style={{ marginBottom:16 }}><WCLogo size={52}/></div>
                    <h3 style={{ fontSize:15, color:"#475569", fontFamily:"Fraunces,serif", marginBottom:8 }}>Awaiting Image Upload</h3>
                    <p style={{ fontSize:13, color:"#334155", maxWidth:240 }}>
                      {isM?"Upload a wound image, fill in patient & drug details, then run analysis.":"Upload your wound image and hit Run — we handle everything else."}
                    </p>
                  </Card>
                )}

                {analysing && (
                  <Card style={{ minHeight:360, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
                    <div style={{ width:72, height:72, borderRadius:"50%", background:"#1d4ed818", border:"2px solid #3b82f640", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                      <svg className="spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    </div>
                    <h3 style={{ fontSize:15, color:"white", fontFamily:"Fraunces,serif", marginBottom:10 }}>Running Pipeline…</h3>
                    {["GaussianBlur preprocessing","Otsu thresholding","Morphological cleaning","RegionProps measurement","Stage classification",
                      isM?"Drug-adjusted healing model":"Healing rate computation"
                    ].map((s,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:"#1e293b40", borderRadius:7, marginBottom:6, width:"92%" }}>
                        <svg className="spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        <span style={{ fontSize:12, color:"#64748b" }}>{s}</span>
                      </div>
                    ))}
                  </Card>
                )}

                {lastResult && !analysing && (
                  <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    {lastResult.sys_status==="CHRONIC WOUND ALERT" && (
                      <div style={{ background:"#450a0a", border:"1px solid #dc2626", borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                        <Ic d={I.alert} size={18} c="#ef4444"/>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#fca5a5" }}>⚠ Chronic Wound Conversion Alert</div>
                          <div style={{ fontSize:12, color:"#ef444488", marginTop:2 }}>Healing rate stagnant below threshold. Immediate review recommended.</div>
                        </div>
                      </div>
                    )}
                    <Card glow="#3b82f6">
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                        <div>
                          <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:6 }}>Day {lastResult.day} Result</h3>
                          <StageBadge stage={lastResult.stage}/>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:22, fontFamily:"DM Mono,monospace", fontWeight:700, color:"white" }}>{lastResult.area_mm2}</div>
                          <div style={{ fontSize:11, color:"#64748b" }}>mm² area</div>
                        </div>
                      </div>
                      <ConfBar label="Wound Closure" value={lastResult.closure_pct/100} color="#22c55e"/>
                      <ConfBar label="Analysis Confidence" value={0.72+(lastResult.closure_pct/100)*0.22} color="#3b82f6"/>
                      {isM && pti.drugName && (
                        <div style={{ marginTop:8, padding:"8px 12px", background:"#0a1628", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ fontSize:11, color:"#475569" }}>Drug: <span style={{ color:"#a78bfa", fontWeight:600 }}>{pti.drugName}</span></span>
                          <span style={{ fontSize:11, color:"#22c55e", fontFamily:"DM Mono,monospace" }}>{pti.expectedHealingRate}%/day expected</span>
                        </div>
                      )}
                    </Card>
                    <Card>
                      <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:16 }}>Metrics</h3>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                        <RadialGauge value={lastResult.closure_pct} color="#22c55e" label="Closure %"/>
                        <RadialGauge value={Math.min(100,lastResult.healing_rate*6)} color="#3b82f6" label="Heal Rate"/>
                        {isM
                          ? <RadialGauge value={Math.min(100,(pti.expectedHealingRate/20)*100)} color="#a78bfa" label="Drug Score"/>
                          : <RadialGauge value={Math.max(0,100-lastResult.closure_pct)} color="#f59e0b" label="Remaining"/>}
                      </div>
                    </Card>
                    <Card>
                      <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:12 }}>Tissue Metrics</h3>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        {[
                          {k:"Width",    v:`${lastResult.width_mm} mm`,        col:"#a78bfa"},
                          {k:"Rate",     v:`${lastResult.healing_rate} mm²/d`, col:"#60a5fa"},
                          {k:"Age Est.", v:lastResult.age_est,                 col:"#f59e0b"},
                          {k:"Status",   v:lastResult.sys_status.includes("CHRONIC")?"Chronic Risk":"Normal", col:lastResult.sys_status.includes("CHRONIC")?"#ef4444":"#22c55e"},
                        ].map(m=>(
                          <div key={m.k} style={{ padding:"10px", background:"#1e293b50", borderRadius:8 }}>
                            <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>{m.k}</div>
                            <div style={{ fontSize:13, fontFamily:"DM Mono,monospace", fontWeight:700, color:m.col }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={()=>setNav("reports")} className="btn-p" style={{ flex:1, justifyContent:"center" }}><Ic d={I.report} size={14} c="white"/> Save Report</button>
                      <button onClick={exportCSV} className="btn-g" style={{ flex:1, justifyContent:"center" }}><Ic d={I.download} size={14}/> Export CSV</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {nav==="sessions" && (
          <div className="fade-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26 }}>
              <div>
                <h1 style={{ fontFamily:"Fraunces,serif", fontSize:30, fontWeight:600, color:"white" }}>Session Log</h1>
                <p style={{ color:"#64748b", fontSize:13, marginTop:3 }}>{sessions.length} sessions for {user?.name}</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={exportCSV} className="btn-g"><Ic d={I.download} size={14}/> CSV</button>
                <button onClick={async()=>{ if(window.confirm("Clear all sessions?")){ await saveSess([]); setLastResult(null); }}} className="btn-g" style={{ color:"#ef4444", borderColor:"#ef444440" }}>
                  <Ic d={I.trash} size={14} c="#ef4444"/> Clear
                </button>
              </div>
            </div>
            {!sessions.length ? (
              <Card style={{ textAlign:"center", padding:60 }}>
                <WCLogo size={48}/>
                <h3 style={{ fontSize:16, color:"#475569", fontFamily:"Fraunces,serif", marginTop:14 }}>No sessions yet</h3>
                <p style={{ fontSize:13, color:"#334155", marginTop:6 }}>Go to "New Analysis" and upload your first wound image.</p>
                <button onClick={()=>setNav("analysis")} className="btn-p" style={{ marginTop:18 }}><Ic d={I.plus} size={14} c="white"/> Start Session</button>
              </Card>
            ) : (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:22 }}>
                  <Card>
                    <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:12 }}>Closure Trend</h3>
                    <SparkLine data={sessions.map(s=>s.closure_pct)} color="#22c55e" h={80}/>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                      <span style={{ fontSize:10, color:"#334155", fontFamily:"DM Mono,monospace" }}>Day 0</span>
                      <span style={{ fontSize:10, color:"#22c55e", fontFamily:"DM Mono,monospace" }}>Day {latestDay} → {lastS?.closure_pct}%</span>
                    </div>
                  </Card>
                  <Card>
                    <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:12 }}>Area Reduction</h3>
                    <SparkLine data={sessions.map(s=>s.area_mm2)} color="#3b82f6" h={80}/>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                      <span style={{ fontSize:10, color:"#334155", fontFamily:"DM Mono,monospace" }}>{sessions[0]?.area_mm2} mm²</span>
                      <span style={{ fontSize:10, color:"#3b82f6", fontFamily:"DM Mono,monospace" }}>→ {lastS?.area_mm2} mm²</span>
                    </div>
                  </Card>
                </div>
                <Card>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr>
                          {["Day","Area mm²","Width mm","Closure %","Rate mm²/d","Stage","Age Est.",...(isM?["Drug"]:[]),"Status"].map(h=>(
                            <th key={h} style={{ textAlign:"left", fontSize:10, color:"#475569", fontFamily:"DM Mono,monospace", padding:"7px 10px", borderBottom:"1px solid #1e293b", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s,i)=>(
                          <tr key={i} className="trow" style={{ borderBottom:"1px solid #0f172a" }}>
                            <td style={{ padding:"10px", fontSize:13, fontFamily:"DM Mono,monospace", color:"#60a5fa", fontWeight:700 }}>{s.day}</td>
                            <td style={{ padding:"10px", fontSize:12, color:"#94a3b8", fontFamily:"DM Mono,monospace" }}>{s.area_mm2}</td>
                            <td style={{ padding:"10px", fontSize:12, color:"#94a3b8", fontFamily:"DM Mono,monospace" }}>{s.width_mm}</td>
                            <td style={{ padding:"10px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:44, height:3, background:"#1e293b", borderRadius:99 }}>
                                  <div style={{ height:"100%", width:`${s.closure_pct}%`, background:s.closure_pct>60?"#22c55e":s.closure_pct>30?"#f59e0b":"#ef4444", borderRadius:99 }}/>
                                </div>
                                <span style={{ fontSize:12, fontFamily:"DM Mono,monospace", color:"#94a3b8" }}>{s.closure_pct}%</span>
                              </div>
                            </td>
                            <td style={{ padding:"10px", fontSize:12, color:"#94a3b8", fontFamily:"DM Mono,monospace" }}>{s.healing_rate}</td>
                            <td style={{ padding:"10px" }}><StageBadge stage={s.stage}/></td>
                            <td style={{ padding:"10px", fontSize:12, color:"#64748b" }}>{s.age_est}</td>
                            {isM && <td style={{ padding:"10px", fontSize:12, color:"#a78bfa", fontFamily:"DM Mono,monospace" }}>{s.drug||"—"}</td>}
                            <td style={{ padding:"10px" }}>
                              <span style={{ fontSize:11, color:s.sys_status.includes("CHRONIC")?"#fca5a5":"#86efac", background:s.sys_status.includes("CHRONIC")?"#450a0a":"#052e16", padding:"2px 8px", borderRadius:6, fontFamily:"DM Mono,monospace", whiteSpace:"nowrap" }}>
                                {s.sys_status.includes("CHRONIC")?"⚠ CHRONIC":"✓ Normal"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── PATIENTS ── */}
        {nav==="patients" && (
          <div className="fade-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26 }}>
              <div>
                <h1 style={{ fontFamily:"Fraunces,serif", fontSize:30, fontWeight:600, color:"white" }}>
                  {isM?"Patient Registry":"My Wound History"}
                </h1>
                <p style={{ color:"#64748b", fontSize:13, marginTop:3 }}>{patients.length} records under your account</p>
              </div>
              <button onClick={()=>setNav("analysis")} className="btn-p"><Ic d={I.plus} size={14} c="white"/> New Session</button>
            </div>
            {!patients.length ? (
              <Card style={{ textAlign:"center", padding:60 }}>
                <Ic d={I.user} size={40} c="#334155"/>
                <h3 style={{ fontSize:16, color:"#475569", fontFamily:"Fraunces,serif", marginTop:14 }}>No records yet</h3>
                <p style={{ fontSize:13, color:"#334155", marginTop:6 }}>Run an analysis session to automatically create a record.</p>
              </Card>
            ) : selPt ? (
              <div className="fade-in">
                <button onClick={()=>setSelPt(null)} className="btn-g" style={{ marginBottom:18 }}>← Back</button>
                <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:20 }}>
                  <Card>
                    <div style={{ textAlign:"center", marginBottom:18 }}>
                      <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${isM?"#1d4ed8,#3b82f6":"#065f46,#22c55e"})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:18, color:"white", fontWeight:700 }}>{selPt.name[0]}</div>
                      <h3 style={{ fontSize:15, color:"white", fontWeight:600 }}>{selPt.name}</h3>
                      <p style={{ fontSize:12, color:"#64748b" }}>{selPt.condition||"—"}</p>
                    </div>
                    {[["Age",selPt.age||"—"],["Drug",selPt.drug||"N/A"],["Last Day",`Day ${selPt.lastDay}`]].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #1e293b" }}>
                        <span style={{ fontSize:12, color:"#475569" }}>{k}</span>
                        <span style={{ fontSize:12, color:"#94a3b8", fontFamily:"DM Mono,monospace" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:14 }}><StageBadge stage={selPt.stage}/></div>
                  </Card>
                  <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                    <Card glow="#22c55e">
                      <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:14 }}>Healing Progress</h3>
                      <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                        <RadialGauge value={selPt.latestClosure||0} color="#22c55e" label="Closure %" size={110}/>
                        <div style={{ flex:1 }}>
                          <SparkLine data={sessions.filter(s=>s.ptInfo?.name===selPt.name).map(s=>s.closure_pct)} color="#22c55e" h={70}/>
                          <p style={{ fontSize:11, color:"#475569", marginTop:4 }}>Session closure trend</p>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:14 }}>Before / After</h3>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        {["Baseline (Day 0)","Latest"].map((lbl,ii)=>{
                          const ptS=sessions.filter(s=>s.ptInfo?.name===selPt.name);
                          const s=ii===0?ptS[0]:ptS[ptS.length-1];
                          return (
                            <div key={lbl} style={{ background:"#1e293b", borderRadius:10, overflow:"hidden" }}>
                              {s?.imageUrl
                                ? <img src={s.imageUrl} alt={lbl} style={{ width:"100%", height:100, objectFit:"cover", filter:"brightness(.85)" }}/>
                                : <div style={{ height:100, background:`linear-gradient(135deg,${ii===0?"#450a0a,#7f1d1d":"#052e16,#14532d"})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    <span style={{ fontSize:11, color:ii===0?"#fca5a5":"#86efac", fontFamily:"DM Mono,monospace" }}>{s?`${s.area_mm2} mm²`:"—"}</span>
                                  </div>}
                              <div style={{ padding:"6px 10px" }}><p style={{ fontSize:10, color:"#64748b", fontFamily:"DM Mono,monospace" }}>{lbl}</p></div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
                {patients.map(p=>(
                  <div key={p.id} onClick={()=>setSelPt(p)}
                    style={{ background:"linear-gradient(135deg,#0f172a,#1a2540)", border:"1px solid #1e293b", borderRadius:12, padding:18, cursor:"pointer", transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#3b82f640";e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e293b";e.currentTarget.style.transform="translateY(0)";}}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${isM?"#1d4ed8,#3b82f6":"#065f46,#22c55e"})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"white", fontWeight:700 }}>{p.name[0]}</div>
                        <div>
                          <div style={{ fontSize:13, color:"white", fontWeight:600 }}>{p.name}</div>
                          <div style={{ fontSize:11, color:"#475569" }}>Age {p.age||"—"}</div>
                        </div>
                      </div>
                      {p.sys_status?.includes("CHRONIC") && <span style={{ fontSize:9, padding:"2px 6px", background:"#450a0a", color:"#fca5a5", borderRadius:4, fontFamily:"DM Mono,monospace", height:"fit-content" }}>⚠ CHRONIC</span>}
                    </div>
                    {isM && p.drug && <p style={{ fontSize:12, color:"#a78bfa", marginBottom:8, fontFamily:"DM Mono,monospace" }}>💊 {p.drug}</p>}
                    <div style={{ marginBottom:10 }}><StageBadge stage={p.stage}/></div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:3, background:"#0f172a", borderRadius:99 }}>
                        <div style={{ height:"100%", width:`${p.latestClosure||0}%`, background:(p.latestClosure||0)>60?"#22c55e":(p.latestClosure||0)>30?"#f59e0b":"#ef4444", borderRadius:99 }}/>
                      </div>
                      <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"DM Mono,monospace" }}>{(p.latestClosure||0).toFixed(0)}%</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                      <span style={{ fontSize:11, color:"#334155" }}>Day {p.lastDay}</span>
                      <span style={{ fontSize:11, color:"#3b82f6" }}>View →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {nav==="reports" && (
          <div className="fade-in">
            <div style={{ marginBottom:26 }}>
              <h1 style={{ fontFamily:"Fraunces,serif", fontSize:30, fontWeight:600, color:"white" }}>Reports & Export</h1>
              <p style={{ color:"#64748b", fontSize:13, marginTop:3 }}>Download clinical reports and research datasets</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Card glow="#3b82f6">
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:4 }}>Clinical Report</h3>
                  <p style={{ fontSize:13, color:"#475569", marginBottom:18 }}>Full wound healing report with AI predictions & session history</p>
                  <div style={{ marginBottom:16 }}>
                    {(isM
                      ?["Patient Details","Drug & Dose Parameters","Session Log Table","Healing Rate Graph","Chronic Wound Assessment","Drug Efficacy Analysis"]
                      :["Session Log","Healing Progress","Stage Classification","Chronic Wound Assessment"]
                    ).map(s=>(
                      <label key={s} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, cursor:"pointer" }}>
                        <input type="checkbox" defaultChecked style={{ accentColor:"#3b82f6" }}/>
                        <span style={{ fontSize:13, color:"#94a3b8" }}>{s}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={exportReport} disabled={reportGen} className="btn-p" style={{ width:"100%", justifyContent:"center" }}>
                    {reportGen
                      ? <><svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Generating…</>
                      : <><Ic d={I.download} size={14} c="white"/> Download Report (.txt)</>}
                  </button>
                </Card>
                <Card>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:14 }}>Data Exports</h3>
                  {[
                    {label:"Session Log", fmt:"CSV",  fn:exportCSV},
                    {label:"Full Dataset",fmt:"JSON", fn:()=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(sessions,null,2)],{type:"application/json"})); a.download=`woundchron_${user.uid}.json`; a.click(); }},
                  ].map((e,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<1?"1px solid #1e293b":"none" }}>
                      <div>
                        <div style={{ fontSize:13, color:"white" }}>{e.label}</div>
                        <div style={{ fontSize:11, color:"#475569", fontFamily:"DM Mono,monospace" }}>{e.fmt} · {sessions.length} rows</div>
                      </div>
                      <button onClick={e.fn} className="btn-g" style={{ padding:"6px 12px", fontSize:12 }}><Ic d={I.download} size={13}/> Export</button>
                    </div>
                  ))}
                </Card>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <Card>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:14 }}>Report Preview</h3>
                  <div style={{ background:"#020817", borderRadius:8, padding:14, fontFamily:"DM Mono,monospace", fontSize:11, color:"#64748b", lineHeight:1.9, maxHeight:340, overflowY:"auto" }}>
                    <div style={{ color:"#3b82f6" }}>══ WOUNDCHRON REPORT ══</div>
                    <div>User : {user?.name} ({user?.email})</div>
                    <div>Role : {user?.role}</div>
                    <div>Date : {new Date().toLocaleDateString()}</div>
                    <div style={{ color:"#3b82f680", margin:"6px 0" }}>──────────────────────</div>
                    <div style={{ color:"#22c55e" }}>SESSION SUMMARY</div>
                    <div>Sessions : {sessions.length}</div>
                    <div>Closure  : {lastS?.closure_pct??0}%</div>
                    <div>Stage    : {lastS?.stage??"—"}</div>
                    <div>Status   : {lastS?.sys_status??"—"}</div>
                    {isM && pti.drugName && <>
                      <div style={{ color:"#3b82f680", margin:"6px 0" }}>──────────────────────</div>
                      <div style={{ color:"#22c55e" }}>DRUG PARAMETERS</div>
                      <div>Drug  : {pti.drugName}</div>
                      <div>Class : {pti.drugClass||"—"}</div>
                      <div>Rate  : {pti.expectedHealingRate}%/day expected</div>
                    </>}
                    <div style={{ color:"#3b82f680", margin:"6px 0" }}>──────────────────────</div>
                    {sessions.slice(-5).map(s=><div key={s.day}>Day {s.day}: {s.area_mm2}mm² | {s.closure_pct}% | {s.stage}</div>)}
                    <div style={{ color:"#334155", marginTop:8, fontSize:10 }}>AI-generated — review with licensed clinician.</div>
                  </div>
                </Card>
                <Card>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:14 }}>Account Summary</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      {k:"Account ID", v:user?.uid,       col:"#3b82f6"},
                      {k:"Provider",   v:user?.provider,  col:"#a78bfa"},
                      {k:"Sessions",   v:sessions.length, col:"#22c55e"},
                      {k:"Records",    v:patients.length, col:"#f59e0b"},
                      {k:"Avg Closure",v:`${avgClosure}%`,col:"#60a5fa"},
                      {k:"Chronic",    v:chronicCt,       col:"#ef4444"},
                    ].map(m=>(
                      <div key={m.k} style={{ padding:"10px 12px", background:"#1e293b50", borderRadius:8 }}>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>{m.k}</div>
                        <div style={{ fontSize:13, fontFamily:"DM Mono,monospace", fontWeight:700, color:m.col, wordBreak:"break-all" }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
