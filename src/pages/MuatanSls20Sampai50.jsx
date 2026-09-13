import { useState, useEffect, useMemo, useRef } from "react";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "1bbkM6q4EPHzg4q4A49pT_0yEHWquppvFuKc-plzBISE";
const GID_DATA        = "1014730323";

const CSV_DATA = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_DATA}`;

// ── URL Web App Google Apps Script untuk simpan Keterangan Hasil Verifikasi ──
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvdBnZOFassRc8hoQDth_vAeZtAQzNYfphWQ_g_NogsIRAuN_P5iNb0rKRt_EUaFfurw/exec";
// ── Kolom (0-based index) sesuai header spreadsheet ──
const COL = {
  kecamatan: 2,
  kelurahan: 3,
  sls: 4,
  petugas: 5,
  totalAssignment: 6,
  totalKeluargaAktif: 7,
  dtsenDitemukan: 10,
  keluargaBaru: 17,
  keterangan: 18,
  namaPPL: 21,   // kolom V
  namaPML: 22,   // kolom W
};

function parseCSV(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  return lines.map(line => {
    const cols = []; let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim()); return cols;
  });
}

function countColor(v) { if (v === 0) return "#10b981"; if (v <= 3) return "#3b82f6"; if (v <= 8) return "#f59e0b"; return "#f43f5e"; }
function countBadgeStyle(v) {
  if (v === 0) return { bg: "#d1fae5", text: "#065f46", dot: "#10b981" };
  if (v <= 3) return { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" };
  if (v <= 8) return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
  return { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e" };
}
function countLabel(v) { if (v === 0) return "Semua Terverifikasi"; if (v <= 3) return "Hampir Selesai"; if (v <= 8) return "Sedang Berjalan"; return "Perlu Perhatian"; }

function StatCard({ label, value, sub, icon, variant }) {
  const styles = {
    orange: { card: "bg-[#f5820a] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
    rose:   { card: "bg-[#e11d48] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
  };
  const s = styles[variant];
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden flex flex-col gap-4 ${s.card}`}>
      <div className="absolute -top-7 -right-7 w-28 h-28 rounded-full bg-white opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 right-7 w-14 h-14 rounded-full bg-white opacity-10 pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-widest leading-tight max-w-[130px] ${s.label}`}>{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${s.icon}`}>{icon}</div>
      </div>
      <div className="relative">
        <p className="text-3xl font-black leading-none tracking-tight">{value}</p>
        {sub && <p className={`text-xs mt-1 ${s.sub}`}>{sub}</p>}
      </div>
    </div>
  );
}

function KecamatanCard({ kecamatan, total, belum, onClick, isSelected }) {
  const color = countColor(belum);
  const badge = countBadgeStyle(belum);
  const label = countLabel(belum);
  return (
    <button onClick={onClick} className="w-full text-left border-0 bg-transparent p-0 cursor-pointer">
      <div className={`rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100" : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
            <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
          </div>
          <span className="text-3xl font-black flex-shrink-0" style={{ color }}>{belum}</span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.text }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: badge.dot }} />
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

function FilterCard({ label, count, color, isActive, onClick }) {
  const styles = {
    emerald: { bg: isActive ? "bg-emerald-500" : "bg-emerald-50", text: isActive ? "text-white" : "text-emerald-700", sub: isActive ? "text-emerald-100" : "text-emerald-500" },
    amber:   { bg: isActive ? "bg-amber-500" : "bg-amber-50",   text: isActive ? "text-white" : "text-amber-700",   sub: isActive ? "text-amber-100" : "text-amber-500" },
  };
  const s = styles[color];
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left rounded-xl p-3 border-2 transition-all duration-150 ${isActive ? "border-transparent shadow-sm" : "border-transparent hover:opacity-90"} ${s.bg}`}
    >
      <p className={`text-2xl font-black leading-none ${s.text}`}>{count}</p>
      <p className={`text-[11px] font-semibold mt-1 leading-tight ${s.sub}`}>{label}</p>
    </button>
  );
}

function SlsEntryRow({ item, rank, onDetail }) {
  const verified = (item.keterangan || "").trim() !== "";
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{item.kelurahan || "-"}</p>
          <p className="text-[13px] text-gray-400 mt-0.5 truncate font-mono">{item.sls || "-"}</p>
          <p className="text-[13px] text-gray-500 truncate mt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 flex-shrink-0">PML</span>
            <span className="truncate">{item.namaPML || "-"}</span>
          </p>
          <p className="text-[13px] text-gray-500 truncate mt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">PPL</span>
            <span className="truncate">{item.namaPPL || "-"}</span>
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
            verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {verified ? "Terverifikasi" : "Belum"}
        </span>
        <button
          onClick={onDetail}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors flex-shrink-0"
        >
          Detail
        </button>
      </div>
    </div>
  );
}

export default function MuatanSls20Sampai50() {
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [search, setSearch]           = useState("");
  const [selectedKec, setSelectedKec] = useState(null);

  const [searchEntry, setSearchEntry] = useState("");
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [filterKeterangan, setFilterKeterangan] = useState(null); // null = tampilkan semua

  const [keteranganDraft, setKeteranganDraft] = useState("");

  // phase: "idle" | "saving" | "success"
  const [phase, setPhase]             = useState("idle");
  const [saveError, setSaveError]     = useState(null);
  const closeTimeoutRef = useRef(null);

  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  function findColIndex(header, ...possibleNames) {
    const normalized = header.map(h => h.trim().toLowerCase());
    for (const name of possibleNames) {
      const idx = normalized.indexOf(name.trim().toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  }

  const loadData = () => {
    setLoading(true);
    fetch(`${CSV_DATA}&t=${Date.now()}`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data."); return r.text(); })
      .then(text => {
        const parsed = parseCSV(text);
        const header = parsed[0];

        // Cari index kolom Nama PPL & Nama PML berdasarkan nama header (bukan posisi tetap)
        const idxNamaPPL = findColIndex(header, "Nama PPL");
        const idxNamaPML = findColIndex(header, "Nama PML");

        const data = parsed.slice(1).map((cols, i) => ({
          rowNumber:       i + 2,
          kecamatan:       (cols[COL.kecamatan] || "").trim(),
          kelurahan:       (cols[COL.kelurahan] || "").trim(),
          sls:             (cols[COL.sls] || "").trim(),
          petugas:         (cols[COL.petugas] || "").trim(),
          totalAssignment: (cols[COL.totalAssignment] || "0").trim(),
          totalKeluargaAktif: (cols[COL.totalKeluargaAktif] || "0").trim(),
          dtsenDitemukan:  (cols[COL.dtsenDitemukan] || "0").trim(),
          keluargaBaru:    (cols[COL.keluargaBaru] || "0").trim(),
          keterangan:      (cols[COL.keterangan] || "").trim(),
          namaPPL:         idxNamaPPL !== -1 ? (cols[idxNamaPPL] || "").trim() : "",
          namaPML:         idxNamaPML !== -1 ? (cols[idxNamaPML] || "").trim() : "",
        })).filter(r => r.kecamatan);

        setRows(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); };
  }, []);

  useEffect(() => {
    setSelectedRowKey(null);
    setSearchEntry("");
    setFilterKeterangan(null); // reset filter setiap ganti kecamatan
    if (tableRef.current) tableRef.current.scrollTop = 0;
  }, [selectedKec]);

  useEffect(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setPhase("idle");
    setSaveError(null);
    if (tableRef.current) tableRef.current.scrollTop = 0;
  }, [selectedRowKey]);

  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const kecamatanAgg = useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.kecamatan)) map.set(r.kecamatan, { kecamatan: r.kecamatan, total: 0, belum: 0 });
      const g = map.get(r.kecamatan);
      g.total += 1;
      if (!r.keterangan) g.belum += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
  }, [rows]);

  const kecamatanList = useMemo(() =>
    kecamatanAgg.filter(k => search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
  , [kecamatanAgg, search]);

  const keteranganCounts = useMemo(() => {
    if (!selectedKec) return { sesuai: 0, belumDidata: 0 };
    const list = rows.filter(r => r.kecamatan === selectedKec);
    return {
      sesuai: list.filter(r => r.keterangan === "01 Sudah Sesuai").length,
      belumDidata: list.filter(r => r.keterangan === "02 Masih ada penduduk belum didata").length,
    };
  }, [rows, selectedKec]);

  const entryList = useMemo(() => {
    if (!selectedKec) return [];
    return rows
      .filter(r => r.kecamatan === selectedKec)
      .filter(r => filterKeterangan === null || r.keterangan === filterKeterangan)
      .filter(r =>
        searchEntry === "" ||
        (r.kelurahan || "").toLowerCase().includes(searchEntry.toLowerCase()) ||
        (r.sls || "").toLowerCase().includes(searchEntry.toLowerCase()) ||
        (r.namaPPL || "").toLowerCase().includes(searchEntry.toLowerCase()) ||
        (r.namaPML || "").toLowerCase().includes(searchEntry.toLowerCase())
      )
      .sort((a, b) => a.kelurahan.localeCompare(b.kelurahan) || a.sls.localeCompare(b.sls));
  }, [rows, selectedKec, searchEntry, filterKeterangan]);

  const selectedRow = useMemo(() =>
    rows.find(r => r.rowNumber === selectedRowKey) || null
  , [rows, selectedRowKey]);

  useEffect(() => {
    if (selectedRow) setKeteranganDraft(selectedRow.keterangan || "");
  }, [selectedRow]);

  const panelLevel = selectedRow ? 3 : selectedKec ? 2 : 1;
  const isBusy = phase !== "idle";

  const handleBack = () => {
    if (panelLevel === 3) setSelectedRowKey(null);
    else setSelectedKec(null);
  };

  const handleSaveKeterangan = async () => {
    if (!selectedRow) return;
    setPhase("saving");
    setSaveError(null);
    const rowNumberToUpdate = selectedRow.rowNumber; // simpan dulu sebelum async
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "updateKeterangan",
          rowNumber: rowNumberToUpdate,
          kecamatan: selectedRow.kecamatan,
          kelurahan: selectedRow.kelurahan,
          sls: selectedRow.sls,
          keterangan: keteranganDraft,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.message || "Gagal menyimpan.");

      // Gunakan rowNumberToUpdate, bukan result.rowNumber, supaya update pasti kena
      setRows(prev => prev.map(r =>
        r.rowNumber === rowNumberToUpdate ? { ...r, keterangan: keteranganDraft } : r
      ));

      setPhase("success");
      closeTimeoutRef.current = setTimeout(() => {
        setPhase("idle");
        setSelectedRowKey(null); // tutup panel detail, kembali ke daftar SLS
      }, 2000);
    } catch (e) {
      setSaveError(e.message || "Gagal menyimpan keterangan.");
      setPhase("idle");
    }
  };

  const totalBelum = kecamatanAgg.reduce((s, k) => s + k.belum, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      {/* ── Overlay full-screen: loading → sukses ── */}
      {(phase === "saving" || phase === "success") && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-white/95 backdrop-blur-sm px-6 text-center">
          {phase === "saving" && (
            <div key="loading" className="flex flex-col items-center gap-5 animate-fadeIn">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-[5px] border-orange-100" />
                <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-orange-500 border-r-orange-400 animate-spin" />
                <div className="absolute inset-3 rounded-full border-[3px] border-transparent border-b-orange-300 animate-spin [animation-direction:reverse] [animation-duration:0.9s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-base font-semibold text-gray-700">Menyimpan keterangan</p>
                <span className="flex gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
                </span>
              </div>
              <p className="text-sm text-gray-400">Mohon tunggu…</p>
            </div>
          )}

          {phase === "success" && (
            <div key="success" className="flex flex-col items-center gap-5 animate-successIn">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pingOnce" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-200">
                  <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="white"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength="1"
                      style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "drawCheck 0.5s ease-out 0.2s forwards" }}
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Berhasil disimpan!</p>
                <p className="text-sm text-gray-400 mt-1">Keterangan telah tersimpan ke spreadsheet</p>
              </div>
              <div className="w-40 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500 animate-toastProgress" />
              </div>
            </div>
          )}
        </div>
      )}

      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Muatan SLS 20 - 50 Keluarga</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-orange-100">Data diperbarui pada</p>
                <p className="text-orange-100">{lastUpdated.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} Pukul {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
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
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <StatCard label="Jumlah Kecamatan" value={kecamatanAgg.length} sub="wilayah kerja" icon="🗺️" variant="orange" />
              <StatCard label="SLS Belum Terverifikasi" value={totalBelum} sub={`dari ${rows.length} SLS`} icon="📝" variant="rose" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input type="text" placeholder="Cari nama kecamatan…" value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedKec(null); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 w-full min-w-0">
              <div className="w-full min-w-0 lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map((k) => (
                  <KecamatanCard key={k.kecamatan} kecamatan={k.kecamatan} total={k.total} belum={k.belum}
                    isSelected={selectedKec === k.kecamatan} onClick={() => handleSelectKec(k.kecamatan)} />
                ))}
              </div>

              <div ref={detailRef} className="w-full min-w-0 lg:w-[45%]">
                {!selectedKec ? (
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar Kelurahan &amp; Petugas.</p>
                  </div>
                ) : (
                  <div className="sticky top-6 w-full min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                            {panelLevel === 3 ? "Detail SLS" : "Kecamatan"}
                          </p>
                          {panelLevel === 3 && (
                            <button onClick={handleBack} className="text-orange-100 text-[11px] font-semibold mb-1 flex items-center gap-1 hover:text-white">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              {selectedKec}
                            </button>
                          )}
                          <h2 className="text-white text-xl font-black truncate">
                            {panelLevel === 3 ? selectedRow.kelurahan : selectedKec}
                          </h2>
                          {panelLevel === 3 && (
                            <p className="text-orange-100 text-xs font-mono mt-0.5 truncate">{selectedRow.sls}</p>
                          )}
                        </div>
                        <button
                          onClick={() => { if (panelLevel === 3) { setSelectedRowKey(null); } else { setSelectedKec(null); } }}
                          disabled={isBusy}
                          className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      {panelLevel === 3 && (
                        <div className="mt-3 flex flex-col gap-1.5 text-white text-sm">
                          <div className="flex items-center justify-between">
                            <span className="opacity-80">Nama PPL</span>
                            <span className="font-bold truncate max-w-[60%] text-right">{selectedRow.namaPPL || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="opacity-80">Nama PML</span>
                            <span className="font-bold truncate max-w-[60%] text-right">{selectedRow.namaPML || "-"}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                      {panelLevel === 2 && (
                        <>
                          <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                            <div className="relative mb-2">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                              </svg>
                              <input type="text" placeholder="Cari Kelurahan / SLS / Petugas…" value={searchEntry}
                                onChange={e => setSearchEntry(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300" />
                            </div>

                            {/* ── Filter Card Keterangan ── */}
                            <div className="flex gap-2 mb-2">
                              <FilterCard
                                label="Sudah Sesuai"
                                count={keteranganCounts.sesuai}
                                color="emerald"
                                isActive={filterKeterangan === "01 Sudah Sesuai"}
                                onClick={() => setFilterKeterangan(prev => prev === "01 Sudah Sesuai" ? null : "01 Sudah Sesuai")}
                              />
                              <FilterCard
                                label="Belum Didata"
                                count={keteranganCounts.belumDidata}
                                color="amber"
                                isActive={filterKeterangan === "02 Masih ada penduduk belum didata"}
                                onClick={() => setFilterKeterangan(prev => prev === "02 Masih ada penduduk belum didata" ? null : "02 Masih ada penduduk belum didata")}
                              />
                            </div>

                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                              <span className="text-xs text-gray-400 w-6 text-center">#</span>
                              <span className="text-xs text-gray-400 flex-1">Kelurahan · SLS · Petugas</span>
                              {filterKeterangan && (
                                <button onClick={() => setFilterKeterangan(null)} className="text-[11px] font-semibold text-orange-500 hover:text-orange-600">
                                  Hapus filter ✕
                                </button>
                              )}
                            </div>
                          </div>
                          {entryList.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">Tidak ada data untuk kecamatan ini.</p>
                          ) : (
                            entryList.map((item, i) => (
                              <SlsEntryRow key={item.rowNumber} item={item} rank={i + 1} onDetail={() => setSelectedRowKey(item.rowNumber)} />
                            ))
                          )}
                        </>
                      )}

                      {panelLevel === 3 && selectedRow && (
                        <div className="py-4">
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-widest">Total Assignment</p>
                              <p className="text-lg font-black text-gray-800 mt-1">{selectedRow.totalAssignment}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-widest">Keluarga Aktif</p>
                              <p className="text-lg font-black text-gray-800 mt-1">{selectedRow.totalKeluargaAktif}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-widest">DTSEN Ditemukan</p>
                              <p className="text-lg font-black text-gray-800 mt-1">{selectedRow.dtsenDitemukan}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-widest">Keluarga Baru</p>
                              <p className="text-lg font-black text-gray-800 mt-1">{selectedRow.keluargaBaru}</p>
                            </div>
                          </div>

                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Keterangan Hasil Verifikasi Lapangan
                          </label>
                          <select
                            value={keteranganDraft}
                            onChange={e => setKeteranganDraft(e.target.value)}
                            disabled={isBusy}
                            className="w-full mt-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50 disabled:text-gray-400 appearance-none cursor-pointer"
                            style={{
                              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.75rem center",
                              backgroundSize: "1.1em",
                            }}
                          >
                            <option value="">— Pilih keterangan —</option>
                            <option value="01 Sudah Sesuai">01 Sudah Sesuai</option>
                            <option value="02 Masih ada penduduk belum didata">02 Masih ada penduduk belum didata</option>
                          </select>

                          {saveError && (
                            <div className="mt-3 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-600">
                              <span className="text-sm leading-none mt-0.5">⚠️</span>
                              <span>{saveError}</span>
                            </div>
                          )}

                          <button
                            onClick={handleSaveKeterangan}
                            disabled={isBusy}
                            className="w-full mt-3 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-colors"
                          >
                            {phase === "saving" ? "Menyimpan…" : "Simpan Keterangan"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-600">
                        {panelLevel === 3
                          ? (selectedRow.keterangan ? "Sudah terverifikasi" : "Belum terverifikasi")
                          : `${entryList.length} SLS`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(0.97) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        .animate-fadeIn{animation:fadeIn 0.2s ease-out;}

        @keyframes successIn{
          0%{opacity:0;transform:scale(0.85);}
          60%{opacity:1;transform:scale(1.04);}
          100%{opacity:1;transform:scale(1);}
        }
        .animate-successIn{animation:successIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;}

        @keyframes toastProgress{from{width:100%;}to{width:0%;}}
        .animate-toastProgress{animation:toastProgress 2s linear forwards;}

        @keyframes drawCheck{to{stroke-dashoffset:0;}}

        @keyframes pingOnce{
          0%{transform:scale(1);opacity:0.55;}
          80%{transform:scale(1.6);opacity:0;}
          100%{transform:scale(1.6);opacity:0;}
        }
        .animate-pingOnce{animation:pingOnce 0.9s ease-out forwards;}
      `}</style>
    </div>
  );
}