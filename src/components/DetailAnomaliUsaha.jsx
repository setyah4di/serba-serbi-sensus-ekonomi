import { useState } from "react";

// ── GANTI dengan URL deployment Apps Script kamu (lihat Code_AnomaliUsaha.gs) ──
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/PASTE_DEPLOYMENT_ID_DI_SINI/exec";

const OPSI_HASIL_KONFIRMASI = [
  { value: "", label: "— Belum Dikonfirmasi —" },
  { value: "01 Sudah Sesuai", label: "01 Sudah Sesuai" },
  { value: "02 Perlu Diperbaiki", label: "02 Perlu Diperbaiki" },
];

// Catatan: opsi di bawah adalah dugaan awal. Cek langsung dropdown asli di
// kolom "Hasil Konfirmasi Korwil" pada spreadsheet dan sesuaikan kalau berbeda.
const OPSI_KORWIL = [
  { value: "", label: "— Belum Ditindaklanjuti —" },
  { value: "Sudah Ditindaklanjuti", label: "Sudah Ditindaklanjuti" },
  { value: "Belum Ditindaklanjuti", label: "Belum Ditindaklanjuti" },
];

function idSubSLS(row) {
  const kode = row.subSLS ? `${row.kodeSLS}-${row.subSLS}` : row.kodeSLS;
  return row.namaSLS ? `${kode} · ${row.namaSLS}` : kode;
}

export default function DetailAnomaliUsaha({ row, onClose, onSaved }) {
  const [hasilKonfirmasi, setHasilKonfirmasi] = useState(row?.hasilKonfirmasiPML || "");
  const [keterangan, setKeterangan] = useState(row?.keteranganKoreksi || "");
  const [hasilKorwil, setHasilKorwil] = useState(row?.hasilKonfirmasiKorwil || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  if (!row) return null;

  const isDirty =
    hasilKonfirmasi !== (row.hasilKonfirmasiPML || "") ||
    keterangan !== (row.keteranganKoreksi || "") ||
    hasilKorwil !== (row.hasilKonfirmasiKorwil || "");

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        // text/plain menghindari CORS preflight yang tidak didukung Apps Script secara default
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          sheetRow: row.rowIndex,
          namaUsaha: row.namaUsaha,
          namaAnomali: row.namaAnomali,
          hasilKonfirmasi,
          keterangan,
          hasilKorwil,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Gagal menyimpan perubahan.");

      setSaved(true);
      onSaved?.({
        ...row,
        hasilKonfirmasiPML: hasilKonfirmasi,
        keteranganKoreksi: keterangan,
        hasilKonfirmasiKorwil: hasilKorwil,
      });
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fadeIn flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex-shrink-0" style={{ background: "linear-gradient(135deg,#F5A623 0%,#e8820a 100%)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-0.5">Detail Anomali Usaha</p>
              <h2 className="text-white text-lg font-black leading-tight">{row.namaUsaha}</h2>
              <p className="text-orange-100 text-xs mt-0.5">{row.namaDesa} · {row.namaKec}</p>
            </div>
            <button onClick={onClose} className="text-orange-200 hover:text-white transition-colors mt-1 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 w-1/3 align-top">ID Sub SLS</td>
                <td className="px-3 py-2.5 text-gray-700">{idSubSLS(row)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Nama Usaha</td>
                <td className="px-3 py-2.5 text-gray-700">{row.namaUsaha}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Nama Anomali</td>
                <td className="px-3 py-2.5 text-gray-700">{row.namaAnomali}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Keterangan Anomali</td>
                <td className="px-3 py-2.5 text-gray-700 leading-relaxed">{row.keteranganAnomali || "-"}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Hasil Konfirmasi<br />PML/PPL</td>
                <td className="px-3 py-2.5">
                  <select
                    value={hasilKonfirmasi}
                    onChange={e => setHasilKonfirmasi(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {OPSI_HASIL_KONFIRMASI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Keterangan</td>
                <td className="px-3 py-2.5">
                  <textarea
                    value={keterangan}
                    onChange={e => setKeterangan(e.target.value)}
                    rows={2}
                    placeholder="Tulis keterangan koreksi…"
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                </td>
              </tr>
              <tr>
                <td className="bg-gray-50 px-3 py-2.5 font-semibold text-gray-500 align-top">Ditindaklanjuti<br />Korwil</td>
                <td className="px-3 py-2.5">
                  <select
                    value={hasilKorwil}
                    onChange={e => setHasilKorwil(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {OPSI_KORWIL.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          {row.linkFasih && (
            <a href={row.linkFasih} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-blue-600 hover:underline break-all">
              Buka Link Fasih ↗
            </a>
          )}

          {saveError && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-600">{saveError}</div>
          )}
          {saved && !isDirty && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-600">Perubahan tersimpan.</div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">Tutup</button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${!isDirty || saving ? "bg-orange-200 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"}`}
          >
            {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
