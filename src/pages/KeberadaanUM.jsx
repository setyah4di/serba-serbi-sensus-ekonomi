import { useState, useEffect, useMemo, useRef } from "react";

// ── Konfigurasi Spreadsheet ──
// Spreadsheet: 1507_prelist UM
// https://docs.google.com/spreadsheets/d/1U14KXG3QeDVUBxVVB0Ff0YTpGegWpwviSYNXCmG7dKk/edit?gid=997689442
const SPREADSHEET_ID = "1U14KXG3QeDVUBxVVB0Ff0YTpGegWpwviSYNXCmG7dKk";
const GID_PRELIST = "997689442";
const CSV_PRELIST = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_PRELIST}`;

// URL Web App Apps Script (lihat AppsScript_Update_PrelistUM.js) — tempel URL hasil deploy di sini.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwChTqokIrRzT78xn2oIzqmxbgNMxnB63O4sd7-8IYPAj-nV5xy-uft0-fYo7MtLEfM/exec";

const KECAMATAN_ORDER = [
  "TUNGKAL ULU", "MERLUNG", "BATANG ASAM", "TEBING TINGGI", "RENAH MENDALUH", "MUARA PAPALIK",
  "PENGABUAN", "SENYERANG", "TUNGKAL ILIR", "BRAM ITAM", "SEBERANG KOTA", "BETARA", "KUALA BETARA",
];

// Opsi hasil konfirmasi PML/PPL
const OPSI_KONFIRMASI = [
  { value: "01 Usaha Tutup", label: "01 Usaha Tutup" },
  { value: "02 Bukan di wilayah ini", label: "02 Bukan di wilayah ini" },
];

// ── Parser CSV (menangani newline & koma di dalam tanda kutip) ──
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQ) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQ = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQ = true;
      } else if (ch === ',') {
        row.push(cur);
        cur = "";
      } else if (ch === '\r') {
        // abaikan
      } else if (ch === '\n') {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }
  }

  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  return rows.map(r => r.map(c => c.trim()));
}

// ── Helpers warna card kecamatan (berdasarkan jumlah prelist) ──
function countBadge(v) {
  if (v === 0) return "bg-gray-50 text-gray-500 ring-gray-200";
  if (v <= 15) return "bg-blue-50 text-blue-700 ring-blue-200";
  if (v <= 30) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}
function countBarColor(v) {
  if (v === 0) return "bg-gray-300";
  if (v <= 15) return "bg-blue-500";
  if (v <= 30) return "bg-amber-400";
  return "bg-rose-400";
}

function statusAssignmentBadge(status) {
  const s = (status || "").trim().toUpperCase();
  if (s.startsWith("APPROVED")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (s === "DRAFT") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (s === "REJECTED") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (s === "SUBMITTED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (s === "OPEN") return "bg-purple-50 text-purple-700 ring-purple-200";
  return "bg-gray-50 text-gray-500 ring-gray-200";
}

function konfirmasiBadge(v) {
  const s = (v || "").trim();
  if (s.startsWith("01")) return "bg-slate-50 text-slate-700 ring-slate-200";
  if (s.startsWith("02")) return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-gray-50 text-gray-400 ring-gray-200";
}

// ── Stat Card global ──
function StatCard({ label, value, sub, icon, accentColor }) {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-[18px] p-3.5 sm:p-4 min-h-[104px] sm:min-h-[120px] transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}02 100%)`,
        border: `2px solid ${accentColor}30`,
        boxShadow: `0 4px 12px ${accentColor}08`,
      }}
    >
      <div style={{ position: "absolute", top: "-30px", left: "-30px", width: "80px", height: "80px", borderRadius: "50%", background: `${accentColor}12`, filter: "blur(8px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-25px", right: "-25px", width: "65px", height: "65px", borderRadius: "50%", background: `${accentColor}08`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${accentColor}00, ${accentColor}60, ${accentColor}00)`, pointerEvents: "none" }} />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider m-0 opacity-80" style={{ color: accentColor }}>{label}</p>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg"
          style={{ background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}15)`, border: `1.5px solid ${accentColor}35` }}
        >
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="font-extrabold m-0 mb-1 leading-none text-2xl sm:text-3xl" style={{ color: accentColor }}>{value}</p>
        {sub && <p className="text-[11px] sm:text-xs text-slate-500 m-0 font-medium truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Progress bar ──
function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Card kecamatan ──
// Angka besar = jumlah BELUM dikonfirmasi, sub-info = jumlah sudah dikonfirmasi
function KecamatanCard({ kecamatan, countBelum, countSudah, maxCount, onClick, isSelected }) {
  const barColor = countBarColor(countBelum);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200
        ${isSelected
          ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100"
          : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
          <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight break-words">{kecamatan}</p>
        </div>
        <span className="text-xl sm:text-2xl font-black flex-shrink-0 text-gray-700">{countBelum}</span>
      </div>

      <ProgressBar value={countBelum} max={maxCount} color={barColor} />

      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-emerald-600">{countSudah}</span> Sudah Dikonfirmasi
        </span>
        <span className={`text-xs font-medium px-1 py-0.5 rounded-full ring-1 whitespace-nowrap ${countBadge(countBelum)}`}>
          {countBelum} belum konfirmasi
        </span>
      </div>
    </button>
  );
}

// ── Mini status card filter (di panel detail kecamatan) ──
function StatusFilterCard({ label, value, activeKey, currentFilter, onClick, colorScheme }) {
  const isActive = currentFilter === activeKey;
  const schemes = {
    emerald: {
      base: "border-emerald-100 bg-emerald-50",
      active: "border-emerald-400 bg-emerald-100 shadow-md shadow-emerald-100",
      num: "text-emerald-700",
      label: "text-emerald-600",
    },
    rose: {
      base: "border-rose-100 bg-rose-50",
      active: "border-rose-400 bg-rose-100 shadow-md shadow-rose-100",
      num: "text-rose-700",
      label: "text-rose-600",
    },
  };
  const sc = schemes[colorScheme];
  return (
    <button
      onClick={onClick}
      className={`w-full min-w-0 rounded-xl border-2 px-3 py-2.5 flex items-center justify-between gap-2
        transition-all duration-200 select-none
        ${isActive ? sc.active : sc.base + " hover:brightness-95"}`}
    >
      <span className={`text-xs font-semibold ${sc.label}`}>{label}</span>
      <span className={`text-lg font-black leading-none ${sc.num}`}>{value}</span>
    </button>
  );
}

// ── Baris prelist UM ──
function PrelistRow({ row, rank, onDetail }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-300 w-5 text-right flex-shrink-0 mt-0.5">{rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-700 truncate">{row.nama}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {row.nmdesa} - {row.nmsls}
          </p>
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-400 font-medium w-[105px] flex-shrink-0">Status Assignment</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${statusAssignmentBadge(row.statusAssignment)}`}>
                {row.statusAssignment || "Belum Diketahui"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-400 font-medium w-[105px] flex-shrink-0">Hasil Konfirmasi</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${konfirmasiBadge(row.hasilKonfirmasi)}`}>
                {row.hasilKonfirmasi ? row.hasilKonfirmasi : "Belum Dikonfirmasi"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-gray-400">
            Jml Usaha: <span className="font-bold text-gray-600">{row.jumlahUsahaRingkasan || "-"}</span>
          </span>
          <button
            onClick={() => onDetail(row)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-500
              hover:bg-orange-100 active:bg-orange-200 transition-colors border border-orange-100 whitespace-nowrap"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal detail & konfirmasi ──
// phase: "idle" | "saving" | "success"
function DetailPrelistUM({ row, onClose, onSaved }) {
  const [hasilKonfirmasi, setHasilKonfirmasi] = useState(row.hasilKonfirmasi || "");
  const [alamatBenar, setAlamatBenar] = useState(row.alamatBenar || "");
  const [phase, setPhase] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const closeTimeoutRef = useRef(null);

  const perluAlamat = hasilKonfirmasi.startsWith("02");
  const isBusy = phase !== "idle";

  useEffect(() => {
    return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); };
  }, []);

  const handleSave = async () => {
    setErrorMsg("");

    if (!hasilKonfirmasi) {
      setErrorMsg("Pilih hasil konfirmasi PML/PPL terlebih dahulu.");
      return;
    }
    if (perluAlamat && !alamatBenar.trim()) {
      setErrorMsg("Alamat yang benar wajib diisi jika memilih \"02 Bukan di wilayah ini\".");
      return;
    }
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.startsWith("PASTE_URL")) {
      setErrorMsg("APPS_SCRIPT_URL belum diisi. Tempel URL Web App Apps Script terlebih dahulu.");
      return;
    }

    setPhase("saving");
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        // text/plain menghindari CORS preflight yang tidak didukung Apps Script secara default
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          sheetRow: row.rowIndex,
          idsbr: row.idsbr,
          nama: row.nama,
          hasilKonfirmasi,
          alamatBenar: perluAlamat ? alamatBenar : "",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Gagal menyimpan data.");

      onSaved({
        ...row,
        hasilKonfirmasi,
        alamatBenar: perluAlamat ? alamatBenar : "",
      });

      setPhase("success");
      closeTimeoutRef.current = setTimeout(() => { onClose(); }, 2000);
    } catch (err) {
      setErrorMsg("Gagal menghubungi server: " + err.message);
      setPhase("idle");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={isBusy ? undefined : onClose}>

      {/* ── Overlay full-screen: loading → sukses ── */}
      {(phase === "saving" || phase === "success") && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-white/95 backdrop-blur-sm px-6 text-center">
          {phase === "saving" && (
            <div key="loading" className="flex flex-col items-center gap-5 animate-fadeIn">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-[5px] border-orange-100" />
                <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-orange-500 border-r-orange-400 animate-spin" />
                <div className="absolute inset-3 rounded-full border-[3px] border-transparent border-b-orange-300 animate-spin [animation-direction:reverse] [animation-duration:0.9s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-base font-semibold text-gray-700">Menyimpan perubahan</p>
                <span className="flex gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
                </span>
              </div>
              <p className="text-sm text-gray-400">Mohon tunggu…</p>
            </div>
          )}

          {phase === "success" && (
            <div key="success" className="flex flex-col items-center gap-5 animate-successIn">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pingOnce" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-200">
                  <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="white"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength="1"
                      style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "drawCheck 0.5s ease-out 0.2s forwards" }}
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Berhasil disimpan!</p>
                <p className="text-sm text-gray-400 mt-1">Perubahan telah tersimpan ke spreadsheet</p>
              </div>
              <div className="w-40 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500 animate-toastProgress" />
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-orange-100 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Konfirmasi Prelist UM</p>
              <h2 className="text-white text-base sm:text-lg font-black break-words leading-tight">{row.nama}</h2>
            </div>
            <button onClick={onClose} disabled={isBusy} className="text-orange-200 hover:text-white transition-colors p-1 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
          <table className="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-500 w-1/3 align-top">SLS</td>
                <td className="px-3 py-2 text-gray-700">{row.nmsls || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-500 align-top">Desa</td>
                <td className="px-3 py-2 text-gray-700">{row.nmdesa || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-500 align-top">Jumlah Usaha</td>
                <td className="px-3 py-2 text-gray-700">{row.jumlahUsahaRingkasan || "-"}</td>
              </tr>
              <tr>
                <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-500 align-top">Status Assignment</td>
                <td className="px-3 py-2">
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 whitespace-nowrap ${statusAssignmentBadge(row.statusAssignment)}`}>
                    {row.statusAssignment || "-"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {row.alamat && (
            <div className="text-xs">
              <p className="text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Alamat Tercatat</p>
              <p className="text-gray-600">{row.alamat}</p>
            </div>
          )}

          <div className="pt-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Hasil Konfirmasi PML/PPL
            </label>
            <select
              value={hasilKonfirmasi}
              onChange={e => setHasilKonfirmasi(e.target.value)}
              disabled={isBusy}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:text-gray-400"
            >
              <option value="">Pilih hasil konfirmasi…</option>
              {OPSI_KONFIRMASI.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {perluAlamat && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Alamat yang Benar
              </label>
              <textarea
                value={alamatBenar}
                onChange={e => setAlamatBenar(e.target.value)}
                rows={3}
                disabled={isBusy}
                placeholder="Tuliskan alamat usaha yang sebenarnya…"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none disabled:text-gray-400"
              />
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <p className="text-rose-600 text-xs font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end bg-gray-50">
          <button
            onClick={onClose}
            disabled={isBusy}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isBusy || !hasilKonfirmasi}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {phase === "saving" ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(0.97) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
        .animate-fadeIn{animation:fadeIn 0.2s ease-out;}

        @keyframes successIn{
          0%{opacity:0;transform:scale(0.85);}
          60%{opacity:1;transform:scale(1.04);}
          100%{opacity:1;transform:scale(1);}
        }
        .animate-successIn{animation:successIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;}

        @keyframes toastProgress{from{width:100%;}to{width:0%;}}
        .animate-toastProgress{animation:toastProgress 2s linear forwards;}

        @keyframes drawCheck{to{stroke-dashoffset:0;}}

        @keyframes pingOnce{
          0%{transform:scale(1);opacity:0.55;}
          80%{transform:scale(1.6);opacity:0;}
          100%{transform:scale(1.6);opacity:0;}
        }
        .animate-pingOnce{animation:pingOnce 0.9s ease-out forwards;}
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KOMPONEN UTAMA
// ══════════════════════════════════════════════════════════════════════════════
export default function KeberadaanUM() {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("urut");
  const [searchUM, setSearchUM] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null | "sudah" | "belum"
  const [modalRow, setModalRow] = useState(null);

  const detailRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) tableRef.current.scrollTop = 0;
    setSearchUM("");
    setStatusFilter(null);
  }, [selectedKec]);

  const handleStatusFilter = (key) => {
    setStatusFilter(prev => prev === key ? null : key);
    if (tableRef.current) tableRef.current.scrollTop = 0;
  };

  const handleSelectKec = (kec) => {
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  // ── Fetch CSV ──
  useEffect(() => {
    fetch(`${CSV_PRELIST}&_cb=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data prelist UM."); return r.text(); })
      .then(text => {
        const parsed = parseCSV(text);
        const data = [];

        parsed.slice(1).forEach((cols, idx) => {
          const sheetRow = idx + 2;

          const idsbr = (cols[0] || "").trim();
          const nama = (cols[1] || "").trim();
          if (!idsbr || !nama) return;

          data.push({
            rowIndex: sheetRow,
            idsbr,
            nama,
            alamat: (cols[2] || "").trim(),
            kddesa: (cols[3] || "").trim(),
            kdsls: (cols[4] || "").trim(),
            nmkec: (cols[5] || "").trim(),
            nmdesa: (cols[6] || "").trim(),
            nmsls: (cols[7] || "").trim(),
            email: (cols[10] || "").trim(),
            skala: (cols[11] || "").trim(),
            latitude: (cols[12] || "").trim(),
            longitude: (cols[13] || "").trim(),
            statusAssignment: (cols[21] || "").trim(),   // V
            jumlahUsahaRingkasan: (cols[22] || "").trim(), // W
            hasilKonfirmasi: (cols[23] || "").trim(),      // X
            alamatBenar: (cols[24] || "").trim(),          // Y
          });
        });

        setRawRows(data);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Agregasi per kecamatan ──
  const kecamatanMap = useMemo(() => {
    const m = {};
    rawRows.forEach(r => { if (!m[r.nmkec]) m[r.nmkec] = []; m[r.nmkec].push(r); });
    return m;
  }, [rawRows]);

  // ── Statistik global (3 kartu utama + status konfirmasi) ──
  const globalStats = useMemo(() => {
    if (!rawRows.length) return null;
    const kecamatanSet = new Set(rawRows.map(r => r.nmkec).filter(Boolean));
    const ringkasanJumlahUsaha = rawRows.filter(r => r.jumlahUsahaRingkasan.trim() === "1").length;
    const sudahKonfirmasi = rawRows.filter(r => r.hasilKonfirmasi.trim() !== "").length;
    const belumKonfirmasi = rawRows.length - sudahKonfirmasi;
    return {
      totalKecamatan: kecamatanSet.size,
      ringkasanJumlahUsaha,
      totalPrelistUM: rawRows.length,
      sudahKonfirmasi,
      belumKonfirmasi,
    };
  }, [rawRows]);

  // ── Daftar kartu kecamatan ──
  // Angka utama di kartu = jumlah yang BELUM dikonfirmasi (lebih butuh perhatian),
  // sub-info di bawahnya = jumlah yang sudah dikonfirmasi.
  const kecamatanList = useMemo(() => {
    const namaList = new Set([...KECAMATAN_ORDER, ...Object.keys(kecamatanMap)]);
    return [...namaList]
      .map(nama => {
        const list = kecamatanMap[nama] || [];
        const countSudah = list.filter(r => r.hasilKonfirmasi.trim() !== "").length;
        const countBelum = list.length - countSudah;
        return {
          kecamatan: nama,
          count: list.length,
          countBelum,
          countSudah,
        };
      })
      .filter(k => k.count > 0 || KECAMATAN_ORDER.includes(k.kecamatan))
      .filter(k => search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortBy === "jumlah"
          ? b.countBelum - a.countBelum
          : (KECAMATAN_ORDER.indexOf(a.kecamatan) - KECAMATAN_ORDER.indexOf(b.kecamatan)) ||
            a.kecamatan.localeCompare(b.kecamatan)
      );
  }, [kecamatanMap, search, sortBy]);

  const maxCount = useMemo(
    () => kecamatanList.reduce((m, k) => Math.max(m, k.countBelum), 0),
    [kecamatanList]
  );

  const selectedRows = useMemo(() => {
    if (!selectedKec) return [];
    return [...(kecamatanMap[selectedKec] || [])].sort(
      (a, b) => a.nmdesa.localeCompare(b.nmdesa) || a.nmsls.localeCompare(b.nmsls)
    );
  }, [selectedKec, kecamatanMap]);

  // ── 2 kategori status (Sudah / Belum Dikonfirmasi) untuk kecamatan terpilih ──
  const statusCounts = useMemo(() => {
    const sudah = selectedRows.filter(r => r.hasilKonfirmasi.trim() !== "").length;
    const belum = selectedRows.length - sudah;
    return { sudah, belum };
  }, [selectedRows]);

  const filteredRows = useMemo(() => {
    let result = selectedRows;

    if (statusFilter === "sudah") {
      result = result.filter(r => r.hasilKonfirmasi.trim() !== "");
    } else if (statusFilter === "belum") {
      result = result.filter(r => r.hasilKonfirmasi.trim() === "");
    }

    if (searchUM.trim()) {
      const q = searchUM.toLowerCase();
      result = result.filter(r =>
        (r.nama || "").toLowerCase().includes(q) ||
        (r.nmsls || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedRows, statusFilter, searchUM]);

  // Modal DetailPrelistUM menutup dirinya sendiri (lewat onClose) setelah
  // animasi sukses selesai, jadi di sini cukup update data lokalnya saja.
  const handleSaved = (updatedRow) => {
    setRawRows(prev => prev.map(r => r.rowIndex === updatedRow.rowIndex ? updatedRow : r));
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">

      {modalRow && (
        <DetailPrelistUM row={modalRow} onClose={() => setModalRow(null)} onSaved={handleSaved} />
      )}

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#fb923c 0%,#f97316 45%,#ea580c 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div>
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-black leading-tight">Monitoring Prelist Usaha Menengah</h1>
            <p className="text-orange-100 mt-1 text-sm sm:text-base">Sensus Ekonomi 2026</p>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-6 py-6 sm:py-8">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Mengambil data prelist UM dari spreadsheet…</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-4">
            <p className="text-rose-600 font-semibold">Gagal memuat data</p>
            <p className="text-rose-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && globalStats && (
          <>
            {/* ── Stat Cards global: 5 kartu dalam satu baris ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 mb-6 sm:mb-7">
              
              <StatCard
                label="Belum Dikonfirmasi"
                value={globalStats.belumKonfirmasi}
                sub={`${globalStats.sudahKonfirmasi} sudah dikonfirmasi`}
                icon="⏳"
                accentColor="#e11d48"
              />
              <StatCard
                label="Sudah Dikonfirmasi"
                value={globalStats.sudahKonfirmasi}
                sub={`${globalStats.belumKonfirmasi} belum dikonfirmasi`}
                icon="✅"
                accentColor="#0f766e"
              />
              <StatCard
                label="Ringkasan Jumlah Usaha"
                value={globalStats.ringkasanJumlahUsaha}
                sub="jumlah usaha ditemukan"
                icon="🏢"
                accentColor="#2563eb"
              />
              <StatCard
                label="Jumlah Prelist UM"
                value={globalStats.totalPrelistUM}
                sub="total baris data"
                icon="📋"
                accentColor="#ea580c"
              />
            </div>

            {/* ── Filter & sort kecamatan ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text" placeholder="Cari nama kecamatan…" value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedKec(null); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setSortBy("urut")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy === "urut" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Urutan</button>
                <button onClick={() => setSortBy("jumlah")} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${sortBy === "jumlah" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>Terbanyak ↓</button>
              </div>
            </div>

            {/* ── Layout dua kolom ── */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Kolom kiri: kartu kecamatan */}
              <div className="lg:w-[55%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                {kecamatanList.map(({ kecamatan, countBelum, countSudah }) => (
                  <KecamatanCard
                    key={kecamatan}
                    kecamatan={kecamatan}
                    countBelum={countBelum}
                    countSudah={countSudah}
                    maxCount={maxCount}
                    isSelected={selectedKec === kecamatan}
                    onClick={() => handleSelectKec(kecamatan)}
                  />
                ))}
              </div>

              {/* Kolom kanan: detail */}
              <div ref={detailRef} className="w-full min-w-0 lg:w-[45%]">
                {!selectedKec ? (
                  <div className="lg:sticky lg:top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-16 sm:py-20 text-center px-6 sm:px-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                    <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar prelist UM di wilayah tersebut.</p>
                  </div>
                ) : (
                  <div className="lg:sticky lg:top-6 w-full min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Panel header */}
                    <div className="px-5 sm:px-6 py-4 sm:py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Kecamatan</p>
                          <h2 className="text-white text-lg sm:text-xl font-black break-words">{selectedKec}</h2>
                        </div>
                        <button onClick={() => setSelectedKec(null)} className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-white text-sm">
                        <span className="opacity-80">Total prelist UM di kecamatan ini</span>
                        <span className="font-bold text-lg">{selectedRows.length}</span>
                      </div>
                    </div>

                    {/* ── 2 Status Filter Card ── */}
                    <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                        Filter berdasarkan status
                        {statusFilter && (
                          <button onClick={() => setStatusFilter(null)} className="ml-2 text-orange-500 normal-case font-semibold hover:underline">
                            (reset)
                          </button>
                        )}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <StatusFilterCard
                          label="Belum Dikonfirmasi"
                          value={statusCounts.belum}
                          activeKey="belum"
                          currentFilter={statusFilter}
                          onClick={() => handleStatusFilter("belum")}
                          colorScheme="rose"
                        />
                        <StatusFilterCard
                          label="Sudah Dikonfirmasi"
                          value={statusCounts.sudah}
                          activeKey="sudah"
                          currentFilter={statusFilter}
                          onClick={() => handleStatusFilter("sudah")}
                          colorScheme="emerald"
                        />
                      </div>
                    </div>

                    {/* Daftar UM */}
                    <div ref={tableRef} className="px-4 sm:px-6 max-h-[460px] sm:max-h-[520px] overflow-y-auto">
                      <div className="sticky top-0 bg-white pt-2 pb-1 z-10">
                        <div className="relative mb-2">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                          </svg>
                          <input
                            type="text" placeholder="Cari nama UM / SLS" value={searchUM}
                            onChange={e => { setSearchUM(e.target.value); if (tableRef.current) tableRef.current.scrollTop = 0; }}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
                          />
                          {searchUM && (
                            <button onClick={() => setSearchUM("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {filteredRows.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-3xl mb-2">
                            {statusFilter === "sudah" ? "✅" : statusFilter === "belum" ? "⏳" : "🔍"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {searchUM
                              ? `Tidak ada hasil untuk "${searchUM}"`
                              : statusFilter === "sudah"
                              ? "Tidak ada data yang sudah dikonfirmasi."
                              : statusFilter === "belum"
                              ? "Tidak ada data yang belum dikonfirmasi."
                              : "Belum ada data prelist UM."}
                          </p>
                        </div>
                      ) : (
                        filteredRows.map((r, i) => (
                          <PrelistRow
                            key={`${r.kddesa}-${r.kdsls}-${r.idsbr}-${i}`}
                            row={r} rank={i + 1}
                            onDetail={setModalRow}
                          />
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-2 text-xs text-gray-400 flex-wrap items-center">
                        <span className="font-semibold text-gray-600">
                          {filteredRows.length}{(searchUM || statusFilter) ? ` / ${selectedRows.length}` : ""} UM
                        </span>
                        {statusFilter ? (
                          <span className={`font-medium ${statusFilter === "sudah" ? "text-emerald-600" : "text-rose-500"}`}>
                            · {statusFilter === "sudah" ? "Sudah Dikonfirmasi" : "Belum Dikonfirmasi"}
                          </span>
                        ) : (
                          <>
                            <span>·</span>
                            <span className="text-gray-400 font-medium">
                              {filteredRows.filter(r => !r.hasilKonfirmasi).length} belum dikonfirmasi
                            </span>
                          </>
                        )}
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
        @keyframes fadeIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
