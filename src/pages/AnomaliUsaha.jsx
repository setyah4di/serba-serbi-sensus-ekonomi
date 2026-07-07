import { useState, useEffect, useMemo, useRef } from "react";
import DetailAnomaliUsaha from "../components/DetailAnomaliUsaha";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "1lUDHElN9DJtMLvsQRYjbO2-N0GMh_8UYUO4uIftmiR8";
const GID_ANOMALI    = "649978969";
const CSV_ANOMALI = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_ANOMALI}`;

const KECAMATAN_ORDER = [
  "TUNGKAL ULU","MERLUNG","BATANG ASAM","TEBING TINGGI","RENAH MENDALUH","MUARA PAPALIK",
  "PENGABUAN","SENYERANG","TUNGKAL ILIR","BRAM ITAM","SEBERANG KOTA","BETARA","KUALA BETARA",
];

const KODE_KEC_MAP = {
  "1507010":"TUNGKAL ULU","1507011":"MERLUNG","1507012":"BATANG ASAM","1507013":"TEBING TINGGI",
  "1507014":"RENAH MENDALUH","1507015":"MUARA PAPALIK","1507020":"PENGABUAN","1507021":"SENYERANG",
  "1507030":"TUNGKAL ILIR","1507031":"BRAM ITAM","1507032":"SEBERANG KOTA","1507040":"BETARA","1507041":"KUALA BETARA",
};

// ── Parser CSV ──
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQ = false;
  const clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQ) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else { inQ = false; }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') { inQ = true; }
      else if (ch === ',') { row.push(field.trim()); field = ""; }
      else if (ch === '\n') { row.push(field.trim()); rows.push(row); row = []; field = ""; }
      else { field += ch; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field.trim()); rows.push(row); }
  return rows;
}

function isSubtotalRow(cols) {
  for (let i = 0; i <= 8; i++) {
    if (/\bTotal\s*$/i.test((cols[i] || "").trim())) return true;
  }
  return false;
}

function isKodeKec(v) { return /^1507\d{3}$/.test((v || "").trim()); }
function isNamaKec(v) { return KECAMATAN_ORDER.includes((v || "").trim().toUpperCase()); }

// ── Helpers warna ──
function countColor(v)    { if(v===0)return"#10b981"; if(v<=5)return"#3b82f6"; if(v<=15)return"#f59e0b"; return"#f43f5e"; }
function countBarColor(v) { if(v===0)return"#10b981"; if(v<=5)return"#3b82f6"; if(v<=15)return"#f59e0b"; return"#f43f5e"; }
function countBadgeStyle(v){
  if(v===0)return{bg:"#d1fae5",text:"#065f46",dot:"#10b981"};
  if(v<=5)return{bg:"#dbeafe",text:"#1e40af",dot:"#3b82f6"};
  if(v<=15)return{bg:"#fef3c7",text:"#92400e",dot:"#f59e0b"};
  return{bg:"#ffe4e6",text:"#9f1239",dot:"#f43f5e"};
}
function countLabel(v) { if(v===0)return"Aman"; if(v<=5)return"Ringan"; if(v<=15)return"Sedang"; return"Perlu Perhatian"; }

function statusBadgeStyle(status) {
  const s = (status || "").trim();
  if(s.startsWith("01"))return{bg:"#d1fae5",text:"#065f46",dot:"#10b981"};
  if(s.startsWith("02"))return{bg:"#ffe4e6",text:"#9f1239",dot:"#f43f5e"};
  return{bg:"#f1f5f9",text:"#475569",dot:"#94a3b8"};
}
function statusLabel(status) {
  return (status || "").trim() || "Belum Dikonfirmasi";
}

// ── Progress Bar ──
function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ width:"100%", height:"6px", background:"#f1f5f9", borderRadius:"99px", overflow:"hidden" }}>
      <div style={{
        height:"100%", width:`${pct}%`, borderRadius:"99px",
        background: color,
        transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: pct > 0 ? `0 0 6px ${color}66` : "none",
      }}/>
    </div>
  );
}

// ── Stat Card global (diubah menjadi status anomali) ──
function StatCard({ label, value, sub, icon, accentColor }) {
  return (
    <div style={{
      background: `${accentColor}14`,
      borderRadius:"16px", padding:"20px 20px 16px",
      border:`1.5px solid ${accentColor}25`,
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      minHeight:"110px", position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", right:"-18px", bottom:"-18px", width:"72px", height:"72px", borderRadius:"50%", background:`${accentColor}15`, pointerEvents:"none" }}/>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px" }}>
        <p style={{ fontSize:"11px", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em", margin:0 }}>{label}</p>
        <div style={{ width:"32px", height:"32px", borderRadius:"10px", background:`${accentColor}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"16px" }}>{icon}</div>
      </div>
      <div>
        <p style={{ fontSize:"28px", fontWeight:800, color:accentColor, margin:0, lineHeight:1.1 }}>{value}</p>
        {sub && <p style={{ fontSize:"13px", color:"gray", marginTop:"3px", margin:0 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Kecamatan Card (angka = perbaiki + belum) ──
function KecamatanCard({ kecamatan, count, maxCount, countDesa, countSLS, onClick, isSelected }) {
  const color = countColor(count);
  const badge = countBadgeStyle(count);
  const label = countLabel(count);
  return (
    <button onClick={onClick} style={{ width:"100%", textAlign:"left", border:"none", background:"none", padding:0, cursor:"pointer" }}>
      <div style={{
        background: isSelected ? "#fff7ed" : "#fff",
        borderRadius:"16px", padding:"18px 20px",
        border: isSelected ? "2px solid #f97316" : "1.5px solid #f1f5f9",
        boxShadow: isSelected ? "0 4px 20px rgba(249,115,22,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
        transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
        display:"flex", flexDirection:"column", gap:"12px",
      }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 3px 0" }}>Kecamatan</p>
            <p style={{ fontSize:"15px", fontWeight:700, color:"#1e293b", margin:0, lineHeight:1.3 }}>{kecamatan}</p>
          </div>
          <span style={{ fontSize:"24px", fontWeight:800, color, flexShrink:0, lineHeight:1 }}>{count}</span>
        </div>
        <ProgressBar value={count} max={maxCount} color={color} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"6px" }}>
          <div style={{ display:"flex", gap:"12px" }}>
            {[["Desa", countDesa], ["SLS", countSLS]].map(([lbl, val]) => (
              <span key={lbl} style={{ fontSize:"12px", color:"#94a3b8", display:"flex", alignItems:"center", gap:"4px" }}>
                <span style={{ display:"inline-block", width:"6px", height:"6px", borderRadius:"50%", background:"#cbd5e1" }}/>
                <b style={{ color:"#475569", fontWeight:600 }}>{val}</b> {lbl}
              </span>
            ))}
          </div>
          <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"99px", background:badge.bg, color:badge.text, display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:badge.dot, flexShrink:0 }}/>
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Mini Status Card (Sesuai / Perbaiki / Belum) ──
function MiniStatusCard({ label, count, total, color, bg, dot, isActive, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      style={{
        flex:1, border:"none", cursor:"pointer", textAlign:"left",
        background: isActive ? color : bg,
        borderRadius:"14px", padding:"12px 14px",
        border: isActive ? `2px solid ${color}` : `1.5px solid ${bg === "#fff" ? "#f1f5f9" : bg}`,
        boxShadow: isActive ? `0 4px 16px ${color}33` : "none",
        transition:"all 0.18s cubic-bezier(0.4,0,0.2,1)",
        transform: isActive ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
        <span style={{ width:"7px", height:"7px", borderRadius:"50%", background: isActive ? "rgba(255,255,255,0.8)" : dot, flexShrink:0 }}/>
        <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color: isActive ? "rgba(255,255,255,0.85)" : "#64748b" }}>{label}</span>
      </div>
      <p style={{ fontSize:"22px", fontWeight:800, margin:0, lineHeight:1, color: isActive ? "#fff" : color }}>{count}</p>
      <p style={{ fontSize:"10px", margin:"3px 0 0 0", color: isActive ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{pct}% dari total</p>
    </button>
  );
}

// ── Anomali Row ──
function AnomaliRow({ row, rank, onDetail }) {
  const badge = statusBadgeStyle(row.hasilKonfirmasiPML);
  return (
    <div style={{ padding:"14px 0", borderBottom:"1px solid #f8fafc" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
        <span style={{ fontSize:"11px", fontWeight:700, color:"#cbd5e1", width:"20px", textAlign:"right", flexShrink:0, marginTop:"2px" }}>{rank}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#1e293b", margin:"0 0 3px 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.namaUsaha}</p>
          <p style={{ fontSize:"13px", color:"#94a3b8", margin:"0 0 3px 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {row.namaDesa}{row.namaSLS ? ` · ${row.namaSLS}` : ""} 
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"4px", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
              <span style={{ background:"#fff7ed", color:"#ea580c", fontSize:"10px", fontWeight:700, padding:"2px 6px", borderRadius:"5px" }}>PML</span>
              <span style={{ fontSize:"12px", color:"#64748b", maxWidth:"110px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.namaPML || "-"}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
              <span style={{ background:"#eff6ff", color:"#2563eb", fontSize:"10px", fontWeight:700, padding:"1px 6px", borderRadius:"5px" }}>PPL</span>
              <span style={{ fontSize:"12px", color:"#64748b", maxWidth:"130px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.namaPetugas || "-"}</span>
            </div>
          </div>
          <p style={{ fontSize:"13px", color:"#64748b", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.namaAnomali}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px", flexShrink:0 }}>
          <span style={{ fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"99px", background:badge.bg, color:badge.text, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"4px" }}>
            <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:badge.dot }}/>
            {statusLabel(row.hasilKonfirmasiPML)}
          </span>
          <button
            onClick={() => onDetail(row)}
            style={{ fontSize:"11px", fontWeight:600, padding:"4px 10px", borderRadius:"8px", background:"#fff7ed", color:"#ea580c", border:"1px solid #fed7aa", cursor:"pointer", whiteSpace:"nowrap" }}
          >Detail</button>
        </div>
      </div>
    </div>
  );
}

// ── Custom hook untuk deteksi mobile ──
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
}

// ── Komponen Utama ──
export default function MonitoringAnomaliUsaha() {
  const [rawRows, setRawRows]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("urut");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchKK, setSearchKK]       = useState("");
  const [modalRow, setModalRow]       = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [pmlFilter, setPmlFilter] = useState(null);   // ← BARU
  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
  if (tableRef.current) tableRef.current.scrollTop = 0;
  setSearchKK("");
  setActiveFilter(null);
  setPmlFilter(null);   // ← BARU
}, [selectedKec]);

  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && isMobile) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const handleFilterCard = (key) => {
    setActiveFilter(prev => prev === key ? null : key);
    if (tableRef.current) tableRef.current.scrollTop = 0;
    setSearchKK("");
  };
  const handlePmlFilter = (pml) => {
  setPmlFilter(prev => prev === pml ? null : pml);
  if (tableRef.current) tableRef.current.scrollTop = 0;
};

  // ── Fetch & parse CSV ──
  useEffect(() => {
    fetch(`${CSV_ANOMALI}&_cb=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data anomali."); return r.text(); })
      .then(text => {
        const parsed = parseCSV(text);
        let lastKodeKec="",lastNamaKec="",lastKodeDesa="",lastNamaDesa="",lastPML="",lastPetugas="",lastKodeSLS="",lastSubSLS="",lastNamaSLS="";
        const data = [];
        parsed.slice(1).forEach((cols, idx) => {
          while (cols.length < 17) cols.push("");
          if (isSubtotalRow(cols)) return;
          const rawKodeKec = (cols[0]||"").trim();
          if (isKodeKec(rawKodeKec)) { lastKodeKec=rawKodeKec; if(KODE_KEC_MAP[rawKodeKec])lastNamaKec=KODE_KEC_MAP[rawKodeKec]; }
          const rawNamaKec = (cols[1]||"").trim().toUpperCase();
          if (isNamaKec(rawNamaKec)) lastNamaKec=rawNamaKec;
          const rawKodeDesa = (cols[2]||"").trim();
          if (/^\d{7,10}$/.test(rawKodeDesa)) lastKodeDesa=rawKodeDesa;
          const rawNamaDesa = (cols[3]||"").trim();
          if (rawNamaDesa && !/^\d+$/.test(rawNamaDesa) && !isSubtotalRow([rawNamaDesa])) lastNamaDesa=rawNamaDesa;
          const rawPML = (cols[4]||"").trim();
          if (rawPML && !isSubtotalRow([rawPML])) lastPML=rawPML;
          const rawPetugas = (cols[5]||"").trim();
          if (rawPetugas && !isSubtotalRow([rawPetugas])) lastPetugas=rawPetugas;
          const rawKodeSLS = (cols[6]||"").trim();
          if (/^\d{4}$/.test(rawKodeSLS)) lastKodeSLS=rawKodeSLS;
          const rawSubSLS = (cols[7]||"").trim();
          if (/^\d{2}$/.test(rawSubSLS)) lastSubSLS=rawSubSLS;
          const rawNamaSLS = (cols[8]||"").trim();
          if (rawNamaSLS && !isSubtotalRow([rawNamaSLS])) lastNamaSLS=rawNamaSLS;
          const namaUsaha   = (cols[9]||"").trim();
          const namaAnomali = (cols[10]||"").trim();
          if (!namaUsaha || !namaAnomali || !lastNamaKec) return;
          data.push({
            rowIndex:idx+2, kodeKec:lastKodeKec, namaKec:lastNamaKec, kodeDesa:lastKodeDesa,
            namaDesa:lastNamaDesa, namaPML:lastPML, namaPetugas:lastPetugas, kodeSLS:lastKodeSLS,
            subSLS:lastSubSLS, namaSLS:lastNamaSLS, namaKK:namaUsaha, namaUsaha, namaAnomali,
            keteranganAnomali:(cols[11]||"").trim(), linkFasih:(cols[12]||"").trim(),
            hasilKonfirmasiPML:(cols[14]||"").trim(), keteranganKoreksi:(cols[15]||"").trim(),
            hasilKonfirmasiKorwil:(cols[16]||"").trim(),
          });
        });
        setRawRows(data); setLastUpdated(new Date()); setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Agregasi per kecamatan ──
  const kecamatanMap = useMemo(() => {
    const m = {};
    rawRows.forEach(r => { if(!r.namaKec)return; if(!m[r.namaKec])m[r.namaKec]=[]; m[r.namaKec].push(r); });
    return m;
  }, [rawRows]);

  // Hitung global status (untuk stat card)
  const globalStatus = useMemo(() => {
    const sesuai = rawRows.filter(r => r.hasilKonfirmasiPML.startsWith("01")).length;
    const perbaiki = rawRows.filter(r => r.hasilKonfirmasiPML.startsWith("02")).length;
    const belum = rawRows.filter(r => !r.hasilKonfirmasiPML.trim()).length;
    return { sesuai, perbaiki, belum, total: rawRows.length };
  }, [rawRows]);

  // KecamatanList dengan count = perbaiki + belum
  const kecamatanList = useMemo(() => {
    const namaSet = new Set([...KECAMATAN_ORDER, ...Object.keys(kecamatanMap)]);
    return [...namaSet].map(nama => {
      const list    = kecamatanMap[nama]||[];
      // Hitung jumlah yang TIDAK sesuai (perbaiki + belum)
      const count = list.filter(r => !r.hasilKonfirmasiPML.startsWith("01")).length;
      const desaSet = new Set(list.map(r=>`${r.kodeDesa}||${r.namaDesa}`));
      const slsSet  = new Set(list.map(r=>`${r.kodeDesa}||${r.kodeSLS}||${r.subSLS}`));
      return { kecamatan:nama, count, countDesa:desaSet.size, countSLS:slsSet.size };
    })
    .filter(k => k.count>0 || KECAMATAN_ORDER.includes(k.kecamatan))
    .filter(k => search===""||k.kecamatan.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sortBy==="jumlah"?b.count-a.count:(KECAMATAN_ORDER.indexOf(a.kecamatan)-KECAMATAN_ORDER.indexOf(b.kecamatan))||a.kecamatan.localeCompare(b.kecamatan));
  }, [kecamatanMap, search, sortBy]);

  const maxCount = useMemo(() => kecamatanList.reduce((m,k)=>Math.max(m,k.count),0), [kecamatanList]);

  const selectedRows = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec]||[])].sort((a,b)=>a.namaDesa.localeCompare(b.namaDesa)||a.kodeSLS.localeCompare(b.kodeSLS));
  }, [selectedKec, kecamatanMap]);

const pmlList = useMemo(() => {
  const set = new Set();
  selectedRows.forEach(r => { if (r.namaPML) set.add(r.namaPML); });
  return [...set].sort((a, b) => a.localeCompare(b));
}, [selectedRows]);

  const statusCounts = useMemo(() => ({
    sesuai:  selectedRows.filter(r=>r.hasilKonfirmasiPML.startsWith("01")).length,
    perbaiki:selectedRows.filter(r=>r.hasilKonfirmasiPML.startsWith("02")).length,
    belum:   selectedRows.filter(r=>!r.hasilKonfirmasiPML.trim()).length,
  }), [selectedRows]);

const filteredRows = useMemo(() => {
  let result = selectedRows;
  if (activeFilter === "sesuai")   result = result.filter(r=>r.hasilKonfirmasiPML.startsWith("01"));
  if (activeFilter === "perbaiki") result = result.filter(r=>r.hasilKonfirmasiPML.startsWith("02"));
  if (activeFilter === "belum")    result = result.filter(r=>!r.hasilKonfirmasiPML.trim());
  if (pmlFilter) result = result.filter(r => r.namaPML === pmlFilter);
  if (!searchKK.trim()) return result;
  const q = searchKK.toLowerCase();
  return result.filter(r =>
    (r.namaUsaha   || "").toLowerCase().includes(q) ||
    (r.namaPetugas || "").toLowerCase().includes(q)
  );
}, [selectedRows, activeFilter, pmlFilter, searchKK]); // ← tambahkan pmlFilter

  const handleSaved = (updatedRow) => {
    setRawRows(prev=>prev.map(r=>r.rowIndex===updatedRow.rowIndex?updatedRow:r));
    setModalRow(updatedRow);
  };

  const filterLabel = activeFilter === "sesuai" ? "Sudah Sesuai" : activeFilter === "perbaiki" ? "Perlu Diperbaiki" : activeFilter === "belum" ? "Belum Dikonfirmasi" : null;
  const filterColor = activeFilter === "sesuai" ? "#10b981" : activeFilter === "perbaiki" ? "#f43f5e" : activeFilter === "belum" ? "#94a3b8" : null;

  // ── Styles responsif ──
  const mainLayoutStyle = {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: isMobile ? "column" : "row",
  };

  const kecamatanGridStyle = {
    flex: isMobile ? "1 1 100%" : "1 1 380px",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : (isTablet ? "repeat(auto-fill, minmax(200px, 1fr))" : "repeat(auto-fill, minmax(260px, 1fr))"),
    gap: "12px",
    alignContent: "start",
    width: "100%",
  };

  const detailPanelStyle = {
    flex: isMobile ? "1 1 100%" : "0 0 500px",
    minWidth: isMobile ? "auto" : "300px",
    position: isMobile ? "static" : "sticky",
    top: "24px",
    width: "100%",
  };

  const statGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "14px",
    marginBottom: "28px",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {modalRow && (
        <DetailAnomaliUsaha row={modalRow} onClose={()=>setModalRow(null)} onSaved={handleSaved} />
      )}

      {/* ── HEADER ── */}
      <header style={{ background:"linear-gradient(135deg,#fb923c 0%,#f97316 45%,#ea580c 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:"-40px", top:"-40px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", right:"120px", bottom:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding: isMobile ? "20px 16px 24px" : "28px 24px 32px", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", justifyContent:"space-between", gap:"16px" }}>
            <div>
              <h1 style={{ color:"#fff", fontSize: isMobile ? "24px" : "28px", fontWeight:800, margin:"0 0 4px 0", lineHeight:1.2 }}>Monitoring Anomali Usaha</h1>
              <p style={{ color:"rgba(255,255,255,0.75)", margin:0, fontSize: isMobile ? "16px" : "17px", fontWeight:500 }}>Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated && (
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:"12px", padding: isMobile ? "8px 12px" : "10px 16px", border:"1px solid rgba(255,255,255,0.2)" }}>
                <p style={{ color:"rgba(255,255,255,0.75)", fontSize:"14px", margin:"0 0 2px 0", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Data diperbarui</p>
                <p style={{ color:"#fff", fontSize:"12px", margin:0, fontWeight:700 }}>
                  {lastUpdated.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} · 07.00 WIB
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:"1200px", margin:"0 auto", padding: isMobile ? "16px 12px 32px" : "28px 24px 48px" }}>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:"16px" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"3px solid #fed7aa", borderTopColor:"#f97316", animation:"spin 0.8s linear infinite" }}/>
            <p style={{ color:"#94a3b8", fontSize:"14px", margin:0 }}>Mengambil data anomali dari spreadsheet…</p>
          </div>
        )}

        {error && (
          <div style={{ background:"#fff1f2", border:"1.5px solid #fecdd3", borderRadius:"16px", padding:"20px 24px", marginTop:"16px" }}>
            <p style={{ color:"#e11d48", fontWeight:700, margin:"0 0 4px 0" }}>Gagal memuat data</p>
            <p style={{ color:"#fb7185", fontSize:"13px", margin:0 }}>{error}</p>
          </div>
        )}

        {!loading && !error && globalStatus && (
          <>
            {/* ── Stat Cards global ── */}
            <div style={statGridStyle}>
              <StatCard label="Sudah Sesuai" value={globalStatus.sesuai} sub={`${((globalStatus.sesuai/globalStatus.total)*100).toFixed(1)}% dari total`}
 icon="✅" accentColor="#10b981"/>
              <StatCard label="Perlu Diperbaiki" value={globalStatus.perbaiki} sub={`${((globalStatus.perbaiki/globalStatus.total)*100).toFixed(1)}% dari total`} icon="🛠️" accentColor="#f43f5e"/>
              <StatCard label="Belum Dikonfirmasi" value={globalStatus.belum} sub={`${((globalStatus.belum/globalStatus.total)*100).toFixed(1)}% dari total`} icon="⏳" accentColor="#64748b"/>
              <StatCard label="Total Anomali" value={globalStatus.total} sub="seluruh baris anomali" icon="📊" accentColor="#f97316"/>
            </div>

            {/* ── Search & Sort ── */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", marginBottom:"20px" }}>
              <div style={{ position:"relative", flex:1, minWidth: isMobile ? "140px" : "200px" }}>
                <svg style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="16" height="16" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Cari nama kecamatan…" value={search}
                  onChange={e=>{setSearch(e.target.value);setSelectedKec(null);}}
                  style={{ width:"100%", paddingLeft:"40px", paddingRight:"16px", paddingTop: isMobile ? "8px" : "10px", paddingBottom: isMobile ? "8px" : "10px", borderRadius:"12px", border:"1.5px solid #e2e8f0", background:"#fff", fontSize: isMobile ? "13px" : "14px", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#f97316"}
                  onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                />
              </div>
              <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                {[["urut","Urutan"],["jumlah","Terbanyak ↓"]].map(([val,lbl])=>(
                  <button key={val} onClick={()=>setSortBy(val)} style={{
                    padding: isMobile ? "6px 12px" : "10px 18px",
                    borderRadius:"12px",
                    fontSize: isMobile ? "12px" : "13px",
                    fontWeight:600,
                    cursor:"pointer",
                    border: sortBy===val?"none":"1.5px solid #e2e8f0",
                    background: sortBy===val?"#f97316":"#fff",
                    color: sortBy===val?"#fff":"#64748b",
                    transition:"all 0.15s",
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            {/* ── Layout dua kolom (responsif) ── */}
            <div style={mainLayoutStyle}>

              {/* Kecamatan grid */}
              <div style={kecamatanGridStyle}>
                {kecamatanList.map(({ kecamatan, count, countDesa, countSLS }) => (
                  <KecamatanCard
                    key={kecamatan} kecamatan={kecamatan} count={count} maxCount={maxCount}
                    countDesa={countDesa} countSLS={countSLS}
                    isSelected={selectedKec===kecamatan}
                    onClick={()=>handleSelectKec(kecamatan)}
                  />
                ))}
              </div>

              {/* Detail panel */}
              <div ref={detailRef} style={detailPanelStyle}>
                {!selectedKec ? (
                  <div style={{ background:"#fff", borderRadius:"20px", border:"2px dashed #e2e8f0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding: isMobile ? "40px 20px" : "60px 32px", textAlign:"center" }}>
                    <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"#fff7ed", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
                      <svg width="26" height="26" fill="none" stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p style={{ fontWeight:700, color:"#475569", fontSize: isMobile ? "14px" : "15px", margin:"0 0 6px 0" }}>Pilih Kecamatan</p>
                    <p style={{ color:"#94a3b8", fontSize:"13px", margin:0, lineHeight:1.6 }}>Klik kartu kecamatan untuk melihat daftar usaha dengan anomali.</p>
                  </div>
                ) : (
                  <div style={{ background:"#fff", borderRadius:"20px", border:"1.5px solid #f1f5f9", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", overflow:"hidden" }}>

                    {/* Panel header */}
                    <div style={{ background:"linear-gradient(135deg,#fb923c 0%,#f97316 50%,#ea580c 100%)", padding: isMobile ? "16px 16px 14px" : "20px 22px 18px", position:"relative", overflow:"hidden" }}>
                      <div style={{ position:"absolute", right:"-20px", bottom:"-20px", width:"100px", height:"100px", borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }}/>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"14px" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 3px 0" }}>Kecamatan</p>
                          <h2 style={{ color:"#fff", fontSize: isMobile ? "18px" : "20px", fontWeight:800, margin:0, lineHeight:1.2 }}>{selectedKec}</h2>
                        </div>
                        <button onClick={()=>setSelectedKec(null)} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"8px", width:"30px", height:"30px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
                        <span style={{ color:"rgba(255,255,255,0.8)", fontSize:"12px" }}>Total anomali</span>
                        <span style={{ color:"#fff", fontSize:"15px", fontWeight:800 }}>{selectedRows.length}</span>
                      </div>
                    </div>

                    {/* ── 3 Status Mini Cards ── */}
                    <div style={{ padding: isMobile ? "12px 14px" : "16px 18px", background:"#fafafa", borderBottom:"1px solid #f1f5f9" }}>
                      <p style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px 0" }}>
                        Filter status
                      </p>
                      <div style={{ display:"flex", gap:"8px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                        <MiniStatusCard
                          label="Sesuai" count={statusCounts.sesuai} total={selectedRows.length}
                          color="#10b981" bg="#f0fdf4" dot="#10b981"
                          isActive={activeFilter==="sesuai"}
                          onClick={()=>handleFilterCard("sesuai")}
                        />
                        <MiniStatusCard
                          label="Perbaiki" count={statusCounts.perbaiki} total={selectedRows.length}
                          color="#f43f5e" bg="#fff1f2" dot="#f43f5e"
                          isActive={activeFilter==="perbaiki"}
                          onClick={()=>handleFilterCard("perbaiki")}
                        />
                        <MiniStatusCard
                          label="Belum" count={statusCounts.belum} total={selectedRows.length}
                          color="#64748b" bg="#f8fafc" dot="#94a3b8"
                          isActive={activeFilter==="belum"}
                          onClick={()=>handleFilterCard("belum")}
                        />
                      </div>
                      {activeFilter && (
                        <button
                          onClick={()=>setActiveFilter(null)}
                          style={{ marginTop:"10px", fontSize:"11px", fontWeight:600, color:"#94a3b8", background:"none", border:"1.5px solid #e2e8f0", borderRadius:"8px", padding:"4px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px" }}
                        >
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          Hapus filter
                        </button>
                      )}
                    </div>
                    {/* ── Filter PML ── */}
{pmlList.length > 0 && (
  <div style={{ padding: isMobile ? "12px 14px" : "16px 18px", background:"#fff", borderBottom:"1px solid #f1f5f9" }}>
    <p style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px 0" }}>
      Filter PML
    </p>
    <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
      <button
        onClick={() => setPmlFilter(null)}
        style={{
          padding: "6px 14px", borderRadius:"99px", fontSize:"12px", fontWeight:700,
          cursor:"pointer", whiteSpace:"nowrap",
          border: !pmlFilter ? "none" : "1.5px solid #fed7aa",
          background: !pmlFilter ? "#f97316" : "#fff7ed",
          color: !pmlFilter ? "#fff" : "#ea580c",
          transition:"all 0.15s",
        }}
      >
        Semua PML
      </button>
      {pmlList.map(pml => (
        <button
          key={pml}
          onClick={() => handlePmlFilter(pml)}
          style={{
            padding: "6px 14px", borderRadius:"99px", fontSize:"12px", fontWeight:700,
            cursor:"pointer", whiteSpace:"nowrap",
            border: pmlFilter === pml ? "none" : "1.5px solid #fed7aa",
            background: pmlFilter === pml ? "#f97316" : "#fff7ed",
            color: pmlFilter === pml ? "#fff" : "#ea580c",
            transition:"all 0.15s",
          }}
        >
          {pml}
        </button>
      ))}
    </div>
   
  </div>
)}

                    {/* Daftar anomali */}
                    <div ref={tableRef} style={{ padding: isMobile ? "0 12px" : "0 20px", maxHeight: isMobile ? "380px" : "440px", overflowY:"auto" }}>
                      <div style={{ position:"sticky", top:0, background:"#fff", paddingTop:"12px", paddingBottom:"2px", zIndex:10 }}>
                        {/* Search */}
                        <div style={{ position:"relative", marginBottom:"10px" }}>
                          <svg style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                            width="14" height="14" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                          </svg>
                        <input type="text" placeholder="Cari nama usaha / nama PCL…" value={searchKK}                            onChange={e=>{setSearchKK(e.target.value); if(tableRef.current)tableRef.current.scrollTop=0;}}
                            style={{ width:"100%", paddingLeft:"32px", paddingRight:searchKK?"28px":"12px", paddingTop:"8px", paddingBottom:"8px", borderRadius:"10px", border:"1.5px solid #e2e8f0", background:"#f8fafc", fontSize:"12px", outline:"none", boxSizing:"border-box" }}
                          />
                          {searchKK && (
                            <button onClick={()=>setSearchKK("")} style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", padding:"2px", display:"flex" }}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                          )}
                        </div>

                        {/* Filter indicator */}
                        {filterLabel && (
                          <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"6px 10px", borderRadius:"8px", background:`${filterColor}10`, marginBottom:"8px" }}>
                            <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:filterColor, flexShrink:0 }}/>
                            <span style={{ fontSize:"11px", fontWeight:700, color:filterColor }}>Menampilkan: {filterLabel}</span>
                            <span style={{ fontSize:"11px", color:"#94a3b8", marginLeft:"auto" }}>{filteredRows.length} data</span>
                          </div>
                        )}

                      </div>

                      {filteredRows.length === 0 ? (
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 0", gap:"8px" }}>
                          <svg width="32" height="32" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                          </svg>
                          <p style={{ color:"#cbd5e1", fontSize:"13px", margin:0 }}>
                            {searchKK ? `Tidak ada hasil untuk "${searchKK}"` : `Tidak ada anomali dengan status "${filterLabel}"`}
                          </p>
                        </div>
                      ) : (
                        filteredRows.map((r,i) => (
                          <AnomaliRow key={`${r.kodeDesa}-${r.kodeSLS}-${r.namaUsaha}-${i}`} row={r} rank={i+1} onDetail={setModalRow} />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: isMobile ? "10px 16px" : "12px 20px", background:"#f8fafc", borderTop:"1px solid #f1f5f9" }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 14px", alignItems:"center", fontSize: isMobile ? "11px" : "12px" }}>
                        <span style={{ fontWeight:700, color:"#475569" }}>
{filteredRows.length}{(searchKK||activeFilter||pmlFilter)?` / ${selectedRows.length}`:""} Anomali                        </span>
{pmlFilter && (
  <>
    <span style={{ color:"#cbd5e1" }}>·</span>
    <span style={{ color:"#2563eb", fontWeight:600 }}>PML: {pmlFilter}</span>
  </>
)}
                        <span style={{ color:"#cbd5e1" }}>·</span>
                        <span style={{ color:"#10b981", fontWeight:600 }}>{filteredRows.filter(r=>r.hasilKonfirmasiPML.startsWith("01")).length} sesuai</span>
                        <span style={{ color:"#cbd5e1" }}>·</span>
                        <span style={{ color:"#f43f5e", fontWeight:600 }}>{filteredRows.filter(r=>r.hasilKonfirmasiPML.startsWith("02")).length} perbaiki</span>
                        <span style={{ color:"#cbd5e1" }}>·</span>
                        <span style={{ color:"#94a3b8", fontWeight:600 }}>{filteredRows.filter(r=>!r.hasilKonfirmasiPML.trim()).length} belum</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}