import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as XLSX from "xlsx"; // npm install xlsx

// ── Konfigurasi Spreadsheet ──
const SPREADSHEET_ID = "1BHma1HmHYKlzMV2GQ7Y_Z9gNMMPA2m8LplG6V4T81zs";
const GID_DATA = "471865770";

const CSV_DATA = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID_DATA}`;

// ── Endpoint Apps Script untuk write-back ──
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyeL5OeGqFM9rkNTzOVJ7L_dFHeyhuWuslZpUXjC4ZU8_Hy-Ezkg42p5cn7BTVyEmxlGw/exec";

// ── Kolom (0-based index) ──
// F  = level_3_nam  -> Kecamatan
// H  = level_4_nam  -> Desa/Kelurahan
// J  = level_5_nam  -> Nama RT
// L  = level_6_full -> Kode SLS lengkap
// M  = data1        -> Nama Assignment
// N  = data2        -> Alamat
// O  = data3        -> IDSBR
// R  = data6        -> Jenis Prelist
// Y  = Keberadaan / Klasifikasi
// Z  = Catatan
// AA = Prelist Usaha
// AB = Nomor Bangunan
// AC = Konfirmasi
// AD = Penjelasan
const COL = {
  kecamatan: 5,
  desa: 7,
  rtNama: 9,
  slsFull: 11,
  namaAssignment: 12,
  alamat: 13,
  idsbr: 14,
  jenisPrelist: 17,
  keberadaan: 24,
  catatan: 25,
  prelistUsaha: 26,
  nomorBangunan: 27,
  konfirmasi: 28,
  penjelasan: 29,
};

// ── Opsi konfirmasi yang ditulis ke kolom AC ──
const KONFIRMASI_OPTIONS = [
  { value: "Ada dan sudah diperbaiki di FASIH", label: "1. Ada dan sudah diperbaiki di FASIH" },
  { value: "Data sudah sesuai", label: "2. Data sudah sesuai" },
];

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (ch === '"') {
      if (inQuotes && nextCh === '"') {
        currentVal += '"';
        i++; // lewati kutip ganda lolos (escaped quote)
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
      if (ch === '\r' && nextCh === '\n') i++; // tangani CRLF
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || currentRow[0] !== "") {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += ch;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }

  return rows;
}

// ── Ubah baris CSV mentah menjadi objek data yang dipakai aplikasi ──
function rowsFromCsvText(text) {
  const parsed = parseCSV(text);
  return parsed.slice(1).map((cols, i) => ({
    rowNumber: i + 2, // baris asli di spreadsheet (baris 1 = header)
    kecamatan: (cols[COL.kecamatan] || "").trim(),
    desa: (cols[COL.desa] || "").trim(),
    rtNama: (cols[COL.rtNama] || "").trim(),
    slsFull: (cols[COL.slsFull] || "").trim(),
    namaAssignment: (cols[COL.namaAssignment] || "").trim(),
    alamat: (cols[COL.alamat] || "").trim(),
    idsbr: (cols[COL.idsbr] || "").trim(),
    jenisPrelist: (cols[COL.jenisPrelist] || "").trim(),
    keberadaan: (cols[COL.keberadaan] || "").trim(),
    catatan: (cols[COL.catatan] || "").trim(),
    prelistUsaha: (cols[COL.prelistUsaha] || "").trim(),
    nomorBangunan: (cols[COL.nomorBangunan] || "").trim(),
    konfirmasi: (cols[COL.konfirmasi] || "").trim(),
    penjelasan: (cols[COL.penjelasan] || "").trim(),
  })).filter(r => r.kecamatan && r.desa);
}

// ── Helpers warna (severity berdasarkan jumlah tidak ditemukan) ──
function countColor(v) { if (v === 0) return "#10b981"; if (v <= 5) return "#3b82f6"; if (v <= 15) return "#f59e0b"; return "#f43f5e"; }
function countBadgeStyle(v) {
  if (v === 0) return { bg: "#d1fae5", text: "#065f46", dot: "#10b981" };
  if (v <= 5) return { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" };
  if (v <= 15) return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
  return { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e" };
}
function countLabel(v) { if (v === 0) return "Aman"; if (v <= 5) return "Ringan"; if (v <= 15) return "Sedang"; return "Perlu Perhatian"; }

// ── Apakah baris ini punya isian Prelist Usaha? (dipakai untuk highlight hijau) ──
function hasPrelistUsaha(item) {
  const v = (item.prelistUsaha || "").trim();
  return v !== "" && v !== "-";
}

// ── Kirim konfirmasi ke Apps Script (text/plain agar tidak kena CORS preflight) ──
async function postKonfirmasi(rowNumber, konfirmasi, penjelasan) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "konfirmasi", rowNumber, konfirmasi, penjelasan }),
  });
  if (!res.ok) throw new Error("Request gagal");
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Gagal menyimpan");
  return data;
}

// ── Export data satu kecamatan ke Excel ──
function exportKecamatanToExcel(kecamatan, data) {
  const wsData = data.map(r => ({
    Kecamatan: r.kecamatan,
    Desa: r.desa,
    "Nama RT": r.rtNama,
    "Kode SLS": r.slsFull,
    "Nama Assignment": r.namaAssignment,
    Alamat: r.alamat,
    IDSBR: r.idsbr,
    "Jenis Prelist": r.jenisPrelist,
    Keberadaan: r.keberadaan,
    Catatan: r.catatan,
    "Prelist Usaha": r.prelistUsaha,
    "Nomor Bangunan": r.nomorBangunan,
    Konfirmasi: r.konfirmasi,
    Penjelasan: r.penjelasan,
  }));
  const ws = XLSX.utils.json_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 28 },
    { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
    { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 28 },
  ];
  const wb = XLSX.utils.book_new();
  const safeSheetName = (kecamatan || "Data").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  const safeFileName = (kecamatan || "Data").replace(/[\\/:*?"<>|]/g, "_");
  XLSX.writeFile(wb, `Tidak_Ditemukan_${safeFileName}.xlsx`);
}

// ── Spinner kecil (dipertahankan untuk kompatibilitas) ──
function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// ── ANIMASI LOADING & TOAST — Keyframes CSS global (dirender sekali) ──
// ══════════════════════════════════════════════════════════════
function LoadingKeyframes() {
  return (
    <style>{`
      @keyframes spin-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
      @keyframes spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      @keyframes dot-bounce {
        0%, 80%, 100% { transform: translateY(0) scale(1);    opacity: .45; }
        40%           { transform: translateY(-5px) scale(1.15); opacity: 1; }
      }
      @keyframes glow-ring {
        0%   { transform: scale(.85); opacity: .55; }
        100% { transform: scale(1.55); opacity: 0; }
      }
      @keyframes core-pulse {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%      { transform: scale(1.35); opacity: .6; }
      }
      @keyframes text-shimmer {
        0%   { background-position: 200% 50%; }
        100% { background-position: -200% 50%; }
      }
      @keyframes overlay-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes pop-in {
        0%   { opacity: 0; transform: scale(.85) translateY(6px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }

      /* ── Animasi toast sukses ── */
      @keyframes toast-in {
        0%   { opacity: 0; transform: translate(-50%, 40px) scale(.85); }
        60%  { opacity: 1; transform: translate(-50%, -6px) scale(1.03); }
        100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
      @keyframes toast-out {
        0%   { opacity: 1; transform: translate(-50%, 0) scale(1); }
        100% { opacity: 0; transform: translate(-50%, 24px) scale(.9); }
      }
      @keyframes check-pop {
        0%   { transform: scale(0) rotate(-30deg); }
        60%  { transform: scale(1.2) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes check-draw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes toast-progress {
        from { width: 100%; }
        to   { width: 0%; }
      }
      @keyframes confetti {
        0%   { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
        100% { opacity: 0; transform: translate(var(--tx), 28px) rotate(220deg) scale(.4); }
      }
      @keyframes ping-ring {
        0%   { transform: scale(1);   opacity: .6; }
        100% { transform: scale(1.9); opacity: 0; }
      }
    `}</style>
  );
}

// ── Spinner elegan: ring ganda berlawanan arah + glow + core berdenyut ──
function SavingSpinner({ size = 60 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow ring yang mengembang */}
      <span
        className="absolute inset-0 rounded-full border-2 border-orange-300"
        style={{ animation: "glow-ring 1.4s ease-out infinite" }}
      />
      {/* Ring luar — searah jarum jam */}
      <span
        className="absolute inset-0 rounded-full border-[3.5px] border-transparent"
        style={{
          borderTopColor: "#f5820a",
          borderRightColor: "#fbbf24",
          animation: "spin-cw .9s linear infinite",
        }}
      />
      {/* Ring dalam — berlawanan arah */}
      <span
        className="absolute rounded-full border-[3px] border-transparent"
        style={{
          inset: size * 0.18,
          borderBottomColor: "#e8820a",
          borderLeftColor: "#fdba74",
          animation: "spin-ccw .7s linear infinite",
        }}
      />
      {/* Titik pusat bercahaya */}
      <span
        className="rounded-full bg-gradient-to-br from-orange-400 to-amber-500"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          boxShadow: "0 0 14px rgba(245,130,10,.6)",
          animation: "core-pulse 1.2s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ── Tiga titik melompat ──
function BouncingDots({ dot = "w-1.5 h-1.5", color = "bg-orange-400", gap = "gap-1.5" }) {
  return (
    <div className={`flex items-center ${gap}`}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`${dot} ${color} rounded-full`}
          style={{ animation: `dot-bounce 1.1s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  );
}

// ── Overlay loading penuh untuk modal saat menyimpan ──
function SavingOverlay() {
  return (
    <div
      className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/85 backdrop-blur-sm overflow-hidden"
      style={{ animation: "overlay-in .25s ease-out both" }}
    >
      {/* Nuansa gradasi lembut di latar overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-transparent to-amber-50/70" />

      <div className="relative" style={{ animation: "pop-in .3s ease-out both" }}>
        <SavingSpinner size={64} />
      </div>

      <div className="relative flex flex-col items-center gap-2.5">
        <p
          className="text-sm font-bold bg-clip-text text-transparent bg-[length:200%_auto]"
          style={{
            backgroundImage: "linear-gradient(90deg,#9ca3af 30%,#f5820a 50%,#9ca3af 70%)",
            animation: "text-shimmer 1.8s linear infinite",
          }}
        >
          Menyimpan konfirmasi…
        </p>
        <BouncingDots />
        <p className="text-[10.5px] text-gray-400 font-medium">Mohon tunggu sebentar, jangan tutup halaman</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── TOAST SUKSES — muncul otomatis setelah submit selesai ──
//    Slide-up spring + checkmark tergambar + confetti + ring ping
//    + progress bar auto-dismiss + animasi keluar halus
// ══════════════════════════════════════════════════════════════
function SuccessToast({ show, duration = 2500 }) {
  const [mounted, setMounted] = useState(show);
  const [leaving, setLeaving] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (show) {
      setMounted(true);
      setLeaving(false);
      setRunId(id => id + 1); // paksa replay semua animasi tiap muncul
    } else if (mounted) {
      setLeaving(true);
      const t = setTimeout(() => { setMounted(false); setLeaving(false); }, 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[70]"
      style={{ animation: `${leaving ? "toast-out .35s ease-in both" : "toast-in .5s cubic-bezier(.34,1.56,.64,1) both"}` }}
    >
      <div
        key={runId}
        className="relative overflow-hidden flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-400 text-white pl-3.5 pr-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 min-w-[270px]"
      >
        {/* Partikel confetti yang berjatuhan */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className="absolute top-1 w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              background: ["#fde68a", "#f9a8d4", "#93c5fd", "#ffffff", "#fdba74", "#6ee7b7"][i],
              left: `${12 + i * 15}%`,
              "--tx": `${(i % 2 === 0 ? -1 : 1) * (6 + i * 3)}px`,
              animation: `confetti .9s ease-out ${0.15 + i * 0.07}s both`,
            }}
          />
        ))}

        {/* Badge checkmark: ring ping + pop + garis centang tergambar */}
        <span className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/30" style={{ animation: "ping-ring 1s ease-out .2s both" }} />
          <span
            className="relative w-9 h-9 rounded-full bg-white/25 backdrop-blur flex items-center justify-center"
            style={{ animation: "check-pop .45s cubic-bezier(.34,1.56,.64,1) .1s both" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: "check-draw .35s ease-out .35s forwards" }}
              />
            </svg>
          </span>
        </span>

        {/* Teks */}
        <div className="relative flex flex-col">
          <p className="text-sm font-black leading-tight tracking-tight">Data Berhasil Disimpan!</p>
          <p className="text-[11px] text-white/85 font-medium mt-0.5">Konfirmasi Anda sudah tercatat di spreadsheet</p>
        </div>

        {/* Progress bar — menunjukkan sisa waktu sebelum toast hilang */}
        <span
          className="absolute bottom-0 left-0 h-[3px] bg-white/50 rounded-full"
          style={{ animation: `toast-progress ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

// ── Stat Card (dashboard atas) — responsif untuk HP ──
function StatCard({ label, value, sub, icon, variant, onClick, isActive, className = "" }) {
  const styles = {
    orange: { card: "bg-[#f5820a] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
    rose: { card: "bg-[#e11d48] text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/65" },
    emerald: { card: "bg-emerald-500 text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/70" },
    blue: { card: "bg-blue-500 text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/70" },
    indigo: { card: "bg-indigo-500 text-white", icon: "bg-white/20", label: "text-white/85", sub: "text-white/70" },
  };
  const s = styles[variant];
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`relative rounded-2xl p-3.5 sm:p-5 overflow-hidden flex flex-col gap-2.5 sm:gap-4 text-left w-full h-full ${s.card} ${className} ${onClick ? "cursor-pointer transition-transform hover:scale-[1.02]" : ""} ${isActive ? "ring-4 ring-white/70" : ""}`}
    >
      <div className="absolute -top-7 -right-7 w-28 h-28 rounded-full bg-white opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 right-7 w-14 h-14 rounded-full bg-white opacity-10 pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <p className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest leading-tight max-w-[130px] ${s.label}`}>{label}</p>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0 ${s.icon}`}>{icon}</div>
      </div>
      <div className="relative">
        <p className="text-2xl sm:text-3xl font-black leading-none tracking-tight">{value}</p>
        {sub && <p className={`text-[11px] sm:text-xs mt-1 ${s.sub}`}>{sub}</p>}
      </div>
    </Comp>
  );
}

// ── Kartu filter kecil untuk panel detail (level 3) ──
function MiniFilterCard({ label, count, color, isActive, onClick }) {
  const palette = {
    emerald: { bg: isActive ? "bg-emerald-500" : "bg-emerald-50", text: isActive ? "text-white" : "text-emerald-700", sub: isActive ? "text-emerald-100" : "text-emerald-500" },
    blue: { bg: isActive ? "bg-blue-500" : "bg-blue-50", text: isActive ? "text-white" : "text-blue-700", sub: isActive ? "text-blue-100" : "text-blue-500" },
    indigo: { bg: isActive ? "bg-indigo-500" : "bg-indigo-50", text: isActive ? "text-white" : "text-indigo-700", sub: isActive ? "text-indigo-100" : "text-indigo-500" },
    rose: { bg: isActive ? "bg-rose-500" : "bg-rose-50", text: isActive ? "text-white" : "text-rose-700", sub: isActive ? "text-rose-100" : "text-rose-500" },
  };
  const s = palette[color];
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left rounded-xl p-3 transition-all duration-150 ${s.bg} ${isActive ? "shadow-sm" : "hover:opacity-90"}`}
    >
      <p className={`text-xl font-black leading-none ${s.text}`}>{count}</p>
      <p className={`text-[10.5px] font-semibold mt-1 leading-tight ${s.sub}`}>{label}</p>
    </button>
  );
}

// ── Kecamatan Card ──
function KecamatanCard({ kecamatan, total, onClick, isSelected }) {
  const color = countColor(total);
  const badge = countBadgeStyle(total);
  const label = countLabel(total);
  return (
    <button onClick={onClick} className="w-full text-left border-0 bg-transparent p-0 cursor-pointer">
      <div className={`rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected ? "border-orange-400 bg-orange-50 shadow-md shadow-orange-100" : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-0.5">Kecamatan</p>
            <p className="text-base font-bold text-gray-800 leading-tight">{kecamatan}</p>
          </div>
          <span className="text-3xl font-black flex-shrink-0" style={{ color }}>{total}</span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.text }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: badge.dot }} />
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Baris Desa (level 1 drill-down) ──
function DesaRow({ desa, total, rank, onDetail }) {
  const badge = countBadgeStyle(total);
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{desa || "-"}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{total} data tidak ditemukan</p>
        </div>
        <span className="text-sm font-black px-3 py-1.5 rounded-xl flex-shrink-0 tabular-nums" style={{ background: badge.bg, color: badge.text }}>
          {total}
        </span>
        <button
          onClick={onDetail}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors flex-shrink-0"
        >
          Detail
        </button>
      </div>
    </div>
  );
}

// ── Baris RT / SLS unik (level 2 drill-down) ──
function SlsRow({ group, rank, onClick }) {
  const badge = countBadgeStyle(group.total);
  return (
    <button onClick={onClick} className="w-full text-left border-0 bg-transparent p-0 cursor-pointer">
      <div className="py-3.5 border-b border-gray-50 last:border-0 group flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-400 transition-colors">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{group.rtNama || "-"}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate font-mono">{group.slsFull || "-"}</p>
        </div>
        <span className="text-sm font-black px-3 py-1.5 rounded-xl flex-shrink-0 tabular-nums" style={{ background: badge.bg, color: badge.text }}>
          {group.total}
        </span>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}

// ── Kartu Assignment (level 3) ──
// isSaving: true saat item ini sedang dalam proses submit konfirmasi
// ── Kartu Assignment (level 3) ──
// isSaving: true saat item ini sedang dalam proses submit konfirmasi
function AssignmentCard({ item, rank, onOpenConfirm, showLocation, isSaving }) {
  const highlighted = hasPrelistUsaha(item);
  const fields = [
    { label: "Alamat", value: item.alamat },
    { label: "IDSBR", value: item.idsbr },
    { label: "Jenis Prelist", value: item.jenisPrelist },
    { label: "Keberadaan", value: item.keberadaan },
    { label: "Catatan", value: item.catatan },
    { label: "Prelist Keluarga Tujuan", value: item.prelistUsaha },
    { label: "Nomor Bangunan Keluarga", value: item.nomorBangunan },
  ];

  // Penjelasan (kolom AD) HANYA tampil jika konfirmasi = "Data sudah sesuai"
  const showPenjelasan = item.konfirmasi === "Data sudah sesuai" && item.penjelasan;

  return (
    <div
      className={`relative py-4 border-b border-gray-50 last:border-0 transition-colors duration-300 ${highlighted ? "bg-emerald-50 -mx-6 px-6 rounded-lg border-b-0" : ""
        }`}
    >
      <div className="flex items-start gap-3 mb-2">
        <span className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 leading-snug">{item.namaAssignment || "-"}</p>
          {showLocation && (
            <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">
              {item.kecamatan} · {item.desa} · RT {item.rtNama || "-"} · {item.slsFull || "-"}
            </p>
          )}
        </div>
        {highlighted && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5">
            Prelist Usaha Terindikasi Usaha Keluarga
          </span>
        )}
      </div>
      <div className="pl-9 grid grid-cols-1 gap-1.5">
        {fields.map(f => (
          <div key={f.label} className="flex items-baseline gap-2">
            <span className="text-[10.5px] text-gray-400 font-semibold uppercase tracking-widest w-24 flex-shrink-0">{f.label}</span>
            <span className="text-xs font-medium text-gray-700 break-words">{f.value || "-"}</span>
          </div>
        ))}
      </div>
      <div className="pl-9 mt-3 flex items-center gap-2 flex-wrap">
        {/* Tombol Konfirmasi HANYA muncul jika kolom konfirmasi benar-benar kosong */}
        {isSaving ? (
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 shadow-sm"
            style={{ animation: "pop-in .2s ease-out both" }}
          >
            <BouncingDots dot="w-1 h-1" color="bg-orange-500" gap="gap-[3px]" />
            Menyimpan…
          </span>
        ) : !item.konfirmasi ? (
          <button
            onClick={() => onOpenConfirm(item)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            Konfirmasi
          </button>
        ) : (
          <div className="w-full">
            {/* ── Baris status konfirmasi ── */}
            <span className="text-[11px] text-gray-500">
              Status: <span className="font-semibold text-gray-700">{item.konfirmasi}</span>
            </span>

            {/* ── Baris Penjelasan (kolom AD) — hanya jika konfirmasi "Data sudah sesuai" ── */}
            {showPenjelasan && (
              <div
                className="mt-2 rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2.5"
                style={{ animation: "pop-in .25s ease-out both" }}
              >
                <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mb-0.5">
                  Penjelasan
                </p>
                <p className="text-xs font-medium text-gray-700 break-words leading-relaxed">
                  {item.penjelasan}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel hasil filter global (dari 3 kartu kondisi di dashboard atas) ──
function GlobalFilterPanel({ title, items, search, onSearchChange, onBack, onOpenConfirm, savingRowNumber }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
        <button onClick={onBack} className="text-orange-100 text-[11px] font-semibold mb-1 flex items-center gap-1 hover:text-white">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Dashboard
        </button>
        <h2 className="text-white text-xl font-black">{title}</h2>
        <p className="text-orange-100 text-sm mt-1">{items.length} data ditemukan</p>
      </div>
      <div className="px-6 py-4">
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari kecamatan / desa / RT / nama assignment…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Tidak ada data untuk kondisi ini.</p>
          ) : (
            items.map((item, i) => (
              <AssignmentCard
                key={`${item.namaAssignment}-${item.rowNumber}`}
                item={item}
                rank={i + 1}
                onOpenConfirm={onOpenConfirm}
                showLocation
                isSaving={savingRowNumber === item.rowNumber}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal konfirmasi (menulis ke kolom AC dan, jika perlu, AD) ──
function ConfirmModal({ item, onClose, onSubmit, submitting, errorMsg }) {
  const [pilihan, setPilihan] = useState(item.konfirmasi || "");
  const [penjelasan, setPenjelasan] = useState(item.penjelasan || "");

  const needsPenjelasan = pilihan === "Data sudah sesuai";
  const canSubmit = pilihan !== "" && (!needsPenjelasan || penjelasan.trim() !== "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {/* ── Overlay animasi loading estetik saat sedang menyimpan ── */}
        {submitting && <SavingOverlay />}

        <div className="flex items-start justify-between mb-1">
          <h3 className="text-base font-bold text-gray-800">Konfirmasi Data</h3>
          <button onClick={onClose} disabled={submitting} className="text-gray-300 hover:text-gray-500 p-1 flex-shrink-0 disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4 break-words">{item.namaAssignment || "-"}</p>

        <div className="space-y-2 mb-4">
          {KONFIRMASI_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors ${submitting ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${pilihan === opt.value ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
            >
              <input
                type="radio"
                name="konfirmasi"
                value={opt.value}
                checked={pilihan === opt.value}
                onChange={() => setPilihan(opt.value)}
                disabled={submitting}
                className="accent-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>

        {needsPenjelasan && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">
              Penjelasan
            </label>
            <textarea
              value={penjelasan}
              onChange={e => setPenjelasan(e.target.value)}
              rows={3}
              disabled={submitting}
              placeholder="Jelaskan kesesuaian data…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none disabled:opacity-60"
            />
          </div>
        )}

        {errorMsg && <p className="text-xs text-rose-500 mb-3">{errorMsg}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={() => onSubmit(item, pilihan, needsPenjelasan ? penjelasan.trim() : "")}
            disabled={!canSubmit || submitting}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <span
                className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block"
                style={{ animation: "spin-cw .7s linear infinite" }}
              />
            )}
            {submitting ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ──
export default function MonitoringPetugas() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [search, setSearch] = useState("");       // cari kecamatan
  const [selectedKec, setSelectedKec] = useState(null);

  const [searchDesa, setSearchDesa] = useState("");        // cari desa
  const [selectedDesa, setSelectedDesa] = useState(null);

  const [searchSls, setSearchSls] = useState("");        // cari RT/SLS
  const [selectedSlsKey, setSelectedSlsKey] = useState(null); // level 3: grup RT/SLS terpilih
  const [keberadaanFilter, setKeberadaanFilter] = useState(""); // filter keberadaan pada level assignment
  const [detailCategoryFilter, setDetailCategoryFilter] = useState(null); // "prelist" | "konf1" | "konf2" | "belum" | null

  // ── State filter kartu global (dashboard atas) ──
  const [globalFilter, setGlobalFilter] = useState(null); // "prelist" | "konf1" | "konf2" | null
  const [globalSearch, setGlobalSearch] = useState("");

  // ── State modal konfirmasi ──
  const [confirmItem, setConfirmItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const detailRef = useRef(null);
  const tableRef = useRef(null);
  const toastTimerRef = useRef(null);

  // ── Ambil data dari spreadsheet. silent=true -> tidak menampilkan loading layar penuh ──
  const loadData = useCallback(({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    return fetch(`${CSV_DATA}&t=${Date.now()}`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Gagal mengambil data."); return r.text(); })
      .then(text => {
        setRows(rowsFromCsvText(text));
        setLastUpdated(new Date());
        if (!silent) setLoading(false);
      })
      .catch(e => {
        if (!silent) { setError(e.message); setLoading(false); }
      });
  }, []);

  // ── Load data awal ──
  useEffect(() => { loadData(); }, [loadData]);

  // ── Reset saat ganti kecamatan / desa / grup RT-SLS ──
  useEffect(() => { setSelectedDesa(null); setSearchDesa(""); if (tableRef.current) tableRef.current.scrollTop = 0; }, [selectedKec]);
  useEffect(() => { setSearchSls(""); setSelectedSlsKey(null); if (tableRef.current) tableRef.current.scrollTop = 0; }, [selectedDesa]);
  useEffect(() => { setKeberadaanFilter(""); setDetailCategoryFilter(null); if (tableRef.current) tableRef.current.scrollTop = 0; }, [selectedSlsKey]);

  // ── Bersihkan timer toast saat komponen unmount ──
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showSavedToast = () => {
    setSavedToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSelectKec = (kec) => {
    setGlobalFilter(null); // keluar dari mode filter global saat memilih kecamatan
    const next = selectedKec === kec ? null : kec;
    setSelectedKec(next);
    if (next && window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  // ── Toggle kartu filter global (dashboard atas) ──
  const handleToggleGlobalFilter = (key) => {
    setGlobalFilter(prev => (prev === key ? null : key));
    setGlobalSearch("");
    setSelectedKec(null); // keluar dari mode drill-down kecamatan
  };

  // ── Kirim konfirmasi ke Apps Script, update optimistik, lalu sinkronkan ulang di latar belakang ──
  const handleSubmitKonfirmasi = async (item, pilihan, penjelasan) => {
    setSubmitting(true);
    setConfirmError("");
    try {
      await postKonfirmasi(item.rowNumber, pilihan, penjelasan);

      // Update optimistik: data di halaman langsung berubah tanpa menunggu refetch
      setRows(prev => prev.map(r =>
        r.rowNumber === item.rowNumber ? { ...r, konfirmasi: pilihan, penjelasan } : r
      ));
      setConfirmItem(null);
      showSavedToast(); // ← toast sukses beranimasi muncul di sini, setelah submit selesai

      // Sinkronisasi ulang di latar belakang (tanpa loading layar penuh)
      loadData({ silent: true });
    } catch (e) {
      setConfirmError("Gagal menyimpan konfirmasi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Row number yang sedang disimpan (dipakai di level 3 & panel global) ──
  const savingRowNumber = submitting ? confirmItem?.rowNumber : null;

  // ── Total keseluruhan ──
  // ── Total belum dikonfirmasi: hanya baris dengan kolom konfirmasi MASIH KOSONG ──
  const totalAll = useMemo(
    () => rows.filter(r => !(r.konfirmasi || "").trim()).length,
    [rows]
  );
  // ── Agregat 3 kondisi untuk kartu dashboard ──
  const globalPrelistCount = useMemo(() => rows.filter(hasPrelistUsaha).length, [rows]);
  const globalKonf1Count = useMemo(() => rows.filter(r => r.konfirmasi === "Ada dan sudah diperbaiki di FASIH").length, [rows]);
  const globalKonf2Count = useMemo(() => rows.filter(r => r.konfirmasi === "Data sudah sesuai").length, [rows]);

  // ── Daftar hasil filter global ──
  const globalFilteredList = useMemo(() => {
    if (!globalFilter) return [];
    let list = rows;
    if (globalFilter === "prelist") list = list.filter(hasPrelistUsaha);
    if (globalFilter === "konf1") list = list.filter(r => r.konfirmasi === "Ada dan sudah diperbaiki di FASIH");
    if (globalFilter === "konf2") list = list.filter(r => r.konfirmasi === "Data sudah sesuai");
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter(r =>
        (r.namaAssignment || "").toLowerCase().includes(q) ||
        (r.kecamatan || "").toLowerCase().includes(q) ||
        (r.desa || "").toLowerCase().includes(q) ||
        (r.rtNama || "").toLowerCase().includes(q) ||
        (r.slsFull || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, globalFilter, globalSearch]);

  const globalFilterTitle = globalFilter === "prelist" ? "Data dengan Prelist Usaha"
    : globalFilter === "konf1" ? "Konfirmasi: Ada dan Sudah Diperbaiki di FASIH"
      : globalFilter === "konf2" ? "Konfirmasi: Data Sudah Sesuai"
        : "";

  // ── Agregasi per Kecamatan ──
  const kecamatanAgg = useMemo(() => {
    const map = new Map();
    rows.forEach(r => { map.set(r.kecamatan, (map.get(r.kecamatan) || 0) + 1); });
    return Array.from(map.entries())
      .map(([kecamatan, total]) => ({ kecamatan, total }))
      .sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
  }, [rows]);

  const kecamatanList = useMemo(() =>
    kecamatanAgg.filter(k => search === "" || k.kecamatan.toLowerCase().includes(search.toLowerCase()))
    , [kecamatanAgg, search]);

  // ── Agregasi Desa dalam Kecamatan terpilih ──
  const desaAgg = useMemo(() => {
    if (!selectedKec) return [];
    const map = new Map();
    rows.forEach(r => { if (r.kecamatan === selectedKec) map.set(r.desa, (map.get(r.desa) || 0) + 1); });
    return Array.from(map.entries())
      .map(([desa, total]) => ({ desa, total }))
      .sort((a, b) => a.desa.localeCompare(b.desa));
  }, [rows, selectedKec]);

  const desaList = useMemo(() =>
    desaAgg.filter(d => searchDesa === "" || d.desa.toLowerCase().includes(searchDesa.toLowerCase()))
    , [desaAgg, searchDesa]);

  // ── Grup RT/SLS unik dalam Desa terpilih ──
  const slsGroupAgg = useMemo(() => {
    if (!selectedKec || !selectedDesa) return [];
    const map = new Map();
    rows.forEach(r => {
      if (r.kecamatan !== selectedKec || r.desa !== selectedDesa) return;
      const key = `${r.rtNama}||${r.slsFull}`;
      if (!map.has(key)) map.set(key, { key, rtNama: r.rtNama, slsFull: r.slsFull, total: 0, items: [] });
      const g = map.get(key);
      g.total += 1;
      g.items.push(r);
    });
    return Array.from(map.values()).sort((a, b) => a.rtNama.localeCompare(b.rtNama) || a.slsFull.localeCompare(b.slsFull));
  }, [rows, selectedKec, selectedDesa]);

  const slsGroupList = useMemo(() =>
    slsGroupAgg.filter(g =>
      searchSls === "" ||
      (g.rtNama || "").toLowerCase().includes(searchSls.toLowerCase()) ||
      (g.slsFull || "").toLowerCase().includes(searchSls.toLowerCase())
    )
    , [slsGroupAgg, searchSls]);

  const selectedSlsGroup = useMemo(() =>
    slsGroupAgg.find(g => g.key === selectedSlsKey) || null
    , [slsGroupAgg, selectedSlsKey]);

  // ── Opsi filter Keberadaan (kolom Y) untuk grup assignment terpilih ──
  const keberadaanOptions = useMemo(() => {
    if (!selectedSlsGroup) return [];
    const map = new Map();
    selectedSlsGroup.items.forEach(it => {
      const val = it.keberadaan || "-";
      map.set(val, (map.get(val) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([value, total]) => ({ value, total }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [selectedSlsGroup]);

  // ── Hitungan kondisi (Prelist Usaha / Konfirmasi 1 / Konfirmasi 2 / Belum Konfirmasi) ──
  const categoryCounts = useMemo(() => {
    if (!selectedSlsGroup) return { prelist: 0, konf1: 0, konf2: 0, belum: 0 };
    const items = selectedSlsGroup.items;
    return {
      prelist: items.filter(hasPrelistUsaha).length,
      konf1: items.filter(it => it.konfirmasi === "Ada dan sudah diperbaiki di FASIH").length,
      konf2: items.filter(it => it.konfirmasi === "Data sudah sesuai").length,
      belum: items.filter(it => !(it.konfirmasi || "").trim()).length,
    };
  }, [selectedSlsGroup]);

  const filteredAssignmentItems = useMemo(() => {
    if (!selectedSlsGroup) return [];
    let items = selectedSlsGroup.items;
    if (keberadaanFilter) items = items.filter(it => (it.keberadaan || "-") === keberadaanFilter);
    if (detailCategoryFilter === "prelist") items = items.filter(hasPrelistUsaha);
    if (detailCategoryFilter === "konf1") items = items.filter(it => it.konfirmasi === "Ada dan sudah diperbaiki di FASIH");
    if (detailCategoryFilter === "konf2") items = items.filter(it => it.konfirmasi === "Data sudah sesuai");
    if (detailCategoryFilter === "belum") items = items.filter(it => !(it.konfirmasi || "").trim());
    return items;
  }, [selectedSlsGroup, keberadaanFilter, detailCategoryFilter]);

  // ── Judul & total pada header panel, tergantung level ──
  const panelLevel = selectedSlsGroup ? 3 : selectedDesa ? 2 : 1;
  const panelTitle = panelLevel === 3 ? selectedSlsGroup.rtNama : panelLevel === 2 ? selectedDesa : selectedKec;
  const panelTotal = panelLevel === 3 ? selectedSlsGroup.total
    : panelLevel === 2 ? slsGroupAgg.reduce((s, g) => s + g.total, 0)
      : (kecamatanAgg.find(k => k.kecamatan === selectedKec)?.total || 0);

  // ── Target export sesuai level panel yang sedang dibuka ──
  const exportTarget = useMemo(() => {
    if (panelLevel === 3 && selectedSlsGroup) {
      return {
        fileLabel: `${selectedKec} - ${selectedDesa} - RT ${selectedSlsGroup.rtNama || "-"}`,
        buttonLabel: `RT ${selectedSlsGroup.rtNama || "-"}`,
        data: selectedSlsGroup.items,
      };
    }
    if (panelLevel === 2 && selectedKec && selectedDesa) {
      return {
        fileLabel: `${selectedKec} - ${selectedDesa}`,
        buttonLabel: `Desa ${selectedDesa}`,
        data: rows.filter(r => r.kecamatan === selectedKec && r.desa === selectedDesa),
      };
    }
    return {
      fileLabel: selectedKec || "Data",
      buttonLabel: `Kec. ${selectedKec || "-"}`,
      data: rows.filter(r => r.kecamatan === selectedKec),
    };
  }, [panelLevel, selectedKec, selectedDesa, selectedSlsGroup, rows]);

  const handleBack = () => {
    if (panelLevel === 3) setSelectedSlsKey(null);
    else if (panelLevel === 2) setSelectedDesa(null);
    else setSelectedKec(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      {/* ── Keyframes animasi loading & toast (dirender sekali) ── */}
      <LoadingKeyframes />

      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight">Prelist Perlu Dikonfirmasi</h1>
              <p className="text-orange-100 mt-1">Sensus Ekonomi 2026</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white opacity-5" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <SavingSpinner size={56} />
            <div className="flex flex-col items-center gap-2">
              <p
                className="text-sm font-bold bg-clip-text text-transparent bg-[length:200%_auto]"
                style={{
                  backgroundImage: "linear-gradient(90deg,#9ca3af 30%,#f5820a 50%,#9ca3af 70%)",
                  animation: "text-shimmer 1.8s linear infinite",
                }}
              >
                Mengambil data dari spreadsheet…
              </p>
              <BouncingDots />
            </div>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-4">
            <p className="text-rose-600 font-semibold">Gagal memuat data</p>
            <p className="text-rose-400 text-sm mt-1">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            {/* ── 5 Kartu Statistik: 2 kolom di HP, 5 kolom di desktop ── */}
            <div className="grid grid-cols-2 gap-3 mb-8 lg:grid-cols-5">
              <StatCard
                label="Jumlah Kecamatan"
                value={kecamatanAgg.length}
                sub="wilayah kerja"
                icon="🗺️"
                variant="orange"
              />
              <StatCard
                label="Total Belum Dikonfirmasi"
                value={totalAll}
                sub="seluruh baris data"
                icon="⚠️"
                variant="rose"
              />
              <StatCard
                label=" Prelist Usaha Terindikasi Usaha Keluarga "
                value={globalPrelistCount}
                sub="klik untuk lihat daftar"
                icon="🏪"
                variant="emerald"
                isActive={globalFilter === "prelist"}
                onClick={() => handleToggleGlobalFilter("prelist")}
              />
              <StatCard
                label="Ada & Sudah Diperbaiki di FASIH"
                value={globalKonf1Count}
                sub="klik untuk lihat daftar"
                icon="✅"
                variant="blue"
                isActive={globalFilter === "konf1"}
                onClick={() => handleToggleGlobalFilter("konf1")}
              />
              <StatCard
                label="Data Sudah Sesuai"
                value={globalKonf2Count}
                sub="klik untuk lihat daftar"
                icon="📋"
                variant="indigo"
                className="col-span-2 lg:col-span-1"
                isActive={globalFilter === "konf2"}
                onClick={() => handleToggleGlobalFilter("konf2")}
              />
            </div>
            {globalFilter ? (
              /* ── Mode filter global aktif ── */
              <GlobalFilterPanel
                title={globalFilterTitle}
                items={globalFilteredList}
                search={globalSearch}
                onSearchChange={setGlobalSearch}
                onBack={() => setGlobalFilter(null)}
                onOpenConfirm={setConfirmItem}
                savingRowNumber={savingRowNumber}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input type="text" placeholder="Cari nama kecamatan…" value={search}
                      onChange={e => { setSearch(e.target.value); setSelectedKec(null); }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 w-full min-w-0">
                  {/* ── Kolom kiri: kartu kecamatan ── */}
                  <div className="w-full min-w-0 lg:w-[55%] grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 content-start">
                    {kecamatanList.map(({ kecamatan, total }) => (
                      <KecamatanCard key={kecamatan} kecamatan={kecamatan} total={total} isSelected={selectedKec === kecamatan} onClick={() => handleSelectKec(kecamatan)} />
                    ))}
                  </div>

                  {/* ── Kolom kanan: panel drill-down ── */}
                  <div ref={detailRef} className="w-full min-w-0 lg:w-[45%]">
                    {!selectedKec ? (
                      <div className="sticky top-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 text-center px-8">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                          <svg className="w-7 h-7 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <p className="font-semibold text-gray-600">Pilih Kecamatan</p>
                        <p className="text-gray-400 text-sm mt-1">Klik kartu kecamatan untuk melihat daftar desa.</p>
                      </div>
                    ) : (
                      <div className="sticky top-6 w-full min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                                {panelLevel === 3 ? "RT / SLS" : panelLevel === 2 ? "Desa" : "Kecamatan"}
                              </p>
                              {panelLevel > 1 && (
                                <button onClick={handleBack} className="text-orange-100 text-[11px] font-semibold mb-1 flex items-center gap-1 hover:text-white">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                  {panelLevel === 3 ? selectedDesa : selectedKec}
                                </button>
                              )}
                              <h2 className="text-white text-xl font-black truncate">{panelTitle}</h2>
                            </div>
                            <button
                              onClick={() => { if (panelLevel === 3) { setSelectedSlsKey(null); } else if (panelLevel === 2) { setSelectedDesa(null); } else { setSelectedKec(null); } }}
                              className="text-orange-200 hover:text-white transition-colors mt-1 p-1 flex-shrink-0"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-white text-sm">
                            <span className="opacity-80">Total </span>
                            <span className="font-black text-lg">{panelTotal}</span>
                          </div>
                          <button
                            onClick={() => exportKecamatanToExcel(exportTarget.fileLabel, exportTarget.data)}
                            disabled={exportTarget.data.length === 0}
                            className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                            Export Excel — {exportTarget.buttonLabel} ({exportTarget.data.length})
                          </button>
                        </div>

                        <div ref={tableRef} className="px-6 py-2 max-h-[500px] overflow-y-auto">
                          {panelLevel === 1 && (
                            <>
                              <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                                <div className="relative mb-2">
                                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                  </svg>
                                  <input type="text" placeholder="Cari nama desa…" value={searchDesa}
                                    onChange={e => setSearchDesa(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300" />
                                </div>
                                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                  <span className="text-xs text-gray-400 w-6 text-center">#</span>
                                  <span className="text-xs text-gray-400 flex-1">Nama Desa</span>
                                </div>
                              </div>
                              {desaList.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8">Tidak ada data desa di kecamatan ini.</p>
                              ) : (
                                desaList.map((d, i) => (
                                  <DesaRow key={d.desa} desa={d.desa} total={d.total} rank={i + 1} onDetail={() => setSelectedDesa(d.desa)} />
                                ))
                              )}
                            </>
                          )}

                          {panelLevel === 2 && (
                            <>
                              <div className="sticky top-0 bg-white pt-2 pb-2 z-10">
                                <div className="relative mb-2">
                                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                  </svg>
                                  <input type="text" placeholder="Cari RT / SLS…" value={searchSls}
                                    onChange={e => setSearchSls(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300" />
                                </div>
                                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                  <span className="text-xs text-gray-400 w-6 text-center">#</span>
                                  <span className="text-xs text-gray-400 flex-1">RT · Kode SLS</span>
                                  <span className="text-xs text-gray-400 w-12 text-center">Jumlah</span>
                                </div>
                              </div>
                              {slsGroupList.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8">Tidak ada data RT/SLS di desa ini.</p>
                              ) : (
                                slsGroupList.map((g, i) => (
                                  <SlsRow key={g.key} group={g} rank={i + 1} onClick={() => setSelectedSlsKey(g.key)} />
                                ))
                              )}
                            </>
                          )}

                          {panelLevel === 3 && selectedSlsGroup && (
                            <>
                              <div className="sticky top-0 bg-white pt-2 pb-3 z-10">
                                {/* Filter kategori kondisi */}
                                <div className="flex gap-2 mb-2">
                                  <MiniFilterCard label="Prelist Usaha Terindikasi Usaha Keluarga" count={categoryCounts.prelist} color="emerald" isActive={detailCategoryFilter === "prelist"} onClick={() => setDetailCategoryFilter(prev => (prev === "prelist" ? null : "prelist"))} />
                                  <MiniFilterCard label="Ada & Sudah Diperbaiki di FASIH" count={categoryCounts.konf1} color="blue" isActive={detailCategoryFilter === "konf1"} onClick={() => setDetailCategoryFilter(prev => (prev === "konf1" ? null : "konf1"))} />
                                  <MiniFilterCard label="Data Sesuai" count={categoryCounts.konf2} color="indigo" isActive={detailCategoryFilter === "konf2"} onClick={() => setDetailCategoryFilter(prev => (prev === "konf2" ? null : "konf2"))} />
                                  <MiniFilterCard label="Belum Konfirmasi" count={categoryCounts.belum} color="rose" isActive={detailCategoryFilter === "belum"} onClick={() => setDetailCategoryFilter(prev => (prev === "belum" ? null : "belum"))} />
                                </div>
                                {/* Filter Keberadaan */}
                                <div className="relative">
                                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  <select value={keberadaanFilter} onChange={e => setKeberadaanFilter(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none">
                                    <option value="">Semua Keberadaan</option>
                                    {keberadaanOptions.map(o => (
                                      <option key={o.value} value={o.value}>{o.value} ({o.total})</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              {filteredAssignmentItems.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8">Tidak ada data untuk filter ini.</p>
                              ) : (
                                filteredAssignmentItems.map((item, i) => (
                                  <AssignmentCard
                                    key={`${item.namaAssignment}-${item.rowNumber}`}
                                    item={item}
                                    rank={i + 1}
                                    onOpenConfirm={setConfirmItem}
                                    isSaving={savingRowNumber === item.rowNumber}
                                  />
                                ))
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Toast sukses beranimasi (muncul otomatis setelah submit selesai) ── */}
        <SuccessToast show={savedToast} />

        {/* ── Modal konfirmasi ── */}
        {confirmItem && (
          <ConfirmModal
            item={confirmItem}
            onClose={() => { setConfirmItem(null); setConfirmError(""); }}
            onSubmit={handleSubmitKonfirmasi}
            submitting={submitting}
            errorMsg={confirmError}
          />
        )}
      </main>
    </div>
  );
}