import { useState, useEffect } from "react";

const MENUS = [
  {
    id: "daftar-hadir",
    label: "DAFTAR\nHADIR",
    emoji: "⏱️",
    highlight: true,
    bg: "from-yellow-50 to-white",
    border: "border-yellow-300",
    textColor: "text-blue-700",
    url: "http://s.bps.go.id/DaftarHadirNgibarSE1507",
  },
  {
    id: "link-zoom",
    label: "LINK\nZOOM",
    emoji: "🎥",
    highlight: false,
    bg: "from-blue-50 to-white",
    border: "border-blue-100",
    textColor: "text-blue-700",
    url: "https://s.bps.go.id/ZoomNgibarSE1507",
  },
  {
    id: "virtual-Background",
    label: "VIRTUAL\nBACKGROUND",
    emoji: "🖼️",
    highlight: false,
    bg: "from-blue-50 to-white",
    border: "border-blue-100",
    textColor: "text-blue-700",
    url: "https://drive.google.com/file/d/109QG-1yxBGHxMAPce1VwsanOG7VSk6Gx/view",
  },
  {
    id: "kuesioner",
    label: "KUESIONER",
    emoji: "📋",
    highlight: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    textColor: "text-blue-700",
    url: "https://s.bps.go.id/KuesionerUB_1507",
  },
  {
    id: "materi",
    label: "MATERI",
    emoji: "📁",
    highlight: false,
    bg: "from-yellow-50 to-white",
    border: "border-yellow-100",
    textColor: "text-blue-700",
    url: "http://s.bps.go.id/MateriNgibarSE1507",
  },
  {
    id: "surat",
    label: "Surat Undangan",
    emoji: "📩",
    highlight: false,
    bg: "from-red-50 to-white",
    border: "border-red-100",
    textColor: "text-blue-700",
    url: "http://s.bps.go.id/UndanganNgibarSE1507",
  },
  {
    id: "qa",
    label: "Pertanyaan",
    emoji: "💬",
    highlight: false,
    bg: "from-purple-50 to-white",
    border: "border-purple-100",
    textColor: "text-blue-700",
    url: "http://s.bps.go.id/QNANgibarSE1507",
  },
];

export default function Ngibar() {
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
        <div className="mb-5 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 backdrop-blur-sm">
            Ngibar · Sensus Ekonomi 2026
          </span>
          <h1 className="text-3xl font-extrabold text-white drop-shadow">
            Ngisi Bareng Sensus Ekonomi 2026
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Pilih menu di bawah ini untuk mengaksesnya
          </p>
        </div>

        {/* ── Layout A: 3 – 2 – 2 ── */}
        <div className="flex flex-col gap-4">

          {/* Baris 1 — 3 kolom */}
          <div className="grid grid-cols-3 gap-4">
            {MENUS.slice(0, 3).map((m, i) => (
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

          {/* Baris 2 — 2 kolom tengah */}
{/* Baris 2 */}
<div className="grid grid-cols-2 gap-4">
  <MenuCard
    menu={MENUS[3]}
    pressed={pressed}
    onClick={handleClick}
    visible={visible}
    delay={0.3}
  />

  <MenuCard
    menu={MENUS[4]}
    pressed={pressed}
    onClick={handleClick}
    visible={visible}
    delay={0.4}
  />
</div>

{/* Baris 3 */}
<div className="grid grid-cols-2 gap-4">
  <MenuCard
    menu={MENUS[5]}
    pressed={pressed}
    onClick={handleClick}
    visible={visible}
    delay={0.5}
  />

    <MenuCard
      menu={MENUS[6]}
      pressed={pressed}
      onClick={handleClick}
      visible={visible}
      delay={0.6}
    />
</div>

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