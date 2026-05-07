// src/element/TabelKebutuhan.jsx

import { useState, useMemo } from "react";

// ── Data mentah ──────────────────────────────────────────────────────────────
const RAW_DATA = [
  { kecamatan: "BATANG ASAM", cadangan: 3, desa: [
    { nama: "DUSUN KEBUN",     kebutuhan: 4 },
    { nama: "KAMPUNG BARU",    kebutuhan: 3 },
    { nama: "LUBUK BERNAI",    kebutuhan: 5 },
    { nama: "LUBUK LAWAS",     kebutuhan: 4 },
    { nama: "RAWA MEDANG",     kebutuhan: 3 },
    { nama: "RAWANG KEMPAS",   kebutuhan: 6 },
    { nama: "SRI AGUNG",       kebutuhan: 4 },
    { nama: "SUBAN",           kebutuhan: 3 },
    { nama: "SUNGAI BADAR",    kebutuhan: 5 },
    { nama: "SUNGAI PENOBAN",  kebutuhan: 4 },
    { nama: "TANJUNG BOJO",    kebutuhan: 3 },
  ]},
  { kecamatan: "BETARA", cadangan: 2, desa: [
    { nama: "BUNGA TANJUNG",      kebutuhan: 5 },
    { nama: "LUBUK TERENTANG",    kebutuhan: 4 },
    { nama: "MAKMUR JAYA",        kebutuhan: 3 },
    { nama: "MANDALA JAYA",       kebutuhan: 6 },
    { nama: "MEKAR JAYA",         kebutuhan: 4 },
    { nama: "MUNTIALO",           kebutuhan: 3 },
    { nama: "PEMATANG BULUH",     kebutuhan: 5 },
    { nama: "PEMATANG LUMUT",     kebutuhan: 4 },
    { nama: "SERDANG JAYA",       kebutuhan: 3 },
    { nama: "SUNGAI TERAP",       kebutuhan: 6 },
    { nama: "TELUK KULBI",        kebutuhan: 4 },
    { nama: "TERJUN GAJAH",       kebutuhan: 3 },
  ]},
  { kecamatan: "BRAM ITAM", cadangan: 2, desa: [
    { nama: "BRAM ITAM KANAN",    kebutuhan: 5 },
    { nama: "BRAM ITAM KIRI",     kebutuhan: 4 },
    { nama: "BRAM ITAM RAYA",     kebutuhan: 6 },
    { nama: "JATI EMAS",          kebutuhan: 3 },
    { nama: "KEMUNING",           kebutuhan: 4 },
    { nama: "MEKAR TANJUNG",      kebutuhan: 5 },
    { nama: "PANTAI GADING",      kebutuhan: 3 },
    { nama: "PEMBENGIS",          kebutuhan: 4 },
    { nama: "SEMAU",              kebutuhan: 6 },
    { nama: "TANJUNG SENJULANG",  kebutuhan: 3 },
  ]},
  { kecamatan: "KUALA BETARA", cadangan: 2, desa: [
    { nama: "BETARA KANAN",       kebutuhan: 4 },
    { nama: "BETARA KIRI",        kebutuhan: 3 },
    { nama: "DATARAN PINANG",     kebutuhan: 5 },
    { nama: "KUALA INDAH",        kebutuhan: 4 },
    { nama: "SUAK LABU",          kebutuhan: 3 },
    { nama: "SUNGAI DUALAP",      kebutuhan: 6 },
    { nama: "SUNGAI DUNGUN",      kebutuhan: 4 },
    { nama: "SUNGAI GEBAR",       kebutuhan: 3 },
    { nama: "SUNGAI GEBAR BARAT", kebutuhan: 5 },
    { nama: "TANJUNG PASIR",      kebutuhan: 4 },
  ]},
  { kecamatan: "MERLUNG", cadangan: 1, desa: [
    { nama: "ADI PURWA",          kebutuhan: 3 },
    { nama: "BUKIT HARAPAN",      kebutuhan: 4 },
    { nama: "LUBUK TERAP",        kebutuhan: 5 },
    { nama: "MERLUNG",            kebutuhan: 6 },
    { nama: "PENYABUNGAN",        kebutuhan: 3 },
    { nama: "PINANG GADING",      kebutuhan: 4 },
    { nama: "TANJUNG BENANAK",    kebutuhan: 5 },
    { nama: "TANJUNG MAKMUR",     kebutuhan: 3 },
    { nama: "TANJUNG PAKU",       kebutuhan: 4 },
  ]},
  { kecamatan: "MUARA PAPALIK", cadangan: 2, desa: [
    { nama: "BUKIT INDAH",        kebutuhan: 4 },
    { nama: "DUSUN MUDO",         kebutuhan: 3 },
    { nama: "INTAN JAYA",         kebutuhan: 5 },
    { nama: "KEMANG MANIS",       kebutuhan: 4 },
    { nama: "LUBUK SEBONTAN",     kebutuhan: 6 },
    { nama: "PEMATANG BALAM",     kebutuhan: 3 },
    { nama: "RANTAU BADAK",       kebutuhan: 4 },
    { nama: "RANTAU BADAK LAMO",  kebutuhan: 5 },
    { nama: "SUNGAI MULUK",       kebutuhan: 3 },
    { nama: "SUNGAI PAPAUH",      kebutuhan: 4 },
  ]},
  { kecamatan: "PENGABUAN", cadangan: 3, desa: [
    { nama: "KARYA MAJU",         kebutuhan: 5 },
    { nama: "MEKAR JATI",         kebutuhan: 4 },
    { nama: "PARIT BILAL",        kebutuhan: 3 },
    { nama: "PARIT PUDIN",        kebutuhan: 6 },
    { nama: "PARIT SIDANG",       kebutuhan: 4 },
    { nama: "PASAR SENIN",        kebutuhan: 3 },
    { nama: "SUAK SAMIN",         kebutuhan: 5 },
    { nama: "SUNGAI BAUNG",       kebutuhan: 4 },
    { nama: "SUNGAI JERING",      kebutuhan: 3 },
    { nama: "SUNGAI PAMPANG",     kebutuhan: 6 },
    { nama: "SUNGAI RAYA",        kebutuhan: 4 },
    { nama: "SUNGAI SERINDIT",    kebutuhan: 3 },
    { nama: "TELUKNILAU",         kebutuhan: 5 },
  ]},
  { kecamatan: "RENAH MENDALUH", cadangan: 2, desa: [
    { nama: "BUKIT BAKAR",        kebutuhan: 3 },
    { nama: "CINTA DAMAI",        kebutuhan: 4 },
    { nama: "LAMPISI",            kebutuhan: 5 },
    { nama: "LUBUK KAMBING",      kebutuhan: 3 },
    { nama: "MUARA DANAU",        kebutuhan: 6 },
    { nama: "PULAU PAUH",         kebutuhan: 4 },
    { nama: "RANTAU BENAR",       kebutuhan: 3 },
    { nama: "SUNGAI PAUR",        kebutuhan: 5 },
    { nama: "SUNGAI ROTAN",       kebutuhan: 4 },
    { nama: "TANAH TUMBUH",       kebutuhan: 3 },
  ]},
  { kecamatan: "SEBERANG KOTA", cadangan: 2, desa: [
    { nama: "HARAPAN JAYA",       kebutuhan: 6 },
    { nama: "KUALA BARU",         kebutuhan: 5 },
    { nama: "KUALA KAHAR",        kebutuhan: 4 },
    { nama: "MEKAR ALAM",         kebutuhan: 3 },
    { nama: "MUARA SEBERANG",     kebutuhan: 5 },
    { nama: "TELUK PULAI RAYA",   kebutuhan: 4 },
    { nama: "TUNGKAL IV DESA",    kebutuhan: 6 },
    { nama: "TUNGKAL V",          kebutuhan: 3 },
  ]},
  { kecamatan: "SENYERANG", cadangan: 2, desa: [
    { nama: "KEMPAS JAYA",        kebutuhan: 4 },
    { nama: "LUMAHAN",            kebutuhan: 3 },
    { nama: "MARGO RUKUN",        kebutuhan: 5 },
    { nama: "SENYERANG",          kebutuhan: 4 },
    { nama: "SUNGAI KAYU ARO",    kebutuhan: 3 },
    { nama: "SUNGAI KEPAYANG",    kebutuhan: 6 },
    { nama: "SUNGAI LANDAK",      kebutuhan: 4 },
    { nama: "SUNGAI RAMBAI",      kebutuhan: 3 },
    { nama: "SUNGSANG",           kebutuhan: 5 },
    { nama: "TELUK KETAPANG",     kebutuhan: 4 },
  ]},
  { kecamatan: "TEBING TINGGI", cadangan: 2, desa: [
    { nama: "ADI JAYA",           kebutuhan: 3 },
    { nama: "DATARAN KEMPAS",     kebutuhan: 4 },
    { nama: "DELIMA",             kebutuhan: 5 },
    { nama: "KELAGIAN",           kebutuhan: 3 },
    { nama: "PURWODADI",          kebutuhan: 6 },
    { nama: "SUKA DAMAI",         kebutuhan: 4 },
    { nama: "SUNGAI KERUH",       kebutuhan: 3 },
    { nama: "TALANG MAKMUR",      kebutuhan: 5 },
    { nama: "TEBING TINGGI",      kebutuhan: 4 },
    { nama: "TELUK PENGKAH",      kebutuhan: 3 },
  ]},
  { kecamatan: "TUNGKAL ILIR", cadangan: 3, desa: [
    { nama: "KAMPUNG NELAYAN",    kebutuhan: 6 },
    { nama: "PATUNAS",            kebutuhan: 4 },
    { nama: "SRIWIJAYA",          kebutuhan: 5 },
    { nama: "SUNGAINIBUNG",       kebutuhan: 3 },
    { nama: "TELUK SIALANG",      kebutuhan: 4 },
    { nama: "TUNGKAL EMPAT KOTA", kebutuhan: 6 },
    { nama: "TUNGKAL HARAPAN",    kebutuhan: 4 },
    { nama: "TUNGKAL I",          kebutuhan: 5 },
    { nama: "TUNGKAL II",         kebutuhan: 3 },
    { nama: "TUNGKAL III",        kebutuhan: 4 },
  ]},
  { kecamatan: "TUNGKAL ULU", cadangan: 2, desa: [
    { nama: "BADANG",             kebutuhan: 3 },
    { nama: "BADANG SEPAKAT",     kebutuhan: 4 },
    { nama: "BRASAU",             kebutuhan: 5 },
    { nama: "GEMURUH",            kebutuhan: 3 },
    { nama: "KUALA DASAL",        kebutuhan: 6 },
    { nama: "PELABUHAN DAGANG",   kebutuhan: 4 },
    { nama: "PEMATANG PAUH",      kebutuhan: 3 },
    { nama: "PEMATANG TEMBESU",   kebutuhan: 5 },
    { nama: "TAMAN RAJA",         kebutuhan: 4 },
    { nama: "TANJUNG TAYAS",      kebutuhan: 3 },
  ]},
];

// ── Flatten data sekalian beri nomor urut global ──────────────────────────────
const FLAT_ROWS = (() => {
  let globalNo = 0;
  return RAW_DATA.map((kec, kecIdx) => {
    const rows = kec.desa.map((desa, desaIdx) => ({
      kecIdx,
      kecamatan: kec.kecamatan,
      cadangan: kec.cadangan,
      totalDesaKec: kec.desa.length,
      desaIdx,
      isFirst: desaIdx === 0,
      globalNo: ++globalNo,
      nama: desa.nama,
      kebutuhan: desa.kebutuhan,
    }));
    return rows;
  }).flat();
})();

// ── Capitalize helper ─────────────────────────────────────────────────────────
function toTitle(str) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function TabelKebutuhan() {
  const [searchKec, setSearchKec] = useState("");
  const [searchDesa, setSearchDesa] = useState("");

  const isFiltering = searchKec.trim() !== "" || searchDesa.trim() !== "";

  // Baris yang lolos filter
  const filtered = useMemo(() => {
    if (!isFiltering) return FLAT_ROWS;
    return FLAT_ROWS.filter((r) => {
      const matchKec  = r.kecamatan.toLowerCase().includes(searchKec.toLowerCase().trim());
      const matchDesa = r.nama.toLowerCase().includes(searchDesa.toLowerCase().trim());
      return matchKec && matchDesa;
    });
  }, [searchKec, searchDesa, isFiltering]);

  // Statistik footer dari baris yang tampil
  const totalPetugas  = filtered.reduce((s, r) => s + r.kebutuhan, 0);
  const totalCadangan = useMemo(() => {
    if (isFiltering) {
      // sum cadangan unik per kecamatan yang masih ada di hasil filter
      const seenKec = new Set();
      return filtered.reduce((s, r) => {
        if (!seenKec.has(r.kecIdx)) { seenKec.add(r.kecIdx); return s + r.cadangan; }
        return s;
      }, 0);
    }
    return RAW_DATA.reduce((s, k) => s + k.cadangan, 0);
  }, [filtered, isFiltering]);

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* ── Judul ── */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-wide">
            Kebutuhan Petugas SE 2026
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Kabupaten Tanjung Jabung Barat — Data per Kecamatan &amp; Desa
          </p>
          <div className="h-1 w-16 bg-orange-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* ── Search bar ── */}
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

        {/* ── Info hasil filter ── */}
        {isFiltering && (
          <p className="text-xs text-gray-500 mb-3">
            Menampilkan <strong>{filtered.length}</strong> desa dari hasil pencarian
          </p>
        )}

        {/* ── Tabel ── */}
        <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">
          <table className="w-full border-collapse text-sm">

            {/* Header */}
            <thead>
              <tr className="bg-orange-500 text-white">
                {["No", "Nama Kecamatan", "No", "Nama Desa", "Kebutuhan Petugas", "Cadangan"].map((h) => (
                  <th
                    key={h}
                    className="border border-orange-400 px-4 py-3 text-center font-extrabold uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Tidak ada data yang sesuai pencarian.
                  </td>
                </tr>
              ) : isFiltering ? (
                // ── Mode filter: render flat (tanpa rowspan) ──
                filtered.map((r, i) => (
                  <tr key={`f-${i}`} className={`${i % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}>
                    <td className="border border-gray-100 px-3 py-2 text-center font-bold text-gray-700 bg-orange-50 whitespace-nowrap">
                      {r.kecIdx + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center font-extrabold text-gray-800 uppercase bg-orange-50 whitespace-nowrap" style={{ minWidth: 140 }}>
                      {r.kecamatan}
                    </td>
                    <td className="border border-gray-100 px-3 py-2 text-center text-gray-500 text-xs font-medium">
                      {r.desaIdx + 1}
                    </td>
                    <td className="border border-gray-100 px-4 py-2 text-gray-700 font-medium" style={{ minWidth: 180 }}>
                      {toTitle(r.nama)}
                    </td>
                    <td className="border border-gray-100 px-4 py-2 text-center font-bold text-gray-800">
                      {r.kebutuhan}
                    </td>
                    <td className="border border-gray-100 px-4 py-2 text-center text-gray-600 font-semibold bg-orange-50">
                      {r.cadangan}
                    </td>
                  </tr>
                ))
              ) : (
                // ── Mode normal: rowspan per kecamatan ──
                filtered.map((r, i) => (
                  <tr
                    key={`n-${i}`}
                    className={`${r.kecIdx % 2 === 0 ? "bg-white" : "bg-orange-50"} hover:bg-orange-100 transition-colors`}
                  >
                    {/* No Kecamatan — rowspan */}
                    {r.isFirst && (
                      <td
                        rowSpan={r.totalDesaKec}
                        className="border border-gray-200 px-3 py-2 text-center font-bold text-gray-700 align-middle bg-orange-50"
                        style={{ borderRight: "2px solid #e5e7eb" }}
                      >
                        {r.kecIdx + 1}
                      </td>
                    )}
                    {/* Nama Kecamatan — rowspan */}
                    {r.isFirst && (
                      <td
                        rowSpan={r.totalDesaKec}
                        className="border border-gray-200 px-4 py-2 text-center font-extrabold text-gray-800 align-middle uppercase leading-tight bg-orange-50"
                        style={{ borderRight: "2px solid #d1d5db", minWidth: 140 }}
                      >
                        {r.kecamatan}
                      </td>
                    )}
                    {/* No Desa */}
                    <td className="border border-gray-100 px-3 py-2 text-center text-gray-500 text-xs font-medium">
                      {r.desaIdx + 1}
                    </td>
                    {/* Nama Desa */}
                    <td className="border border-gray-100 px-4 py-2 text-gray-700 font-medium" style={{ minWidth: 180 }}>
                      {toTitle(r.nama)}
                    </td>
                    {/* Kebutuhan Petugas */}
                    <td className="border border-gray-100 px-4 py-2 text-center font-bold text-gray-800">
                      {r.kebutuhan}
                    </td>
                    {/* Cadangan — rowspan */}
                    {r.isFirst && (
                      <td
                        rowSpan={r.totalDesaKec}
                        className="border border-gray-200 px-4 py-2 text-center align-middle font-semibold text-gray-700 bg-orange-50"
                      >
                        {r.cadangan}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>

            {/* Footer */}
            <tfoot>
              <tr className="bg-orange-500 text-white font-extrabold">
                <td colSpan={2} className="border border-orange-400 px-4 py-3 text-center uppercase tracking-wide">
                  Total
                </td>
                <td colSpan={2} className="border border-orange-400 px-4 py-3 text-center">
                  {filtered.length} Desa/Kelurahan
                </td>
                <td className="border border-orange-400 px-4 py-3 text-center">
                  {totalPetugas}
                </td>
                <td className="border border-orange-400 px-4 py-3 text-center">
                  {totalCadangan}
                </td>
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
