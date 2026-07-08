import { useState, useEffect, useMemo, useRef } from "react";
import DetailAnomaliKeluarga from "../components/DetailAnomaliKeluarga";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "1NrrW4Yd6JTzZisJ_qMaX0HxW8tuF9aEEVp_eNWflTbU";
const GID_ANOMALI    = "2062667195";
const CSV_ANOMALI = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_ANOMALI}`;

const KECAMATAN_ORDER = [
  "TUNGKAL ULU","MERLUNG","BATANG ASAM","TEBING TINGGI","RENAH MENDALUH","MUARA PAPALIK",
  "PENGABUAN","SENYERANG","TUNGKAL ILIR","BRAM ITAM","SEBERANG KOTA","BETARA","KUALA BETARA",
];

// ── Parser CSV ──
function parseCSV(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  return lines.map(line => {
    const cols = []; let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

function isTotalMarker(v) {
  return /total\s*$/i.test((v || "").trim());
}

// ── Klasifikasi status konfirmasi ──
function getStatusKey(row) {
  const h = (row.hasilKonfirmasiPML || "").trim();
  if (h.startsWith("01")) return "sesuai";
  if (h.startsWith("02")) return "perlu";
  return "belum";
}

function getKorwilStatusKey(row) {
  const h = (row.hasilKonfirmasiKorwil || "").trim();
  if (h.startsWith("01")) return "korwil_ditangani";
  if (h.startsWith("02")) return "korwil_diperbaiki";
  return null;
}

// ── Helpers warna card kecamatan (berdasarkan jumlah BELUM TUNTAS) ──
// "belum tuntas" = perlu + belum → makin banyak makin merah
function countColor(v)    { if (v === 0) return "text-emerald-600"; if (v <= 5) return "text-blue-600"; if (v <= 15) return "text-amber-500"; return "text-rose-500"; }
function countBarColor(v) { if (v === 0) return "bg-emerald-400"; if (v <= 5) return "bg-blue-500"; if (v <= 15) return "bg-amber-400"; return "bg-rose-400"; }
function countBadge(v)    { if (v === 0) return "bg-emerald-50 text-emerald-700 ring-emerald-200"; if (v <= 5) return "bg-blue-50 text-blue-700 ring-blue-200"; if (v <= 15) return "bg-amber-50 text-amber-700 ring-amber-200"; return "bg-rose-50 text-rose-700 ring-rose-200"; }
function countLabel(v)    { if (v === 0) return "Tuntas"; if (v <= 5) return "Ringan"; if (v <= 15) return "Sedang"; return "Perlu Perhatian"; }

function statusBadge(status) {
  const s = (status || "").trim();
  if (s.startsWith("01")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s.startsWith("02")) return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-gray-50 text-gray-500 ring-gray-200";
}
function statusLabel(status) {
  return (status || "").trim() || "Belum Dikonfirmasi";
}

// ── Media Query Hook ──
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

// ── Stat Card global ──
function StatCard({ label, value, sub, icon, accentColor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}02 100%)`,
      borderRadius:"18px", padding:"18px 16px 14px",
      border:`2px solid ${accentColor}30`,
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      minHeight:"120px", position:"relative", overflow:"hidden",
      boxShadow: `0 4px 12px ${accentColor}08`,
      transition: "all 0.3s ease",
    }}>
      {/* Decorative elements - top left gradient circle */}
      <div style={{ position:"absolute", top:"-30px", left:"-30px", width:"80px", height:"80px", borderRadius:"50%", background:`${accentColor}12`, filter:"blur(8px)", pointerEvents:"none" }}/>
      {/* Decorative elements - bottom right accent */}
      <div style={{ position:"absolute", bottom:"-25px", right:"-25px", width:"65px", height:"65px", borderRadius:"50%", background:`${accentColor}08`, pointerEvents:"none" }}/>
      {/* Top accent line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:`linear-gradient(90deg, ${accentColor}00, ${accentColor}60, ${accentColor}00)`, pointerEvents:"none" }}/>
      
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px", position:"relative", zIndex:1 }}>
        <p style={{ fontSize:"10px", fontWeight:700, color:accentColor, textTransform:"uppercase", letterSpacing:"0.08em", margin:0, opacity:0.8 }}>{label}</p>
        <div style={{ width:"36px", height:"36px", borderRadius:"12px", background:`linear-gradient(135deg, ${accentColor}25, ${accentColor}15)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"18px", border:`1.5px solid ${accentColor}35` }}>{icon}</div>
      </div>
      <div style={{ position:"relative", zIndex:1 }}>
        <p style={{ fontSize:"32px", fontWeight:800, color:accentColor, margin:0, lineHeight:1, marginBottom:"4px" }}>{value}</p>
        {sub && <p style={{ fontSize:"12px", color:"#64748b", margin:0, fontWeight:500 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Progress bar ──
function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Card kecamatan ──
// Angka besar = jumlah anomali BELUM TUNTAS (perlu + belum konfirmasi)
// Sub-info    = jumlah sesuai
function KecamatanCard({ kecamatan, countBelumTuntas, countSesuai, maxCount, onClick, isSelected }) {
  const textColor = countColor(countBelumTuntas);
  const barColor  = countBarColor(countBelumTuntas);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
        ${isSelected
          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
          : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
          <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
        </div>
        {/* Angka menonjol = belum tuntas */}
        <span className={`text-2xl font-black flex-shrink-0 ${textColor}`}>{countBelumTuntas}</span>
      </div>

      <ProgressBar value={countBelumTuntas} max={maxCount} color={barColor} />

      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
        {/* Info sesuai */}
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-emerald-600">{countSesuai}</span> sesuai
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${countBadge(countBelumTuntas)}`}>
          {countLabel(countBelumTuntas)}
        </span>
      </div>
    </button>
  );
}

// ── Mini status card filter ──
function StatusFilterCard({ label, value, activeKey, currentFilter, onClick, colorScheme }) {
  const isActive = currentFilter === activeKey;
  const schemes = {
    emerald: {
      base:   "border-emerald-100 bg-emerald-50",
      active: "border-emerald-400 bg-emerald-100 shadow-md shadow-emerald-100",
      num:    "text-emerald-700",
      label:  "text-emerald-600",
    },
    rose: {
      base:   "border-rose-100 bg-rose-50",
      active: "border-rose-400 bg-rose-100 shadow-md shadow-rose-100",
      num:    "text-rose-700",
      label:  "text-rose-600",
    },
    gray: {
      base:   "border-gray-100 bg-gray-50",
      active: "border-gray-400 bg-gray-100 shadow-md shadow-gray-100",
      num:    "text-gray-700",
      label:  "text-gray-500",
    },
    blue: {                                    // ← BARU
    base:   "border-blue-100 bg-blue-50",
    active: "border-blue-400 bg-blue-100 shadow-md shadow-blue-100",
    num:    "text-blue-700",
    label:  "text-blue-600",
  },
  purple: {                                  // ← BARU
    base:   "border-purple-100 bg-purple-50",
    active: "border-purple-400 bg-purple-100 shadow-md shadow-purple-100",
    num:    "text-purple-700",
    label:  "text-purple-600",
  }
  };
  const sc = schemes[colorScheme];
 return (
  <button
    onClick={onClick}
    className={`w-full min-w-0 rounded-xl border-2 px-2 py-2.5 flex flex-col items-center gap-1
      transition-all duration-200 select-none
      ${isActive ? sc.active : sc.base + " hover:brightness-95"}`}
  >
    <span className={`text-lg font-black leading-none ${sc.num}`}>{value}</span>
    <span className={`text-[9px] font-semibold text-center leading-tight ${sc.label}`}>{label}</span>
    {isActive && <span className={`text-[8px] font-bold mt-0.5 ${sc.label}`}>▲</span>}
  </button>
);
}

// ── Baris anomali ──
function AnomaliRow({ row, rank, onDetail }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-700 truncate">{row.namaKK}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {row.namaDesa} - {row.namaSLS}
          </p>
          {/* Desktop */}
          <p className="hidden sm:block text-xs text-gray-400 truncate mt-0.5">
            <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
            {row.namaPML || "-"}
            <span className="inline-block bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 mr-1">PPL</span>
            {row.namaPetugas || "-"}
          </p>
          {/* Mobile */}
          <div className="block sm:hidden text-xs text-gray-400 mt-0.5 space-y-1">
            <div className="flex items-center gap-1">
              <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded">PML</span>
              <span className="truncate">{row.namaPML || "-"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded">PPL</span>
              <span className="truncate">{row.namaPetugas || "-"}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">{row.namaAnomali}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${statusBadge(row.hasilKonfirmasiPML)}`}>
            {statusLabel(row.hasilKonfirmasiPML)}
          </span>
          <button
            onClick={() => onDetail(row)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500
              hover:bg-orange-100 active:bg-orange-200 transition-colors border border-orange-100 whitespace-nowrap"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KOMPONEN UTAMA
// ══════════════════════════════════════════════════════════════════════════════
export default function MonitoringAnomali() {
  const [rawRows, setRawRows]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedKec, setSelectedKec]   = useState(null);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("urut");
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [searchKK, setSearchKK]         = useState("");
  const [modalRow, setModalRow]         = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [pmlFilter, setPmlFilter] = useState(null);   // ← BARU

  const isMobile = useMediaQuery("(max-width: 640px)");

  const detailRef = useRef(null);
  const tableRef  = useRef(null);

 useEffect(() => {
  if (tableRef.current) tableRef.current.scrollTop = 0;
  setSearchKK("");
  setStatusFilter(null);
  setPmlFilter(null);   // ← BARU
}, [selectedKec]);

  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
    }
  };

  const handleStatusFilter = (key) => {
    setStatusFilter(prev => prev === key ? null : key);
    if (tableRef.current) tableRef.current.scrollTop = 0;
  };

  const handlePmlFilter = (pml) => {
  setPmlFilter(prev => prev === pml ? null : pml);
  if (tableRef.current) tableRef.current.scrollTop = 0;
};

  // ── Fetch CSV ──
  useEffect(() => {
    fetch(`${CSV_ANOMALI}&_cb=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data anomali."); return r.text(); })
      .then(text => {
        const parsed = parseCSV(text);
        let lastKodeKec="", lastNamaKec="", lastKodeDesa="", lastNamaDesa="";
let lastKodeSLS="", lastSubSLS="", lastNamaSLS="", lastPML="", lastPetugas="";  // tambahkan lastNamaSLS=""
        const data = [];

        
      parsed.slice(1).forEach((cols, idx) => {
  const sheetRow = idx + 2;
  const kodeKec     = (cols[0]||"").trim(); if (kodeKec     && !isTotalMarker(kodeKec))     lastKodeKec  = kodeKec;
  const namaKec     = (cols[1]||"").trim(); if (namaKec     && !isTotalMarker(namaKec))     lastNamaKec  = namaKec;
  const kodeDesa    = (cols[2]||"").trim(); if (kodeDesa    && !isTotalMarker(kodeDesa))    lastKodeDesa = kodeDesa;
  const namaDesa    = (cols[3]||"").trim(); if (namaDesa    && !isTotalMarker(namaDesa))    lastNamaDesa = namaDesa;
  const kodeSLS     = (cols[4]||"").trim(); if (kodeSLS     && !isTotalMarker(kodeSLS))     lastKodeSLS  = kodeSLS;
  const subSLS      = (cols[5]||"").trim(); if (subSLS      && !isTotalMarker(subSLS))      lastSubSLS   = subSLS;
  const namaSLS     = (cols[6]||"").trim(); if (namaSLS     && !isTotalMarker(namaSLS))     lastNamaSLS  = namaSLS;   // ← BARU
  const namaPML     = (cols[7]||"").trim(); if (namaPML     && !isTotalMarker(namaPML))     lastPML      = namaPML;   // 6 → 7
  const namaPetugas = (cols[8]||"").trim(); if (namaPetugas && !isTotalMarker(namaPetugas)) lastPetugas  = namaPetugas; // 7 → 8

  const namaKK      = (cols[9] ||"").trim();  // 8 → 9
  const namaAnomali = (cols[10]||"").trim();  // 9 → 10
  if (!namaKK || !namaAnomali) return;

  data.push({
    rowIndex: sheetRow,
    kodeKec: lastKodeKec, namaKec: lastNamaKec,
    kodeDesa: lastKodeDesa, namaDesa: lastNamaDesa,
    kodeSLS: lastKodeSLS, subSLS: lastSubSLS,
    namaSLS: lastNamaSLS,                          // ← BARU: masukkan ke row object
    namaPML: lastPML, namaPetugas: lastPetugas,
    namaKK, namaAnomali,
    keteranganAnomali:     (cols[11]||"").trim(),   // 10 → 11
    linkFasih:             (cols[12]||"").trim(),   // 11 → 12
    hasilKonfirmasiPML:    (cols[14]||"").trim(),   // tetap
    keteranganKoreksi:     (cols[15]||"").trim(),   // tetap
    hasilKonfirmasiKorwil: (cols[16]||"").trim(),   // tetap
  });
});
        setRawRows(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Agregasi ──
  const kecamatanMap = useMemo(() => {
    const m = {};
    rawRows.forEach(r => { if (!m[r.namaKec]) m[r.namaKec]=[]; m[r.namaKec].push(r); });
    return m;
  }, [rawRows]);

  // ── Statistik global (3 kartu utama) ──
  const globalStats = useMemo(() => {
  if (!rawRows.length) return null;
  const sesuai = rawRows.filter(r => getStatusKey(r)==="sesuai").length;
  const perlu  = rawRows.filter(r => getStatusKey(r)==="perlu").length;
  const belum  = rawRows.filter(r => getStatusKey(r)==="belum").length;
  const korwilDitangani  = rawRows.filter(r => getKorwilStatusKey(r)==="korwil_ditangani").length;   // ← BARU
  const korwilDiperbaiki = rawRows.filter(r => getKorwilStatusKey(r)==="korwil_diperbaiki").length;  // ← BARU
  return { total: rawRows.length, sesuai, perlu, belum, korwilDitangani, korwilDiperbaiki };
}, [rawRows]);

  // ── Daftar kartu kecamatan ──
  // Angka di kartu = perlu + belum (belum tuntas)
  const kecamatanList = useMemo(() => {
    const namaList = new Set([...KECAMATAN_ORDER, ...Object.keys(kecamatanMap)]);
    return [...namaList]
      .map(nama => {
        const list   = kecamatanMap[nama] || [];
        const sesuai = list.filter(r => getStatusKey(r)==="sesuai").length;
        const perlu  = list.filter(r => getStatusKey(r)==="perlu").length;
        const belum  = list.filter(r => getStatusKey(r)==="belum").length;
        return {
          kecamatan: nama,
          countBelumTuntas: perlu + belum,  // ← angka besar di kartu
          countSesuai: sesuai,
          countTotal:  list.length,
        };
      })
      .filter(k => k.countTotal > 0 || KECAMATAN_ORDER.includes(k.kecamatan))
      .filter(k => search==="" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortBy === "jumlah"
          ? b.countBelumTuntas - a.countBelumTuntas
          : (KECAMATAN_ORDER.indexOf(a.kecamatan) - KECAMATAN_ORDER.indexOf(b.kecamatan)) ||
            a.kecamatan.localeCompare(b.kecamatan)
      );
  }, [kecamatanMap, search, sortBy]);

  // maxCount untuk proporsi progress bar (pakai belumTuntas)
  const maxCount = useMemo(
    () => kecamatanList.reduce((m,k) => Math.max(m, k.countBelumTuntas), 0),
    [kecamatanList]
  );

  const selectedRows = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec]||[])].sort(
      (a,b) => a.namaDesa.localeCompare(b.namaDesa) || a.kodeSLS.localeCompare(b.kodeSLS)
    );
  }, [selectedKec, kecamatanMap]);
  const pmlList = useMemo(() => {
  const set = new Set();
  selectedRows.forEach(r => { if (r.namaPML) set.add(r.namaPML); });
  return [...set].sort((a, b) => a.localeCompare(b));
}, [selectedRows]);

 const statusCounts = useMemo(() => ({
  sesuai:  selectedRows.filter(r => getStatusKey(r)==="sesuai").length,
  perlu:   selectedRows.filter(r => getStatusKey(r)==="perlu").length,
  belum:   selectedRows.filter(r => getStatusKey(r)==="belum").length,
  korwilDitangani:  selectedRows.filter(r => getKorwilStatusKey(r)==="korwil_ditangani").length,    // ← BARU
  korwilDiperbaiki: selectedRows.filter(r => getKorwilStatusKey(r)==="korwil_diperbaiki").length,   // ← BARU
}), [selectedRows]);

const filteredRows = useMemo(() => {
  let result = selectedRows;
  if (statusFilter === "sesuai" || statusFilter === "perlu" || statusFilter === "belum") {
    result = result.filter(r => getStatusKey(r) === statusFilter);
  } else if (statusFilter === "korwil_ditangani" || statusFilter === "korwil_diperbaiki") {   // ← BARU
    result = result.filter(r => getKorwilStatusKey(r) === statusFilter);
  }
  if (pmlFilter) result = result.filter(r => r.namaPML === pmlFilter);
  if (searchKK.trim()) {
    const q = searchKK.toLowerCase();
    result = result.filter(r =>
      (r.namaKK      ||"").toLowerCase().includes(q) ||
      (r.namaPetugas ||"").toLowerCase().includes(q)
    );
  }
  return result;
}, [selectedRows, statusFilter, pmlFilter, searchKK]); // ← tambahkan pmlFilter di dependency

  const handleSaved = (updatedRow) => {
    setRawRows(prev => prev.map(r => r.rowIndex===updatedRow.rowIndex ? updatedRow : r));
    setModalRow(updatedRow);
  };

 const filterLabel = statusFilter==="sesuai" ? "✓ Sudah Sesuai"
  : statusFilter==="perlu"  ? "✗ Perlu Diperbaiki"
  : statusFilter==="belum"  ? "⏳ Belum Dikonfirmasi"
  : statusFilter==="korwil_ditangani"  ? "🛡️ Ditangani Korwil"
  : statusFilter==="korwil_diperbaiki" ? "🔧 Diperbaiki PCL & Diapprove PML"
  : null;
    // ── Hitung last update: Minggu terakhir jam 06.00 WIB ──
  const getLastUpdate = () => {
    const now = new Date();
    const update = new Date(now);
    // Cari Minggu minggu ini
    update.setDate(now.getDate() - now.getDay());
    // Set jam update
    update.setHours(6, 0, 0, 0);
    // Jika sekarang masih sebelum Minggu 06.00, mundur ke Minggu minggu lalu
    if (now < update) {
      update.setDate(update.getDate() - 7);
    }
    return update;
  };
  const computedLastUpdated = getLastUpdate();
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {modalRow && (
        <DetailAnomaliKeluarga row={modalRow} onClose={() => setModalRow(null)} onSaved={handleSaved} />
      )}

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden" style={{ background:"linear-gradient(135deg,#fb923c 0%,#f97316 45%,#ea580c 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Monitoring Anomali Keluarga</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {computedLastUpdated && (
              <div className="text-right">
                <p className="text-orange-100">Data diperbarui pada</p>
                <p className="text-orange-100">
                  {computedLastUpdated.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} Pukul 06.00 WIB
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Mengambil data anomali dari spreadsheet…</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-4">
            <p className="text-rose-600 font-semibold">Gagal memuat data</p>
            <p className="text-rose-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && globalStats && (
          <>
            {/* ── Stat Cards global ── */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))", gap: "14px", marginBottom: "28px" }}>
  <StatCard
    label="Sudah Sesuai"
    value={globalStats.sesuai}
    sub={`${((globalStats.sesuai/globalStats.total)*100).toFixed(1)}% dari total`}
    icon="✅"
    accentColor="#0ea5e9"
  />
  <StatCard
    label="Perlu Diperbaiki"
    value={globalStats.perlu}
    sub={`${((globalStats.perlu/globalStats.total)*100).toFixed(1)}% dari total`}
    icon="❌"
    accentColor="#e11d48"
  />
  <StatCard
    label="Belum Dikonfirmasi"
    value={globalStats.belum}
    sub={`${((globalStats.belum/globalStats.total)*100).toFixed(1)}% dari total`}
    icon="⏳"
    accentColor="#f59e0b"
  />
  <StatCard
    label="Ditangani Korwil"
    value={globalStats.korwilDitangani}
    sub={`${((globalStats.korwilDitangani/globalStats.total)*100).toFixed(1)}% dari total`}
    icon="🛡️"
    accentColor="#a855f7"
  />
  <StatCard
    label="Diperbaiki PCL & Diapprove PML"
    value={globalStats.korwilDiperbaiki}
    sub={`${((globalStats.korwilDiperbaiki/globalStats.total)*100).toFixed(1)}% dari total`}
    icon="🔧"
    accentColor="#10b981"
  />
  <StatCard
    label="Total Anomali"
    value={globalStats.total}
    sub="seluruh baris anomali"
    icon="📊"
    accentColor="#06b6d4"
  />
            </div>

            {/* ── Filter & sort kecamatan ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text" placeholder="Cari nama kecamatan…" value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedKec(null); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setSortBy("urut")}   className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy==="urut"   ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Urutan</button>
                <button onClick={() => setSortBy("jumlah")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy==="jumlah" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Terbanyak ↓</button>
              </div>
            </div>

            {/* ── Keterangan angka kartu ── */}
            {/* <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Angka pada kartu kecamatan = jumlah anomali <strong className="text-gray-600">belum tuntas</strong> (perlu diperbaiki + belum dikonfirmasi)
            </p> */}

            {/* ── Layout dua kolom ── */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Kolom kiri: kartu kecamatan */}
              <div className="lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, countBelumTuntas, countSesuai }) => (
                  <KecamatanCard
                    key={kecamatan}
                    kecamatan={kecamatan}
                    countBelumTuntas={countBelumTuntas}
                    countSesuai={countSesuai}
                    maxCount={maxCount}
                    isSelected={selectedKec===kecamatan}
                    onClick={() => handleSelectKec(kecamatan)}
                  />
                ))}
              </div>

              {/* Kolom kanan: detail */}
              <div ref={detailRef} className="lg:w-[45%]">
                {!selectedKec ? (
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar keluarga dengan anomali.</p>
                  </div>
                ) : (
                  <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Panel header */}
                    <div className="px-6 py-5" style={{ background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Kecamatan</p>
                          <h2 className="text-white text-xl font-black">{selectedKec}</h2>
                        </div>
                        <button onClick={() => setSelectedKec(null)} className="text-orange-200 hover:text-white transition-colors mt-1 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-white text-sm">
                        <span className="opacity-80">Total anomali di kecamatan ini</span>
                        <span className="font-bold text-lg">{selectedRows.length}</span>
                      </div>
                    </div>

                    {/* ── 3 Status Filter Card ── */}
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
    Filter berdasarkan status
    {statusFilter && (
      <button onClick={() => setStatusFilter(null)} className="ml-2 text-orange-500 normal-case font-semibold hover:underline">
        (reset)
      </button>
    )}
  </p>
  <div className="grid grid-cols-5 gap-1.5">
    <StatusFilterCard label="Sudah Sesuai"       value={statusCounts.sesuai}            activeKey="sesuai"            currentFilter={statusFilter} onClick={() => handleStatusFilter("sesuai")}            colorScheme="emerald" />
    <StatusFilterCard label="Perlu Diperbaiki"   value={statusCounts.perlu}             activeKey="perlu"             currentFilter={statusFilter} onClick={() => handleStatusFilter("perlu")}             colorScheme="rose"    />
    <StatusFilterCard label="Belum Dikonfirmasi" value={statusCounts.belum}             activeKey="belum"             currentFilter={statusFilter} onClick={() => handleStatusFilter("belum")}             colorScheme="gray"    />
    <StatusFilterCard label="Ditangani Korwil"   value={statusCounts.korwilDitangani}   activeKey="korwil_ditangani"  currentFilter={statusFilter} onClick={() => handleStatusFilter("korwil_ditangani")}  colorScheme="blue"    />
    <StatusFilterCard label="Diperbaiki PCL"     value={statusCounts.korwilDiperbaiki}  activeKey="korwil_diperbaiki" currentFilter={statusFilter} onClick={() => handleStatusFilter("korwil_diperbaiki")} colorScheme="purple"  />
  </div>
</div>
{/* ── Filter PML ── */}
{pmlList.length > 0 && (
  <div className="px-5 py-4 border-b border-gray-100">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
      Filter berdasarkan PML
      {pmlFilter && (
        <button onClick={() => setPmlFilter(null)} className="ml-2 text-orange-500 normal-case font-semibold hover:underline">
          (reset)
        </button>
      )}
    </p>
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => setPmlFilter(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap
          ${!pmlFilter
            ? "bg-orange-500 text-white"
            : "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"}`}
      >
        Semua PML
      </button>
      {pmlList.map(pml => (
        <button
          key={pml}
          onClick={() => handlePmlFilter(pml)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap
            ${pmlFilter === pml
              ? "bg-orange-500 text-white"
              : "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"}`}
        >
          {pml}
        </button>
      ))}
    </div>
  </div>
)}
                    {/* Daftar KK */}
                    <div ref={tableRef} className="px-6 max-h-[460px] overflow-y-auto">
                      <div className="sticky top-0 bg-white pt-2 pb-1 z-10">
                       
                        <div className="relative mb-2">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                          </svg>
                          <input
                            type="text" placeholder="Cari nama Kepala Keluarga / nama PPL" value={searchKK}
                            onChange={e => { setSearchKK(e.target.value); if(tableRef.current) tableRef.current.scrollTop=0; }}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
                          />
                          {searchKK && (
                            <button onClick={() => setSearchKK("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {filteredRows.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-3xl mb-2">
                            {statusFilter==="sesuai" ? "✅" : statusFilter==="perlu" ? "❌" : statusFilter==="belum" ? "⏳" : "🔍"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {searchKK
                              ? `Tidak ada hasil untuk "${searchKK}"`
                              : statusFilter
                              ? `Tidak ada data dengan status "${filterLabel}"`
                              : "Belum ada data anomali."}
                          </p>
                        </div>
                      ) : (
                        filteredRows.map((r,i) => (
                          <AnomaliRow
                            key={`${r.kodeDesa}-${r.kodeSLS}-${r.namaKK}-${i}`}
                            row={r} rank={i+1}
                            onDetail={setModalRow}
                          />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-2 text-xs text-gray-400 flex-wrap items-center">
                        <span className="font-semibold text-gray-600">
{filteredRows.length}{(searchKK||statusFilter||pmlFilter) ? ` / ${selectedRows.length}` : ""} KK                        </span>
{pmlFilter && (
  <span className="text-blue-500 font-medium">· PML: {pmlFilter}</span>
)}
                        {statusFilter ? (
                          <span className="text-orange-500 font-medium">· {filterLabel}</span>
                        ) : (
                          <>
                            <span>·</span>
                            <span className="text-emerald-600 font-medium">{statusCounts.sesuai} sesuai</span>
                            <span>·</span>
                            <span className="text-rose-400 font-medium">{statusCounts.perlu} perlu diperbaiki</span>
                            <span>·</span>
                            <span className="text-gray-400 font-medium">{statusCounts.belum} belum dikonfirmasi</span>
                          </>
                        )}
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
        @keyframes fadeIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
