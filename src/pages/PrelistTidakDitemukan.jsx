import { useState, useEffect, useMemo, useRef } from "react";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "1BHma1HmHYKlzMV2GQ7Y_Z9gNMMPA2m8LplG6V4T81zs";
const GID_DATA        = "471865770";

const CSV_DATA = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_DATA}`;

// ── Kolom (0-based index) ──
// F  = level_3_nam  -> Kecamatan
// H  = level_4_nam  -> Desa/Kelurahan
// J  = level_5_nam  -> Nama RT
// L  = level_6_full -> Kode SLS lengkap
// M  = data1        -> Nama Assignment
// N  = data2        -> Alamat
// O  = data3        -> IDSBR
// R  = data6        -> Jenis Prelist
const COL = {
  kecamatan: 5,
  desa: 7,
  rtNama: 9,
  slsFull: 11,
  namaAssignment: 12,
  alamat: 13,
  idsbr: 14,
  jenisPrelist: 17,
  keberadaan: 24,
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

// ── Helpers warna (severity berdasarkan jumlah tidak ditemukan) ──
function countColor(v) { if (v === 0) return "#10b981"; if (v <= 5) return "#3b82f6"; if (v <= 15) return "#f59e0b"; return "#f43f5e"; }
function countBadgeStyle(v) {
  if (v === 0) return { bg: "#d1fae5", text: "#065f46", dot: "#10b981" };
  if (v <= 5) return { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" };
  if (v <= 15) return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
  return { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e" };
}
function countLabel(v) { if (v === 0) return "Aman"; if (v <= 5) return "Ringan"; if (v <= 15) return "Sedang"; return "Perlu Perhatian"; }

// ── Stat Card (dashboard atas) ──
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

// ── Kecamatan Card ──
function KecamatanCard({ kecamatan, total, onClick, isSelected }) {
  const color = countColor(total);
  const badge = countBadgeStyle(total);
  const label = countLabel(total);
  return (
    <button onClick={onClick} className="w-full text-left border-0 bg-transparent p-0 cursor-pointer">
      <div className={`rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100" : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
            <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
          </div>
          <span className="text-3xl font-black flex-shrink-0" style={{ color }}>{total}</span>
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

// ── Baris Desa (level 1 drill-down) ──
function DesaRow({ desa, total, rank, onDetail }) {
  const badge = countBadgeStyle(total);
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{desa || "-"}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{total} data tidak ditemukan</p>
        </div>
        <span className="text-sm font-black px-3 py-1.5 rounded-xl flex-shrink-0 tabular-nums" style={{ background: badge.bg, color: badge.text }}>
          {total}
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

// ── Baris RT / SLS unik (level 2 drill-down) — sudah digabung, tampilkan jumlah ──
function SlsRow({ group, rank, onClick }) {
  const badge = countBadgeStyle(group.total);
  return (
    <button onClick={onClick} className="w-full text-left border-0 bg-transparent p-0 cursor-pointer">
      <div className="py-3.5 border-b border-gray-50 last:border-0 group flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{group.rtNama || "-"}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate font-mono">{group.slsFull || "-"}</p>
        </div>
        <span className="text-sm font-black px-3 py-1.5 rounded-xl flex-shrink-0 tabular-nums" style={{ background: badge.bg, color: badge.text }}>
          {group.total}
        </span>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}

// ── Kartu Assignment (level 3, ditampilkan langsung tanpa pop up) ──
function AssignmentCard({ item, rank }) {
  const fields = [
    { label: "Alamat", value: item.alamat },
    { label: "IDSBR", value: item.idsbr },
    { label: "Jenis Prelist", value: item.jenisPrelist },
    { label: "Keberadaan", value: item.keberadaan },
  ];
  return (
    <div className="py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3 mb-2">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {rank}
        </span>
        <p className="text-sm font-bold text-gray-800 leading-snug flex-1 min-w-0">{item.namaAssignment || "-"}</p>
      </div>
      <div className="pl-9 grid grid-cols-1 gap-1.5">
        {fields.map(f => (
          <div key={f.label} className="flex items-baseline gap-2">
            <span className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-widest w-24 flex-shrink-0">{f.label}</span>
            <span className="text-xs font-medium text-gray-700 break-words">{f.value || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringPetugas() {
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [search, setSearch]           = useState("");       // cari kecamatan
  const [selectedKec, setSelectedKec] = useState(null);

  const [searchDesa, setSearchDesa]   = useState("");        // cari desa
  const [selectedDesa, setSelectedDesa] = useState(null);

  const [searchSls, setSearchSls]     = useState("");        // cari RT/SLS
  const [selectedSlsKey, setSelectedSlsKey] = useState(null); // level 3: grup RT/SLS terpilih
  const [keberadaanFilter, setKeberadaanFilter] = useState(""); // filter keberadaan pada level assignment

  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  // ── Load data ──
  useEffect(() => {
    fetch(`${CSV_DATA}&t=${Date.now()}`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data."); return r.text(); })
      .then(text => {
        const parsed = parseCSV(text);
        const data = parsed.slice(1).map(cols => ({
          kecamatan:      (cols[COL.kecamatan] || "").trim(),
          desa:           (cols[COL.desa] || "").trim(),
          rtNama:         (cols[COL.rtNama] || "").trim(),
          slsFull:        (cols[COL.slsFull] || "").trim(),
          namaAssignment: (cols[COL.namaAssignment] || "").trim(),
          alamat:         (cols[COL.alamat] || "").trim(),
          idsbr:          (cols[COL.idsbr] || "").trim(),
          jenisPrelist:   (cols[COL.jenisPrelist] || "").trim(),
          keberadaan:     (cols[COL.keberadaan] || "").trim(),
        })).filter(r => r.kecamatan && r.desa);
        setRows(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Reset saat ganti kecamatan / desa / grup RT-SLS ──
  useEffect(() => { setSelectedDesa(null); setSearchDesa(""); if (tableRef.current) tableRef.current.scrollTop = 0; }, [selectedKec]);
  useEffect(() => { setSearchSls(""); setSelectedSlsKey(null); if (tableRef.current) tableRef.current.scrollTop = 0; }, [selectedDesa]);
  useEffect(() => { setKeberadaanFilter(""); if (tableRef.current) tableRef.current.scrollTop = 0; }, [selectedSlsKey]);

  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  // ── Total keseluruhan (jumlah seluruh baris) ──
  const totalAll = rows.length;

  // ── Agregasi per Kecamatan ──
  const kecamatanAgg = useMemo(() => {
    const map = new Map();
    rows.forEach(r => { map.set(r.kecamatan, (map.get(r.kecamatan) || 0) + 1); });
    return Array.from(map.entries())
      .map(([kecamatan, total]) => ({ kecamatan, total }))
      .sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
  }, [rows]);

  const kecamatanList = useMemo(() =>
    kecamatanAgg.filter(k => search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
  , [kecamatanAgg, search]);

  // ── Agregasi Desa dalam Kecamatan terpilih ──
  const desaAgg = useMemo(() => {
    if (!selectedKec) return [];
    const map = new Map();
    rows.forEach(r => { if (r.kecamatan === selectedKec) map.set(r.desa, (map.get(r.desa) || 0) + 1); });
    return Array.from(map.entries())
      .map(([desa, total]) => ({ desa, total }))
      .sort((a, b) => a.desa.localeCompare(b.desa));
  }, [rows, selectedKec]);

  const desaList = useMemo(() =>
    desaAgg.filter(d => searchDesa === "" || d.desa.toLowerCase().includes(searchDesa.toLowerCase()))
  , [desaAgg, searchDesa]);

  // ── Grup RT/SLS unik dalam Desa terpilih (RT+SLS sama digabung, dihitung jumlahnya) ──
  const slsGroupAgg = useMemo(() => {
    if (!selectedKec || !selectedDesa) return [];
    const map = new Map();
    rows.forEach(r => {
      if (r.kecamatan !== selectedKec || r.desa !== selectedDesa) return;
      const key = `${r.rtNama}||${r.slsFull}`;
      if (!map.has(key)) map.set(key, { key, rtNama: r.rtNama, slsFull: r.slsFull, total: 0, items: [] });
      const g = map.get(key);
      g.total += 1;
      g.items.push(r);
    });
    return Array.from(map.values()).sort((a, b) => a.rtNama.localeCompare(b.rtNama) || a.slsFull.localeCompare(b.slsFull));
  }, [rows, selectedKec, selectedDesa]);

  const slsGroupList = useMemo(() =>
    slsGroupAgg.filter(g =>
      searchSls === "" ||
      (g.rtNama || "").toLowerCase().includes(searchSls.toLowerCase()) ||
      (g.slsFull || "").toLowerCase().includes(searchSls.toLowerCase())
    )
  , [slsGroupAgg, searchSls]);

  const selectedSlsGroup = useMemo(() =>
    slsGroupAgg.find(g => g.key === selectedSlsKey) || null
  , [slsGroupAgg, selectedSlsKey]);

  // ── Opsi filter Keberadaan (kolom Y) untuk grup assignment terpilih ──
  const keberadaanOptions = useMemo(() => {
    if (!selectedSlsGroup) return [];
    const map = new Map();
    selectedSlsGroup.items.forEach(it => {
      const val = it.keberadaan || "-";
      map.set(val, (map.get(val) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([value, total]) => ({ value, total }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [selectedSlsGroup]);

  const filteredAssignmentItems = useMemo(() => {
    if (!selectedSlsGroup) return [];
    if (!keberadaanFilter) return selectedSlsGroup.items;
    return selectedSlsGroup.items.filter(it => (it.keberadaan || "-") === keberadaanFilter);
  }, [selectedSlsGroup, keberadaanFilter]);

  // ── Judul & total pada header panel, tergantung level ──
  const panelLevel = selectedSlsGroup ? 3 : selectedDesa ? 2 : 1;
  const panelTitle = panelLevel === 3 ? selectedSlsGroup.rtNama : panelLevel === 2 ? selectedDesa : selectedKec;
  const panelTotal = panelLevel === 3 ? selectedSlsGroup.total
    : panelLevel === 2 ? slsGroupAgg.reduce((s, g) => s + g.total, 0)
    : (kecamatanAgg.find(k => k.kecamatan === selectedKec)?.total || 0);

  const handleBack = () => {
    if (panelLevel === 3) setSelectedSlsKey(null);
    else if (panelLevel === 2) setSelectedDesa(null);
    else setSelectedKec(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Daftar Prelist Tidak Ditemukan</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-orange-100">Data diperbarui pada</p>
                <p className="text-orange-100">{lastUpdated.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} Pukul 08.00 WIB</p>
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
              <StatCard label="Total Tidak Ditemukan" value={totalAll} sub="seluruh baris data" icon="⚠️" variant="rose" />
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
              {/* ── Kolom kiri: kartu kecamatan ── */}
              <div className="w-full min-w-0 lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, total }) => (
                  <KecamatanCard key={kecamatan} kecamatan={kecamatan} total={total} isSelected={selectedKec === kecamatan} onClick={() => handleSelectKec(kecamatan)} />
                ))}
              </div>

              {/* ── Kolom kanan: panel drill-down ── */}
              <div ref={detailRef} className="w-full min-w-0 lg:w-[45%]">
                {!selectedKec ? (
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar desa.</p>
                  </div>
                ) : (
                  <div className="sticky top-6 w-full min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                            {panelLevel === 3 ? "RT / SLS" : panelLevel === 2 ? "Desa" : "Kecamatan"}
                          </p>
                          {panelLevel > 1 && (
                            <button onClick={handleBack} className="text-orange-100 text-[11px] font-semibold mb-1 flex items-center gap-1 hover:text-white">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              {panelLevel === 3 ? selectedDesa : selectedKec}
                            </button>
                          )}
                          <h2 className="text-white text-xl font-black truncate">{panelTitle}</h2>
                        </div>
                        <button
                          onClick={() => { if (panelLevel === 3) { setSelectedSlsKey(null); } else if (panelLevel === 2) { setSelectedDesa(null); } else { setSelectedKec(null); } }}
                          className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-white text-sm">
                        <span className="opacity-80">Total Tidak Ditemukan</span>
                        <span className="font-black text-lg">{panelTotal}</span>
                      </div>
                    </div>

                    <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                      {panelLevel === 1 && (
                        <>
                          <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                            <div className="relative mb-2">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                              </svg>
                              <input type="text" placeholder="Cari nama desa…" value={searchDesa}
                                onChange={e => setSearchDesa(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300" />
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                              <span className="text-xs text-gray-400 w-6 text-center">#</span>
                              <span className="text-xs text-gray-400 flex-1">Nama Desa</span>
                            </div>
                          </div>
                          {desaList.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">Tidak ada data desa di kecamatan ini.</p>
                          ) : (
                            desaList.map((d, i) => (
                              <DesaRow key={d.desa} desa={d.desa} total={d.total} rank={i + 1} onDetail={() => setSelectedDesa(d.desa)} />
                            ))
                          )}
                        </>
                      )}

                      {panelLevel === 2 && (
                        <>
                          <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                            <div className="relative mb-2">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                              </svg>
                              <input type="text" placeholder="Cari RT / SLS…" value={searchSls}
                                onChange={e => setSearchSls(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300" />
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                              <span className="text-xs text-gray-400 w-6 text-center">#</span>
                              <span className="text-xs text-gray-400 flex-1">RT · Kode SLS</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">Jumlah</span>
                            </div>
                          </div>
                          {slsGroupList.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">Tidak ada data RT/SLS untuk desa ini.</p>
                          ) : (
                            slsGroupList.map((g, i) => (
                              <SlsRow key={g.key} group={g} rank={i + 1} onClick={() => setSelectedSlsKey(g.key)} />
                            ))
                          )}
                        </>
                      )}

                      {panelLevel === 3 && selectedSlsGroup && (
                        <>
                          <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                            <div className="relative mb-2">
                              <select
                                value={keberadaanFilter}
                                onChange={e => setKeberadaanFilter(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
                              >
                                <option value="">Semua Keberadaan ({selectedSlsGroup.items.length})</option>
                                {keberadaanOptions.map(o => (
                                  <option key={o.value} value={o.value}>{o.value} ({o.total})</option>
                                ))}
                              </select>
                              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                              <span className="text-xs text-gray-400 w-6 text-center">#</span>
                              <span className="text-xs text-gray-400 flex-1">Nama Assignment</span>
                            </div>
                          </div>
                          {filteredAssignmentItems.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">Tidak ada assignment dengan keberadaan tersebut.</p>
                          ) : (
                            filteredAssignmentItems.map((item, i) => (
                              <AssignmentCard key={`${item.namaAssignment}-${i}`} item={item} rank={i + 1} />
                            ))
                          )}
                        </>
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-600">
                        {panelLevel === 3 ? `${filteredAssignmentItems.length}${keberadaanFilter ? ` / ${selectedSlsGroup.items.length}` : ""} data assignment`
                          : panelLevel === 2 ? `${slsGroupList.length} RT / SLS unik`
                          : `${desaList.length} desa`}
                      </span>
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
