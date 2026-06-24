import { useState, useEffect, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "15LFgyVGKJ4Dd5-HBFk6HPrMn5j4vE43k";
const GID_REKAP      = "476651225";
const GID_GABUNGAN   = "1176424983";
const GID_PERHARI    = "1622434113";

const CSV_REKAP    = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_REKAP}`;
const CSV_GABUNGAN = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_GABUNGAN}`;
const CSV_PERHARI  = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_PERHARI}`;

const KECAMATAN_NAMES = {
  "010":"TUNGKAL ULU","011":"MERLUNG","012":"BATANG ASAM","013":"TEBING TINGGI",
  "014":"RENAH MENDALUH","015":"MUARA PAPALIK","020":"PENGABUAN","021":"SENYERANG",
  "030":"TUNGKAL ILIR","031":"BRAM ITAM","032":"SEBERANG KOTA","040":"BETARA","041":"KUALA BETARA",
};
const KECAMATAN_ORDER = [
  "TUNGKAL ULU","MERLUNG","BATANG ASAM","TEBING TINGGI","RENAH MENDALUH","MUARA PAPALIK",
  "PENGABUAN","SENYERANG","TUNGKAL ILIR","BRAM ITAM","SEBERANG KOTA","BETARA","KUALA BETARA",
];

function resolveKecamatan(raw) {
  const t = raw.trim(); if (!t) return null;
  const u = t.toUpperCase();
  if (KECAMATAN_ORDER.includes(u)) return u;
  const p = t.padStart(3,"0");
  return KECAMATAN_NAMES[p] || KECAMATAN_NAMES[t] || null;
}

function parseCSV(text) {
  const lines = text.replace(/\r/g,"").trim().split("\n");
  return lines.map(line => {
    const cols=[]; let cur="",inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){inQ=!inQ;continue;}
      if(ch===','&&!inQ){cols.push(cur.trim());cur="";continue;}
      cur+=ch;
    }
    cols.push(cur.trim()); return cols;
  });
}

function parseProgress(raw){
  const v=parseFloat((raw||"0").replace("%","").replace(",",".").trim());
  return isNaN(v)?0:v;
}
function parseNum(raw){
  const v=parseInt(String(raw||"0").replace(/[^0-9-]/g,""),10);
  return isNaN(v)?0:v;
}

// Parse tanggal dari berbagai format: "20/06/2026", "20-06-2026", serial excel, dll
function parseDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  // Format DD/MM/YYYY atau DD-MM-YYYY
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,"0")}-${m1[1].padStart(2,"0")}`;
  // Format YYYY-MM-DD
  const m2 = s.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/);
  if (m2) return s;
  // Excel serial number
  const n = parseInt(s, 10);
  if (!isNaN(n) && n > 40000) {
    const d = new Date((n - 25569) * 86400 * 1000);
    const y = d.getUTCFullYear(), mo = String(d.getUTCMonth()+1).padStart(2,"0"), dy = String(d.getUTCDate()).padStart(2,"0");
    return `${y}-${mo}-${dy}`;
  }
  return null;
}

function fmtDate(isoDate) {
  if (!isoDate) return "";
  const [y,m,d] = isoDate.split("-");
  return `${d}/${m}`;
}

// ── Helpers warna ──
function progressColor(v){if(v>=100)return"bg-emerald-600";if(v>=75)return"bg-emerald-400";if(v>=50)return"bg-blue-500";if(v>=25)return"bg-amber-400";return"bg-rose-400";}
function progressTextColor(v){if(v>=100)return"text-emerald-700";if(v>=75)return"text-emerald-600";if(v>=50)return"text-blue-600";if(v>=25)return"text-amber-500";return"text-rose-500";}
function badgeStyle(v){if(v>=100)return"bg-emerald-100 text-emerald-800 ring-emerald-300";if(v>=75)return"bg-emerald-50 text-emerald-700 ring-emerald-200";if(v>=50)return"bg-blue-50 text-blue-700 ring-blue-200";if(v>=25)return"bg-amber-50 text-amber-700 ring-amber-200";return"bg-rose-50 text-rose-700 ring-rose-200";}
function badgeLabel(v){if(v>=100)return"Selesai";if(v>=75)return"Sangat Baik";if(v>=50)return"Baik";if(v>=25)return"Sedang";return"Perlu Perhatian";}

function ProgressBar({value,color}){
  return(<div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{width:`${Math.min(Math.max(value,0),100)}%`}}/></div>);
}
function StatCard({label,value,sub,accent,icon}){
  return(<div className={`rounded-2xl p-5 ${accent} flex flex-col justify-between`}><div className="flex items-start justify-between mb-3"><p className="text-xs font-semibold uppercase tracking-widest opacity-70 leading-tight">{label}</p>{icon&&<span className="text-lg opacity-60">{icon}</span>}</div><div><p className="text-3xl font-black">{value}</p>{sub&&<p className="text-xs opacity-60 mt-1">{sub}</p>}</div></div>);
}
function KecamatanCard({kecamatan,avg,countPCL,countPML,onClick,isSelected}){
  const color=progressColor(avg),textColor=progressTextColor(avg);
  return(<button onClick={onClick} className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected?"border-orange-400 bg-orange-50 shadow-md shadow-orange-100":"border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}><div className="flex items-start justify-between mb-2"><div className="flex-1 min-w-0 pr-2"><p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p><p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p></div><span className={`text-2xl font-black flex-shrink-0 ${textColor}`}>{avg.toFixed(1)}%</span></div><ProgressBar value={avg} color={color}/><div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap"><div className="flex gap-3"><span className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{countPML}</span> PML</span><span className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{countPCL}</span> PCL</span></div><span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${badgeStyle(avg)}`}>{badgeLabel(avg)}</span></div></button>);
}

// ── Custom Tooltip untuk chart ──
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

// Dot kustom: selalu tampil di setiap titik
function CustomDot({ cx, cy, stroke }) {
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={3.5} fill="#fff" stroke={stroke} strokeWidth={2} />;
}

// ── Grafik Tren Harian ──
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
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tren Harian</p>
      <div className="bg-gray-50 rounded-2xl p-3">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              interval={0}
              angle={chartData.length > 6 ? -35 : 0}
              textAnchor={chartData.length > 6 ? "end" : "middle"}
              height={chartData.length > 6 ? 40 : 20}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
            {LINES.map(({ key, color }) => (
              <Line
                key={key}
                type="linear"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={<CustomDot stroke={color} />}
                activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Modal Detail PCL ──
function DetailModal({ pcl, detailRows, chartData, loadingChart, onClose }) {
  const totalAssignment = detailRows.reduce((s,r)=>s+r.total_assignment,0);
  const totalApproved   = detailRows.reduce((s,r)=>s+r.approved,0);
  const totalSubmitted  = detailRows.reduce((s,r)=>s+r.submitted,0);
  const totalDraft      = detailRows.reduce((s,r)=>s+r.draft,0);
  const totalRejected   = detailRows.reduce((s,r)=>s+r.rejected,0);
  const totalOpen       = detailRows.reduce((s,r)=>s+r.open,0);
  const progress = pcl.progress;
  const handleBackdrop = (e) => { if(e.target===e.currentTarget) onClose(); };

  const statItems = [
    {label:"Total Assignment",value:totalAssignment,icon:"📋",bg:"bg-gray-100 text-gray-700"},
    {label:"Approved",        value:totalApproved,  icon:"✅",bg:"bg-emerald-50 text-emerald-700"},
    {label:"Submitted",       value:totalSubmitted, icon:"📤",bg:"bg-blue-50 text-blue-700"},
    {label:"Draft",           value:totalDraft,     icon:"📝",bg:"bg-amber-50 text-amber-700"},
    {label:"Rejected",        value:totalRejected,  icon:"❌",bg:"bg-rose-50 text-rose-700"},
    {label:"Open",            value:totalOpen,      icon:"🔓",bg:"bg-purple-50 text-purple-700"},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{backgroundColor:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)"}}
      onClick={handleBackdrop}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0" style={{background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)"}}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">Detail PCL</p>
              <p className="text-white font-black text-xl leading-tight">{pcl.namaPCL || pcl.emailPCL}</p>
              {/* {pcl.emailPCL && pcl.namaPCL && (
                <p className="text-orange-100 text-xs mt-0.5 break-all">{pcl.emailPCL}</p>
              )} */}
            </div>
            <button onClick={onClose} className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          {(pcl.namaPML||pcl.emailPML)&&(
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {pcl.namaPML&&<div className="flex items-center gap-1.5"><span className="text-orange-200 text-xs">PML:</span><span className="text-white text-xs font-semibold">{pcl.namaPML}</span></div>}
              {/* {pcl.emailPML&&<div className="flex items-center gap-1.5"><span className="text-orange-200 text-xs">Email:</span><span className="text-white text-xs">{pcl.emailPML}</span></div>} */}
            </div>
          )}
          <div className="mt-3">
            <div className="flex justify-between text-white text-sm mb-1.5">
              <span className="opacity-80">Progress</span>
              <span className="font-bold">{progress.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div className="h-2.5 rounded-full bg-white transition-all duration-700" style={{width:`${Math.min(progress,100)}%`}}/>
            </div>
          </div>
        </div>

        {/* Body scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Grafik tren harian ── */}
          <TrendChart chartData={chartData} loading={loadingChart} />

          {/* ── Stat cards ── */}
          {detailRows.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🔍</span></div>
              <p className="text-gray-500 font-medium">Data tidak ditemukan</p>
              <p className="text-gray-400 text-xs mt-1">PCL: <span className="font-mono">{pcl.emailPCL}</span></p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {statItems.map(({label,value,icon,bg})=>(
                  <div key={label} className={`rounded-xl p-3 ${bg}`}>
                    <p className="text-[11px] opacity-60 font-medium leading-tight mb-1">{icon} {label}</p>
                    <p className="text-2xl font-black">{value.toLocaleString("id-ID")}</p>
                  </div>
                ))}
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

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ── Baris PCL ──
function PCLRow({pcl,rank,onDetail}){
  const {emailPML,emailPCL,progress,namaPML,namaPCL}=pcl;
  const color=progressColor(progress),textColor=progressTextColor(progress);
  return(
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{rank}</span>
        <div className="flex-1 min-w-0">
          {namaPCL&&<p className="text-xs font-bold text-gray-700 truncate">{namaPCL}</p>}
          {/* <p className={`truncate ${namaPCL?"text-xs text-gray-400":"text-sm font-semibold text-gray-800"}`}>{emailPCL}</p> */}
          {emailPML?(
            <p className="text-xs text-gray-400 truncate mt-0.5">
              <span className="inline-block bg-orange-50 text-orange-500 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1">PML</span>
              {namaPML||emailPML}
            </p>
          ):(
            <p className="text-xs text-rose-300 mt-0.5 italic">PML tidak terdeteksi</p>
          )}
          <div className="mt-1.5"><ProgressBar value={progress} color={color}/></div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-sm font-bold w-16 text-right ${textColor}`}>{progress.toFixed(2)}%</span>
          <button onClick={()=>onDetail(pcl)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 active:bg-orange-200 transition-colors border border-orange-100 whitespace-nowrap">
            Detail
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringPetugas() {
  const [rows, setRows]                 = useState([]);
  const [gabunganRows, setGabunganRows] = useState([]);
  const [perHariRaw, setPerHariRaw]     = useState(null); // {dates[], data: {namaPCL: {status: [nilai per tanggal]}}}
  const [loading, setLoading]           = useState(true);
  const [loadingGab, setLoadingGab]     = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [error, setError]               = useState(null);
  const [selectedKec, setSelectedKec]   = useState(null);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("urut");
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [modalPCL, setModalPCL]         = useState(null);
  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(()=>{if(tableRef.current)tableRef.current.scrollTop=0;},[selectedKec]);

  const handleSelectKec=(kec)=>{
    const next=selectedKec===kec?null:kec;
    setSelectedKec(next);
    if(next&&window.innerWidth<1024){setTimeout(()=>detailRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50);}
  };

  // ── Load rekap progress pendataan ──
  useEffect(()=>{
    fetch(CSV_REKAP).then(r=>{if(!r.ok)throw new Error("Gagal mengambil data.");return r.text();})
    .then(text=>{
      const parsed=parseCSV(text);
      let lastKec=null,lastPML="";
      const data=parsed.slice(1).map(cols=>{
        const rk=resolveKecamatan(cols[0]||"");
        if(rk)lastKec=rk;
        const pr=(cols[1]||"").trim();if(pr)lastPML=pr;
        return{kecamatan:lastKec,emailPML:lastPML,emailPCL:(cols[2]||"").trim(),progress:parseProgress(cols[3]||"0")};
      }).filter(r=>r.kecamatan&&r.emailPCL);
      setRows(data);setLastUpdated(new Date());setLoading(false);
    }).catch(e=>{setError(e.message);setLoading(false);});
  },[]);

  // ── Load hasil_gabungan ──
  useEffect(()=>{
    fetch(CSV_GABUNGAN).then(r=>r.ok?r.text():Promise.reject()).then(text=>{
      const parsed=parseCSV(text);
      if(parsed.length<2){setLoadingGab(false);return;}
      const header=parsed[0].map(h=>h.toLowerCase().replace(/\s+/g," ").trim());
      const fc=(...kws)=>{for(const k of kws){const i=header.findIndex(h=>h.includes(k));if(i>=0)return i;}return -1;};
      const iNamaPML=fc("nama pml"),iEmailPML=fc("email pml"),iNamaPCL=fc("nama ppl","nama pcl"),
            iEmailPCL=fc("email ppl","email pcl"),iTotal=fc("total_ass","total"),iKodeId=fc("kode_id","kode"),
            iApproved=fc("approv"),iSubmit=fc("submit"),iDraft=fc("draft"),iReject=fc("reject"),iOpen=fc("open");
      const data=parsed.slice(1).map(cols=>{
        const namaPCL=iNamaPCL>=0?(cols[iNamaPCL]||"").trim():"";
        const emailPCL=iEmailPCL>=0?(cols[iEmailPCL]||"").trim():"";
        if(!namaPCL&&!emailPCL)return null;
        return{namaPML:iNamaPML>=0?(cols[iNamaPML]||"").trim():"",emailPML:iEmailPML>=0?(cols[iEmailPML]||"").trim():"",
          namaPCL,emailPCL,total_assignment:iTotal>=0?parseNum(cols[iTotal]):0,kode_id:iKodeId>=0?(cols[iKodeId]||"").trim():"",
          approved:iApproved>=0?parseNum(cols[iApproved]):0,submitted:iSubmit>=0?parseNum(cols[iSubmit]):0,
          draft:iDraft>=0?parseNum(cols[iDraft]):0,rejected:iReject>=0?parseNum(cols[iReject]):0,open:iOpen>=0?parseNum(cols[iOpen]):0};
      }).filter(Boolean);
      setGabunganRows(data);setLoadingGab(false);
    }).catch(()=>setLoadingGab(false));
  },[]);

  // ── Load rekap progres per hari ──
  // Key komposit: "kec||pml||pcl" (lowercase) agar nama PCL yang sama di kecamatan/PML berbeda tidak tabrakan
  useEffect(()=>{
    fetch(CSV_PERHARI).then(r=>r.ok?r.text():Promise.reject()).then(text=>{
      const parsed=parseCSV(text);
      if(parsed.length<3){setLoadingChart(false);return;}

      const headerRow = parsed[1];
      const dateStartIdx = 4;
      const dates = [];
      for(let i = dateStartIdx; i < headerRow.length; i++){
        const d = parseDate(headerRow[i]);
        if(d) dates.push({ idx: i, iso: d, label: fmtDate(d) });
      }

      let lastKec="", lastPML="", lastPCL="";
      // Map: "kec||pml||pcl" → { status → { isoDate → nilai } }
      const dataMap = {};

      for(let r=3; r<parsed.length; r++){
        const cols = parsed[r];
        const kecRaw = (cols[0]||"").trim();
        const pmlRaw = (cols[1]||"").trim();
        const pclRaw = (cols[2]||"").trim();
        const status  = (cols[3]||"").trim();

        if(kecRaw && kecRaw!=="-") lastKec=kecRaw;
        if(pmlRaw && pmlRaw!=="-") lastPML=pmlRaw;
        if(pclRaw && pclRaw!=="-") lastPCL=pclRaw;

        if(!lastPCL) continue;
        const statusNorm = status.charAt(0).toUpperCase()+status.slice(1).toLowerCase();
        if(!["Approved","Draft","Rejected","Submitted"].includes(statusNorm)) continue;

        // Key komposit — unik per kombinasi kec+pml+pcl
        const compKey = `${lastKec.toLowerCase()}||${lastPML.toLowerCase()}||${lastPCL.toLowerCase()}`;
        if(!dataMap[compKey]) dataMap[compKey]={};
        if(!dataMap[compKey][statusNorm]) dataMap[compKey][statusNorm]={};

        dates.forEach(({idx,iso})=>{
          dataMap[compKey][statusNorm][iso] = parseNum(cols[idx]);
        });
      }

      setPerHariRaw({ dates, dataMap });
      setLoadingChart(false);
    }).catch(()=>setLoadingChart(false));
  },[]);

  // ── Helper: buat key komposit (normalize) ──
  const makeCompKey = (kec="", pml="", pcl="") =>
    `${kec.toLowerCase().trim()}||${pml.toLowerCase().trim()}||${pcl.toLowerCase().trim()}`;

  // Bangun chartData — pakai key komposit kec+namaPML+namaPCL
  // namaPML didapat dari: namaPML (sudah dienrich) atau lookup emailPML rekap → namaPML gabungan
  const buildChartData = (pcl) => {
    if(!perHariRaw || !pcl) return [];
    const { dates, dataMap } = perHariRaw;

    const kec     = (pcl.kecamatan||"").trim();
    const namaPML = (pcl.namaPML  ||"").trim();  // sudah dienrich dari enrichedRows
    const namaPCL = (pcl.namaPCL  ||pcl.emailPCL||"").trim();
    const emailPML= (pcl.emailPML ||"").toLowerCase().trim(); // emailPML dari rekap (kolom B)

    // Jika namaPML belum terisi, coba cari dari emailPML rekap → namaPML gabungan
    const resolvedNamaPML = namaPML || namaPMLFromEmail[emailPML] || "";

    // Coba beberapa kombinasi key secara berurutan
    const candidates = [
      makeCompKey(kec, resolvedNamaPML, namaPCL),
      // Tanpa kecamatan (sheet perhari mungkin pakai kode bukan nama)
      ...Object.keys(dataMap).filter(k => {
        const parts = k.split("||");
        if(parts.length!==3) return false;
        const kPML = parts[1], kPCL = parts[2];
        const pclMatch = kPCL === namaPCL.toLowerCase().trim();
        if(!pclMatch) return false;
        // Cocokkan PML: namaPML atau emailPML (sebagian cocok)
        const pmlLow = resolvedNamaPML.toLowerCase().trim();
        return kPML === pmlLow || (pmlLow && kPML.includes(pmlLow.split(" ")[0].toLowerCase()));
      }),
      // Fallback terakhir: semua yang namaPCL-nya cocok
      ...Object.keys(dataMap).filter(k=>k.endsWith(`||${namaPCL.toLowerCase().trim()}`)),
    ];

    let matchKey = null;
    for(const k of candidates){
      if(k && dataMap[k]){ matchKey=k; break; }
    }
    if(!matchKey) return [];

    const pclData = dataMap[matchKey];
    return dates.map(({iso,label})=>({
      label,
      Approved:  pclData["Approved"]?.[iso]  ?? 0,
      Draft:     pclData["Draft"]?.[iso]     ?? 0,
      Rejected:  pclData["Rejected"]?.[iso]  ?? 0,
      Submitted: pclData["Submitted"]?.[iso] ?? 0,
    }));
  };

  // ── Maps dari hasil_gabungan ──

  // Map 1: emailPCL (kolom D gabungan) → rows
  const gabunganByEmailPCL = useMemo(()=>{
    const map={};
    gabunganRows.forEach(r=>{
      if(r.emailPCL){
        const k=r.emailPCL.toLowerCase().trim();
        if(!map[k])map[k]=[];
        map[k].push(r);
      }
    });
    return map;
  },[gabunganRows]);

  // Map 2: namaPCL (kolom C gabungan) → rows  (kolom C rekap = nama, bukan email)
  const gabunganByNamaPCL = useMemo(()=>{
    const map={};
    gabunganRows.forEach(r=>{
      if(r.namaPCL){
        const k=r.namaPCL.toLowerCase().trim();
        if(!map[k])map[k]=[];
        map[k].push(r);
      }
    });
    return map;
  },[gabunganRows]);

  // Map 3: "namaPML_gabungan||namaPCL" → rows  (kunci terkuat untuk nama duplikat)
  const gabunganByNamaPmlNamaPCL = useMemo(()=>{
    const map={};
    gabunganRows.forEach(r=>{
      if(r.namaPML && r.namaPCL){
        const k=`${r.namaPML.toLowerCase().trim()}||${r.namaPCL.toLowerCase().trim()}`;
        if(!map[k])map[k]=[];
        map[k].push(r);
      }
    });
    return map;
  },[gabunganRows]);

  // Map 4: emailPML_gabungan → namaPML (untuk resolve email→nama)
  const namaPMLFromEmailGab = useMemo(()=>{
    const map={};
    gabunganRows.forEach(r=>{
      if(r.emailPML && r.namaPML)
        map[r.emailPML.toLowerCase().trim()] = r.namaPML;
    });
    return map;
  },[gabunganRows]);

  // Map 5: namaPML_gabungan → emailPML (kebalikannya, untuk resolve nama→email)
  const emailPMLFromNamaGab = useMemo(()=>{
    const map={};
    gabunganRows.forEach(r=>{
      if(r.emailPML && r.namaPML)
        map[r.namaPML.toLowerCase().trim()] = r.emailPML;
    });
    return map;
  },[gabunganRows]);

  // ── Resolve namaPML dari emailPML rekap ──
  // emailPML rekap (kolom B) → namaPML gabungan
  // Strategi: coba exact match dulu, lalu partial match
  const resolveNamaPML = (emailPMLRekap) => {
    if(!emailPMLRekap) return "";
    const key = emailPMLRekap.toLowerCase().trim();
    // Exact match
    if(namaPMLFromEmailGab[key]) return namaPMLFromEmailGab[key];
    // Mungkin emailPML rekap = nama PML langsung (bukan email)
    const byNama = gabunganRows.find(r=>r.namaPML.toLowerCase().trim()===key);
    if(byNama) return byNama.namaPML;
    return emailPMLRekap; // kembalikan apa adanya
  };

  // ── findDetailRows: gunakan namaPML (hasil resolve) + namaPCL sebagai kunci utama ──
  const findDetailRows = (pcl) => {
    if(!pcl) return [];
    const emailPCLKey  = (pcl.emailPCL||"").toLowerCase().trim();
    const namaPCLKey   = (pcl.namaPCL ||emailPCLKey).toLowerCase().trim();
    // namaPML sudah dienrich dari enrichedRows via resolveNamaPML
    const namaPMLKey   = (pcl.namaPML ||"").toLowerCase().trim();

    // 1. Kunci terkuat: namaPML + namaPCL (disambiguasi untuk nama duplikat)
    if(namaPMLKey && namaPCLKey){
      const k = `${namaPMLKey}||${namaPCLKey}`;
      if(gabunganByNamaPmlNamaPCL[k]?.length) return gabunganByNamaPmlNamaPCL[k];
    }

    // 2. Email PCL langsung (jika kolom C rekap berisi email)
    if(gabunganByEmailPCL[emailPCLKey]?.length){
      const results = gabunganByEmailPCL[emailPCLKey];
      if(results.length===1) return results;
      // Duplikat: filter berdasarkan namaPML
      if(namaPMLKey){
        const f=results.filter(r=>r.namaPML.toLowerCase().trim()===namaPMLKey);
        if(f.length) return f;
      }
      return results;
    }

    // 3. Fallback: namaPCL saja
    if(namaPCLKey && gabunganByNamaPCL[namaPCLKey]?.length){
      const results = gabunganByNamaPCL[namaPCLKey];
      if(results.length===1) return results;
      if(namaPMLKey){
        const f=results.filter(r=>r.namaPML.toLowerCase().trim()===namaPMLKey);
        if(f.length) return f;
      }
      return [results[0]]; // ambil satu saja jika tidak bisa bedakan
    }

    return [];
  };

  // ── enrichedRows: resolve namaPML dari emailPML rekap (kolom B) ──
  // Ini kunci utama: emailPML rekap → namaPML gabungan → pakai sebagai disambiguator
  const enrichedRows = useMemo(()=>rows.map(r=>{
    const emailPMLRekap = (r.emailPML||"").trim(); // kolom B sheet rekap
    const namaPCLRekap  = (r.emailPCL||"").trim(); // kolom C sheet rekap (bisa nama atau email)

    // Step 1: resolve namaPML dari emailPML rekap
    const namaPML = resolveNamaPML(emailPMLRekap);
    const namaPMLLow = namaPML.toLowerCase().trim();
    const namaPCLLow = namaPCLRekap.toLowerCase().trim();

    // Step 2: cari namaPCL dari gabungan
    // Strategi: cari baris gabungan yang namaPML-nya cocok DAN (emailPCL atau namaPCL) cocok dengan kolom C rekap
    let namaPCL = "";

    // Coba: namaPML + namaPCL (kolom C rekap sebagai nama)
    const byPmlPcl = gabunganByNamaPmlNamaPCL[`${namaPMLLow}||${namaPCLLow}`];
    if(byPmlPcl?.length){
      namaPCL = byPmlPcl[0].namaPCL;
    } else {
      // Coba: emailPCL = kolom C rekap
      const byEmail = gabunganByEmailPCL[namaPCLLow];
      if(byEmail?.length){
        // Ada duplikat? Filter dengan namaPML
        const match = byEmail.find(b=>b.namaPML.toLowerCase().trim()===namaPMLLow)||byEmail[0];
        namaPCL = match.namaPCL;
      } else {
        // Coba: kolom C rekap langsung sebagai namaPCL di gabungan
        const byNama = gabunganByNamaPCL[namaPCLLow];
        if(byNama?.length){
          // Filter dengan namaPML untuk disambiguasi
          const match = byNama.find(b=>b.namaPML.toLowerCase().trim()===namaPMLLow)||byNama[0];
          namaPCL = match.namaPCL;
        }
      }
    }

    return {...r, namaPML, namaPCL};
  }),[rows, gabunganRows, gabunganByNamaPmlNamaPCL, gabunganByEmailPCL, gabunganByNamaPCL]);

  // ── Helper build chart dari key ──
  const buildFromKey = (pclData, dates) =>
    dates.map(({iso,label})=>({
      label,
      Approved:  pclData["Approved"]?.[iso]  ?? 0,
      Draft:     pclData["Draft"]?.[iso]     ?? 0,
      Rejected:  pclData["Rejected"]?.[iso]  ?? 0,
      Submitted: pclData["Submitted"]?.[iso] ?? 0,
    }));

  // ── buildChartData: pakai namaPML yang sudah benar dari enrichedRows ──

  const kecamatanMap=useMemo(()=>{
    const m={};enrichedRows.forEach(r=>{if(!m[r.kecamatan])m[r.kecamatan]=[];m[r.kecamatan].push(r);});return m;
  },[enrichedRows]);

  const kecamatanList=useMemo(()=>KECAMATAN_ORDER.map(nama=>{
    const pcls=kecamatanMap[nama]||[];
    const avg=pcls.length?pcls.reduce((s,p)=>s+p.progress,0)/pcls.length:0;
    const pmlSet=new Set(pcls.map(p=>p.emailPML).filter(Boolean));
    return{kecamatan:nama,avg,countPCL:pcls.length,countPML:pmlSet.size};
  }).filter(k=>search===""||k.kecamatan.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sortBy==="progress"?b.avg-a.avg:KECAMATAN_ORDER.indexOf(a.kecamatan)-KECAMATAN_ORDER.indexOf(b.kecamatan))
  ,[kecamatanMap,search,sortBy]);

  const selectedPCL=useMemo(()=>{
    if(!selectedKec)return[];
    return[...(kecamatanMap[selectedKec]||[])].sort((a,b)=>b.progress-a.progress);
  },[selectedKec,kecamatanMap]);

  const globalStats=useMemo(()=>{
    if(!enrichedRows.length)return null;
    const allPML=new Set(enrichedRows.map(r=>r.emailPML).filter(Boolean));
    const avg=enrichedRows.reduce((s,r)=>s+r.progress,0)/enrichedRows.length;
    return{totalPCL:enrichedRows.length,totalPML:allPML.size,avg,
      done100:enrichedRows.filter(r=>r.progress>=100).length,zero:enrichedRows.filter(r=>r.progress===0).length};
  },[enrichedRows]);

  const avgSelected=selectedPCL.length?selectedPCL.reduce((s,p)=>s+p.progress,0)/selectedPCL.length:0;
  const pmlSelected=[...new Set(selectedPCL.map(p=>p.emailPML).filter(Boolean))];
  const namaPMLMap=useMemo(()=>{const m={};enrichedRows.forEach(r=>{if(r.emailPML&&r.namaPML)m[r.emailPML]=r.namaPML;});return m;},[enrichedRows]);

  const handleDetail=(pcl)=>setModalPCL(pcl);

  return(
    <div className="min-h-screen bg-gray-50 font-sans">

      {modalPCL&&(
        <DetailModal
          pcl={modalPCL}
          detailRows={findDetailRows(modalPCL)}
          chartData={buildChartData(modalPCL)}
          loadingChart={loadingChart}
          onClose={()=>setModalPCL(null)}
        />
      )}

      <header className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)"}}>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Monitoring Petugas Pencacahan</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated&&(
              <div className="text-right">
                <p className="text-orange-100">Data diperbarui pada</p>
                <p className="text-orange-100">{lastUpdated.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} Pukul 07.00 WIB</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5"/>
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5"/>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading&&(
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"/>
            <p className="text-gray-400 text-sm">Mengambil data dari spreadsheet…</p>
          </div>
        )}
        {error&&(
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-4">
            <p className="text-rose-600 font-semibold">Gagal memuat data</p>
            <p className="text-rose-400 text-sm mt-1">{error}</p>
          </div>
        )}
        {!loading&&!error&&globalStats&&(
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              <StatCard label="Total Petugas PML" value={globalStats.totalPML} sub="pengawas lapangan" accent="bg-gray-500 text-white" icon="👨‍💼"/>
              <StatCard label="Total Petugas PCL" value={globalStats.totalPCL} sub="pencacah lapangan" accent="bg-orange-500 text-white" icon="🧑‍🏭"/>
              <StatCard label="Rata-rata Progress" value={`${globalStats.avg.toFixed(1)}%`} sub="seluruh PCL" accent="bg-blue-500 text-white" icon="📊"/>
              <StatCard label="Progress = 100%" value={globalStats.done100} sub="PCL sudah selesai" accent="bg-emerald-50 text-emerald-800" icon="✅"/>
              <StatCard label="PCL Belum Mulai" value={globalStats.zero} sub="progress 0%" accent="bg-rose-50 text-rose-700" icon="⏳"/>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input type="text" placeholder="Cari nama kecamatan…" value={search}
                  onChange={e=>{setSearch(e.target.value);setSelectedKec(null);}}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={()=>setSortBy("urut")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy==="urut"?"bg-orange-500 text-white":"bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Urutan</button>
                <button onClick={()=>setSortBy("progress")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy==="progress"?"bg-orange-500 text-white":"bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Progress ↓</button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
              <div className="lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({kecamatan,avg,countPCL,countPML})=>(
                  <KecamatanCard key={kecamatan} kecamatan={kecamatan} avg={avg} countPCL={countPCL} countPML={countPML}
                    isSelected={selectedKec===kecamatan} onClick={()=>handleSelectKec(kecamatan)}/>
                ))}
              </div>

              <div ref={detailRef} className="lg:w-[45%]">
                {!selectedKec?(
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat detail PML dan PCL.</p>
                  </div>
                ):(
                  <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5" style={{background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)"}}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Kecamatan</p>
                          <h2 className="text-white text-xl font-black">{selectedKec}</h2>
                        </div>
                        <button onClick={()=>setSelectedKec(null)} className="text-orange-200 hover:text-white transition-colors mt-1 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-white text-sm mb-1.5"><span className="opacity-80">Rata-rata progress PCL</span><span className="font-bold">{avgSelected.toFixed(2)}%</span></div>
                        <div className="w-full bg-white/20 rounded-full h-2"><div className="h-2 rounded-full bg-white transition-all duration-700" style={{width:`${Math.min(avgSelected,100)}%`}}/></div>
                      </div>
                      {pmlSelected.length>0&&(
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1.5">Petugas PML</p>
                          <div className="flex flex-col gap-1">
                            {pmlSelected.map(pml=>(
                              <div key={pml} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 flex-shrink-0"/>
                                <span className="text-white text-xs font-medium truncate">{namaPMLMap[pml]||pml}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                      <div className="flex items-center gap-3 py-3 border-b border-gray-100 mb-1 sticky top-0 bg-white z-10">
                        <span className="text-xs text-gray-400 w-5">#</span>
                        <span className="text-xs text-gray-400 flex-1">Nama / Email PCL · PML</span>
                        <span className="text-xs text-gray-400 w-28 text-right">Progress</span>
                      </div>
                      {loadingGab&&(
                        <div className="flex items-center gap-2 py-2 px-1 mb-2 bg-amber-50 rounded-lg">
                          <div className="w-3 h-3 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin flex-shrink-0"/>
                          <p className="text-amber-600 text-xs">Memuat data detail…</p>
                        </div>
                      )}
                      {selectedPCL.length===0?(
                        <p className="text-gray-400 text-sm text-center py-8">Belum ada data petugas.</p>
                      ):(
                        selectedPCL.map((p,i)=>(
                          <PCLRow key={`${p.emailPCL}-${i}`} pcl={p} rank={i+1} onDetail={handleDetail}/>
                        ))
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="font-semibold text-gray-600">{selectedPCL.length} PCL</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-medium">{selectedPCL.filter(p=>p.progress>=100).length} selesai</span>
                        <span>·</span>
                        <span className="text-amber-500 font-medium">{selectedPCL.filter(p=>p.progress>0&&p.progress<100).length} berjalan</span>
                        <span>·</span>
                        <span className="text-rose-400 font-medium">{selectedPCL.filter(p=>p.progress===0).length} belum mulai</span>
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
