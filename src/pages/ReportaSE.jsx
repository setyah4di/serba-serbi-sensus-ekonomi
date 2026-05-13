import { useEffect, useRef, useState } from "react";
import reportaseImg from "../assets/image/reportase.jpeg";
import reportasePdf from "../assets/file/REPORTASEVol1.pdf";

function useScrollZoom(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function ReportaSE() {
  const [cardRef, cardVisible] = useScrollZoom(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex flex-col items-center justify-center py-20 px-4">

      {/* ── Header ── */}
      <div
        className="text-center mb-12"
        style={{
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <span className="inline-block bg-orange-100 text-orange-600 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
          Reporta-SE · Vol. 1
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
          Reportase Sensus Ekonomi 2026
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Klik pada gambar untuk membaca publikasi
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px w-10 bg-orange-300 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <div className="h-px w-10 bg-orange-300 rounded-full" />
        </div>
      </div>

      {/* ── Image Card ── */}
      <div
        ref={cardRef}
        style={{
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "scale(1) translateY(0)" : "scale(0.88) translateY(40px)",
          transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
        }}
      >
        <a
          href={reportasePdf}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="block relative group"
          title="Buka Reportase SE Vol. 1 (PDF)"
        >
          {/* Card wrapper */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100"
            style={{
              transform: hovered ? "scale(1.03) translateY(-6px)" : "scale(1) translateY(0)",
              boxShadow: hovered
                ? "0 32px 64px rgba(249,115,22,0.25), 0 8px 24px rgba(0,0,0,0.12)"
                : "0 8px 32px rgba(0,0,0,0.10)",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
            }}
          >
            {/* Cover image */}
            <img
              src={reportaseImg}
              alt="Cover Reportase SE 2026 Vol. 1"
              className="block w-full object-cover"
              style={{ maxWidth: 420, maxHeight: 600 }}
            />

            {/* Hover overlay */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-[2px]"
              style={{
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* PDF icon */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/60 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white font-extrabold text-base drop-shadow">Buka PDF</p>
              <p className="text-white/70 text-xs">REPORTASE SE Vol. 1</p>
            </div>
          </div>

          {/* Badge bawah card */}
          <div
            className="mt-5 flex items-center justify-center gap-2"
            style={{
              transform: hovered ? "translateY(4px)" : "translateY(0)",
              transition: "transform 0.3s ease",
            }}
          >
            <span className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9v10a2 2 0 01-2 2z" />
              </svg>
              Unduh / Baca PDF
            </span>
          </div>
        </a>
      </div>

    </div>
  );
}
