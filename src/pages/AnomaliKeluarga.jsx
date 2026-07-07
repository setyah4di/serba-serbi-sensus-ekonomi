import { useState, useEffect, useMemo, useRef } from "react";
import DetailAnomaliKeluarga from "../components/DetailAnomaliKeluarga";

// ── Konfigurasi Spreadsheet ──
// Spreadsheet: 1507_Anomali_keluarga, sheet "Daftar Anomali"
const SPREADSHEET_ID = "1CvpNntuuSiDhjzexFVFbNF7z_zUQU1O5MSRowSckswI";
const GID_ANOMALI     = "367057747";
const CSV_ANOMALI = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_ANOMALI}`;

const KECAMATAN_ORDER = [
  "TUNGKAL ULU","MERLUNG","BATANG ASAM","TEBING TINGGI","RENAH MENDALUH","MUARA PAPALIK",
  "PENGABUAN","SENYERANG","TUNGKAL ILIR","BRAM ITAM","SEBERANG KOTA","BETARA","KUALA BETARA",
];

// ── Parser CSV (mendukung koma di dalam tanda kutip) ──
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

// Baris subtotal pivot biasanya berisi teks "... Total" di kolom grouping.
// Fungsi ini menolak nilai semacam itu supaya tidak dianggap sebagai carry-forward yang valid.
function isTotalMarker(v) {
  return /total\s*$/i.test((v || "").trim());
}

// ── Helper tampilan berdasarkan jumlah anomali ──
function countColor(v)    { if (v === 0) return "text-emerald-600"; if (v <= 5) return "text-blue-600"; if (v <= 15) return "text-amber-500"; return "text-rose-500"; }
function countBarColor(v) { if (v === 0) return "bg-emerald-400";  if (v <= 5) return "bg-blue-500";   if (v <= 15) return "bg-amber-400";  return "bg-rose-400"; }
function countBadge(v)    { if (v === 0) return "bg-emerald-50 text-emerald-700 ring-emerald-200"; if (v <= 5) return "bg-blue-50 text-blue-700 ring-blue-200"; if (v <= 15) return "bg-amber-50 text-amber-700 ring-amber-200"; return "bg-rose-50 text-rose-700 ring-rose-200"; }
function countLabel(v)    { if (v === 0) return "Aman"; if (v <= 5) return "Ringan"; if (v <= 15) return "Sedang"; return "Perlu Perhatian"; }

function statusBadge(status) {
  const s = (status || "").trim();
  if (s.startsWith("01")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s.startsWith("02")) return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-gray-50 text-gray-500 ring-gray-200";
}
function statusLabel(status) {
  return (status || "").trim() || "Belum Dikonfirmasi";
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ label, value, sub, icon, variant }) {
  const styles = {
    gray:   { card: "bg-[#5a6273] text-white", icon: "bg-white/20", label: "text-white/80", sub: "text-white/60" },
    orange: { card: "bg-[#f5820a] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
    blue:   { card: "bg-[#3a8fe8] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
    rose:   { card: "bg-[#e0525f] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
  };
  const s = styles[variant];
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden flex flex-col gap-4 ${s.card}`}>
      <div className="absolute -top-7 -right-7 w-28 h-28 rounded-full bg-white opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 right-7 w-14 h-14 rounded-full bg-white opacity-10 pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-widest leading-tight max-w-[110px] ${s.label}`}>{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${s.icon}`}>{icon}</div>
      </div>
      <div className="relative">
        <p className="text-3xl font-black leading-none tracking-tight">{value}</p>
        {sub && <p className={`text-xs mt-1 ${s.sub}`}>{sub}</p>}
      </div>
    </div>
  );
}

function KecamatanCard({ kecamatan, count, maxCount, countDesa, countSLS, onClick, isSelected }) {
  const textColor = countColor(count), barColor = countBarColor(count);
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100" : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
          <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
        </div>
        <span className={`text-2xl font-black flex-shrink-0 ${textColor}`}>{count}</span>
      </div>
      <ProgressBar value={count} max={maxCount} color={barColor} />
      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
        <div className="flex gap-3">
          <span className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{countDesa}</span> Desa</span>
          <span className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{countSLS}</span> SLS</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${countBadge(count)}`}>{countLabel(count)}</span>
      </div>
    </button>
  );
}

function AnomaliRow({ row, rank, onDetail }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-700 truncate">{row.namaKK}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {row.namaDesa} · SLS {row.kodeSLS}{row.subSLS ? `-${row.subSLS}` : ""}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
            {row.namaPML || "-"}
            <span className="inline-block bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 mr-1">Petugas</span>
            {row.namaPetugas || "-"}
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">{row.namaAnomali}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${statusBadge(row.hasilKonfirmasiPML)}`}>{statusLabel(row.hasilKonfirmasiPML)}</span>
          <button onClick={() => onDetail(row)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 active:bg-orange-200 transition-colors border border-orange-100 whitespace-nowrap">Detail</button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringAnomali() {
  const [rawRows, setRawRows]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("urut");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchKK, setSearchKK]       = useState("");
  const [modalRow, setModalRow]       = useState(null);
  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(() => { if (tableRef.current) tableRef.current.scrollTop = 0; setSearchKK(""); }, [selectedKec]);

  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  // ── Ambil data dari spreadsheet ──
  useEffect(() => {
    fetch(`${CSV_ANOMALI}&_cb=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data anomali."); return r.text(); })
      .then(text => {
        const parsed = parseCSV(text);

        let lastKodeKec = "", lastNamaKec = "", lastKodeDesa = "", lastNamaDesa = "";
        let lastKodeSLS = "", lastSubSLS = "", lastPML = "", lastPetugas = "";
        const data = [];

        parsed.slice(1).forEach((cols, idx) => {
          // idx=0 → elemen kedua dari CSV (baris ke-2 di spreadsheet, 1-indexed),
          // jadi nomor baris asli di spreadsheet = idx + 2.
          const sheetRow = idx + 2;
          const kodeKec  = (cols[0]  || "").trim(); if (kodeKec  && !isTotalMarker(kodeKec))  lastKodeKec  = kodeKec;
          const namaKec  = (cols[1]  || "").trim(); if (namaKec  && !isTotalMarker(namaKec))  lastNamaKec  = namaKec;
          const kodeDesa = (cols[2]  || "").trim(); if (kodeDesa && !isTotalMarker(kodeDesa)) lastKodeDesa = kodeDesa;
          const namaDesa = (cols[3]  || "").trim(); if (namaDesa && !isTotalMarker(namaDesa)) lastNamaDesa = namaDesa;
          const kodeSLS  = (cols[4]  || "").trim(); if (kodeSLS  && !isTotalMarker(kodeSLS))  lastKodeSLS  = kodeSLS;
          const subSLS   = (cols[5]  || "").trim(); if (subSLS   && !isTotalMarker(subSLS))   lastSubSLS   = subSLS;
          const namaPML  = (cols[6]  || "").trim(); if (namaPML  && !isTotalMarker(namaPML))  lastPML      = namaPML;
          const namaPetugas = (cols[7] || "").trim(); if (namaPetugas && !isTotalMarker(namaPetugas)) lastPetugas = namaPetugas;

          const namaKK      = (cols[8] || "").trim();
          const namaAnomali = (cols[9] || "").trim();

          // Baris subtotal pivot (mis. "0002 Total", "NAMA Total") tidak memiliki nama KK & nama anomali → dilewati.
          if (!namaKK || !namaAnomali) return;

          data.push({
            rowIndex: sheetRow,
            kodeKec: lastKodeKec, namaKec: lastNamaKec,
            kodeDesa: lastKodeDesa, namaDesa: lastNamaDesa,
            kodeSLS: lastKodeSLS, subSLS: lastSubSLS,
            namaPML: lastPML, namaPetugas: lastPetugas,
            namaKK, namaAnomali,
            keteranganAnomali: (cols[10] || "").trim(),
            linkFasih: (cols[11] || "").trim(),
            hasilKonfirmasiPML: (cols[13] || "").trim(),
            keteranganKoreksi: (cols[14] || "").trim(),
            hasilKonfirmasiKorwil: (cols[15] || "").trim(),
          });
        });

        setRawRows(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Agregasi per kecamatan ──
  const kecamatanMap = useMemo(() => {
    const m = {};
    rawRows.forEach(r => { if (!m[r.namaKec]) m[r.namaKec] = []; m[r.namaKec].push(r); });
    return m;
  }, [rawRows]);

  const kecamatanList = useMemo(() => {
    const namaList = new Set([...KECAMATAN_ORDER, ...Object.keys(kecamatanMap)]);
    return [...namaList]
      .map(nama => {
        const list = kecamatanMap[nama] || [];
        const desaSet = new Set(list.map(r => `${r.kodeDesa}||${r.namaDesa}`));
        const slsSet  = new Set(list.map(r => `${r.kodeDesa}||${r.kodeSLS}||${r.subSLS}`));
        return { kecamatan: nama, count: list.length, countDesa: desaSet.size, countSLS: slsSet.size };
      })
      .filter(k => k.count > 0 || KECAMATAN_ORDER.includes(k.kecamatan))
      .filter(k => search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortBy === "jumlah"
        ? b.count - a.count
        : (KECAMATAN_ORDER.indexOf(a.kecamatan) - KECAMATAN_ORDER.indexOf(b.kecamatan)) || a.kecamatan.localeCompare(b.kecamatan)
      );
  }, [kecamatanMap, search, sortBy]);

  const maxCount = useMemo(() => kecamatanList.reduce((m, k) => Math.max(m, k.count), 0), [kecamatanList]);

  const selectedRows = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec] || [])].sort((a, b) => a.namaDesa.localeCompare(b.namaDesa) || a.kodeSLS.localeCompare(b.kodeSLS));
  }, [selectedKec, kecamatanMap]);

  const filteredRows = useMemo(() => {
    if (!searchKK.trim()) return selectedRows;
    const q = searchKK.toLowerCase();
    return selectedRows.filter(r => (r.namaKK || "").toLowerCase().includes(q) || (r.namaDesa || "").toLowerCase().includes(q));
  }, [selectedRows, searchKK]);

  const globalStats = useMemo(() => {
    if (!rawRows.length) return null;
    const kecSet  = new Set(rawRows.map(r => r.namaKec).filter(Boolean));
    const desaSet = new Set(rawRows.map(r => `${r.kodeDesa}||${r.namaDesa}`));
    const slsSet  = new Set(rawRows.map(r => `${r.kodeDesa}||${r.kodeSLS}||${r.subSLS}`));
    return { totalKecamatan: kecSet.size, totalDesa: desaSet.size, totalSLS: slsSet.size, totalBaris: rawRows.length };
  }, [rawRows]);

  const handleDetail = (row) => setModalRow(row);

  const handleSaved = (updatedRow) => {
    setRawRows(prev => prev.map(r => (r.rowIndex === updatedRow.rowIndex ? updatedRow : r)));
    setModalRow(updatedRow);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {modalRow && <DetailAnomaliKeluarga row={modalRow} onClose={() => setModalRow(null)} onSaved={handleSaved} />}

      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Monitoring Anomali Keluarga</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-orange-100">Data diperbarui pada</p>
                <p className="text-orange-100">{lastUpdated.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} Pukul 07.00 WIB</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </header>

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
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <StatCard label="Jumlah Kecamatan" value={globalStats.totalKecamatan} sub="wilayah terdampak"     icon="🏘️" variant="gray"   />
              <StatCard label="Jumlah Desa"      value={globalStats.totalDesa}      sub="desa/kelurahan"       icon="🏡" variant="orange" />
              <StatCard label="Jumlah SLS"       value={globalStats.totalSLS}       sub="satuan lingkungan"    icon="📍" variant="blue"   />
              <StatCard label="Baris Anomali"    value={globalStats.totalBaris}     sub="isian anomali keluarga" icon="⚠️" variant="rose"  />
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
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setSortBy("urut")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy === "urut" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Urutan</button>
                <button onClick={() => setSortBy("jumlah")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy === "jumlah" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Terbanyak ↓</button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
              <div className="lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, count, countDesa, countSLS }) => (
                  <KecamatanCard key={kecamatan} kecamatan={kecamatan} count={count} maxCount={maxCount}
                    countDesa={countDesa} countSLS={countSLS}
                    isSelected={selectedKec === kecamatan} onClick={() => handleSelectKec(kecamatan)} />
                ))}
              </div>

              <div ref={detailRef} className="lg:w-[45%]">
                {!selectedKec ? (
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar keluarga dengan anomali.</p>
                  </div>
                ) : (
                  <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Kecamatan</p>
                          <h2 className="text-white text-xl font-black">{selectedKec}</h2>
                        </div>
                        <button onClick={() => setSelectedKec(null)} className="text-orange-200 hover:text-white transition-colors mt-1 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-white text-sm">
                        <span className="opacity-80">Total anomali di kecamatan ini</span>
                        <span className="font-bold text-lg">{selectedRows.length}</span>
                      </div>
                    </div>
                    <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                      <div className="sticky top-0 bg-white pt-2 pb-1 z-10">
                        <div className="relative mb-2">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                          </svg>
                          <input type="text" placeholder="Cari nama KK / desa…" value={searchKK}
                            onChange={e => { setSearchKK(e.target.value); if (tableRef.current) tableRef.current.scrollTop = 0; }}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300" />
                          {searchKK && (
                            <button onClick={() => setSearchKK("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-400 w-5">#</span>
                          <span className="text-xs text-gray-400 flex-1">Nama KK · Desa/SLS · PML/Petugas</span>
                          <span className="text-xs text-gray-400 w-20 text-right">Status</span>
                        </div>
                      </div>
                      {filteredRows.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                          {searchKK ? `Tidak ada hasil untuk "${searchKK}"` : "Belum ada data anomali."}
                        </p>
                      ) : (
                        filteredRows.map((r, i) => (
                          <AnomaliRow key={`${r.kodeDesa}-${r.kodeSLS}-${r.namaKK}-${i}`} row={r} rank={i + 1} onDetail={handleDetail} />
                        ))
                      )}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="font-semibold text-gray-600">
                          {filteredRows.length}{searchKK ? ` / ${selectedRows.length}` : ""} Anomali
                        </span>
                        <span>·</span>
                        <span className="text-emerald-600 font-medium">{filteredRows.filter(r => r.hasilKonfirmasiPML.startsWith("01")).length} sudah sesuai</span>
                        <span>·</span>
                        <span className="text-rose-400 font-medium">{filteredRows.filter(r => r.hasilKonfirmasiPML.startsWith("02")).length} perlu diperbaiki</span>
                        <span>·</span>
                        <span className="text-gray-400 font-medium">{filteredRows.filter(r => !r.hasilKonfirmasiPML.trim()).length} belum dikonfirmasi</span>
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
        @keyframes fadeIn{from{opacity:0;transform:scale(0.97) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        .animate-fadeIn{animation:fadeIn 0.2s ease-out;}
      `}</style>
    </div>
  );
}
