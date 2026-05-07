"use client";

import { useEffect, useState, useRef } from "react";
import TutorialPendaftaran from "../element/TutorialPendaftaran";
import TabelKebutuhan from "../element/TabelKebutuhan";

import background from "../assets/beranda.JPG";

export default function Registrasi() {
  function useScrollZoom() {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { threshold: 0.2 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);
    return [ref, isVisible];
  }

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const [heroRef, heroVisible] = useScrollZoom();

  return (
    <>
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-[360px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${background})`,
            transform: heroVisible ? "scale(1)" : "scale(1.1)",
            transition: "transform 1.2s ease",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div
          className="relative z-10 text-center px-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
          }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight">
            Rekrutmen
          </h1>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ===== ALUR PENDAFTARAN ===== */}
      <AlurPendaftaran />

      {/* ===== TABEL KEBUTUHAN PETUGAS ===== */}
      <TabelKebutuhan />

      {/* ===== TUTORIAL PENDAFTARAN ===== */}
      <TutorialPendaftaran />
    </>
  );
}

const KARTU = [
  {
    id: "registrasi",
    label: "Registrasi Akun",
    clickable: true,
    img: null,
    icon: (
      <svg width="64" height="56" viewBox="0 0 64 56">
        <circle cx="20" cy="14" r="12" fill="#F28C28" />
        <circle cx="36" cy="12" r="12" fill="#4CAF50" />
        <circle cx="50" cy="14" r="12" fill="#2196F3" />
        <ellipse cx="20" cy="42" rx="16" ry="12" fill="#F28C28" />
        <ellipse cx="36" cy="40" rx="16" ry="12" fill="#4CAF50" />
        <ellipse cx="50" cy="42" rx="16" ry="12" fill="#2196F3" />
      </svg>
    ),
    extraLabel: "SOBAT BPS",
    subLabel: "A helpful and friendly apps",
  },
  {
    id: "pengumuman-admin",
    label: "Pengumuman Seleksi Administrasi",
    clickable: false,
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  },
  {
    id: "seleksi-kompetensi",
    label: "Seleksi Kompetensi",
    clickable: false,
    img: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&q=80",
  },
  {
    id: "pengumuman-akhir",
    label: "Pengumuman Seleksi Akhir",
    clickable: false,
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80",
  },
];

function AlurPendaftaran() {
  const [modalOpen, setModalOpen] = useState(false);

  const scrollToTutorial = () => {
    setTimeout(() => {
      document.getElementById("tutorial-pendaftaran")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <>
      <section className="bg-[#F28C28] py-12 px-8 text-center">
        <h2 className="text-xl font-bold tracking-widest mb-8 text-white">ALUR PENDAFTARAN</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {KARTU.map((k) => (
            <div
              key={k.id}
              onClick={k.clickable ? () => setModalOpen(true) : undefined}
              className={k.clickable ? "cursor-pointer hover:-translate-y-1 transition-transform" : ""}
            >
              <div className="bg-white rounded-lg aspect-[4/3] flex flex-col items-center justify-center gap-2 overflow-hidden p-4">
                {k.img ? (
                  <img src={k.img} alt={k.label} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {k.icon}
                    {k.extraLabel && <p className="text-xs font-black tracking-widest text-gray-800">{k.extraLabel}</p>}
                    {k.subLabel && <p className="text-[9px] text-gray-500 italic">{k.subLabel}</p>}
                  </>
                )}
              </div>
              <p className="mt-3 text-sm font-bold text-gray-900">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-white rounded-xl p-8 max-w-md w-[90%] text-center relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-4 text-gray-400 text-xl leading-none hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-2">Daftar Rekrutmen Mitra BPS</h3>
            <p className="text-sm text-gray-500 mb-5">Wajib Melakukan Pendaftaran pada 2 Link Berikut:</p>
            <div className="flex flex-col gap-3 mb-5">
              <a
                href="https://sites.google.com/view/rekrutmenmitra3403/registrasi?authuser=0"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#4285F4] hover:bg-[#2a6dd4] text-white font-bold py-3 px-5 rounded-lg text-sm transition-colors"
              >
                📋 Daftar Dulu di SOBAT BPS
              </a>
              <a
                href="https://sites.google.com/view/rekrutmenmitra3403/registrasi?authuser=0"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F28C28] hover:bg-[#d9770d] text-white font-bold py-3 px-5 rounded-lg text-sm transition-colors"
              >
                📱 Lanjut Daftar di Google Form
              </a>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pastikan sebelum mendaftar, Anda sudah melihat{" "}
              <button
                onClick={() => { setModalOpen(false); scrollToTutorial(); }}
                className="text-[#F28C28] font-bold underline hover:text-[#d9770d]"
              >
                tutorial pendaftaran di bawah ini ↓
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
