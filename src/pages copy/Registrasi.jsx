import { useState } from "react";

const steps = ["Data Pribadi", "Domisili", "Dokumen", "Konfirmasi"];

export default function Registrasi() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ nama: "", nik: "", ttl: "", hp: "", email: "", pendidikan: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Pendaftaran Online
          </span>
          <h1 className="text-3xl font-extrabold text-gray-800">Registrasi Mitra SE 2026</h1>
          <p className="text-gray-500 mt-2 text-sm">Isi formulir berikut untuk mendaftar sebagai Mitra Statistik Sensus Ekonomi 2026</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
          {steps.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-1">
              <button
                onClick={() => setStep(i)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </button>
              <span className={`text-xs font-semibold ${i === step ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Data Pribadi</h2>
              {[
                { label: "Nama Lengkap", name: "nama", type: "text", placeholder: "Sesuai KTP" },
                { label: "NIK", name: "nik", type: "text", placeholder: "16 digit NIK" },
                { label: "Tempat, Tanggal Lahir", name: "ttl", type: "text", placeholder: "Kota, DD/MM/YYYY" },
                { label: "No. HP Aktif", name: "hp", type: "tel", placeholder: "08xxxxxxxxxx" },
                { label: "Email", name: "email", type: "email", placeholder: "contoh@email.com" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input
                    name={f.name}
                    type={f.type}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pendidikan Terakhir</label>
                <select
                  name="pendidikan"
                  value={form.pendidikan}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Pilih Pendidikan --</option>
                  <option>SMA/SMK/Sederajat</option>
                  <option>D3</option>
                  <option>S1</option>
                  <option>S2</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Data Domisili</h2>
              {[
                { label: "Kecamatan", placeholder: "Nama Kecamatan" },
                { label: "Kelurahan/Desa", placeholder: "Nama Kelurahan/Desa" },
                { label: "RT / RW", placeholder: "001 / 002" },
                { label: "Alamat Lengkap", placeholder: "Jl. ..." },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Upload Dokumen</h2>
              {["Foto KTP", "Foto Selfie + KTP", "Ijazah Terakhir"].map((doc) => (
                <div key={doc} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer group">
                  <div className="text-3xl mb-2">📎</div>
                  <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">{doc}</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk upload • JPG/PNG, maks 2MB</p>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-800 mb-2">Konfirmasi Pendaftaran</h2>
              <p className="text-gray-500 text-sm mb-6">Pastikan data yang Anda isi sudah benar sebelum mengirimkan formulir.</p>
              <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
                <p><span className="font-semibold text-gray-600">Nama:</span> {form.nama || "-"}</p>
                <p><span className="font-semibold text-gray-600">NIK:</span> {form.nik || "-"}</p>
                <p><span className="font-semibold text-gray-600">Email:</span> {form.email || "-"}</p>
                <p><span className="font-semibold text-gray-600">No. HP:</span> {form.hp || "-"}</p>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                Kirim Pendaftaran
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
              >
                ← Kembali
              </button>
              <button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
              >
                Lanjut →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
