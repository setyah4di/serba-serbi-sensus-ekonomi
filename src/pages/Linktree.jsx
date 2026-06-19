import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MENUS = [
  {
    id: "matriks",
    label: "Matriks Pelatihan SE2026",
    emoji: "📅",
    big: true,
    bg: "from-orange-50 to-white",
    border: "border-orange-200",
    url: "https://drive.google.com/drive/folders/1lqd5tOu5ixbiFzqhclnkRovII6Uyuqfq",
  },
  {
    id: "training",
    label: "Tautan WEB\nTraining GOJAGS",
    emoji: "🌐",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://gojags-training.bps.go.id",
  },
  {
    id: "classroom",
    label: "Tautan WEB\nClassroom GOJAGS",
    emoji: "📘",
    big: false,
    bg: "from-blue-50 to-white",
    border: "border-blue-100",
    url: "https://gojags-classroom.bps.go.id",
  },
  {
    id: "video",
    label: "Daftar Alokasi Petugas",
    emoji: "🧑‍🏭",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://docs.google.com/spreadsheets/d/1CbuukhxqKjYQWMGY4DdN8tArwjbD5e0vlcaaf82uYiM/edit?gid=1541524641#gid=1541524641",
  },
  {
    id: "materi",
    label: "Video Materi Pelatihan",
    emoji: "▶️",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://www.youtube.com/playlist?list=PLKL-X2vrqb6nvYt_WkBP0Qs5q24VauQkH",
  },
  {
    id: "lk",
    label: "LK Penilaian",
    emoji: "📋",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://drive.google.com/drive/u/1/folders/1Hq-z9D3diQdZ7r2o3TJXdaaE5mZGGZOs",
  },
  {
    id: "laporan",
    label: "Laporan Pelatihan Per Kelas",
    emoji: "🔍",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://drive.google.com/drive/folders/1x9Y9jGBld5kCSrUycIq3JMM8PrPD-vJ7",
  },
  {
    id: "dokumentasi",
    label: "Dokumentasi Kegiatan",
    emoji: "📷",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://drive.google.com/drive/folders/1pOWgDSy49g6LmlaxwsMIm9S4_G56MQoF",
  },
  {
    id: "arsip",
    label: "Q & A Pelatihan",
    emoji: "🗨️",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://docs.google.com/spreadsheets/d/1xxj1CHMlzvyJzrESEbpfAXq0hqGo3a8fuNW2rAbKdAo/edit?gid=1828671124#gid=1828671124",
  },
  {
    id: "progress",
    label: "Progress Petugas Pencacahan",
    emoji: "👮",
    big: false,
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
    url: "https://drive.google.com/drive/folders/1qu8OTvoQcObfQuvp5YD7wXj4ov11z1lL?usp=sharing",
  },
];

export default function Linktree() {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleClick = (id) => {
    // Jika Progress Petugas, tampilkan popup sub menu
    if (id === "progress") {
      setShowSubMenu(true);
      return;
    }

    setPressed(id);
    const menu = MENUS.find((m) => m.id === id);
    setTimeout(() => {
      window.open(menu.url.trim(), "_blank", "noopener noreferrer");
      setPressed(null);
    }, 180);
  };

  const handleSubMenuClick = (type) => {
    if (type === "website") {
      setShowSubMenu(false);
      navigate("/monitoring-petugas");
    } else if (type === "spreadsheet") {
      window.open(
        "https://drive.google.com/drive/folders/1qu8OTvoQcObfQuvp5YD7wXj4ov11z1lL?usp=sharing",
        "_blank",
        "noopener noreferrer"
      );
      setShowSubMenu(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #F5A623 0%, #F28C28 60%, #e8820a 100%)",
        padding: isMobile ? "24px 12px" : "60px 16px",
      }}
    >
      <div
        className="mx-auto relative z-10"
        style={{
          maxWidth: isMobile ? "100%" : "768px",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: "all 0.6s ease",
        }}
      >
        {isMobile ? (
          /* ── MOBILE: semua card full-width, stack vertikal ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Card Matriks — horizontal di mobile */}
            <MobileCardBig
              menu={MENUS[0]}
              pressed={pressed}
              onClick={handleClick}
              visible={visible}
              delay={0}
            />
            {/* Baris 2 card kecil: 2 kolom */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {MENUS.slice(1, 3).map((m, i) => (
                <MobileCardSmall
                  key={m.id}
                  menu={m}
                  pressed={pressed}
                  onClick={handleClick}
                  visible={visible}
                  delay={0.05 * (i + 1)}
                />
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {MENUS.slice(3, 5).map((m, i) => (
                <MobileCardSmall
                  key={m.id}
                  menu={m}
                  pressed={pressed}
                  onClick={handleClick}
                  visible={visible}
                  delay={0.05 * (i + 3)}
                />
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {MENUS.slice(5, 7).map((m, i) => (
                <MobileCardSmall
                  key={m.id}
                  menu={m}
                  pressed={pressed}
                  onClick={handleClick}
                  visible={visible}
                  delay={0.05 * (i + 5)}
                />
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {MENUS.slice(7, 9).map((m, i) => (
                <MobileCardSmall
                  key={m.id}
                  menu={m}
                  pressed={pressed}
                  onClick={handleClick}
                  visible={visible}
                  delay={0.05 * (i + 7)}
                />
              ))}
            </div>
            <div
              style={{
               display: "flex", flexDirection: "column", gap: 12
              }}
            >
               <MobileCardBig
              menu={MENUS[9]}
              pressed={pressed}
              onClick={handleClick}
              visible={visible}
              delay={0}
            />
            </div>
          </div>
        ) : (
          /* ── DESKTOP: layout 3 baris seperti sebelumnya ── */
          <>
            {/* Baris 1 */}
            <div
              className="grid gap-4 mb-4"
              style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
            >
              <MenuCard
                menu={MENUS[0]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0}
                big
              />
              <MenuCard
                menu={MENUS[1]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.1}
              />
              <MenuCard
                menu={MENUS[2]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.15}
              />
            </div>

            {/* Baris 2 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <MenuCard
                menu={MENUS[3]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.2}
              />
              <MenuCard
                menu={MENUS[4]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.25}
              />
              <MenuCard
                menu={MENUS[5]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.3}
              />
            </div>

            {/* Baris 3 */}
            <div className="grid grid-cols-4 gap-4">
              <MenuCard
                menu={MENUS[6]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.35}
              />
              <MenuCard
                menu={MENUS[7]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.4}
              />
              <MenuCard
                menu={MENUS[8]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.45}
              />
              <MenuCard
                menu={MENUS[9]}
                pressed={pressed}
                onClick={handleClick}
                visible={visible}
                delay={0.5}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Popup Sub Menu Progress Petugas */}
      {showSubMenu && (
        <PopupSubMenu onClose={() => setShowSubMenu(false)} onSelect={handleSubMenuClick} />
      )}
    </div>
  );
}

/* Card besar horizontal — untuk mobile */
function MobileCardBig({ menu, pressed, onClick, visible, delay }) {
  const isPressed = pressed === menu.id;
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `all 0.6s ease ${delay}s`,
      }}
    >
      <button
        onClick={() => onClick(menu.id)}
        style={{
          width: "100%",
          minHeight: 80,
          borderRadius: 16,
          border: "2px solid #fed7aa",
          background: "linear-gradient(135deg, #fff7ed, #ffffff)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          cursor: "pointer",
          textAlign: "left",
          transform: isPressed ? "scale(0.97)" : "scale(1)",
          transition: "all 0.15s ease",
        }}
      >
        <span style={{ fontSize: 36, flexShrink: 0 }}>{menu.emoji}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1e40af",
            lineHeight: 1.3,
          }}
        >
          {menu.label}
        </span>
      </button>
    </div>
  );
}

/* Card kecil — untuk mobile, 2 kolom */
function MobileCardSmall({ menu, pressed, onClick, visible, delay }) {
  const isPressed = pressed === menu.id;
  const lines = menu.label.split("\n");
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `all 0.6s ease ${delay}s`,
      }}
    >
      <button
        onClick={() => onClick(menu.id)}
        style={{
          width: "100%",
          minHeight: 110,
          borderRadius: 16,
          border: "1px solid #fed7aa",
          background: "linear-gradient(180deg, #fff7ed, #ffffff)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          cursor: "pointer",
          transform: isPressed ? "scale(0.97)" : "scale(1)",
          transition: "all 0.15s ease",
        }}
      >
        <span style={{ fontSize: 30 }}>{menu.emoji}</span>
        <span
          style={{
            fontWeight: 600,
            fontSize: 12,
            color: "#1e40af",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {lines.map((line, i) => (
            <span key={i} style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </span>
      </button>
    </div>
  );
}

/* Card desktop — tidak berubah */
function MenuCard({ menu, pressed, onClick, visible, delay, big = false }) {
  const isPressed = pressed === menu.id;
  const lines = menu.label.split("\n");

  if (big) {
    return (
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: `all 0.6s ease ${delay}s`,
        }}
      >
        <button
          onClick={() => onClick(menu.id)}
          className={`
            w-full h-full min-h-44 rounded-2xl border-2 ${menu.border}
            bg-gradient-to-br ${menu.bg}
            flex flex-row items-center justify-start
            gap-6 px-8 py-6 shadow-sm hover:shadow-md
            transition-all duration-150 select-none cursor-pointer text-left
            ${isPressed ? "scale-95 brightness-95" : "hover:-translate-y-0.5"}
          `}
        >
          <div className="text-6xl drop-shadow flex-shrink-0">{menu.emoji}</div>
          <div>
            <p className="font-bold text-lg text-blue-800 leading-tight mb-1">
              {menu.label}
            </p>
            {menu.sub && (
              <p className="text-sm text-gray-500 leading-snug">{menu.sub}</p>
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.6s ease ${delay}s`,
      }}
    >
      <button
        onClick={() => onClick(menu.id)}
        className={`
          w-full min-h-36 rounded-2xl border ${menu.border}
          bg-gradient-to-b ${menu.bg}
          flex flex-col items-center justify-center
          gap-3 px-3 py-5 shadow-sm hover:shadow-md
          transition-all duration-150 select-none cursor-pointer
          ${isPressed ? "scale-95 brightness-95" : "hover:-translate-y-0.5"}
        `}
      >
        <div className="text-4xl drop-shadow">{menu.emoji}</div>
        <div className="font-semibold text-sm text-blue-800 text-center leading-tight">
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </button>
    </div>
  );
}

/* Popup Sub Menu untuk Progress Petugas */
function PopupSubMenu({ onClose, onSelect }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          maxWidth: 400,
          width: "90%",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1e40af",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Progress Petugas Pencacahan
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Sub Menu Website */}
          <button
            onClick={() => onSelect("website")}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "2px solid #3b82f6",
              backgroundColor: "#dbeafe",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              color: "#1e40af",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#93c5fd";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#dbeafe";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span>🌐</span>
            Website
          </button>

          {/* Sub Menu Spreadsheet */}
          <button
            onClick={() => onSelect("spreadsheet")}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "2px solid #f97316",
              backgroundColor: "#fed7aa",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              color: "#b45309",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fdba74";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fed7aa";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span>📊</span>
            Spreadsheet
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#e5e7eb",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            color: "#4b5563",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#e5e7eb";
          }}
        >
          Tutup
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
