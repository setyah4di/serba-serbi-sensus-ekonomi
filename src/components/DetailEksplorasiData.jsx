import { useState, useEffect, useRef } from "react";

// ── GANTI dengan URL deployment Apps Script kamu (lihat Code.gs) ──
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzJpyFu3YdH1VxySlzD6J7QdEIMoPhy_GUYrMOXJdwmXDZo68HPibanNKmd9pGP0EOE/exec";

// Sesuaikan teks opsi ini kalau data validation di kolom R spreadsheet kamu berbeda.
const OPSI_HASIL_KONFIRMASI = [
  { value: "", label: "— Belum Dikonfirmasi —" },
  { value: "01 Sudah Sesuai", label: "01 Sudah Sesuai" },
  { value: "02 Perlu Diperbaiki", label: "02 Perlu Diperbaiki" },
];

// Kolom "Ditindaklanjuti Korwil" (T) hanya relevan/ditampilkan ketika
// Hasil Konfirmasi = "Perlu Diperbaiki".
const OPSI_KORWIL = [
  { value: "", label: "— Belum Ditindaklanjuti —" },
  { value: "01 Sudah Ditangani Korwil", label: "01 Sudah Ditangani Korwil" },
];

export default function DetailEksplorasiData({ row, onClose, onSaved }) {
  const [hasilKonfirmasi, setHasilKonfirmasi] = useState(row?.hasilKonfirmasi || "");
  const [keterangan, setKeterangan] = useState(row?.keteranganKabkota || "");
  const [ditindaklanjutiKorwil, setDitindaklanjutiKorwil] = useState(row?.ditindaklanjutiKorwil || "");
  const [phase, setPhase] = useState("idle"); // idle | saving | success
  const [saveError, setSaveError] = useState(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); };
  }, []);

  if (!row) return null;

  const isBusy = phase !== "idle";
  const isPerluDiperbaiki = hasilKonfirmasi.trim().startsWith("02");

  const isDirty =
    hasilKonfirmasi !== (row.hasilKonfirmasi || "") ||
    keterangan !== (row.keteranganKabkota || "") ||
    (isPerluDiperbaiki && ditindaklanjutiKorwil !== (row.ditindaklanjutiKorwil || ""));

  const handleSave = async () => {
    setPhase("saving");
    setSaveError(null);
    try {
      const payload = {
        rowNumber: row.rowNumber,
        assignmentId: row.assignmentId,
        penjelasanCase: row.penjelasanCase,
        hasilKonfirmasi,
        keteranganKabkota: keterangan,
      };
      // Kolom T hanya dikirim (dan ditulis ke sheet) kalau statusnya "Perlu Diperbaiki".
      // Kalau tidak, biarkan Apps Script tidak menyentuh kolom T sama sekali.
      if (isPerluDiperbaiki) {
        payload.ditindaklanjutiKorwil = ditindaklanjutiKorwil;
      }

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        // text/plain menghindari CORS preflight yang tidak didukung Apps Script secara default
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Gagal menyimpan perubahan.");

      const updatedRow = {
        ...row,
        hasilKonfirmasi,
        keteranganKabkota: keterangan,
        ditindaklanjutiKorwil: isPerluDiperbaiki ? ditindaklanjutiKorwil : row.ditindaklanjutiKorwil,
      };
      onSaved?.(updatedRow);
      setPhase("success");

      closeTimeoutRef.current = setTimeout(() => onClose(), 1800);
    } catch (err) {
      setSaveError(err.message);
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
                  <span className="text-xl">📊</span>
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
              <p className="text-sm text-gray-500">Mohon tunggu…</p>
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
                <p className="text-gray-500 mt-1">Perubahan telah tersimpan ke spreadsheet</p>
              </div>
              <div className="w-40 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500 animate-toastProgress" />
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fadeIn flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex-shrink-0" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Detail Case</p>
              <h2 className="text-white text-lg font-black leading-tight">{row.data1 || "-"}</h2>
              <p className="text-orange-100 text-xs mt-0.5">{row.namaKelurahan} · {row.namaKecamatan}</p>
            </div>
            <button onClick={onClose} disabled={isBusy} className="text-orange-200 hover:text-white transition-colors mt-1 p-1 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 relative">
          <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 w-1/3 align-top">SLS</td>
                <td className="px-3 py-2.5 text-gray-700">{row.namaSls || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Nama Keluarga</td>
                <td className="px-3 py-2.5 text-gray-700">{row.data1 || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Nomor Bangunan</td>
                <td className="px-3 py-2.5 text-gray-700">{row.nomorBangunan || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Nilai Isian Rincian Pertama</td>
                <td className="px-3 py-2.5 text-gray-700">{row.isianRincian1 || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Nilai Isian Rincian Kedua</td>
                <td className="px-3 py-2.5 text-gray-700">{row.isianRincian2 || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Penjelasan Case</td>
                <td className="px-3 py-2.5 text-gray-700 leading-relaxed whitespace-pre-line">{row.penjelasanCase || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Keterangan Case</td>
                <td className="px-3 py-2.5 text-gray-700 leading-relaxed whitespace-pre-line">{row.keteranganCase || "-"}</td>
              </tr>

              {/* ── Hasil Konfirmasi (kolom R, editable) ── */}
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Hasil Konfirmasi</td>
                <td className="px-3 py-2.5">
                  <select
                    value={hasilKonfirmasi}
                    onChange={e => {
                      const val = e.target.value;
                      setHasilKonfirmasi(val);
                      // Kalau berubah jadi bukan "Perlu Diperbaiki", reset pilihan korwil di form
                      // (tidak akan ikut dikirim/menimpa kolom T karena hanya dikirim saat "02").
                      if (!val.trim().startsWith("02")) setDitindaklanjutiKorwil(row.ditindaklanjutiKorwil || "");
                    }}
                    disabled={isBusy}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {OPSI_HASIL_KONFIRMASI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>

              {/* ── Keterangan → tersimpan ke kolom S "catatan dari kabkota" ── */}
              <tr className={isPerluDiperbaiki ? "border-b border-gray-100" : ""}>
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Keterangan</td>
                <td className="px-3 py-2.5">
                  <textarea
                    value={keterangan}
                    onChange={e => setKeterangan(e.target.value)}
                    rows={3}
                    disabled={isBusy}
                    placeholder="berikan penjelasan mengapa sudah sesuai? atau tuliskan rincian yang perlu diperbaiki dan nilainya"
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
              </tr>

              {/* ── Ditindaklanjuti Korwil (kolom T) — hanya muncul kalau "Perlu Diperbaiki" ── */}
              {isPerluDiperbaiki && (
                <tr>
                  <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Ditindaklanjuti<br />Korwil</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={ditindaklanjutiKorwil}
                      onChange={e => setDitindaklanjutiKorwil(e.target.value)}
                      disabled={isBusy}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      {OPSI_KORWIL.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {row.tautanFasih && (
            <a href={row.tautanFasih} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-blue-600 hover:underline break-all">
              Buka Link Fasih ↗
            </a>
          )}

          {saveError && (
            <div className="mt-3 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-600">
              <span className="text-sm leading-none mt-0.5">⚠️</span>
              <span>{saveError}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={isBusy} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Tutup</button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isBusy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${!isDirty || isBusy ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"}`}
          >
            {phase === "saving" && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {phase === "saving" ? "Menyimpan…" : "Simpan Perubahan"}
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
        .animate-toastProgress{animation:toastProgress 1.8s linear forwards;}

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
