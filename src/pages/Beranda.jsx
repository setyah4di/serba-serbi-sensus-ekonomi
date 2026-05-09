import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import berandaBg from "../assets/image/beranda.JPG";

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

// ── Logo LUMINA — SVG faithful to reference image ────────────────────────────
function LuminaLogo() {
  return (
    <svg
      viewBox="0 0 520 160"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ maxWidth: 320 }}
    >
      <defs>
        {/* Bar gradients */}
        <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>
        <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26C6DA" />
          <stop offset="100%" stopColor="#00897B" />
        </linearGradient>
        <linearGradient id="bar4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#43E97B" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
        {/* Light beam */}
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFD54F" stopOpacity="0" />
        </linearGradient>
        {/* Wave gradient */}
        <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
        {/* Text gradient */}
        <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0D2B6E" />
          <stop offset="50%"  stopColor="#0D47A1" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
        {/* M pillar gradient */}
        <linearGradient id="mPillar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
      </defs>

      {/* ── ICON: Chart bars ── */}
      {/* Bar 1 — tallest, leftmost */}
      <rect x="8"  y="18" width="16" height="90" rx="4" fill="url(#bar1)" />
      {/* Bar 2 */}
      <rect x="28" y="50" width="16" height="58" rx="4" fill="url(#bar2)" />
      {/* Bar 3 */}
      <rect x="48" y="38" width="16" height="70" rx="4" fill="url(#bar3)" />
      {/* Bar 4 — tallest right */}
      <rect x="68" y="28" width="16" height="80" rx="4" fill="url(#bar4)" />

      {/* Light beam from top of bar 1 */}
      <polygon points="16,18 90,2 90,16" fill="url(#beam)" opacity="0.85" />
      {/* Sparkle star at top-left of beam */}
      <g transform="translate(16,14)">
        <polygon points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5" fill="#FFD54F" />
      </g>

      {/* ── ICON: Wave ── */}
      <path
        d="M4,122 Q20,112 36,122 Q52,132 68,122 Q84,112 96,118"
        fill="none" stroke="url(#wave)" strokeWidth="4" strokeLinecap="round"
      />
      <path
        d="M8,134 Q24,124 40,134 Q56,144 72,134 Q88,124 96,130"
        fill="none" stroke="url(#wave)" strokeWidth="3" strokeLinecap="round" opacity="0.6"
      />

      {/* ── TEXT: LUMINA ── */}
      {/* L */}
      <text x="112" y="118" fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="80" fontWeight="900" fill="url(#textGrad)" letterSpacing="2">L</text>

      {/* U */}
      <text x="167" y="118" fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="80" fontWeight="900" fill="url(#textGrad)">U</text>

      {/* M */}
      <text x="226" y="118" fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="80" fontWeight="900" fill="url(#textGrad)">M</text>
      {/* M — blue pillar inside the M letter (the "i" detail on reference) */}
      <rect x="285" y="38" width="10" height="52" rx="5" fill="url(#mPillar)" opacity="0.85" />

      {/* I */}
      <text x="301" y="118" fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="80" fontWeight="900" fill="url(#textGrad)">I</text>

      {/* N */}
      <text x="326" y="118" fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="80" fontWeight="900" fill="url(#textGrad)">N</text>

      {/* A */}
      <text x="393" y="118" fontFamily="'Arial Black', 'Arial', sans-serif"
        fontSize="80" fontWeight="900" fill="url(#textGrad)">A</text>
      {/* A — teal dot at bottom-right of A */}
      <circle cx="505" cy="112" r="7" fill="#00BCD4" />

      {/* Sparkle at top of I */}
      <g transform="translate(331,26)">
        <polygon points="0,-7 1.8,-1.8 7,0 1.8,1.8 0,7 -1.8,1.8 -7,0 -1.8,-1.8" fill="#FFD54F" />
      </g>
    </svg>
  );
}

// ── Menu data ─────────────────────────────────────────────────────────────────
const MENUS = [
  {
    icon: "📋",
    label: "Rekrutmen",
    desc: "Daftar sebagai Mitra Statistik SE 2026",
    path: "/registrasi",
    color: "bg-blue-600",
    external: false,
    isLumina: false,
  },
  {
    icon: "📑",
    label: "KKD",
    desc: "Komunikasi, Koordinasi, dan Diplomasi",
    path: "/kkd",
    color: "bg-emerald-600",
    external: false,
    isLumina: false,
  },
  {
    icon: "📊",
    label: "Ngibar",
    desc: "Ngisi Bareng Data Usaha",
    path: "/ngibar",
    color: "bg-purple-600",
    external: false,
    isLumina: false,
  },
  {
    icon: "📈",
    label: "Reporta-SE",
    desc: "Pelaporan & Rekapitulasi Sensus Ekonomi",
    path: "/reporta-se",
    color: "bg-orange-500",
    external: false,
    isLumina: false,
  },
  {
    icon: "✨",
    label: "LUMINA",
    desc: "Layanan Unggulan Menyajikan Statistik",
    path: "https://pst-bpstanjabbar.netlify.app",
    color: "bg-white",
    external: true,
    isLumina: true,
  },
];

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function Beranda() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const [heroRef, heroVisible] = useScrollZoom();
  const [introRef, introVisible] = useScrollZoom();
  const [cardRef, cardVisible] = useScrollZoom();

  return (
    <>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[520px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${berandaBg})`,
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
            <span className="text-orange-400">SE</span>RBA-
            <span className="text-orange-400">SE</span>RBI
            <br />
            <span className="text-orange-400">SENSUS EKONOMI 2026</span>
          </h1>
          <p className="text-white text-sm uppercase tracking-[0.3em] mb-3 font-semibold">
            Badan Pusat Statistik
          </p>
          <p className="text-lg md:text-xl text-gray-200 uppercase tracking-widest font-light">
            Kabupaten Tanjung Jabung Barat
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="bg-orange-400 py-16 px-4">
        <div
          ref={introRef}
          className="max-w-4xl mx-auto text-gray-900"
          style={{
            transform: introVisible ? "scale(1)" : "scale(0.9)",
            opacity: introVisible ? 1 : 0,
            transition: "all 0.8s ease",
          }}
        >
          <p className="text-base md:text-lg leading-relaxed text-justify">
            <span className="font-extrabold">Sensus Ekonomi 2026 (SE2026)</span> merupakan
            kegiatan statistik nasional yang diselenggarakan oleh Badan Pusat Statistik
            (BPS) untuk memperoleh gambaran menyeluruh mengenai kondisi ekonomi di seluruh
            wilayah Indonesia. Melalui sensus ini, BPS mengumpulkan data terkait berbagai
            sektor usaha, mulai dari usaha mikro, kecil, menengah, hingga besar yang
            berperan penting dalam pembangunan ekonomi nasional.
            <br /><br />
            Informasi yang dihasilkan dari{" "}
            <span className="font-extrabold italic">Sensus Ekonomi 2026</span> akan menjadi
            dasar dalam perencanaan kebijakan, evaluasi pembangunan, serta pengambilan
            keputusan strategis oleh pemerintah dan berbagai pihak terkait. Oleh karena itu,
            partisipasi aktif dari seluruh pelaku usaha sangat diperlukan guna menghasilkan
            data yang akurat dan berkualitas.
            <br /><br />
            <span className="font-extrabold underline">
              Mari dukung pelaksanaan Sensus Ekonomi 2026
            </span>{" "}
            dengan memberikan data yang benar dan lengkap demi kemajuan ekonomi Indonesia,
            khususnya di Kabupaten Tanjung Jabung Barat.
          </p>
        </div>
      </section>

      {/* ── CARDS ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div
          ref={cardRef}
          className="max-w-6xl mx-auto"
          style={{
            transform: cardVisible ? "scale(1)" : "scale(0.95)",
            opacity: cardVisible ? 1 : 0,
            transition: "all 0.8s ease",
          }}
        >
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2 uppercase tracking-wide">
            Menu Utama
          </h2>
          <div className="h-1 w-16 bg-orange-500 mx-auto mb-12 rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {MENUS.map((item, i) => {
              const cardContent = (
                <div
                  className={`
                    bg-white rounded-2xl shadow-sm border border-gray-100
                    flex flex-col items-center text-center
                    hover:shadow-xl hover:-translate-y-2
                    transition-all duration-300 group cursor-pointer h-full
                    ${item.isLumina ? "p-8" : "p-6"}
                  `}
                  style={{
                    transform: cardVisible ? "scale(1)" : "scale(0.8)",
                    opacity: cardVisible ? 1 : 0,
                    transition: `all 0.6s ease ${i * 0.15}s`,
                  }}
                >
                  {item.isLumina ? (
                    /* ── LUMINA card: logo SVG full-width, no cropping ── */
                    <>
                      <div className="w-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                        <LuminaLogo />
                      </div>
                      <h3 className="font-extrabold text-gray-800 text-sm md:text-base mb-2 leading-tight">
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </>
                  ) : (
                    /* ── Regular cards ── */
                    <>
                      <div
                        className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <h3 className="font-extrabold text-gray-800 text-sm md:text-base mb-2 leading-tight">
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </>
                  )}
                </div>
              );

              return item.external ? (
                <a key={item.label} href={item.path} target="_blank" rel="noopener noreferrer">
                  {cardContent}
                </a>
              ) : (
                <Link key={item.label} to={item.path}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
