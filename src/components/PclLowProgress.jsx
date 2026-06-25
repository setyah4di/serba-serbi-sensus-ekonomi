import { useState, useMemo } from "react";

function ProgressBar({value,color}){
  return(<div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{width:`${Math.min(Math.max(value,0),100)}%`}}/></div>);
}

// ── Modal PCL Progress < 10% ──
// Props:
//   rows     : array — daftar PCL dengan progress < 10% (dari globalStats.lowProgress)
//   onDetail : func  — callback saat tombol Detail diklik, menerima object pcl
//   onClose  : func  — callback untuk menutup modal
export default function PclLowProgress({ rows, onDetail, onClose }) {
  const [searchLow, setSearchLow] = useState("");
  const [expandedKec, setExpandedKec] = useState(null);
  const handleBackdrop = (e) => { if(e.target===e.currentTarget) onClose(); };

  const filtered = useMemo(()=>{
    if(!searchLow.trim()) return [...rows].sort((a,b)=>a.progress-b.progress);
    const q = searchLow.toLowerCase();
    return [...rows]
      .filter(r=>(r.namaPCL||"").toLowerCase().includes(q)||(r.emailPCL||"").toLowerCase().includes(q))
      .sort((a,b)=>a.progress-b.progress);
  },[rows, searchLow]);

  // Ringkasan per kecamatan dari semua rows (bukan filtered)
  const byKec = useMemo(()=>{
    const map = {};
    rows.forEach(r=>{
      if(!map[r.kecamatan]) map[r.kecamatan] = [];
      map[r.kecamatan].push(r);
    });
    // Sort tiap kecamatan by progress ascending
    Object.keys(map).forEach(k => {
      map[k].sort((a,b) => a.progress - b.progress);
    });
    return map;
  },[rows]);

  const isSearching = searchLow.trim().length > 0;

  const toggleKec = (kec) => {
    setExpandedKec(prev => prev === kec ? null : kec);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)"}} onClick={handleBackdrop}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0" style={{background:"linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)"}}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-black text-xl leading-tight">PCL Progress &lt; 10%</h2>
              <p className="text-rose-100 text-sm mt-1">{rows.length} petugas membutuhkan perhatian</p>
            </div>
            <button onClick={onClose} className="text-rose-200 hover:text-white transition-colors mt-1 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Mode: Kecamatan cards (accordion) */}
          {!isSearching && (
            <div className="mb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Per Kecamatan — klik untuk lihat daftar PCL
              </p>
              <div className="space-y-2">
                {Object.entries(byKec).map(([kec, pcls]) => {
                  const isOpen = expandedKec === kec;
                  return (
                    <div key={kec} className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${isOpen ? "border-rose-300 shadow-sm shadow-rose-100" : "border-gray-100"}`}>
                      {/* Card header — klik untuk expand */}
                      <button
                        onClick={() => toggleKec(kec)}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isOpen ? "bg-rose-50" : "bg-white hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${isOpen ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600"}`}>
                            {pcls.length}
                          </div>
                          <p className={`text-sm font-bold truncate ${isOpen ? "text-rose-700" : "text-gray-700"}`}>{kec}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-400 font-medium">{pcls.length} PCL</span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-rose-400" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                          </svg>
                        </div>
                      </button>

                      {/* Expanded: daftar PCL */}
                      {isOpen && (
                        <div className="border-t border-rose-100">
                          {pcls.map((pcl, i) => (
                            <div
                              key={`${pcl.emailPCL}-${i}`}
                              className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-rose-50/40 transition-colors"
                            >
                              <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{i+1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{pcl.namaPCL || pcl.emailPCL}</p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
                                  {pcl.namaPML || pcl.emailPML || "—"}
                                </p>
                                <div className="mt-1.5">
                                  <ProgressBar value={pcl.progress} color="bg-rose-400" />
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <span className="text-sm font-black text-rose-500">{pcl.progress.toFixed(2)}%</span>
                                <button
                                  onClick={() => onDetail(pcl)}
                                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 active:bg-orange-200 transition-colors border border-orange-100 whitespace-nowrap"
                                >
                                  Detail
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode: Search results */}
          {isSearching && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Hasil pencarian: {filtered.length} dari {rows.length}
              </p>
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Tidak ada PCL dengan nama "{searchLow}"</p>
                </div>
              ) : (
                <div className="space-y-0 rounded-xl border border-gray-100 overflow-hidden">
                  {filtered.map((pcl, i) => (
                    <div key={`${pcl.emailPCL}-${i}`} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{pcl.namaPCL || pcl.emailPCL}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
                          {pcl.namaPML || pcl.emailPML || "—"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          <span className="inline-block bg-blue-50 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">KEC</span>
                          {pcl.kecamatan}
                        </p>
                        <div className="mt-1.5">
                          <ProgressBar value={pcl.progress} color="bg-rose-400" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-sm font-black text-rose-500">{pcl.progress.toFixed(2)}%</span>
                        <button onClick={()=>onDetail(pcl)} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 active:bg-orange-200 transition-colors border border-orange-100 whitespace-nowrap">Detail</button>
                      </div>
                    </div>
                  ))}
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
