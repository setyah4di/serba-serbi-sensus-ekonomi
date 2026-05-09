// src/element/TabelKebutuhan.jsx

import { useState, useMemo } from "react";

// ── Data real sesuai tabel kebutuhan SE2026 ───────────────────────────────────
// Hanya desa yang membutuhkan penambahan mitra yang ditampilkan.
// cadangan = mitra cadangan per kecamatan
const RAW_DATA = [
  { kecamatan: "TUNGKAL ULU", cadangan: 3, desa: [
    { nama: "BADANG",             kebutuhan: 1 },
    { nama: "KUALA DASAL",        kebutuhan: 2 },
    { nama: "TAMAN RAJA",         kebutuhan: 2 },
    { nama: "BRASAU",             kebutuhan: 1 },
    { nama: "GEMURUH",            kebutuhan: 1 },
    { nama: "PEMATANG TEMBESU",   kebutuhan: 2 },
  ]},
  { kecamatan: "MERLUNG", cadangan: 2, desa: [
    { nama: "BUKIT HARAPAN",      kebutuhan: 2 },
    { nama: "PINANG GADING",      kebutuhan: 1 },
    { nama: "MERLUNG",            kebutuhan: 3 },
    { nama: "LUBUK TERAP",        kebutuhan: 1 },
    { nama: "PENYABUNGAN",        kebutuhan: 1 },
    { nama: "MERLUNG",            kebutuhan: 2 },
  ]},
  { kecamatan: "BATANG ASAM", cadangan: 4, desa: [
    { nama: "KAMPUNG BARU",       kebutuhan: 1 },
    { nama: "SUBAN",              kebutuhan: 6 },
    { nama: "SRI AGUNG",          kebutuhan: 2 },
    { nama: "SUNGAI PENOBAN",     kebutuhan: 2 },
    { nama: "RAWANG KEMPAS",      kebutuhan: 1 },
  ]},
  { kecamatan: "TEBING TINGGI", cadangan: 4, desa: [
    { nama: "PURWODADI",          kebutuhan: 1 },
    { nama: "SUKA DAMAI",         kebutuhan: 2 },
    { nama: "ADI JAYA",           kebutuhan: 1 },
    { nama: "TEBING TINGGI",      kebutuhan: 3 },
    { nama: "KELAGIAN",           kebutuhan: 2 },
    { nama: "DELIMA",             kebutuhan: 1 },
    { nama: "TALANG MAKMUR",      kebutuhan: 1 },
    { nama: "TELUK PENGKAH",      kebutuhan: 1 },
  ]},
  { kecamatan: "MUARA PAPALIK", cadangan: 2, desa: [
    { nama: "BUKIT INDAH",        kebutuhan: 1 },
    { nama: "KEMANG MANIS",       kebutuhan: 1 },
    { nama: "DUSUN MUDO",         kebutuhan: 2 },
    { nama: "RANTAU BADAK",       kebutuhan: 1 },
    { nama: "SUNGAI MULUK",       kebutuhan: 1 },
    { nama: "RANTAU BADAK LAMO",  kebutuhan: 1 },
  ]},
  { kecamatan: "RENAH MENDALUH", cadangan: 3, desa: [
    { nama: "LUBUK KAMBING",      kebutuhan: 3 },
    { nama: "PULAU PAUH",         kebutuhan: 1 },
    { nama: "RANTAU BENAR",       kebutuhan: 2 },
    { nama: "TANAH TUMBUH",       kebutuhan: 1 },
    { nama: "SUNGAI PAUR",        kebutuhan: 1 },
    { nama: "BUKIT BAKAR",        kebutuhan: 1 },
  ]},
  { kecamatan: "PENGABUAN", cadangan: 2, desa: [
    { nama: "TELUKNILAU",         kebutuhan: 2 },
    { nama: "PARIT PUDIN",        kebutuhan: 1 },
    { nama: "MEKAR JATI",         kebutuhan: 1 },
    { nama: "PARIT BILAL",        kebutuhan: 1 },
    { nama: "SUAK SAMIN",         kebutuhan: 1 },
    { nama: "KARYA MAJU",         kebutuhan: 2 },
  ]},
  { kecamatan: "SENYERANG", cadangan: 3, desa: [
    { nama: "MARGO RUKUN",        kebutuhan: 1 },
    { nama: "TELUK KETAPANG",     kebutuhan: 1 },
    { nama: "SENYERANG",          kebutuhan: 1 },
    { nama: "KEMPAS JAYA",        kebutuhan: 1 },
    { nama: "SUNGAI LANDAK",      kebutuhan: 1 },
  ]},
  { kecamatan: "TUNGKAL ILIR", cadangan: 4, desa: [
    { nama: "TUNGKAL I",          kebutuhan: 1 },
  ]},
  { kecamatan: "BRAM ITAM", cadangan: 0, desa: [
    { nama: "-",                  kebutuhan: 0 },
  ]},
  { kecamatan: "SEBERANG KOTA", cadangan: 2, desa: [
    { nama: "TUNGKAL IV DESA",    kebutuhan: 1 },
    { nama: "MUARA SEBERANG",     kebutuhan: 1 },
  ]},
  { kecamatan: "BETARA", cadangan: 3, desa: [
    { nama: "LUBUK TERENTANG",    kebutuhan: 1 },
    { nama: "PEMATANG BULUH",     kebutuhan: 1 },
    { nama: "TELUK KULBI",        kebutuhan: 1 },
    { nama: "SUNGAI TERAP",       kebutuhan: 1 },
    { nama: "BUNGA TANJUNG",      kebutuhan: 1 },
  ]},
  { kecamatan: "KUALA BETARA", cadangan: 0, desa: [
    { nama: "-",                  kebutuhan: 0 },
  ]},
];

// ── Flatten ───────────────────────────────────────────────────────────────────
const FLAT_ROWS = (() => {
  let globalNo = 0;
  return RAW_DATA.map((kec, kecIdx) =>
    kec.desa.map((desa, desaIdx) => ({
      kecIdx,
      kecamatan: kec.kecamatan,
      cadangan: kec.cadangan,
      totalDesaKec: kec.desa.length,
      desaIdx,
      isFirst: desaIdx === 0,
      globalNo: ++globalNo,
      nama: desa.nama,
      kebutuhan: desa.kebutuhan,
    }))
  ).flat();
})();

function toTitle(str) {
  if (str === "-") return "-";
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function TabelKebutuhan() {
  const [searchKec, setSearchKec]   = useState("");
  const [searchDesa, setSearchDesa] = useState("");

  const isFiltering = searchKec.trim() !== "" || searchDesa.trim() !== "";

  const filtered = useMemo(() => {
    if (!isFiltering) return FLAT_ROWS;
    return FLAT_ROWS.filter((r) => {
      const matchKec  = r.kecamatan.toLowerCase().includes(searchKec.toLowerCase().trim());
      const matchDesa = r.nama.toLowerCase().includes(searchDesa.toLowerCase().trim());
      return matchKec && matchDesa;
    });
  }, [searchKec, searchDesa, isFiltering]);

  const totalPetugas = filtered.reduce((s, r) => s + r.kebutuhan, 0);

  const totalCadangan = useMemo(() => {
    const seenKec = new Set();
    return filtered.reduce((s, r) => {
      if (!seenKec.has(r.kecIdx)) { seenKec.add(r.kecIdx); return s + r.cadangan; }
      return s;
    }, 0);
  }, [filtered]);

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* ── Judul ── */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-wide">
            Kebutuhan Penambahan Mitra SE 2026
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Kabupaten Tanjung Jabung Barat — Data per Kecamatan &amp; Desa
          </p>
          <div className="h-1 w-16 bg-orange-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* ── Ringkasan total ──
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Desa Butuh Mitra", value: FLAT_ROWS.filter(r => r.nama !== "-").length, color: "bg-orange-50 border-orange-200 text-orange-700" },
            { label: "Total Kebutuhan Mitra", value: FLAT_ROWS.reduce((s,r) => s + r.kebutuhan, 0), color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Total Cadangan", value: RAW_DATA.reduce((s,k) => s + k.cadangan, 0), color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-semibold mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div> */}

        {/* ── Search ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Cari nama kecamatan..."
              value={searchKec}
              onChange={(e) => setSearchKec(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white shadow-sm"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Cari nama desa..."
              value={searchDesa}
              onChange={(e) => setSearchDesa(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white shadow-sm"
            />
          </div>
          {isFiltering && (
            <button
              onClick={() => { setSearchKec(""); setSearchDesa(""); }}
              className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-xl text-sm transition whitespace-nowrap"
            >
              ✕ Reset
            </button>
          )}
        </div>

        {isFiltering && (
          <p className="text-xs text-gray-500 mb-3">
            Menampilkan <strong>{filtered.length}</strong> baris dari hasil pencarian
          </p>
        )}

        {/* ── Tabel ── */}
        <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-orange-500 text-white">
                {["No", "Nama Kecamatan", "No", "Nama Desa", "Kebutuhan Mitra", "Cadangan"].map((h) => (
                  <th key={h} className="border border-orange-400 px-4 py-3 text-center font-extrabold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Tidak ada data yang sesuai pencarian.
                  </td>
                </tr>
              ) : isFiltering ? (
                filtered.map((r, i) => (
                  <tr key={`f-${i}`} className={`${i % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}>
                    <td className="border border-gray-100 px-3 py-2 text-center font-bold text-gray-700 bg-orange-50 whitespace-nowrap">{r.kecIdx + 1}</td>
                    <td className="border border-gray-200 px-4 py-2 text-center font-extrabold text-gray-800 uppercase bg-orange-50 whitespace-nowrap" style={{ minWidth: 140 }}>{r.kecamatan}</td>
                    <td className="border border-gray-100 px-3 py-2 text-center text-gray-500 text-xs font-medium">{r.nama === "-" ? "-" : r.desaIdx + 1}</td>
                    <td className="border border-gray-100 px-4 py-2 text-gray-700 font-medium" style={{ minWidth: 180 }}>{toTitle(r.nama)}</td>
                    <td className="border border-gray-100 px-4 py-2 text-center font-bold text-gray-800">
                      {r.kebutuhan === 0 ? <span className="text-gray-400">-</span> : r.kebutuhan}
                    </td>
                    <td className="border border-gray-100 px-4 py-2 text-center text-gray-600 font-semibold bg-orange-50">
                      {r.cadangan === 0 ? <span className="text-gray-400">-</span> : r.cadangan}
                    </td>
                  </tr>
                ))
              ) : (
                filtered.map((r, i) => (
                  <tr key={`n-${i}`} className={`${r.kecIdx % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}>
                    {r.isFirst && (
                      <td rowSpan={r.totalDesaKec} className="border border-gray-200 px-3 py-2 text-center font-bold text-gray-700 align-middle bg-orange-50" style={{ borderRight: "2px solid #e5e7eb" }}>
                        {r.kecIdx + 1}
                      </td>
                    )}
                    {r.isFirst && (
                      <td rowSpan={r.totalDesaKec} className="border border-gray-200 px-4 py-2 text-center font-extrabold text-gray-800 align-middle uppercase leading-tight bg-orange-50" style={{ borderRight: "2px solid #d1d5db", minWidth: 140 }}>
                        {r.kecamatan}
                      </td>
                    )}
                    <td className="border border-gray-100 px-3 py-2 text-center text-gray-500 text-xs font-medium">
                      {r.nama === "-" ? "-" : r.desaIdx + 1}
                    </td>
                    <td className="border border-gray-100 px-4 py-2 text-gray-700 font-medium" style={{ minWidth: 180 }}>
                      {toTitle(r.nama)}
                    </td>
                    <td className="border border-gray-100 px-4 py-2 text-center font-bold text-gray-800">
                      {r.kebutuhan === 0 ? <span className="text-gray-400">-</span> : r.kebutuhan}
                    </td>
                    {r.isFirst && (
                      <td rowSpan={r.totalDesaKec} className="border border-gray-200 px-4 py-2 text-center align-middle font-semibold text-gray-700 bg-orange-50">
                        {r.cadangan === 0 ? <span className="text-gray-400">-</span> : r.cadangan}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>

            <tfoot>
              <tr className="bg-orange-500 text-white font-extrabold">
                <td colSpan={2} className="border border-orange-400 px-4 py-3 text-center uppercase tracking-wide">Total</td>
                <td colSpan={2} className="border border-orange-400 px-4 py-3 text-center">{filtered.filter(r => r.nama !== "-").length} Desa/Kelurahan</td>
                <td className="border border-orange-400 px-4 py-3 text-center">{totalPetugas}</td>
                <td className="border border-orange-400 px-4 py-3 text-center">{totalCadangan}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          * Data kebutuhan petugas bersifat sementara dan dapat berubah sesuai kebutuhan lapangan.
        </p>
      </div>
    </section>
  );
}
