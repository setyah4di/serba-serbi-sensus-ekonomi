import { useEffect, useState } from "react";
import heroPng from "../assets/logo_bps.png";

export default function SplashScreen() {
  const [phase, setPhase] = useState("enter"); // enter → stay → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stay"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-orange-400 overflow-hidden"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "scale(1.04)" : "scale(1)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Animated ring */}
      <div
        className="absolute w-96 h-96 rounded-full border-4 border-white/40"
        style={{
          animation: "ping-slow 2s ease-out infinite",
        }}
      />
      <div
        className="absolute w-72 h-72 rounded-full border-2 border-white/20"
        style={{ animation: "ping-slow 2s ease-out infinite 0.4s" }}
      />

      {/* Logo */}
      <div
        className="relative z-10 flex flex-col items-center gap-5"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "translateY(24px)" : "translateY(0)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        <div className="w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden">
          <img
            src={heroPng}
            alt="BPS Logo"
            className="w-20 h-20 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<span class="text-blue-800 font-extrabold text-2xl">BPS</span>';
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-white font-extrabold text-xl tracking-widest uppercase">
            Badan Pusat Statistik
          </p>
          <p className="text-blue-100 text-sm tracking-widest uppercase mt-1">
            Kabupaten Tanjung Jabung Barat
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-black rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-white rounded-full"
            style={{
              width: phase === "enter" ? "0%" : "100%",
              transition: "width 1.8s ease",
            }}
          />
        </div>

        <p className="text-blue-100 text-xs tracking-widest uppercase mt-1">
          Sensus Ekonomi 2026
        </p>
      </div>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
