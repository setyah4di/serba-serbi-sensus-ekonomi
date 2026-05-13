"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom"; // Sesuaikan dengan router yang dipakai
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
    modalType: "registrasi",
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
    clickable: true,
    modalType: "pengumuman-admin",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  },
  {
    id: "seleksi-kompetensi",
    label: "Seleksi Kompetensi",
    clickable: true,
    modalType: "kompetensi",
    img: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&q=80",
  },
  {
    id: "pengumuman-akhir",
    label: "Pengumuman Seleksi Akhir",
    clickable: false,
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80",
  },
];

// =============================================
// MODAL PORTAL — di-render langsung ke document.body
// agar tidak terpengaruh transform/overflow ancestor
// =============================================
function ModalPortal({ type, onClose, navigate, scrollToTutorial }) {
  // Lock scroll saat modal terbuka
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  };

  // Layer 1: backdrop blur murni (tidak ada transform agar blur bekerja)
  const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 99998,
    backdropFilter: "blur(10px) brightness(0.35)",
    WebkitBackdropFilter: "blur(10px) brightness(0.35)",
    background: "rgba(0,0,0,0.15)",
  };

  return createPortal(
    <>
      {/* Backdrop — layer terpisah tanpa transform */}
      <div style={backdropStyle} onClick={onClose} />

      {/* Modal content */}
      <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
        {type === "registrasi" && (
          <div
            style={{
              animation: "zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              width: "90%",
              maxWidth: "420px",
              textAlign: "center",
              position: "relative",
              zIndex: 100000,
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: "12px", right: "16px",
                background: "none", border: "none", cursor: "pointer",
                color: "#9ca3af", fontSize: "20px", lineHeight: 1,
              }}
              onMouseOver={e => e.target.style.color = "#374151"}
              onMouseOut={e => e.target.style.color = "#9ca3af"}
            >✕</button>

            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px", color: "#1f2937" }}>
              Daftar Rekrutmen Mitra BPS
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              Wajib Melakukan Pendaftaran pada 2 Link Berikut:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <a
                href="https://mitra.bps.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#4285F4", color: "white", fontWeight: "700",
                  padding: "12px 20px", borderRadius: "10px", fontSize: "14px",
                  textDecoration: "none", transition: "background 0.2s",
                  display: "block",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#2a6dd4"}
                onMouseOut={e => e.currentTarget.style.background = "#4285F4"}
              >
                📋 Daftar Dulu di SOBAT BPS
              </a>
              <a
                href="https://forms.gle/LQhgkECUb3ChJ5YF8"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#F28C28", color: "white", fontWeight: "700",
                  padding: "12px 20px", borderRadius: "10px", fontSize: "14px",
                  textDecoration: "none", transition: "background 0.2s",
                  display: "block",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#d9770d"}
                onMouseOut={e => e.currentTarget.style.background = "#F28C28"}
              >
                📱 Lanjut Daftar di Google Form
              </a>
            </div>

            <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.6" }}>
              Pastikan sebelum mendaftar, Anda sudah melihat{" "}
              <button
                onClick={() => { onClose(); scrollToTutorial(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#F28C28", fontWeight: "700", textDecoration: "underline",
                  fontSize: "12px",
                }}
              >
                tutorial pendaftaran di bawah ini ↓
              </button>
            </p>
          </div>
        )}

        {type === "kompetensi" && (
          <div
            style={{
              animation: "zoomIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              width: "90%",
              maxWidth: "380px",
              textAlign: "center",
              position: "relative",
              zIndex: 100000,
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: "12px", right: "16px",
                background: "none", border: "none", cursor: "pointer",
                color: "#9ca3af", fontSize: "20px", lineHeight: 1,
              }}
              onMouseOver={e => e.target.style.color = "#374151"}
              onMouseOut={e => e.target.style.color = "#9ca3af"}
            >✕</button>

            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏆</div>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#1f2937", marginBottom: "4px" }}>
              Seleksi Kompetensi
            </h3>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "24px" }}>
              Pilih jenis tes yang ingin Anda akses:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => { onClose(); navigate("/tes-kompetensi"); }}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  background: "#F28C28", color: "white", fontWeight: "700",
                  padding: "16px 20px", borderRadius: "14px", fontSize: "14px",
                  border: "none", cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.background="#d9770d"; e.currentTarget.style.transform="scale(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.background="#F28C28"; e.currentTarget.style.transform="scale(1)"; }}
              >
                <span style={{ fontSize: "28px" }}>📝</span>
                <div>
                  <p style={{ fontWeight: "900", margin: 0 }}>Tes Kompetensi Tertulis</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: "400" }}>
                    30 soal · 60 menit · Online
                  </p>
                </div>
              </button>

              <button
                onClick={() => { onClose(); navigate("/tes-wawancara"); }}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  background: "#2196F3", color: "white", fontWeight: "700",
                  padding: "16px 20px", borderRadius: "14px", fontSize: "14px",
                  border: "none", cursor: "pointer", textAlign: "left",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.background="#1976d2"; e.currentTarget.style.transform="scale(1.02)"; }}
                onMouseOut={e => { e.currentTarget.style.background="#2196F3"; e.currentTarget.style.transform="scale(1)"; }}
              >
                <span style={{ fontSize: "28px" }}>🎤</span>
                <div>
                  <p style={{ fontWeight: "900", margin: 0 }}>Tes Wawancara</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: "400" }}>
                    Tatap muka · 21–23 Juli 2025
                  </p>
                </div>
              </button>
            </div>

            <p style={{ marginTop: "20px", fontSize: "11px", color: "#9ca3af" }}>
              Pastikan Anda sudah lulus seleksi administrasi sebelum mengikuti tes ini.
            </p>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

function AlurPendaftaran() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "registrasi" | "kompetensi"
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

  const handleKartuClick = (k) => {
    if (!k.clickable) return;
    if (k.modalType === "pengumuman-admin") {
      navigate("/pengumuman-administrasi");
      return;
    }
    setModalType(k.modalType);
    setModalOpen(true);
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
              onClick={() => handleKartuClick(k)}
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

      {/* ===== MODAL via PORTAL (render ke document.body agar tidak terpotong) ===== */}
      {modalOpen && <ModalPortal type={modalType} onClose={() => setModalOpen(false)} navigate={navigate} scrollToTutorial={scrollToTutorial} />}

      <style>
        {`
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.75); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}
