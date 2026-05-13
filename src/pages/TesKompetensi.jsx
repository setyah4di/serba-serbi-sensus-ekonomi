"use client";

import { useState, useEffect } from "react";

export default function TesKompetensi() {
  const [visible, setVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMulaiUjian = () => {
    setShowConfirm(true);
  };

  const handleKonfirmasi = () => {
    window.open(
      "https://forms.gle/8ybHzgGN5BqzDWJr7",
      "_blank"
    );
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f0] to-[#ffecd6]">
      {/* Header */}
      <div
        className="bg-[#F28C28] text-white py-4 px-6 text-center shadow-lg"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-30px)",
          transition: "all 0.7s ease",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-4xl mb-2">📝</div>
          <h1 className="text-2xl font-black tracking-widest uppercase mb-1">
            Tes Kompetensi Tertulis
          </h1>
          <p className="text-orange-100 font-medium tracking-wide mb-1">
            Seleksi Mitra Tambahan BPS Kab. Tanjung Jabung Barat — Tahap II
          </p>
            {/* <span className="text-[#F28C28] text-lg">🗓️</span>
             <span className="font-bold ">13 Maret 2026</span> */}
        </div>
      </div>

      {/* Info Bar */}
      <div
        className="bg-white border-b border-orange-100 py-4 px-6"
        style={{
          opacity: visible ? 1 : 0,
          transition: "all 0.7s ease 0.15s",
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-[#F28C28] text-lg">⏱</span>
            <span><span className="font-bold text-gray-800">60 Menit</span> Pengerjaan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#F28C28] text-lg">📋</span>
            <span><span className="font-bold text-gray-800">30 Soal</span> Pilihan Ganda</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#F28C28] text-lg">🌐</span>
            <span>Dikerjakan <span className="font-bold text-gray-800">Online</span></span>
          </div>
         
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Petunjuk Pengerjaan */}
        <div
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.2s",
          }}
        >
          <div className="bg-[#F28C28] px-6 py-4">
            <h2 className="text-white font-black text-base tracking-widest uppercase flex items-center gap-2">
              📋 Petunjuk Pengerjaan
            </h2>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-3">
              {[
                "Siapkan Kartu Tanda Penduduk (KTP) dan ID Sobat BPS untuk verifikasi identitas.",
                "ID Sobat BPS dapat diakses pada link : mitra.bps.go.id",
                "Tes ini terdiri dari 30 soal dengan waktu pengerjaan 60 menit.",
                "Pastikan koneksi internet Anda stabil selama mengerjakan tes.",
                "Form akan otomatis dikunci setelah waktu habis.",
                "Dilarang bekerja sama atau membuka sumber lain selama tes berlangsung.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#F28C28] text-white text-xs font-bold flex-shrink-0 flex items-center justify-center">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Peringatan */}
        <div
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-red-100"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.35s",
          }}
        >
          <div className="bg-red-500 px-6 py-4">
            <h2 className="text-white font-black text-base tracking-widest uppercase flex items-center gap-2">
              ⚠️ Perhatian
            </h2>
          </div>
          <div className="px-6 py-5 bg-red-50">
            <p className="text-sm text-red-700 leading-relaxed">
              Kejujuran dan integritas Anda adalah cerminan kompetensi sebagai calon{" "}
              <strong>Mitra Statistik BPS</strong>. Segala bentuk kecurangan akan
              mendiskualifikasi peserta dari proses seleksi.
            </p>
          </div>
        </div>
     

        {/* Tombol Mulai Ujian */}
        <div
          className="text-center pb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.55s",
          }}
        >
          <button
            onClick={handleMulaiUjian}
            className="bg-[#F28C28] hover:bg-[#d9770d] active:scale-95 text-white font-black text-lg py-4 px-12 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl tracking-widest uppercase"
          >
            🚀 Mulai Ujian
          </button>
        </div>
      </div>

      {/* Konfirmasi Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            style={{ animation: "zoomIn 0.3s ease" }}
          >
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">Siap Memulai Ujian?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Pastikan koneksi internet stabil dan Anda berada di tempat yang tenang. Waktu akan berjalan setelah form dibuka.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleKonfirmasi}
                className="flex-1 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d9770d] text-white font-bold text-sm transition-colors"
              >
                Ya, Mulai!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
