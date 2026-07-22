import { useState, useEffect } from "react";

const MENUS = [
  {
    id: "faskes",
    label: "FASKES",
    emoji: "🏥",
    highlight: true,
    bg: "from-red-50 to-white",
    border: "border-red-200",
    textColor: "text-red-700",
    url: "https://docs.google.com/spreadsheets/d/1ZlVv6FjKRPIDFwf4tlpLm_LOUP1MM0mtFUdj_ZNDwBQ/edit?usp=sharing",
  },
  {
    id: "bumdes",
    label: "BUMDES",
    emoji: "🏘️",
    highlight: false,
    bg: "from-green-50 to-white",
    border: "border-green-200",
    textColor: "text-green-700",
    url: "https://docs.google.com/spreadsheets/d/16ii6_nnIZy3V_iptA-iZRQni6yXbte0ypn8jOrwb48k/edit?usp=sharing",
  },
  {
    id: "sekolah-dinas-pendidikan",
    label: "SEKOLAH\nDINAS PENDIDIKAN",
    emoji: "🏫",
    highlight: false,
    bg: "from-blue-50 to-white",
    border: "border-blue-200",
    textColor: "text-blue-700",
    url: "https://docs.google.com/spreadsheets/d/1RkJhGIJ-J9fk3cqGlsQae9gcj4WxtUVkNapAd3A3ZLY/edit?usp=sharing",
  },
  {
    id: "sekolah-kemenag",
    label: "SEKOLAH\nKEMENTERIAN AGAMA",
    emoji: "🕌",
    highlight: false,
    bg: "from-purple-50 to-white",
    border: "border-purple-200",
    textColor: "text-purple-700",
    url: "https://docs.google.com/spreadsheets/d/1VNliw3Pu_fGhiZ_9ZCkFx_MG1mNGet2i0xPpbXwiEBo/edit?usp=sharing",
  },
];

export default function HasilNgibar() {
  const [pressed, setPressed] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (id) => {
    setPressed(id);
    const menu = MENUS.find((m) => m.id === id);
    setTimeout(() => {
      window.open(menu.url.trim(), "_blank", "noopener noreferrer");
      setPressed(null);
    }, 180);
  };

  return (
    <div
      className="min-h-screen py-10 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F5A623 0%, #F28C28 60%, #e8820a 100%)" }}
    >
      <WaveDecor />

      <div
        className="max-w-lg mx-auto relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition: "all 0.8s ease",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 backdrop-blur-sm">
            Sensus Ekonomi 2026
          </span>
          <h1 className="text-3xl font-extrabold text-white drop-shadow">
            Hasil Ngibar
          </h1>
          <p className="text-white/80 text-sm mt-2">
            Pilih kategori untuk melihat data spreadsheet
          </p>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          {MENUS.map((m, i) => (
            <MenuCard
              key={m.id}
              menu={m}
              pressed={pressed}
              onClick={handleClick}
              visible={visible}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            Klik menu untuk membuka spreadsheet di tab baru
          </p>
        </div>
      </div>

      <style>{`
        @keyframes highlight-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250,204,21,0.7), 0 8px 24px rgba(0,0,0,0.10); }
          50% { box-shadow: 0 0 0 8px rgba(250,204,21,0), 0 8px 32px rgba(0,0,0,0.15); }
        }
        @keyframes spike {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.15) rotate(5deg); }
        }
        .highlight-card { animation: highlight-pulse 1.4s ease-in-out infinite; }
        .spike { animation: spike 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function MenuCard({ menu, pressed, onClick, visible, delay }) {
  const isPressed = pressed === menu.id;
  const label = menu.label.split("\n");

  return (
    <div
      className="relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.7) translateY(30px)",
        transition: `all 0.7s ease ${delay}s`,
      }}
    >
      {/* Spike dekoratif untuk highlight card */}
      {menu.highlight && (
        <>
          <Spike top="-14px" left="-10px" rotate="-20deg" />
          <Spike top="-14px" left="50%" rotate="0deg" style={{ transform: "translateX(-50%) rotate(0deg)" }} />
          <Spike top="-14px" right="-10px" rotate="20deg" />
        </>
      )}

      <button
        onClick={() => onClick(menu.id)}
        className={`
          w-full h-52 rounded-2xl border-2 ${menu.border}
          bg-gradient-to-b ${menu.bg}
          flex flex-col items-center justify-between
          py-5 px-3
          shadow-md active:shadow-inner
          transition-all duration-150 select-none cursor-pointer
          ${menu.highlight ? "highlight-card" : "hover:shadow-lg hover:-translate-y-0.5"}
          ${isPressed ? "scale-95 brightness-95" : ""}
        `}
      >
        <div className="text-4xl drop-shadow-md leading-none mt-1">
          {menu.emoji}
        </div>

        <div className={`font-extrabold text-sm tracking-wide text-center leading-tight ${menu.textColor}`}>
          {label.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 text-sm font-bold mb-1 bg-white/60">
          →
        </div>
      </button>
    </div>
  );
}

function Spike({ top, left, right, rotate, style }) {
  return (
    <div
      className="spike absolute z-20 pointer-events-none"
      style={{ top, left, right, transform: `rotate(${rotate})`, ...style }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22">
        <polygon points="11,1 21,21 1,21" fill="#FACC15" stroke="#F59E0B" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function WaveDecor() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
        <path d="M0,80 C240,160 480,0 720,80 C960,160 1200,0 1440,80 L1440,180 L0,180 Z" fill="rgba(255,255,255,0.10)" />
        <path d="M0,120 C360,60 720,160 1080,100 C1260,70 1380,120 1440,140 L1440,180 L0,180 Z" fill="rgba(255,255,255,0.07)" />
      </svg>
    </div>
  );
}