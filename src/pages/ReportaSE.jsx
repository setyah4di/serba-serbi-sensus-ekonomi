import { useEffect, useRef, useState } from "react";
import reportaseImg from "../assets/image/reportase.jpeg";
import reportaseImg2 from "../assets/image/reportase2.jpeg";
import reportaseImg3 from "../assets/image/reportase3.jpeg";
import reportasePdf from "../assets/file/REPORTASEVOL1.pdf";
import reportasePd2 from "../assets/file/REPORTASEVOL2.pdf";
import reportasePd3 from "../assets/file/REPORTASEVOL3.pdf";

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

function PublicationCard({ vol, title, img, pdf, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [cardRef, cardVisible] = useScrollZoom(0.1);

  return (
    <div
      ref={cardRef}
      style={{
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible
          ? "scale(1) translateY(0)"
          : "scale(0.88) translateY(40px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      <a
        href={pdf}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block relative group"
        title={`Buka ${title} (PDF)`}
      >
        {/* Card wrapper */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100"
          style={{
            transform: hovered
              ? "scale(1.03) translateY(-6px)"
              : "scale(1) translateY(0)",
            boxShadow: hovered
              ? "0 32px 64px rgba(249,115,22,0.25), 0 8px 24px rgba(0,0,0,0.12)"
              : "0 8px 32px rgba(0,0,0,0.10)",
            transition: "transform 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          {/* Cover image */}
          <img
            src={img}
            alt={`Cover ${title}`}
            className="block w-full object-cover"
            style={{ maxWidth: 380, maxHeight: 540 }}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-white font-extrabold text-base drop-shadow">
              Buka PDF
            </p>
            <p className="text-white/70 text-xs uppercase tracking-widest">
              {title}
            </p>
          </div>
        </div>

        {/* Volume badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-widest">
            {vol}
          </span>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9v10a2 2 0 01-2 2z"
              />
            </svg>
            Unduh / Baca PDF
          </span>
        </div>
      </a>
    </div>
  );
}

export default function ReportaSE() {
  const [headerRef, headerVisible] = useScrollZoom(0.1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex flex-col items-center justify-center py-8 px-4">

      {/* ── Header ── */}
      <div
        ref={headerRef}
        className="text-center mb-8"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <span className="inline-block bg-orange-100 text-orange-600 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
          Reporta-SE · Vol. 1 & 2
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
          Reporta Sensus Ekonomi 2026
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

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:flex-row items-start justify-center gap-10">
        <PublicationCard
          vol="Vol. 1"
          title="REPORTASE SE Vol. 1"
          img={reportaseImg}
          pdf={reportasePdf}  
          delay={0.15}
        />
        <PublicationCard
          vol="Vol. 2"
          title="REPORTASE SE Vol. 2"
          img={reportaseImg2}   // ← ganti dengan import gambar cover Vol. 2 jika ada
          pdf={reportasePd2}
          delay={0.3}
        />
        <PublicationCard
          vol="Vol. 3"
          title="REPORTASE SE Vol. 3"
          img={reportaseImg3}   // ← ganti dengan import gambar cover Vol. 3 jika ada
          pdf={reportasePd3}
          delay={0.45}
        />
      </div>

    </div>
  );
}