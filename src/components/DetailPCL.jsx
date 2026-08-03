import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ── Custom Tooltip ──
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: p.color}} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-700">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomDot({ cx, cy, stroke }) {
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={3.5} fill="#fff" stroke={stroke} strokeWidth={2} />;
}

function TrendChart({ chartData, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center justify-center gap-2 h-48">
        <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-gray-400 text-xs">Memuat data tren…</span>
      </div>
    );
  }
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center h-32">
        <p className="text-gray-400 text-xs">Data tren harian tidak tersedia</p>
      </div>
    );
  }
  const LINES = [
    { key: "Approved",  color: "#10b981" },
    { key: "Submitted", color: "#3b82f6" },
    { key: "Draft",     color: "#f59e0b" },
    { key: "Rejected",  color: "#f43f5e" },
  ];
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tren 7 Hari Terakhir</p>
      <div className="bg-gray-50 rounded-2xl p-3">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} interval={0} angle={chartData.length > 6 ? -35 : 0} textAnchor={chartData.length > 6 ? "end" : "middle"} height={chartData.length > 6 ? 40 : 20} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            {LINES.map(({ key, color }) => (
              <Line key={key} type="linear" dataKey={key} stroke={color} strokeWidth={2} dot={<CustomDot stroke={color} />} activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Helper: warna badge untuk status (Rendah/Sedang/Tinggi, dsb) ──
function statusBadgeStyle(status){
  const s=(status||"").toLowerCase();
  if(s.includes("tinggi")) return "bg-emerald-100 text-emerald-700";
  if(s.includes("sedang")) return "bg-amber-100 text-amber-700";
  if(s.includes("rendah")) return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-600";
}

// ── Modal Detail PCL ──
// Props:
//   pcl          : object  — data PCL yang dipilih (namaPCL, emailPCL, namaPML, emailPML, progress)
//   detailRows   : array   — hasil findDetailRows(pcl)
//   chartData    : array   — hasil buildChartData(pcl)
//   loadingChart : boolean — apakah data chart masih dimuat
//   onClose      : func    — callback untuk menutup modal
export default function DetailPCL({ pcl, detailRows, chartData, loadingChart, onClose }) {
  const totalAssignment = detailRows.reduce((s,r)=>s+r.total_assignment,0);
  const totalApproved   = detailRows.reduce((s,r)=>s+r.approved,0);
  const totalSubmitted  = detailRows.reduce((s,r)=>s+r.submitted,0);
  const totalDraft      = detailRows.reduce((s,r)=>s+r.draft,0);
  const totalRejected   = detailRows.reduce((s,r)=>s+r.rejected,0);
  const totalOpen       = detailRows.reduce((s,r)=>s+r.open,0);
  const totalNotFound   = detailRows.reduce((s,r)=>s+(r.not_found||0),0);
  const progress = pcl.progress;

  // ── Progress & Status dari kolom AA (Progress) & AB (Status) spreadsheet ──
  // Dijumlahkan (bukan dirata-rata) agar konsisten dengan card lain yang juga menampilkan total seluruh SLS
  const totalProgressAA = detailRows.reduce((s,r)=>s+(r.progress_aa||0),0);
  // ambil status (AB) yang paling sering muncul di antara baris detail
  const statusCounts = {};
  detailRows.forEach(r=>{
    const st=(r.status_ab||"").trim();
    if(!st) return;
    statusCounts[st]=(statusCounts[st]||0)+1;
  });
  const statusAB = Object.keys(statusCounts).sort((a,b)=>statusCounts[b]-statusCounts[a])[0] || "-";

  const handleBackdrop = (e) => { if(e.target===e.currentTarget) onClose(); };

  // Baris 1: 3 card utama
  const statItemsRow1 = [
    {label:"Total Assignment",value:totalAssignment,icon:"📋",bg:"bg-gray-100 text-gray-700"},
    {label:"Approved",        value:totalApproved,  icon:"✅",bg:"bg-emerald-50 text-emerald-700"},
    {label:"Submitted",       value:totalSubmitted, icon:"📤",bg:"bg-blue-50 text-blue-700"},
    {label:"Rejected",        value:totalRejected,  icon:"❌",bg:"bg-rose-50 text-rose-700"},
  ];
  // Baris 2: 4 card status lainnya
  const statItemsRow2 = [
    {label:"Draft",           value:totalDraft,     icon:"📝",bg:"bg-amber-50 text-amber-700"},
    {label:"Open",            value:totalOpen,      icon:"🔓",bg:"bg-purple-50 text-purple-700"},
    {label:"Tidak Ditemukan", value:totalNotFound,  icon:"🔎",bg:"bg-slate-100 text-slate-700"},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)"}} onClick={handleBackdrop}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn max-h-[92vh] flex flex-col">
        <div className="px-6 pt-6 pb-5 flex-shrink-0" style={{background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)"}}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">Detail PCL</p>
              <p className="text-white font-black text-xl leading-tight">{pcl.namaPCL || pcl.emailPCL}</p>
            </div>
            <button onClick={onClose} className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          {(pcl.namaPML||pcl.emailPML)&&(
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {pcl.namaPML&&<div className="flex items-center gap-1.5"><span className="text-orange-200 text-xs">PML:</span><span className="text-white text-xs font-semibold">{pcl.namaPML}</span></div>}
            </div>
          )}
          <div className="mt-3">
            <div className="flex justify-between text-white text-sm mb-1.5"><span className="opacity-80">Progress</span><span className="font-bold">{progress.toFixed(2)}%</span></div>
            <div className="w-full bg-white/20 rounded-full h-2.5"><div className="h-2.5 rounded-full bg-white transition-all duration-700" style={{width:`${Math.min(progress,100)}%`}}/></div>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <TrendChart chartData={chartData} loading={loadingChart} />
          {detailRows.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🔍</span></div>
              <p className="text-gray-500 font-medium">Data tidak ditemukan</p>
              <p className="text-gray-400 text-xs mt-1">PCL: <span className="font-mono">{pcl.emailPCL}</span></p>
            </div>
          ) : (
            <>
              {/* Baris 1: Total Assignment, Approved, Submitted, Rejected */}
              <div className="grid grid-cols-4 gap-2.5 mb-2.5">
                {statItemsRow1.map(({label,value,icon,bg})=>(
                  <div key={label} className={`rounded-xl p-3 ${bg}`}>
                    <p className="text-[11px] opacity-60 font-medium leading-tight mb-1">{icon} {label}</p>
                    <p className="text-2xl font-black">{value.toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
              {/* Baris 2: Draft, Open, Tidak Ditemukan, Progress+Status (AA & AB) */}
              <div className="grid grid-cols-4 gap-2.5 mb-5">
                {statItemsRow2.map(({label,value,icon,bg})=>(
                  <div key={label} className={`rounded-xl p-3 ${bg}`}>
                    <p className="text-[11px] opacity-60 font-medium leading-tight mb-1">{icon} {label}</p>
                    <p className="text-2xl font-black">{value.toLocaleString("id-ID")}</p>
                  </div>
                ))}
                {/* Card gabungan Progress (AA) + Status (AB) — status ditampilkan tepat di bawah angka */}
                <div className="rounded-xl p-3 bg-orange-100 text-orange-700">
                  <p className="text-[11px] opacity-60 font-medium leading-tight mb-1">🔃 Progress</p>
                  <p className="text-2xl font-black">{totalProgressAA}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeStyle(statusAB)}`}>
                    {statusAB}
                  </span>
                </div>
              </div>
              {detailRows.length>1&&(
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Rincian per SLS ( Total : {detailRows.length} SLS)</p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-50 text-gray-400">
                          <th className="text-left px-3 py-2 font-semibold">Kode ID</th>
                          <th className="text-right px-3 py-2 font-semibold">Total</th>
                          <th className="text-right px-3 py-2 font-semibold text-emerald-500">✅</th>
                          <th className="text-right px-3 py-2 font-semibold text-blue-500">📤</th>
                          <th className="text-right px-3 py-2 font-semibold text-amber-500">📝</th>
                          <th className="text-right px-3 py-2 font-semibold text-rose-500">❌</th>
                          <th className="text-right px-3 py-2 font-semibold text-purple-500">🔓</th>
                          <th className="text-right px-3 py-2 font-semibold text-slate-500">🔎</th>
                          <th className="text-right px-3 py-2 font-semibold text-orange-500">🔃</th>
                        </tr></thead>
                        <tbody>
                          {detailRows.map((r,i)=>(
                            <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                              <td className="px-3 py-2 font-mono text-gray-600 text-[11px]">{r.kode_id}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-700">{r.total_assignment}</td>
                              <td className="px-3 py-2 text-right text-emerald-600 font-medium">{r.approved}</td>
                              <td className="px-3 py-2 text-right text-blue-600 font-medium">{r.submitted}</td>
                              <td className="px-3 py-2 text-right text-amber-600 font-medium">{r.draft}</td>
                              <td className="px-3 py-2 text-right text-rose-500 font-medium">{r.rejected}</td>
                              <td className="px-3 py-2 text-right text-purple-600 font-medium">{r.open}</td>
                              <td className="px-3 py-2 text-right text-slate-600 font-medium">{r.not_found||0}</td>
                              <td className="px-3 py-2 text-right text-orange-600 font-medium">
                                {(r.progress_aa||0)}
                                {/* {r.status_ab && <span className={`ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusBadgeStyle(r.status_ab)}`}>{r.status_ab}</span>} */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  );
}
