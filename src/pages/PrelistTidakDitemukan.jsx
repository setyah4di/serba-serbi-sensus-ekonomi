import { useState, useEffect, useMemo, useRef } from "react";

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "15LFgyVGKJ4Dd5-HBFk6HPrMn5j4vE43k";
const GID_REKAP      = "476651225";
const GID_GABUNGAN   = "1176424983";

const CSV_REKAP    = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_REKAP}`;
const CSV_GABUNGAN = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_GABUNGAN}`;

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

// ── Helpers warna (severity berdasarkan jumlah tidak ditemukan) ──
function notFoundColor(v){ if(v===0)return"#10b981"; if(v<=5)return"#3b82f6"; if(v<=15)return"#f59e0b"; return"#f43f5e"; }
function notFoundBadgeStyle(v){
  if(v===0)return{bg:"#d1fae5",text:"#065f46",dot:"#10b981"};
  if(v<=5)return{bg:"#dbeafe",text:"#1e40af",dot:"#3b82f6"};
  if(v<=15)return{bg:"#fef3c7",text:"#92400e",dot:"#f59e0b"};
  return{bg:"#ffe4e6",text:"#9f1239",dot:"#f43f5e"};
}
function notFoundLabel(v){ if(v===0)return"Aman"; if(v<=5)return"Ringan"; if(v<=15)return"Sedang"; return"Perlu Perhatian"; }

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

// ── Kecamatan Card: hanya menampilkan jumlah tidak ditemukan ──
function KecamatanCard({ kecamatan, notFound, onClick, isSelected }) {
  const color = notFoundColor(notFound);
  const badge = notFoundBadgeStyle(notFound);
  const label = notFoundLabel(notFound);
  return (
    <button onClick={onClick} className="w-full text-left border-0 bg-transparent p-0 cursor-pointer">
      <div className={`rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected?"border-orange-400 bg-orange-50 shadow-md shadow-orange-100":"border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
            <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
          </div>
          <span className="text-3xl font-black flex-shrink-0" style={{color}}>{notFound}</span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:badge.bg,color:badge.text}}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{background:badge.dot}}/>
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Baris Kode ID ──
// ── Baris Kode ID ──
function KodeIdRow({ item, rank }) {
  const badge = notFoundBadgeStyle(item.notFound);
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{item.kodeId || "-"}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {item.namaPCL && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10.5px] font-semibold px-1.5 py-0.5 rounded">
                <span className="text-blue-400 font-bold">PCL</span>
                <span className="text-blue-700">{item.namaPCL}</span>
              </span>
            )}
            {item.namaPML && (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[10.5px] font-semibold px-1.5 py-0.5 rounded">
                <span className="text-orange-400 font-bold">PML</span>
                <span className="text-orange-700">{item.namaPML}</span>
              </span>
            )}
          </div>
        </div>
        <span
          className="text-sm font-black px-3 py-1.5 rounded-xl flex-shrink-0 tabular-nums"
          style={{ background: badge.bg, color: badge.text }}
        >
          {item.notFound}
        </span>
      </div>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringPetugas() {
  const [rows, setRows]                 = useState([]);
  const [gabunganRows, setGabunganRows] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadingGab, setLoadingGab]     = useState(true);
  const [error, setError]               = useState(null);
  const [selectedKec, setSelectedKec]   = useState(null);
  const [search, setSearch]             = useState("");
  const [searchKodeId, setSearchKodeId] = useState("");
  const [lastUpdated, setLastUpdated]   = useState(null);
  const detailRef = useRef(null);
  const tableRef  = useRef(null);

  useEffect(()=>{ if(tableRef.current) tableRef.current.scrollTop=0; setSearchKodeId(""); },[selectedKec]);

  const handleSelectKec=(kec)=>{
    const next=selectedKec===kec?null:kec;
    setSelectedKec(next);
    if(next&&window.innerWidth<1024){ setTimeout(()=>detailRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50); }
  };

  // ── Load rekap (untuk memetakan PML/PCL ↔ kecamatan) ──
  useEffect(()=>{
    fetch(`${CSV_REKAP}&t=${Date.now()}`, { cache: "no-store" }).then(r=>{if(!r.ok)throw new Error("Gagal mengambil data.");return r.text();})
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

  // ── Load gabungan (sumber Kode ID = kolom F, Tidak Ditemukan = kolom Y) ──
  useEffect(()=>{
    const urlGabungan = `${CSV_GABUNGAN}&t=${Date.now()}`;
    fetch(urlGabungan, { cache: "no-store" }).then(r=>r.ok?r.text():Promise.reject()).then(text=>{
      const parsed=parseCSV(text);
      if(parsed.length<2){setLoadingGab(false);return;}
      const header=parsed[0].map(h=>h.toLowerCase().replace(/\s+/g," ").trim());
      const fc=(...kws)=>{for(const k of kws){const i=header.findIndex(h=>h.includes(k));if(i>=0)return i;}return -1;};
      const iNamaPML=fc("nama pml"),iEmailPML=fc("email pml"),iNamaPCL=fc("nama ppl","nama pcl"),
            iEmailPCL=fc("email ppl","email pcl");
      // Kode ID selalu kolom F (index 5); Tidak Ditemukan selalu kolom Y (index 24)
      const iKodeId   = 5;
      const iNotFound = 24;
      const data=parsed.slice(1).map(cols=>{
        const namaPCL=iNamaPCL>=0?(cols[iNamaPCL]||"").trim():"";
        const emailPCL=iEmailPCL>=0?(cols[iEmailPCL]||"").trim():"";
        if(!namaPCL&&!emailPCL)return null;
        return{
          namaPML:iNamaPML>=0?(cols[iNamaPML]||"").trim():"",
          emailPML:iEmailPML>=0?(cols[iEmailPML]||"").trim():"",
          namaPCL,emailPCL,
          kodeId:(cols[iKodeId]||"").trim(),
          notFound:parseNum(cols[iNotFound]),
        };
      }).filter(Boolean);
      setGabunganRows(data);setLoadingGab(false);
    }).catch(()=>setLoadingGab(false));
  },[]);

  // ── Maps gabungan untuk pencocokan PML/PCL ──
  const gabunganByEmailPCL = useMemo(()=>{const map={};gabunganRows.forEach(r=>{if(r.emailPCL){const k=r.emailPCL.toLowerCase().trim();if(!map[k])map[k]=[];map[k].push(r);}});return map;},[gabunganRows]);
  const gabunganByNamaPCL = useMemo(()=>{const map={};gabunganRows.forEach(r=>{if(r.namaPCL){const k=r.namaPCL.toLowerCase().trim();if(!map[k])map[k]=[];map[k].push(r);}});return map;},[gabunganRows]);
  const gabunganByNamaPmlNamaPCL = useMemo(()=>{const map={};gabunganRows.forEach(r=>{if(r.namaPML&&r.namaPCL){const k=`${r.namaPML.toLowerCase().trim()}||${r.namaPCL.toLowerCase().trim()}`;if(!map[k])map[k]=[];map[k].push(r);}});return map;},[gabunganRows]);
  const namaPMLFromEmailGab = useMemo(()=>{const map={};gabunganRows.forEach(r=>{if(r.emailPML&&r.namaPML)map[r.emailPML.toLowerCase().trim()]=r.namaPML;});return map;},[gabunganRows]);

  const resolveNamaPML = (emailPMLRekap) => {
    if(!emailPMLRekap) return "";
    const key = emailPMLRekap.toLowerCase().trim();
    if(namaPMLFromEmailGab[key]) return namaPMLFromEmailGab[key];
    const byNama = gabunganRows.find(r=>r.namaPML.toLowerCase().trim()===key);
    if(byNama) return byNama.namaPML;
    return emailPMLRekap;
  };

  const findDetailRows = (pcl) => {
    if(!pcl) return [];
    const emailPCLKey  = (pcl.emailPCL||"").toLowerCase().trim();
    const namaPCLKey   = (pcl.namaPCL ||emailPCLKey).toLowerCase().trim();
    const namaPMLKey   = (pcl.namaPML ||"").toLowerCase().trim();
    if(namaPMLKey && namaPCLKey){
      const k = `${namaPMLKey}||${namaPCLKey}`;
      if(gabunganByNamaPmlNamaPCL[k]?.length) return gabunganByNamaPmlNamaPCL[k];
    }
    if(gabunganByEmailPCL[emailPCLKey]?.length){
      const results = gabunganByEmailPCL[emailPCLKey];
      if(results.length===1) return results;
      if(namaPMLKey){const f=results.filter(r=>r.namaPML.toLowerCase().trim()===namaPMLKey);if(f.length) return f;}
      return results;
    }
    if(namaPCLKey && gabunganByNamaPCL[namaPCLKey]?.length){
      const results = gabunganByNamaPCL[namaPCLKey];
      if(results.length===1) return results;
      if(namaPMLKey){const f=results.filter(r=>r.namaPML.toLowerCase().trim()===namaPMLKey);if(f.length) return f;}
      return [results[0]];
    }
    return [];
  };

  const enrichedRows = useMemo(()=>rows.map(r=>{
    const emailPMLRekap = (r.emailPML||"").trim();
    const namaPCLRekap  = (r.emailPCL||"").trim();
    const namaPML = resolveNamaPML(emailPMLRekap);
    const namaPMLLow = namaPML.toLowerCase().trim();
    const namaPCLLow = namaPCLRekap.toLowerCase().trim();
    let namaPCL = "";
    const byPmlPcl = gabunganByNamaPmlNamaPCL[`${namaPMLLow}||${namaPCLLow}`];
    if(byPmlPcl?.length){ namaPCL = byPmlPcl[0].namaPCL; }
    else {
      const byEmail = gabunganByEmailPCL[namaPCLLow];
      if(byEmail?.length){ const match = byEmail.find(b=>b.namaPML.toLowerCase().trim()===namaPMLLow)||byEmail[0]; namaPCL = match.namaPCL; }
      else {
        const byNama = gabunganByNamaPCL[namaPCLLow];
        if(byNama?.length){ const match = byNama.find(b=>b.namaPML.toLowerCase().trim()===namaPMLLow)||byNama[0]; namaPCL = match.namaPCL; }
      }
    }
    return {...r, namaPML, namaPCL};
  }),[rows, gabunganRows, gabunganByNamaPmlNamaPCL, gabunganByEmailPCL, gabunganByNamaPCL]);

  // ── Agregasi Tidak Ditemukan per Kecamatan ──
  const kecamatanNotFoundMap = useMemo(() => {
    const map = {};
    KECAMATAN_ORDER.forEach(k => { map[k] = { total: 0, items: [] }; });
    enrichedRows.forEach(r => {
      if (!r.kecamatan || !map[r.kecamatan]) return;
      const details = findDetailRows(r);
      details.forEach(d => {
        if (!d.kodeId) return;
        map[r.kecamatan].total += d.notFound;
        map[r.kecamatan].items.push({
          kodeId: d.kodeId,
          notFound: d.notFound,
          namaPCL: r.namaPCL || r.emailPCL,
          namaPML: r.namaPML || r.emailPML,
        });
      });
    });
    return map;
  }, [enrichedRows, gabunganRows]);

  const totalNotFoundAll = useMemo(
    () => Object.values(kecamatanNotFoundMap).reduce((s,k)=>s+k.total,0),
    [kecamatanNotFoundMap]
  );

  const kecamatanList = useMemo(() =>
    KECAMATAN_ORDER
      .map(nama => ({ kecamatan: nama, notFound: kecamatanNotFoundMap[nama]?.total || 0 }))
      .filter(k => search===""||k.kecamatan.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=>KECAMATAN_ORDER.indexOf(a.kecamatan)-KECAMATAN_ORDER.indexOf(b.kecamatan))
  ,[kecamatanNotFoundMap, search]);

  const selectedItems = useMemo(() => {
    if (!selectedKec) return [];
    const items = kecamatanNotFoundMap[selectedKec]?.items || [];
    return [...items].sort((a,b)=>b.notFound-a.notFound);
  }, [selectedKec, kecamatanNotFoundMap]);

  const filteredItems = useMemo(() => {
    if (!searchKodeId.trim()) return selectedItems;
    const q = searchKodeId.toLowerCase();
    return selectedItems.filter(it => (it.kodeId||"").toLowerCase().includes(q));
  }, [selectedItems, searchKodeId]);

  return(
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <header className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#F5A623 0%,#e8820a 100%)"}}>
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Daftar Prelist Tidak Ditemukan</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
            {lastUpdated&&(
              <div className="text-right">
                <p className="text-orange-100">Data diperbarui pada</p>
                <p className="text-orange-100">{lastUpdated.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} Pukul 08.00 WIB</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5"/>
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5"/>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
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
        {!loading&&!error&&(
          <>
            {/* Stat Cards: hanya jumlah kecamatan & total tidak ditemukan */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <StatCard label="Jumlah Kecamatan" value={KECAMATAN_ORDER.length} sub="wilayah kerja" icon="🗺️" variant="orange" />
              <StatCard label="Total Tidak Ditemukan" value={totalNotFoundAll} sub="seluruh kecamatan" icon="⚠️" variant="rose" />
            </div>

            {loadingGab&&(
              <div className="flex items-center gap-2 py-2 px-3 mb-4 bg-amber-50 rounded-lg">
                <div className="w-3 h-3 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin flex-shrink-0"/>
                <p className="text-amber-600 text-xs">Memuat data detail…</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input type="text" placeholder="Cari nama kecamatan…" value={search}
                  onChange={e=>{setSearch(e.target.value);setSelectedKec(null);}}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 w-full min-w-0">
              <div className="w-full min-w-0 lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({kecamatan,notFound})=>(
                  <KecamatanCard key={kecamatan} kecamatan={kecamatan} notFound={notFound} isSelected={selectedKec===kecamatan} onClick={()=>handleSelectKec(kecamatan)}/>
                ))}
              </div>

              <div ref={detailRef} className="w-full min-w-0 lg:w-[45%]">
                {!selectedKec?(
                  <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar Kode ID yang tidak ditemukan.</p>
                  </div>
                ):(
                  <div className="sticky top-6 w-full min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <div className="mt-3 flex items-center justify-between text-white text-sm">
                        <span className="opacity-80">Total Tidak Ditemukan</span>
                        <span className="font-black text-lg">{kecamatanNotFoundMap[selectedKec]?.total || 0}</span>
                      </div>
                    </div>
                    <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                      <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                        <div className="relative mb-2">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                          </svg>
                          <input type="text" placeholder="Cari ID SLS…" value={searchKodeId}
                            onChange={e=>{setSearchKodeId(e.target.value); if(tableRef.current) tableRef.current.scrollTop=0;}}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"/>
                          {searchKodeId&&(
                            <button onClick={()=>setSearchKodeId("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          )}
                        </div>
                       <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-400 w-6 text-center">#</span>
                        <span className="text-xs text-gray-400 flex-1">ID SLS · PCL / PML</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">Tdk Ditemukan</span>
                      </div>
                      </div>
                      {filteredItems.length===0?(
                        <p className="text-gray-400 text-sm text-center py-8">
                          {searchKodeId ? `Tidak ada Kode ID dengan "${searchKodeId}"` : "Tidak ada data Kode ID di kecamatan ini."}
                        </p>
                      ):(
                        filteredItems.map((item,i)=>(
                          <KodeIdRow key={`${item.kodeId}-${i}`} item={item} rank={i+1}/>
                        ))
                      )}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="font-semibold text-gray-600">
                          {filteredItems.length}{searchKodeId?` / ${selectedItems.length}`:""} Kode ID
                        </span>
                        <span>·</span>
                        <span className="text-rose-500 font-medium">
                          {filteredItems.reduce((s,it)=>s+it.notFound,0)} total tidak ditemukan
                        </span>
                      </div>
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