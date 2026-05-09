"use client";

import { useState, useEffect } from "react";
import TutorialPendaftaran from "../element/TutorialPendaftaran";
import TabelKebutuhan from "../element/TabelKebutuhan";

export default function Registrasi() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ===== ALUR PENDAFTARAN ===== */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition: "all 0.8s ease",
        }}
      >
        <AlurPendaftaran />
      </div>

      {/* ===== TABEL KEBUTUHAN PETUGAS ===== */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.9)",
          transition: "all 1s ease 0.2s",
        }}
      >
        <TabelKebutuhan />
      </div>

      {/* ===== TUTORIAL PENDAFTARAN ===== */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition: "all 1.1s ease 0.4s",
        }}
      >
        <TutorialPendaftaran />
      </div>
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const scrollToTutorial = () => {
    setTimeout(() => {
      document
        .getElementById("tutorial-pendaftaran")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <>
      <section
        className="bg-[#F28C28] py-12 px-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition: "all 0.8s ease",
        }}
      >
        <h2 className="text-xl font-bold tracking-widest mb-8 text-white">
          ALUR PENDAFTARAN
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {KARTU.map((k, index) => (
            <div
              key={k.id}
              onClick={k.clickable ? () => setModalOpen(true) : undefined}
              className={
                k.clickable
                  ? "cursor-pointer hover:-translate-y-1 transition-transform"
                  : ""
              }
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.7)",
                transition: `all 0.6s ease ${index * 0.15}s`,
              }}
            >
              <div className="bg-white rounded-lg aspect-[4/3] flex flex-col items-center justify-center gap-2 overflow-hidden p-4 hover:scale-105 transition-transform duration-300">
                {k.img ? (
                  <img
                    src={k.img}
                    alt={k.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {k.icon}

                    {k.extraLabel && (
                      <p className="text-xs font-black tracking-widest text-gray-800">
                        {k.extraLabel}
                      </p>
                    )}

                    {k.subLabel && (
                      <p className="text-[9px] text-gray-500 italic">
                        {k.subLabel}
                      </p>
                    )}
                  </>
                )}
              </div>

              <p className="mt-3 text-sm font-bold text-gray-900">
                {k.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center"
          onClick={(e) =>
            e.target === e.currentTarget && setModalOpen(false)
          }
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-[90%] text-center relative"
            style={{
              animation: "zoomIn 0.3s ease",
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-4 text-gray-400 text-xl leading-none hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold mb-2">
              Daftar Rekrutmen Mitra BPS
            </h3>

            <p className="text-sm text-gray-500 mb-5">
              Wajib Melakukan Pendaftaran pada 2 Link Berikut:
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <a
                href="https://mitra.bps.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#4285F4] hover:bg-[#2a6dd4] text-white font-bold py-3 px-5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
              >
                📋 Daftar Dulu di SOBAT BPS
              </a>

              <a
                href="https://forms.gle/LQhgkECUb3ChJ5YF8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F28C28] hover:bg-[#d9770d] text-white font-bold py-3 px-5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
              >
                📱 Lanjut Daftar di Google Form
              </a>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Pastikan sebelum mendaftar, Anda sudah melihat{" "}
              <button
                onClick={() => {
                  setModalOpen(false);
                  scrollToTutorial();
                }}
                className="text-[#F28C28] font-bold underline hover:text-[#d9770d]"
              >
                tutorial pendaftaran di bawah ini ↓
              </button>
            </p>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
}