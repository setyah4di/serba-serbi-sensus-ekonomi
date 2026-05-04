"use client";

import { useEffect, useState, useRef } from "react";

// ---- komponen utama ----
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
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80')",
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

      {/* ===== TUTORIAL PENDAFTARAN ===== */}
      <TutorialPendaftaran />
    </>
  );
}

// ---- data kartu ----
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

// ---- Alur Pendaftaran ----
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

      {/* Modal */}
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
            <p className="text-sm text-gray-500 mb-5">Pilih metode pendaftaran yang ingin Anda gunakan:</p>

            <div className="flex flex-col gap-3 mb-5">
              <a
                href="https://sites.google.com/view/rekrutmenmitra3403/registrasi?authuser=0"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F28C28] hover:bg-[#d9770d] text-white font-bold py-3 px-5 rounded-lg text-sm transition-colors"
              >
                📱 Daftar via Sobat BPS
              </a>
              
              <a
                href="https://sites.google.com/view/rekrutmenmitra3403/registrasi?authuser=0"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#4285F4] hover:bg-[#2a6dd4] text-white font-bold py-3 px-5 rounded-lg text-sm transition-colors"
              >
                📋 Daftar via Google Form
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

// ---- Tutorial Pendaftaran ----
function TutorialPendaftaran() {
  return (
    <section id="tutorial-pendaftaran" className="py-12 px-8 bg-white max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center tracking-widest mb-2">PENDAFTARAN REKRUTMEN</h2>
      <hr className="border-gray-200 my-4 mx-auto w-11/12" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

        {/* Langkah 1 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-100 p-4">
            <BrowserMock>
              <p className="text-[9px] font-bold text-gray-800 mb-2">DAFTAR KEGIATAN SURVEI/SENSUS</p>
              <div className="flex items-center justify-between border-2 border-red-500 rounded px-2 py-1 text-[9px] text-gray-500 mb-1">
                <span>rekrutmen</span>
                <span className="bg-[#F28C28] text-white text-[8px] px-1 rounded">cari</span>
              </div>
              <p className="text-[8px] text-gray-500 text-right mt-1">
                <RedDot>1</RedDot> Klik Daftar Survei &nbsp;
                <RedDot>2</RedDot> Cari rekrutmen
              </p>
            </BrowserMock>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              <TutLi>Calon melakukan pendaftaran dengan cara klik <b>"Daftar Survei"</b>.</TutLi>
              <TutLi>Pada menu pencarian ketik <b>"rekrutmen"</b> lalu klik tombol <b>cari</b>.</TutLi>
            </ul>
          </div>
        </div>

        {/* Langkah 2 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-100 p-4">
            <BrowserMock>
              <p className="text-[9px] font-bold text-gray-800 mb-2">DAFTAR KEGIATAN SURVEI/SENSUS</p>
              <div className="border border-gray-200 rounded-lg p-2">
                <p className="text-[10px] font-bold text-gray-900 mb-2">Rekrutmen Mitra BPS 2025</p>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[8px] text-gray-500">● Jenis</span>
                  <span className="bg-green-600 text-white text-[8px] px-1 rounded font-bold">Pendaftaran</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[8px] text-gray-500">● Level</span>
                  <span className="bg-[#F28C28] text-white text-[8px] px-1 rounded font-bold">KABUPATEN/KOTA</span>
                </div>
                <p className="text-[8px] text-gray-500 mb-2">● Tanggal : 14 s.d. 20 Oktober 2024</p>
                <button className="block mx-auto bg-green-600 text-white text-[9px] px-4 py-1 rounded">Daftar</button>
              </div>
            </BrowserMock>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              <TutLi>Lalu akan muncul <b>"Rekrutmen Mitra BPS 2025"</b>.</TutLi>
              <TutLi>Klik <b>"Daftar"</b>.</TutLi>
            </ul>
          </div>
        </div>

        {/* Langkah 3 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-100 p-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-[9px]">
              <p className="font-bold text-[10px] text-gray-900 mb-3">Daftar Sensus/Survei</p>
              {[
                ["Nama Survei", "Rekrutmen Mitra BPS 2025"],
                ["Kegiatan", "Pendaftaran"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2 mb-1">
                  <span className="text-gray-500 min-w-[80px]">{label}</span>
                  <span className="text-gray-700">: {val}</span>
                </div>
              ))}
              {[["Provinsi", "34 (D.I. YOGYAKARTA)"], ["Kabupaten", "03 (KAB. GUNUNGKIDUL)"], ["Jabatan Petugas", "Mitra 2025"]].map(([label, val]) => (
                <div key={label} className="flex gap-2 mb-1 items-center">
                  <span className="text-gray-500 min-w-[80px]">{label}</span>
                  <span className="flex-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-gray-700">: {val} ▾</span>
                </div>
              ))}
              <div className="flex justify-between mt-3">
                <button className="bg-gray-100 border border-gray-200 text-gray-600 rounded px-3 py-1 text-[9px]">Kembali</button>
                <button className="bg-blue-500 text-white rounded px-3 py-1 text-[9px]">Daftar</button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              <TutLi>Pilih Wilayah <b>"Gunungkidul"</b> dan Jabatan <b>"Mitra 2025"</b>.</TutLi>
              <TutLi>Klik <b>"Daftar"</b>.</TutLi>
            </ul>
          </div>
        </div>

        {/* Langkah 4 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-100 p-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[11px] font-bold text-gray-900 mb-3">Rekrutmen Mitra BPS 2025</p>
              {[
                { label: "Jenis", badge: "Pendaftaran", badgeColor: "bg-green-600" },
                { label: "Level", badge: "KABUPATEN/KOTA", badgeColor: "bg-[#F28C28]" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#F28C28] flex-shrink-0" />
                  <span className="text-[9px] text-gray-600">{r.label} :</span>
                  <span className={`${r.badgeColor} text-white text-[8px] px-1.5 py-0.5 rounded font-bold`}>{r.badge}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#F28C28] flex-shrink-0" />
                <span className="text-[9px] text-gray-600">Tanggal : 14 s.d. 20 Oktober 2024</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 text-white text-[9px] py-1.5 rounded">Ubah</button>
                <button className="flex-1 bg-red-500 text-white text-[9px] py-1.5 rounded">Mundur</button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              <TutLi>
                Calon mitra menunggu untuk dikonfirmasi oleh Panitia Rekrutmen pada saat <b>Seleksi Administrasi</b>.
              </TutLi>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}

// ---- helper kecil ----
function BrowserMock({ children }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-200 px-2 py-1 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
        ))}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function TutLi({ children }) {
  return (
    <li className="flex gap-2 text-xs text-gray-700">
      <span className="text-[#F28C28] mt-0.5">▪</span>
      <span>{children}</span>
    </li>
  );
}

function RedDot({ children }) {
  return (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-bold mr-0.5">
      {children}
    </span>
  );
}