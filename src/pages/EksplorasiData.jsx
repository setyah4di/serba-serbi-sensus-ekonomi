import { useState, useEffect, useMemo, useRef } from "react";
import DetailEksplorasiData from "../components/DetailEksplorasiData";

// ── Konfigurasi Apps Script ──
// Web App ini yang menyediakan data (GET ?action=list) sekaligus menerima update (POST)
// untuk kolom R (Hasil Konfirmasi), S (catatan dari kabkota), T (Ditindaklanjuti Korwil).
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzJpyFu3YdH1VxySlzD6J7QdEIMoPhy_GUYrMOXJdwmXDZo68HPibanNKmd9pGP0EOE/exec";

const KECAMATAN_ORDER = [
  "TUNGKAL ULU","MERLUNG","BATANG ASAM","TEBING TINGGI","RENAH MENDALUH","MUARA PAPALIK",
  "PENGABUAN","SENYERANG","TUNGKAL ILIR","BRAM ITAM","SEBERANG KOTA","BETARA","KUALA BETARA",
];

// ── Klasifikasi status Hasil Konfirmasi (kolom R) ──
function getStatusKey(row) {
  const h = (row.hasilKonfirmasi || "").trim();
  if (h.startsWith("01")) return "sesuai";
  if (h.startsWith("02")) return "perlu";
  return "belum";
}

// ── Klasifikasi status Ditindaklanjuti Korwil (kolom T) ──
// Kolom ini hanya relevan ketika Hasil Konfirmasi = "Perlu Diperbaiki".
function getKorwilStatusKey(row) {
  const t = (row.ditindaklanjutiKorwil || "").trim();
  if (t.startsWith("01")) return "korwil_ditangani";
  return null;
}

// ── Kunci filter/badge gabungan untuk satu baris ──
// Kalau kasus "Perlu Diperbaiki" sudah ditindaklanjuti Korwil, itu yang jadi status utamanya.
// Kalau belum, statusnya mengikuti Hasil Konfirmasi.
function computeRowFilterKey(row) {
  if (getKorwilStatusKey(row) === "korwil_ditangani") return "korwil_ditangani";
  return getStatusKey(row); // "sesuai" | "perlu" | "belum"
}

// ── Helpers warna card kecamatan (berdasarkan jumlah BELUM TUNTAS) ──
function countColor(v)    { if (v === 0) return "text-emerald-600"; if (v <= 20) return "text-blue-600"; if (v <= 50) return "text-amber-500"; return "text-rose-500"; }
function countBarColor(v) { if (v === 0) return "bg-emerald-400"; if (v <= 20) return "bg-blue-500"; if (v <= 50) return "bg-amber-400"; return "bg-rose-400"; }
function countBadge(v)    { if (v === 0) return "bg-emerald-50 text-emerald-700 ring-emerald-200"; if (v <= 20) return "bg-blue-50 text-blue-700 ring-blue-200"; if (v <= 50) return "bg-amber-50 text-amber-700 ring-amber-200"; return "bg-rose-50 text-rose-700 ring-rose-200"; }
function countLabel(v)    { if (v === 0) return "Tuntas"; if (v <= 20) return "Ringan"; if (v <= 50) return "Sedang"; return "Perlu Perhatian"; }

function filterBadgeInfo(key) {
  switch (key) {
    case "belum":
      return { label: "Belum Dikonfirmasi", cls: "bg-gray-50 text-gray-600 ring-gray-200" };
    case "sesuai":
      return { label: "Sudah Sesuai", cls: "bg-blue-50 text-blue-700 ring-blue-200" };
    case "perlu":
      return { label: "Perlu Diperbaiki", cls: "bg-rose-50 text-rose-700 ring-rose-200" };
    case "korwil_ditangani":
      return { label: "Sudah Ditangani Korwil", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    default:
      return null;
  }
}

// ── Stat Card global ──
function StatCard({ label, value, sub, icon, accentColor }) {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-[18px] p-3.5 sm:p-4 min-h-[104px] sm:min-h-[120px] transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}02 100%)`,
        border: `2px solid ${accentColor}30`,
        boxShadow: `0 4px 12px ${accentColor}08`,
      }}
    >
      <div style={{ position:"absolute", top:"-30px", left:"-30px", width:"80px", height:"80px", borderRadius:"50%", background:`${accentColor}12`, filter:"blur(8px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-25px", right:"-25px", width:"65px", height:"65px", borderRadius:"50%", background:`${accentColor}08`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:`linear-gradient(90deg, ${accentColor}00, ${accentColor}60, ${accentColor}00)`, pointerEvents:"none" }}/>

      <div className="relative z-10 flex items-start justify-between gap-2">
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider m-0 opacity-80" style={{ color: accentColor }}>{label}</p>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg"
          style={{ background:`linear-gradient(135deg, ${accentColor}25, ${accentColor}15)`, border:`1.5px solid ${accentColor}35` }}
        >
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="font-extrabold m-0 mb-1 leading-none text-2xl sm:text-3xl" style={{ color: accentColor }}>{value}</p>
        {sub && <p className="text-[11px] sm:text-xs text-slate-500 m-0 font-medium truncate">{sub}</p>}
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
// Angka besar = jumlah kasus BELUM TUNTAS (belum dikonfirmasi + perlu diperbaiki yg belum ditindaklanjuti korwil)
// Sub-info    = jumlah kasus yang sudah ditangani korwil
function KecamatanCard({ kecamatan, countBelumTuntas, countKorwilDitangani, maxCount, onClick, isSelected }) {
  const textColor = countColor(countBelumTuntas);
  const barColor  = countBarColor(countBelumTuntas);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200
        ${isSelected
          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
          : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
          <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight break-words">{kecamatan}</p>
        </div>
        <span className={`text-xl sm:text-2xl font-black flex-shrink-0 ${textColor}`}>{countBelumTuntas}</span>
      </div>

      <ProgressBar value={countBelumTuntas} max={maxCount} color={barColor} />

      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-emerald-600">{countKorwilDitangani}</span> Sudah Ditangani Korwil
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${countBadge(countBelumTuntas)}`}>
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
    emerald: { base:"border-emerald-100 bg-emerald-50", active:"border-emerald-400 bg-emerald-100 shadow-md shadow-emerald-100", num:"text-emerald-700", label:"text-emerald-600" },
    rose:    { base:"border-rose-100 bg-rose-50",       active:"border-rose-400 bg-rose-100 shadow-md shadow-rose-100",       num:"text-rose-700",    label:"text-rose-600" },
    gray:    { base:"border-gray-100 bg-gray-50",       active:"border-gray-400 bg-gray-100 shadow-md shadow-gray-100",       num:"text-gray-700",    label:"text-gray-500" },
    blue:    { base:"border-blue-100 bg-blue-50",       active:"border-blue-400 bg-blue-100 shadow-md shadow-blue-100",       num:"text-blue-700",    label:"text-blue-600" },
  };
  const sc = schemes[colorScheme];
  return (
    <button
      onClick={onClick}
      className={`w-full min-w-0 rounded-xl border-2 px-2 py-2.5 flex flex-col items-center gap-1
        transition-all duration-200 select-none
        ${isActive ? sc.active : sc.base + " hover:brightness-95"}`}
    >
      <span className={`text-base sm:text-lg font-black leading-none ${sc.num}`}>{value}</span>
      <span className={`text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-center leading-tight ${sc.label}`}>
        {label}
      </span>
    </button>
  );
}

// ── Baris kasus ──
function KasusRow({ row, rank, onDetail }) {
  const key   = computeRowFilterKey(row);
  const badge = filterBadgeInfo(key);

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-700 truncate">{row.data1 || "-"}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {row.namaKelurahan} - {row.namaSls}
          </p>
          {/* PML / PCL: berdampingan hanya di layar lebar (md+), agar di tablet sempit tidak terpotong */}
          <p className="hidden md:block text-xs text-gray-400 truncate mt-0.5">
            <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
            {row.namaPml || "-"}
            <span className="inline-block bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 mr-1">PCL</span>
            {row.namaPcl || "-"}
          </p>
          {/* Mobile & tablet: PML/PCL ditumpuk agar tidak terpotong */}
          <div className="block md:hidden text-xs text-gray-400 mt-0.5 space-y-1">
            <div className="flex items-center gap-1 min-w-0">
              <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">PML</span>
              <span className="truncate">{row.namaPml || "-"}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="inline-block bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">PCL</span>
              <span className="truncate">{row.namaPcl || "-"}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">{row.penjelasanCase}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${badge.cls}`}>
            {badge.label}
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
export default function EksplorasiData() {
  const [rawRows, setRawRows]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedKec, setSelectedKec]   = useState(null);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("urut");
  const [searchKasus, setSearchKasus]   = useState("");
  const [modalRow, setModalRow]         = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [pmlFilter, setPmlFilter]       = useState(null);

  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(() => {
    if (tableRef.current) tableRef.current.scrollTop = 0;
    setSearchKasus("");
    setStatusFilter(null);
    setPmlFilter(null);
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

  // ── Fetch data dari Apps Script ──
  useEffect(() => {
    fetch(`${APPS_SCRIPT_URL}?action=list&_cb=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data."); return r.json(); })
      .then(json => {
        if (!json.success) throw new Error(json.error || "Gagal mengambil data.");
        setRawRows(json.data || []);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Agregasi per kecamatan ──
  const kecamatanMap = useMemo(() => {
    const m = {};
    rawRows.forEach(r => { if (!m[r.namaKecamatan]) m[r.namaKecamatan]=[]; m[r.namaKecamatan].push(r); });
    return m;
  }, [rawRows]);

  // ── Statistik global (4 kategori + total) ──
  const globalStats = useMemo(() => {
    if (!rawRows.length) return null;
    const sesuai          = rawRows.filter(r => computeRowFilterKey(r) === "sesuai").length;
    const perlu            = rawRows.filter(r => computeRowFilterKey(r) === "perlu").length;
    const belum           = rawRows.filter(r => computeRowFilterKey(r) === "belum").length;
    const korwilDitangani = rawRows.filter(r => computeRowFilterKey(r) === "korwil_ditangani").length;
    return { total: rawRows.length, sesuai, perlu, belum, korwilDitangani };
  }, [rawRows]);

  // ── Daftar kartu kecamatan ──
  const kecamatanList = useMemo(() => {
    const namaList = new Set([...KECAMATAN_ORDER, ...Object.keys(kecamatanMap)]);
    return [...namaList]
      .map(nama => {
        const list = kecamatanMap[nama] || [];
        const belum = list.filter(r => getStatusKey(r) === "belum").length;
        const perluBelumDitindaklanjuti = list.filter(r => computeRowFilterKey(r) === "perlu").length;
        const korwilDitangani = list.filter(r => getKorwilStatusKey(r) === "korwil_ditangani").length;
        return {
          kecamatan: nama,
          countBelumTuntas: belum + perluBelumDitindaklanjuti,     // ← angka besar di kartu
          countKorwilDitangani: korwilDitangani,                    // ← sub-info di kartu
          countTotal: list.length,
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

  const maxCount = useMemo(
    () => kecamatanList.reduce((m,k) => Math.max(m, k.countBelumTuntas), 0),
    [kecamatanList]
  );

  const selectedRows = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec]||[])].sort(
      (a,b) => (a.namaKelurahan||"").localeCompare(b.namaKelurahan||"") || (a.namaSls||"").localeCompare(b.namaSls||"")
    );
  }, [selectedKec, kecamatanMap]);

  const pmlList = useMemo(() => {
    const set = new Set();
    selectedRows.forEach(r => { if (r.namaPml) set.add(r.namaPml); });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [selectedRows]);

  // ── 4 kategori status di panel detail kecamatan ──
  const statusCounts = useMemo(() => {
    const sesuai          = selectedRows.filter(r => computeRowFilterKey(r) === "sesuai").length;
    const perlu            = selectedRows.filter(r => computeRowFilterKey(r) === "perlu").length;
    const belum           = selectedRows.filter(r => computeRowFilterKey(r) === "belum").length;
    const korwilDitangani = selectedRows.filter(r => computeRowFilterKey(r) === "korwil_ditangani").length;
    return { sesuai, perlu, belum, korwilDitangani };
  }, [selectedRows]);

  const filteredRows = useMemo(() => {
    let result = selectedRows;

    if (statusFilter === "sesuai") {
      result = result.filter(r => computeRowFilterKey(r) === "sesuai");
    } else if (statusFilter === "perlu") {
      result = result.filter(r => computeRowFilterKey(r) === "perlu");
    } else if (statusFilter === "belum") {
      result = result.filter(r => computeRowFilterKey(r) === "belum");
    } else if (statusFilter === "korwil_ditangani") {
      result = result.filter(r => computeRowFilterKey(r) === "korwil_ditangani");
    }

    if (pmlFilter) result = result.filter(r => r.namaPml === pmlFilter);

    if (searchKasus.trim()) {
      const q = searchKasus.toLowerCase();
      result = result.filter(r =>
        (r.data1  || "").toLowerCase().includes(q) ||
        (r.namaPcl || "").toLowerCase().includes(q) ||
        (r.alamat || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedRows, statusFilter, pmlFilter, searchKasus]);

  const handleSaved = (updatedRow) => {
    setRawRows(prev => prev.map(r => r.rowNumber===updatedRow.rowNumber ? updatedRow : r));
    setModalRow(updatedRow);
  };

  const filterLabel = statusFilter==="sesuai" ? "✓ Sudah Sesuai"
    : statusFilter==="perlu"  ? "✗ Perlu Diperbaiki"
    : statusFilter==="belum"  ? "⏳ Belum Dikonfirmasi"
    : statusFilter==="korwil_ditangani"  ? "🛡️ Sudah Ditangani Korwil"
    : null;

  // ── Hitung last update: Minggu terakhir jam 06.00 WIB ──
  const getLastUpdate = () => {
    const now = new Date();
    const update = new Date(now);
    update.setDate(now.getDate() - now.getDay());
    update.setHours(6, 0, 0, 0);
    if (now < update) update.setDate(update.getDate() - 7);
    return update;
  };
  const computedLastUpdated = getLastUpdate();

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">

      {modalRow && (
        <DetailEksplorasiData row={modalRow} onClose={() => setModalRow(null)} onSaved={handleSaved} />
      )}

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden" style={{ background:"linear-gradient(135deg,#fb923c 0%,#f97316 45%,#ea580c 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-black leading-tight">Eksplorasi Data</h1>
              <p className="text-orange-100 mt-1 text-sm sm:text-base">Monitoring Konfirmasi Case</p>
            </div>
            {computedLastUpdated && (
              <div className="rounded-xl px-4 py-2.5 bg-white/15 border border-white/20 self-start sm:self-auto">
                <p className="text-white/75 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">
                  Data diperbarui pada
                </p>
                <p className="text-white text-sm font-bold">
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
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-6 py-6 sm:py-8">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Mengambil data dari spreadsheet…</p>
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
            {/* ── Stat Cards global: 5 kartu (4 kategori status + total) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-6 sm:mb-7">
              <StatCard
                label="Belum Dikonfirmasi"
                value={globalStats.belum}
                sub={`${((globalStats.belum/globalStats.total)*100).toFixed(1)}% dari total`}
                icon="⏳"
                accentColor="#f59e0b"
              />
              <StatCard
                label="Sudah Sesuai"
                value={globalStats.sesuai}
                sub={`${((globalStats.sesuai/globalStats.total)*100).toFixed(1)}% dari total`}
                icon="✅"
                accentColor="#2563eb"
              />
              <StatCard
                label="Perlu Diperbaiki"
                value={globalStats.perlu}
                sub={`${((globalStats.perlu/globalStats.total)*100).toFixed(1)}% dari total`}
                icon="❌"
                accentColor="#e11d48"
              />
              <StatCard
                label="Sudah Ditangani Korwil"
                value={globalStats.korwilDitangani}
                sub={`${((globalStats.korwilDitangani/globalStats.total)*100).toFixed(1)}% dari total`}
                icon="🛡️"
                accentColor="#0f766e"
              />
              <StatCard
                label="Total Case"
                value={globalStats.total}
                sub="seluruh baris data"
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

            {/* ── Layout dua kolom ── */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Kolom kiri: kartu kecamatan */}
              <div className="lg:w-[55%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, countBelumTuntas, countKorwilDitangani }) => (
                  <KecamatanCard
                    key={kecamatan}
                    kecamatan={kecamatan}
                    countBelumTuntas={countBelumTuntas}
                    countKorwilDitangani={countKorwilDitangani}
                    maxCount={maxCount}
                    isSelected={selectedKec===kecamatan}
                    onClick={() => handleSelectKec(kecamatan)}
                  />
                ))}
              </div>

              {/* Kolom kanan: detail */}
              <div ref={detailRef} className="w-full min-w-0 lg:w-[45%]">
                {!selectedKec ? (
                  <div className="lg:sticky lg:top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-16 sm:py-20 text-center px-6 sm:px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar case.</p>
                  </div>
                ) : (
                  <div className="lg:sticky lg:top-6 w-full min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Panel header */}
                    <div className="px-5 sm:px-6 py-4 sm:py-5" style={{ background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Kecamatan</p>
                          <h2 className="text-white text-lg sm:text-xl font-black break-words">{selectedKec}</h2>
                        </div>
                        <button onClick={() => setSelectedKec(null)} className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-white text-sm">
                        <span className="opacity-80">Total case di kecamatan ini</span>
                        <span className="font-bold text-lg">{selectedRows.length}</span>
                      </div>
                    </div>

                    {/* ── 4 Status Filter Card ── */}
                    <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                        Filter berdasarkan status
                        {statusFilter && (
                          <button onClick={() => setStatusFilter(null)} className="ml-2 text-orange-500 normal-case font-semibold hover:underline">
                            (reset)
                          </button>
                        )}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <StatusFilterCard label="Belum Dikonfirmasi"     value={statusCounts.belum}           activeKey="belum"             currentFilter={statusFilter} onClick={() => handleStatusFilter("belum")}             colorScheme="gray"    />
                        <StatusFilterCard label="Sudah Sesuai"           value={statusCounts.sesuai}          activeKey="sesuai"            currentFilter={statusFilter} onClick={() => handleStatusFilter("sesuai")}            colorScheme="blue"    />
                        <StatusFilterCard label="Perlu Diperbaiki"       value={statusCounts.perlu}           activeKey="perlu"             currentFilter={statusFilter} onClick={() => handleStatusFilter("perlu")}             colorScheme="rose"    />
                        <StatusFilterCard label="Sudah Ditangani Korwil" value={statusCounts.korwilDitangani} activeKey="korwil_ditangani"  currentFilter={statusFilter} onClick={() => handleStatusFilter("korwil_ditangani")}  colorScheme="emerald" />
                      </div>
                    </div>

                    {/* ── Filter PML ── */}
                    {pmlList.length > 0 && (
                      <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
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

                    {/* Daftar case */}
                    <div ref={tableRef} className="px-4 sm:px-6 max-h-[420px] sm:max-h-[460px] overflow-y-auto">
                      <div className="sticky top-0 bg-white pt-2 pb-1 z-10">
                        <div className="relative mb-2">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                          </svg>
                          <input
                            type="text" placeholder="Cari nama keluarga / nama PCL / alamat" value={searchKasus}
                            onChange={e => { setSearchKasus(e.target.value); if(tableRef.current) tableRef.current.scrollTop=0; }}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
                          />
                          {searchKasus && (
                            <button onClick={() => setSearchKasus("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
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
                            {searchKasus
                              ? `Tidak ada hasil untuk "${searchKasus}"`
                              : statusFilter
                              ? `Tidak ada data dengan status "${filterLabel}"`
                              : "Belum ada data case."}
                          </p>
                        </div>
                      ) : (
                        filteredRows.map((r,i) => (
                          <KasusRow
                            key={r.rowNumber}
                            row={r} rank={i+1}
                            onDetail={setModalRow}
                          />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-2 text-xs text-gray-400 flex-wrap items-center">
                        <span className="font-semibold text-gray-600">
                          {filteredRows.length}{(searchKasus||statusFilter||pmlFilter) ? ` / ${selectedRows.length}` : ""} case
                        </span>
                        {pmlFilter && (
                          <span className="text-blue-500 font-medium">· PML: {pmlFilter}</span>
                        )}
                        {statusFilter ? (
                          <span className="text-orange-500 font-medium">· {filterLabel}</span>
                        ) : (
                          <>
                            <span>·</span>
                            <span className="text-gray-400 font-medium">{filteredRows.filter(r => computeRowFilterKey(r)==="belum").length} belum dikonfirmasi</span>
                            <span>·</span>
                            <span className="text-blue-500 font-medium">{filteredRows.filter(r => computeRowFilterKey(r)==="sesuai").length} sudah sesuai</span>
                            <span>·</span>
                            <span className="text-rose-400 font-medium">{filteredRows.filter(r => computeRowFilterKey(r)==="perlu").length} perlu diperbaiki</span>
                            <span>·</span>
                            <span className="text-emerald-600 font-medium">{filteredRows.filter(r => computeRowFilterKey(r)==="korwil_ditangani").length} sudah ditangani korwil</span>
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
