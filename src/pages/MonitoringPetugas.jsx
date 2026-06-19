import { useState, useEffect, useMemo } from "react";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "15LFgyVGKJ4Dd5-HBFk6HPrMn5j4vE43k";
const GID = "476651225";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

// ── Mapping kode kecamatan → nama (urut sesuai data, baris atas ke bawah) ──
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

// Urutan resmi kecamatan
const KECAMATAN_ORDER = [
  "TUNGKAL ULU", "MERLUNG", "BATANG ASAM", "TEBING TINGGI",
  "RENAH MENDALUH", "MUARA PAPALIK", "PENGABUAN", "SENYERANG",
  "TUNGKAL ILIR", "BRAM ITAM", "SEBERANG KOTA", "BETARA", "KUALA BETARA",
];

// Resolve nama kecamatan dari kode atau nama lengkap
// Mengembalikan null jika tidak dikenali (baris kosong → carry-forward di useEffect)
function resolveKecamatan(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null; // kosong → akan di-carry-forward
  const upperTrimmed = trimmed.toUpperCase();
  if (KECAMATAN_ORDER.includes(upperTrimmed)) return upperTrimmed;
  const padded = trimmed.padStart(3, "0");
  if (KECAMATAN_NAMES[padded]) return KECAMATAN_NAMES[padded];
  if (KECAMATAN_NAMES[trimmed]) return KECAMATAN_NAMES[trimmed];
  return null;
}

// Parse CSV (handle quoted fields & \r)
function parseCSV(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  return lines.map((line) => {
    const cols = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

// ── Helpers warna ──
function progressColor(val) {
  if (val >= 75) return "bg-emerald-500";
  if (val >= 50) return "bg-blue-500";
  if (val >= 25) return "bg-amber-400";
  return "bg-rose-400";
}
function progressTextColor(val) {
  if (val >= 75) return "text-emerald-600";
  if (val >= 50) return "text-blue-600";
  if (val >= 25) return "text-amber-500";
  return "text-rose-500";
}
function badgeStyle(val) {
  if (val >= 75) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (val >= 50) return "bg-blue-50 text-blue-700 ring-blue-200";
  if (val >= 25) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}
function badgeLabel(val) {
  if (val >= 75) return "Sangat Baik";
  if (val >= 50) return "Baik";
  if (val >= 25) return "Sedang";
  return "Perlu Perhatian";
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

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl p-5 ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

function KecamatanCard({ kecamatan, avg, count, onClick, isSelected }) {
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
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
          <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
        </div>
        <span className={`text-2xl font-black flex-shrink-0 ${textColor}`}>{avg.toFixed(1)}%</span>
      </div>
      <ProgressBar value={avg} color={color} />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">{count} petugas</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${badgeStyle(avg)}`}>
          {badgeLabel(avg)}
        </span>
      </div>
    </button>
  );
}

function PetugasRow({ email, progress, rank }) {
  const color = progressColor(progress);
  const textColor = progressTextColor(progress);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{email}</p>
        <div className="mt-1.5">
          <ProgressBar value={progress} color={color} />
        </div>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 w-16 text-right ${textColor}`}>
        {progress.toFixed(2)}%
      </span>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringPetugas() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("urut"); // "urut" | "progress"
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetch(CSV_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Gagal mengambil data. Pastikan spreadsheet bersifat publik.");
        return r.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);
        // Carry-forward: kolom kecamatan hanya terisi di baris pertama tiap grup,
        // baris berikutnya kosong → pakai nilai kecamatan sebelumnya
        let lastKec = null;
        const data = parsed
          .slice(1) // skip header
          .map((cols) => {
            const resolved = resolveKecamatan(cols[0] || "");
            if (resolved) lastKec = resolved;   // perbarui carry-forward jika ada kode baru
            const kecamatan = lastKec;
            const email = (cols[1] || "").trim();
            // Nilai di spreadsheet sudah dalam format persen (misal: 0.18% = 0.18, bukan 18)
            // Cukup hapus simbol % dan parse langsung, tidak perlu konversi
            const raw = (cols[2] || "0").replace("%", "").replace(",", ".").trim();
            const progress = parseFloat(raw) || 0;
            return { kecamatan, email, progress };
          })
          .filter((r) => r.kecamatan && r.email);
        setRows(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // Kelompokkan per kecamatan
  const kecamatanMap = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.kecamatan]) map[r.kecamatan] = [];
      map[r.kecamatan].push(r);
    });
    return map;
  }, [rows]);

  // List kecamatan dengan avg, difilter & diurutkan
  const kecamatanList = useMemo(() => {
    // Mulai dari KECAMATAN_ORDER agar semua 13 kecamatan selalu tampil
    return KECAMATAN_ORDER
      .map((nama) => {
        const petugas = kecamatanMap[nama] || [];
        const avg = petugas.length
          ? petugas.reduce((s, p) => s + p.progress, 0) / petugas.length
          : 0;
        return { kecamatan: nama, avg, count: petugas.length };
      })
      .filter((k) =>
        search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "progress") return b.avg - a.avg;
        // "urut" → ikuti KECAMATAN_ORDER
        return KECAMATAN_ORDER.indexOf(a.kecamatan) - KECAMATAN_ORDER.indexOf(b.kecamatan);
      });
  }, [kecamatanMap, search, sortBy]);

  // Petugas kecamatan terpilih, desc progress
  const selectedPetugas = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec] || [])].sort((a, b) => b.progress - a.progress);
  }, [selectedKec, kecamatanMap]);

  // Statistik global
  const globalStats = useMemo(() => {
    if (!rows.length) return null;
    const avg = rows.reduce((s, r) => s + r.progress, 0) / rows.length;
    return {
      avg,
      above75: rows.filter((r) => r.progress >= 75).length,
      zero: rows.filter((r) => r.progress === 0).length,
      total: rows.length,
      totalKec: Object.keys(kecamatanMap).length,
    };
  }, [rows, kecamatanMap]);

  const avgSelected = selectedPetugas.length
    ? selectedPetugas.reduce((s, p) => s + p.progress, 0) / selectedPetugas.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Header ── */}
      <header
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}
      >
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {/* <p className="text-orange-100 text-xs font-semibold tracking-widest uppercase mb-1">
                Badan Pusat Statistik · Kabupaten Tanjung Jabung Barat
              </p> */}
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">
                Monitoring Petugas PCL
              </h1>
              <p className="text-orange-100 text-sm mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-orange-100 text-xs">
                  Data diperbarui: {lastUpdated.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-orange-200 text-xs mt-0.5">{lastUpdated.toLocaleTimeString("id-ID")}</p>
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
            {/* Statistik Global */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard
                label="Total Petugas"
                value={globalStats.total}
                sub={`${globalStats.totalKec} kecamatan`}
                accent="bg-gray-800 text-white"
              />
              <StatCard
                label="Rata-rata Progress"
                value={`${globalStats.avg.toFixed(1)}%`}
                sub="semua petugas"
                accent="bg-orange-500 text-white"
              />
              <StatCard
                label="Progress ≥ 75%"
                value={globalStats.above75}
                sub="petugas"
                accent="bg-emerald-50 text-emerald-800"
              />
              <StatCard
                label="Belum Mulai"
                value={globalStats.zero}
                sub="progress 0%"
                accent="bg-rose-50 text-rose-700"
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
                    sortBy === "urut"
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}
                >
                  Urutan
                </button>
                <button
                  onClick={() => setSortBy("progress")}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    sortBy === "progress"
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}
                >
                  Progress ↓
                </button>
              </div>
            </div>

            {/* Layout 2 kolom */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Daftar Kecamatan */}
              <div className="lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, avg, count }) => (
                  <KecamatanCard
                    key={kecamatan}
                    kecamatan={kecamatan}
                    avg={avg}
                    count={count}
                    isSelected={selectedKec === kecamatan}
                    onClick={() => setSelectedKec(selectedKec === kecamatan ? null : kecamatan)}
                  />
                ))}
              </div>

              {/* Panel Detail Petugas */}
              <div className="lg:w-[45%]">
                {!selectedKec ? (
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Klik kartu kecamatan untuk melihat daftar progress seluruh petugas.
                    </p>
                  </div>
                ) : (
                  <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header panel detail */}
                    <div
                      className="px-6 py-5"
                      style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                            Kecamatan
                          </p>
                          <h2 className="text-white text-xl font-black">{selectedKec}</h2>
                        </div>
                        <button
                          onClick={() => setSelectedKec(null)}
                          className="text-orange-200 hover:text-white transition-colors mt-1 p-1"
                          title="Tutup"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {/* Progress bar rata-rata */}
                      <div className="mt-4">
                        <div className="flex justify-between text-white text-sm mb-1.5">
                          <span className="opacity-80">Rata-rata progress kecamatan</span>
                          <span className="font-bold">{avgSelected.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-white transition-all duration-700"
                            style={{ width: `${Math.min(avgSelected, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tabel petugas */}
                    <div className="px-6 py-2 max-h-[540px] overflow-y-auto">
                      <div className="flex items-center gap-3 py-3 border-b border-gray-100 mb-1 sticky top-0 bg-white">
                        <span className="text-xs text-gray-400 w-5">#</span>
                        <span className="text-xs text-gray-400 flex-1">Email Petugas</span>
                        <span className="text-xs text-gray-400 w-16 text-right">Progress</span>
                      </div>
                      {selectedPetugas.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                          Belum ada data petugas untuk kecamatan ini.
                        </p>
                      ) : (
                        selectedPetugas.map((p, i) => (
                          <PetugasRow
                            key={`${p.email}-${i}`}
                            email={p.email}
                            progress={p.progress}
                            rank={i + 1}
                          />
                        ))
                      )}
                    </div>

                    {/* Footer ringkasan */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                        <span className="font-medium">{selectedPetugas.length} petugas</span>
                        <span>·</span>
                        <span className="text-emerald-500 font-medium">
                          {selectedPetugas.filter((p) => p.progress >= 75).length} ≥ 75%
                        </span>
                        <span>·</span>
                        <span className="text-amber-500 font-medium">
                          {selectedPetugas.filter((p) => p.progress > 0 && p.progress < 75).length} sedang berjalan
                        </span>
                        <span>·</span>
                        <span className="text-rose-400 font-medium">
                          {selectedPetugas.filter((p) => p.progress === 0).length} belum mulai
                        </span>
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
