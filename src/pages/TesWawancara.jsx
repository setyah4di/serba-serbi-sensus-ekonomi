"use client";

import { useState, useEffect } from "react";



export default function TesWawancara() {
  const [visible, setVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMulaiWawancara = () => {
    setShowConfirm(true);
  };

  const handleKonfirmasi = () => {
    window.open(
      "https://docs.google.com/forms/d/17TTxy86Nx0cnlw7fOgz9yaxjnuWSUxQRzKZr-kQx33A/edit",
      "_blank"
    );
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] to-[#ddeeff]">
      {/* Header */}
      <div
        className="bg-[#F28C28] text-white py-8 px-6 text-center shadow-lg"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-30px)",
          transition: "all 0.7s ease",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-4xl mb-2">🎤</div>
          <h1 className="text-2xl font-black tracking-widest uppercase mb-1">
            Tes Wawancara
          </h1>
          <p className="text-orange-100 text-sm font-medium tracking-wide">
            Seleksi Mitra Tambahan BPS Kab. Tanjung Jabung Barat — Tahap III
          </p>
        </div>
      </div>

      {/* Info Bar */}
      <div
        className="bg-white border-b border-blue-100 py-4 px-6"
        style={{
          opacity: visible ? 1 : 0,
          transition: "all 0.7s ease 0.15s",
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-[#2196F3] text-lg">📅</span>
            <span><span className="font-bold text-gray-800">16 - 17 Maret</span> 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2196F3] text-lg">⏱</span>
            <span><span className="font-bold text-gray-800">±30 Menit</span> per Peserta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2196F3] text-lg">🎦</span>
             <span className="font-bold text-gray-800">Zoom Meeting</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* Panduan Wawancara */}
        <div
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.3s",
          }}
        >
          <div className="bg-[#F28C28] px-3 py-4">
            <h2 className="text-white font-black text-base tracking-widest uppercase flex items-center gap-2">
              📋 Panduan Wawancara
            </h2>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-3">
              {[
                "Hadir 15 menit sebelum jadwal wawancara Anda dimulai.",
                "Berpakaian rapi dan sopan (kemeja/blus formal, hindari kaos polos).",
                "Wawancara dilakukan melalui Zoom Meeting.",
                "Durasi wawancara sekitar 30 menit per peserta.",
                "Matikan atau silent-kan ponsel selama sesi wawancara berlangsung.",
                "Jawab pertanyaan dengan jujur, lugas, dan percaya diri.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#F28C28" }}
                  >
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Topik Wawancara */}
        <div
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.4s",
          }}
        >
        
        </div>
        {/* Tombol Konfirmasi Kehadiran */}
        <div
          className="text-center pb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.6s",
          }}
        >
          <p className="text-sm text-gray-500 mb-4 font-medium">
            Konfirmasikan kehadiran wawancara Anda melalui form berikut:
          </p>
          <button
            onClick={handleMulaiWawancara}
            className="bg-[#F28C28] hover:bg-[#d9770d] active:scale-95 text-white font-black text-lg py-4 px-12 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl tracking-widest uppercase"
          >
            🎤 Mulai Wawancara
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
            <div className="text-5xl mb-4">🎤</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">Konfirmasi Kehadiran?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Anda akan diarahkan ke link Zoom Meeting kehadiran wawancara. Pastikan anda sudah siap.
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
                Lanjutkan
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
