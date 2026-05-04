import { useState } from "react";

const laporanData = [
  { id: "RPT-001", petugas: "Ahmad Fauzi", kecamatan: "Tungkal Ilir", jumlah: 48, tgl: "03 Mei 2026", status: "disetujui" },
  { id: "RPT-002", petugas: "Siti Rahayu", kecamatan: "Betara", jumlah: 32, tgl: "03 Mei 2026", status: "pending" },
  { id: "RPT-003", petugas: "Budi Santoso", kecamatan: "Seberang Kota", jumlah: 55, tgl: "02 Mei 2026", status: "disetujui" },
  { id: "RPT-004", petugas: "Dewi Lestari", kecamatan: "Bram Itam", jumlah: 20, tgl: "02 Mei 2026", status: "ditolak" },
  { id: "RPT-005", petugas: "Eko Prasetyo", kecamatan: "Merlung", jumlah: 41, tgl: "01 Mei 2026", status: "disetujui" },
  { id: "RPT-006", petugas: "Fitriani", kecamatan: "Tebing Tinggi", jumlah: 15, tgl: "01 Mei 2026", status: "pending" },
];

const statusBadge = {
  disetujui: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  ditolak: "bg-red-100 text-red-600",
};

export default function ReportaSE() {
  const [tab, setTab] = useState("rekap");

  const totalUsaha = laporanData.reduce((a, b) => a + b.jumlah, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Reporta-SE
          </span>
          <h1 className="text-3xl font-extrabold text-gray-800">Pelaporan Sensus Ekonomi 2026</h1>
          <p className="text-gray-500 mt-1 text-sm">Rekapitulasi dan manajemen laporan harian petugas lapangan</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Laporan", value: laporanData.length, icon: "📋" },
            { label: "Disetujui", value: laporanData.filter(d=>d.status==="disetujui").length, icon: "✅" },
            { label: "Pending", value: laporanData.filter(d=>d.status==="pending").length, icon: "⏳" },
            { label: "Total Usaha Dilaporkan", value: totalUsaha, icon: "🏪" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "rekap", label: "📊 Rekapitulasi" },
            { id: "input", label: "➕ Input Laporan" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                tab === t.id ? "bg-orange-500 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Rekapitulasi */}
        {tab === "rekap" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-800">Daftar Laporan Masuk</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["ID", "Petugas", "Kecamatan", "Jml Usaha", "Tgl Lapor", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {laporanData.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{l.id}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{l.petugas}</td>
                      <td className="px-5 py-3 text-gray-600">{l.kecamatan}</td>
                      <td className="px-5 py-3 font-bold text-gray-800">{l.jumlah}</td>
                      <td className="px-5 py-3 text-gray-500">{l.tgl}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusBadge[l.status]}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Input Laporan */}
        {tab === "input" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-extrabold text-gray-800 mb-6">Form Input Laporan Harian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Nama Petugas", type: "text", placeholder: "Nama lengkap petugas" },
                { label: "Tanggal Laporan", type: "date", placeholder: "" },
                { label: "Kecamatan", type: "text", placeholder: "Nama kecamatan" },
                { label: "Jumlah Usaha Didata", type: "number", placeholder: "0" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan / Kendala</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan kendala atau catatan lapangan..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition">
                Kirim Laporan
              </button>
              <button className="px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
                Reset
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
