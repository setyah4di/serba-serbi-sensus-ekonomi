import { useState } from "react";

const dokumenList = [
  { id: 1, nama: "Surat Tugas", status: "lengkap", tgl: "12 Apr 2026" },
  { id: 2, nama: "Peta Blok Sensus", status: "lengkap", tgl: "12 Apr 2026" },
  { id: 3, nama: "Daftar Bangunan & Usaha", status: "belum", tgl: "-" },
  { id: 4, nama: "Buku Pedoman Petugas", status: "lengkap", tgl: "10 Apr 2026" },
  { id: 5, nama: "Kuesioner SE2026-L1", status: "proses", tgl: "14 Apr 2026" },
  { id: 6, nama: "Kuesioner SE2026-L2", status: "belum", tgl: "-" },
  { id: 7, nama: "APD (Masker, ID Card)", status: "lengkap", tgl: "11 Apr 2026" },
  { id: 8, nama: "Tablet/Smartphone Terkalibrasi", status: "proses", tgl: "15 Apr 2026" },
];

const badgeConfig = {
  lengkap: { label: "Lengkap", cls: "bg-green-100 text-green-700" },
  proses: { label: "Sedang Diproses", cls: "bg-yellow-100 text-yellow-700" },
  belum: { label: "Belum Lengkap", cls: "bg-red-100 text-red-700" },
};

export default function KKD() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");

  const filtered = dokumenList.filter(
    (d) =>
      (filter === "semua" || d.status === filter) &&
      d.nama.toLowerCase().includes(search.toLowerCase())
  );

  const total = dokumenList.length;
  const lengkap = dokumenList.filter((d) => d.status === "lengkap").length;
  const pct = Math.round((lengkap / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            KKD
          </span>
          <h1 className="text-3xl font-extrabold text-gray-800">Kelengkapan & Kesiapan Dokumen</h1>
          <p className="text-gray-500 mt-1 text-sm">Pantau status kelengkapan dokumen petugas Sensus Ekonomi 2026</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">Progress Kelengkapan Dokumen</p>
            <span className="text-2xl font-extrabold text-emerald-600">{pct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-6 mt-4 text-xs text-gray-500">
            <span>✅ Lengkap: <strong className="text-gray-800">{lengkap}</strong></span>
            <span>⏳ Proses: <strong className="text-gray-800">{dokumenList.filter(d=>d.status==="proses").length}</strong></span>
            <span>❌ Belum: <strong className="text-gray-800">{dokumenList.filter(d=>d.status==="belum").length}</strong></span>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Cari dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <div className="flex gap-2">
            {["semua", "lengkap", "proses", "belum"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                  filter === f ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">No</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Dokumen</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Tgl Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="px-6 py-4 text-gray-400 font-medium">{d.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{d.nama}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeConfig[d.status].cls}`}>
                      {badgeConfig[d.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{d.tgl}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">Tidak ada data ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
