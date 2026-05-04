const kecamatanData = [
  { nama: "Tungkal Ilir", target: 1200, realisasi: 980, petugas: 8 },
  { nama: "Betara", target: 800, realisasi: 640, petugas: 5 },
  { nama: "Seberang Kota", target: 950, realisasi: 920, petugas: 7 },
  { nama: "Bram Itam", target: 600, realisasi: 310, petugas: 4 },
  { nama: "Merlung", target: 700, realisasi: 580, petugas: 5 },
  { nama: "Tebing Tinggi", target: 500, realisasi: 200, petugas: 3 },
  { nama: "Renah Mendaluh", target: 450, realisasi: 380, petugas: 3 },
];

function ProgressBar({ value, max, color = "bg-purple-500" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function Ngibar() {
  const totalTarget = kecamatanData.reduce((a, b) => a + b.target, 0);
  const totalReal = kecamatanData.reduce((a, b) => a + b.realisasi, 0);
  const totalPct = Math.round((totalReal / totalTarget) * 100);

  const statCards = [
    { label: "Total Target Usaha", value: totalTarget.toLocaleString(), icon: "🎯", color: "bg-purple-50 border-purple-100" },
    { label: "Realisasi", value: totalReal.toLocaleString(), icon: "✅", color: "bg-green-50 border-green-100" },
    { label: "Progres Keseluruhan", value: `${totalPct}%`, icon: "📊", color: "bg-blue-50 border-blue-100" },
    { label: "Total Petugas", value: kecamatanData.reduce((a,b)=>a+b.petugas,0), icon: "👥", color: "bg-orange-50 border-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Ngibar
          </span>
          <h1 className="text-3xl font-extrabold text-gray-800">Monitoring Progres Lapangan</h1>
          <p className="text-gray-500 mt-1 text-sm">Pantau perkembangan pendataan lapangan Sensus Ekonomi 2026 per kecamatan</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Per-kecamatan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-800">Rekapitulasi per Kecamatan</h2>
            <span className="text-xs text-gray-400">Update: 4 Mei 2026</span>
          </div>
          <div className="divide-y divide-gray-50">
            {kecamatanData.map((k) => {
              const pct = Math.round((k.realisasi / k.target) * 100);
              const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";
              return (
                <div key={k.nama} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{k.nama}</p>
                      <p className="text-xs text-gray-400">{k.petugas} Petugas • {k.realisasi.toLocaleString()} / {k.target.toLocaleString()} usaha</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"
                    }`}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar value={k.realisasi} max={k.target} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full inline-block" /> ≥ 80%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-full inline-block" /> 50–79%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-full inline-block" /> &lt; 50%</span>
        </div>

      </div>
    </div>
  );
}
