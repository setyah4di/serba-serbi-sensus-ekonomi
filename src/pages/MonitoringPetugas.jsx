import { useState, useEffect, useMemo, useRef } from "react";

// ── Konfigurasi Spreadsheet ──
// Sheet: "rekap progress pendataan" (tab baru dengan kolom PML)
const SPREADSHEET_ID = "15LFgyVGKJ4Dd5-HBFk6HPrMn5j4vE43k";
const GID = "476651225";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

// ── Mapping kode → nama kecamatan ──
const KECAMATAN_NAMES = {
  "010": "TUNGKAL ULU",
  "011": "MERLUNG",
  "012": "BATANG ASAM",
  "013": "TEBING TINGGI",
  "014": "RENAH MENDALUH",
  "015": "MUARA PAPALIK",
  "020": "PENGABUAN",
  "021": "SENYERANG",
  "030": "TUNGKAL ILIR",
  "031": "BRAM ITAM",
  "032": "SEBERANG KOTA",
  "040": "BETARA",
  "041": "KUALA BETARA",
};

const KECAMATAN_ORDER = [
  "TUNGKAL ULU", "MERLUNG", "BATANG ASAM", "TEBING TINGGI",
  "RENAH MENDALUH", "MUARA PAPALIK", "PENGABUAN", "SENYERANG",
  "TUNGKAL ILIR", "BRAM ITAM", "SEBERANG KOTA", "BETARA", "KUALA BETARA",
];

function resolveKecamatan(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (KECAMATAN_ORDER.includes(upper)) return upper;
  const padded = trimmed.padStart(3, "0");
  if (KECAMATAN_NAMES[padded]) return KECAMATAN_NAMES[padded];
  if (KECAMATAN_NAMES[trimmed]) return KECAMATAN_NAMES[trimmed];
  return null;
}

// Parse CSV — handle quoted fields & \r
function parseCSV(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  return lines.map((line) => {
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

function parseProgress(raw) {
  const val = parseFloat((raw || "0").replace("%", "").replace(",", ".").trim());
  return isNaN(val) ? 0 : val;
}

// ── Helpers warna ──
function progressColor(val) {
  if (val >= 100) return "bg-emerald-600";
  if (val >= 75)  return "bg-emerald-400";
  if (val >= 50)  return "bg-blue-500";
  if (val >= 25)  return "bg-amber-400";
  return "bg-rose-400";
}
function progressTextColor(val) {
  if (val >= 100) return "text-emerald-700";
  if (val >= 75)  return "text-emerald-600";
  if (val >= 50)  return "text-blue-600";
  if (val >= 25)  return "text-amber-500";
  return "text-rose-500";
}
function badgeStyle(val) {
  if (val >= 100) return "bg-emerald-100 text-emerald-800 ring-emerald-300";
  if (val >= 75)  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (val >= 50)  return "bg-blue-50 text-blue-700 ring-blue-200";
  if (val >= 25)  return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}
function badgeLabel(val) {
  if (val >= 100) return "Selesai";
  if (val >= 75)  return "Sangat Baik";
  if (val >= 50)  return "Baik";
  if (val >= 25)  return "Sedang";
  // return "Perlu Perhatian";
}

// ── Komponen UI ──
function ProgressBar({ value, color }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className={`rounded-2xl p-5 ${accent} flex flex-col justify-between`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 leading-tight">{label}</p>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div>
        <p className="text-3xl font-black">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function KecamatanCard({ kecamatan, avg, countPCL, countPML, onClick, isSelected }) {
  const color = progressColor(avg);
  const textColor = progressTextColor(avg);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
        ${isSelected
          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
          : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"
        }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
          <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
        </div>
        <span className={`text-2xl font-black flex-shrink-0 ${textColor}`}>{avg.toFixed(1)}%</span>
      </div>
      <ProgressBar value={avg} color={color} />
      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
        <div className="flex gap-3">
          <span className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{countPML}</span> PML
          </span>
          <span className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{countPCL}</span> PCL
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${badgeStyle(avg)}`}>
          {badgeLabel(avg)}
        </span>
      </div>
    </button>
  );
}

// Baris PCL dalam panel detail
function PCLRow({ emailPML, emailPCL, progress, rank }) {
  const color = progressColor(progress);
  const textColor = progressTextColor(progress);
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{rank}</span>
        <div className="flex-1 min-w-0">
          {/* Email PCL */}
          <p className="text-sm font-semibold text-gray-800 truncate">{emailPCL}</p>
          {/* Email PML */}
          {emailPML && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
              {emailPML}
            </p>
          )}
          <div className="mt-1.5">
            <ProgressBar value={progress} color={color} />
          </div>
        </div>
        <span className={`text-sm font-bold flex-shrink-0 w-16 text-right ${textColor}`}>
          {progress.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringPetugas() {
  const [rows, setRows] = useState([]);       // { kecamatan, emailPML, emailPCL, progress }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("urut");
  const [lastUpdated, setLastUpdated] = useState(null);
  const detailRef = useRef(null);
  const tableRef = useRef(null);

  // Reset scroll tabel ke atas setiap kali kecamatan berganti
  useEffect(() => {
    if (tableRef.current) tableRef.current.scrollTop = 0;
  }, [selectedKec]);
  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      // Tunggu render selesai baru scroll
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  useEffect(() => {
    fetch(CSV_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Gagal mengambil data. Pastikan spreadsheet bersifat publik.");
        return r.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);
        // Kolom: A=kecamatan, B=emailPML, C=emailPCL, D=progress
        // Carry-forward: kecamatan & PML hanya terisi di baris pertama tiap grup
        let lastKec = null;
        let lastPML = "";
        const data = parsed
          .slice(1) // skip header
          .map((cols) => {
            // Resolve kecamatan (carry-forward jika kosong)
            const resolved = resolveKecamatan(cols[0] || "");
            if (resolved) { lastKec = resolved; lastPML = ""; } // reset PML saat kec baru

            // PML carry-forward dalam satu kecamatan
            const pmlRaw = (cols[1] || "").trim();
            if (pmlRaw) lastPML = pmlRaw;

            const emailPCL = (cols[2] || "").trim();
            const progress = parseProgress(cols[3] || "0");

            return { kecamatan: lastKec, emailPML: lastPML, emailPCL, progress };
          })
          .filter((r) => r.kecamatan && r.emailPCL);

        setRows(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // Map kecamatan → array PCL rows
  const kecamatanMap = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.kecamatan]) map[r.kecamatan] = [];
      map[r.kecamatan].push(r);
    });
    return map;
  }, [rows]);

  // List kecamatan untuk grid
  const kecamatanList = useMemo(() => {
    return KECAMATAN_ORDER
      .map((nama) => {
        const pcls = kecamatanMap[nama] || [];
        const avg = pcls.length ? pcls.reduce((s, p) => s + p.progress, 0) / pcls.length : 0;
        // Hitung jumlah PML unik
        const pmlSet = new Set(pcls.map((p) => p.emailPML).filter(Boolean));
        return { kecamatan: nama, avg, countPCL: pcls.length, countPML: pmlSet.size };
      })
      .filter((k) => search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "progress") return b.avg - a.avg;
        return KECAMATAN_ORDER.indexOf(a.kecamatan) - KECAMATAN_ORDER.indexOf(b.kecamatan);
      });
  }, [kecamatanMap, search, sortBy]);

  // PCL terpilih, desc progress
  const selectedPCL = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec] || [])].sort((a, b) => b.progress - a.progress);
  }, [selectedKec, kecamatanMap]);

  // Statistik global
  const globalStats = useMemo(() => {
    if (!rows.length) return null;
    const allPCL = rows;
    const allPML = new Set(rows.map((r) => r.emailPML).filter(Boolean));
    const avg = allPCL.reduce((s, r) => s + r.progress, 0) / allPCL.length;
    return {
      totalPCL: allPCL.length,
      totalPML: allPML.size,
      avg,
      done100: allPCL.filter((r) => r.progress >= 100).length,
      zero: allPCL.filter((r) => r.progress === 0).length,
    };
  }, [rows]);

  const avgSelected = selectedPCL.length
    ? selectedPCL.reduce((s, p) => s + p.progress, 0) / selectedPCL.length
    : 0;
  const pmlSelected = [...new Set(selectedPCL.map((p) => p.emailPML).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">
                Monitoring Petugas Pencacahan
              </h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated && (
              <div className="text-right">
                {/* <p className="text-orange-100 text-sm">
                  Data diperbarui pada 
                </p> */}
                <p className="text-orange-100 text-sm">
                   {lastUpdated.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} Pukul {lastUpdated.toLocaleTimeString("id-ID")}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Mengambil data dari spreadsheet…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-4">
            <p className="text-rose-600 font-semibold">Gagal memuat data</p>
            <p className="text-rose-400 text-sm mt-1">{error}</p>
            <p className="text-gray-400 text-xs mt-3">
              Pastikan spreadsheet bersifat publik (Share → Anyone with the link → Viewer).
            </p>
          </div>
        )}

        {/* Dashboard */}
        {!loading && !error && globalStats && (
          <>
            {/* Stat Cards — 5 kartu */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              <StatCard
                label="Total Petugas PML"
                value={globalStats.totalPML}
                sub="pengawas lapangan"
                accent="bg-gray-500 text-white"
                icon="👨‍💼"
              />
              <StatCard
                label="Total Petugas PCL"
                value={globalStats.totalPCL}
                sub="pencacah lapangan"
                accent="bg-orange-500 text-white"
                icon="🧑‍🏭"
              />
              <StatCard
                label="Rata-rata Progress"
                value={`${globalStats.avg.toFixed(1)}%`}
                sub="seluruh PCL"
                accent="bg-blue-500 text-white"
                icon="📊"
              />
              <StatCard
                label="Progress = 100%"
                value={globalStats.done100}
                sub="PCL sudah selesai"
                accent="bg-emerald-50 text-emerald-800"
                icon="✅"
              />
              <StatCard
                label="PCL Belum Mulai"
                value={globalStats.zero}
                sub="progress 0%"
                accent="bg-rose-50 text-rose-700"
                icon="⏳"
              />
            </div>

            {/* Filter & Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari nama kecamatan…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedKec(null); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setSortBy("urut")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    sortBy === "urut" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}
                >Urutan</button>
                <button
                  onClick={() => setSortBy("progress")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    sortBy === "progress" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}
                >Progress ↓</button>
              </div>
            </div>

            {/* Layout 2 kolom */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Grid Kecamatan */}
              <div className="lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, avg, countPCL, countPML }) => (
                  <KecamatanCard
                    key={kecamatan}
                    kecamatan={kecamatan}
                    avg={avg}
                    countPCL={countPCL}
                    countPML={countPML}
                    isSelected={selectedKec === kecamatan}
                    onClick={() => handleSelectKec(kecamatan)}
                  />
                ))}
              </div>

              {/* Panel Detail */}
              <div ref={detailRef} className="lg:w-[45%]">
                {!selectedKec ? (
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat detail PML dan PCL.</p>
                  </div>
                ) : (
                  <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header panel */}
                    <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Kecamatan</p>
                          <h2 className="text-white text-xl font-black">{selectedKec}</h2>
                        </div>
                        <button onClick={() => setSelectedKec(null)} className="text-orange-200 hover:text-white transition-colors mt-1 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {/* Rata-rata progress */}
                      <div className="mt-3">
                        <div className="flex justify-between text-white text-sm mb-1.5">
                          <span className="opacity-80">Rata-rata progress PCL</span>
                          <span className="font-bold">{avgSelected.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${Math.min(avgSelected, 100)}%` }} />
                        </div>
                      </div>
                      {/* Daftar PML */}
                      {pmlSelected.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1.5">Petugas PML</p>
                          <div className="flex flex-col gap-1">
                            {pmlSelected.map((pml) => (
                              <div key={pml} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 flex-shrink-0" />
                                <span className="text-white text-xs font-medium truncate">{pml}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tabel PCL */}
                    <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                      <div className="flex items-center gap-3 py-3 border-b border-gray-100 mb-1 sticky top-0 bg-white z-10">
                        <span className="text-xs text-gray-400 w-5">#</span>
                        <span className="text-xs text-gray-400 flex-1">Email PCL · PML</span>
                        <span className="text-xs text-gray-400 w-16 text-right">Progress</span>
                      </div>
                      {selectedPCL.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Belum ada data petugas.</p>
                      ) : (
                        selectedPCL.map((p, i) => (
                          <PCLRow
                            key={`${p.emailPCL}-${i}`}
                            emailPML={p.emailPML}
                            emailPCL={p.emailPCL}
                            progress={p.progress}
                            rank={i + 1}
                          />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="font-semibold text-gray-600">{selectedPCL.length} PCL</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-medium">{selectedPCL.filter((p) => p.progress >= 100).length} selesai (100%)</span>
                        <span>·</span>
                        <span className="text-amber-500 font-medium">{selectedPCL.filter((p) => p.progress > 0 && p.progress < 100).length} berjalan</span>
                        <span>·</span>
                        <span className="text-rose-400 font-medium">{selectedPCL.filter((p) => p.progress === 0).length} belum mulai</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
