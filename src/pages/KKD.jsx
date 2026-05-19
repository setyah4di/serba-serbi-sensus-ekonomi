import { useEffect, useRef, useState } from "react";
import videoBupati from "../assets/video/KKD_Bupati.mp4";
import videoPajak  from "../assets/video/KKD_Pajak.mp4";
import videoTNI    from "../assets/video/KKD_TNI.mp4";
import videoKadis    from "../assets/video/KKD_Kadis.mp4";

// ── Hook: zoom in saat masuk viewport, zoom out saat keluar ──────────────────
function useZoomOnScroll(threshold = 0.15) {
  const ref = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setZoomed(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, zoomed];
}

// ── Data video ───────────────────────────────────────────────────────────────
const VIDEOS = [
  {
    src: videoBupati,
    title: "Video Dukungan Dari Bupati",
    subtitle: "Kabupaten Tanjung Jabung Barat",
    icon: "🏛️",
    accent: "from-orange-400 to-amber-500",
    tag: "Pemerintah Daerah",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    src: videoTNI,
    title: "Video Dukungan Dari TNI",
    subtitle: "Tanjung Jabung Barat",
    icon: "⭐",
    accent: "from-blue-500 to-indigo-600",
    tag: "TNI",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    src: videoPajak,
    title: "Video Dukungan Dari KPPN Pajak",
    subtitle: "Tanjung Jabung Barat",
    icon: "📊",
    accent: "from-emerald-400 to-teal-600",
    tag: "Instansi Vertikal",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    src: videoKadis,
    title: "Video Dukungan Dari Kepala Dinas",
    subtitle: "Tanjung Jabung Barat",
    icon: "📊",
    accent: "from-emerald-400 to-teal-600",
    tag: "Instansi Dinas",
    tagColor: "bg-red-100 text-gray-700",
  },
];

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function KKD() {
  const [titleRef, titleVisible] = useZoomOnScroll(0.3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div
          ref={titleRef}
          className="mb-14 text-center"
          style={{
            opacity:    titleVisible ? 1 : 0,
            transform:  titleVisible ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <span className="inline-block bg-orange-100 text-orange-600 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            KKD · SE 2026
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
            Komunikasi, Koordinasi,<br className="hidden md:block" /> dan Diplomasi
          </h1>
          <p className="text-gray-400 mt-3 text-sm md:text-base">
            Video dukungan kegiatan Sensus Ekonomi 2026
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="h-px w-12 bg-orange-300 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <div className="h-px w-12 bg-orange-300 rounded-full" />
          </div>
        </div>

        {/* ── Daftar Video ── */}
        <div className="flex flex-col gap-10">
          {VIDEOS.map((v, i) => (
            <VideoCard key={i} video={v} index={i} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ── VideoCard ─────────────────────────────────────────────────────────────────
function VideoCard({ video, index }) {
  const [cardRef, cardVisible] = useZoomOnScroll(0.1);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  // Nomor urut label
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={cardRef}
      style={{
        opacity:    cardVisible ? 1 : 0,
        transform:  cardVisible ? "scale(1) translateY(0)" : "scale(0.88) translateY(40px)",
        transition: `opacity 0.65s ease ${index * 0.1}s, transform 0.65s ease ${index * 0.1}s`,
      }}
    >
      <div className="group bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-500">

        {/* Accent bar gradient atas */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${video.accent}`} />

        {/* ── Info header ── */}
        <div className="flex items-center gap-4 px-6 pt-5 pb-4">
          {/* Nomor */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${video.accent} flex items-center justify-center shadow-md`}>
            <span className="text-white font-extrabold text-lg leading-none">{num}</span>
          </div>

          {/* Teks */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${video.tagColor}`}>
                {video.tag}
              </span>
            </div>
            <h3 className="font-extrabold text-gray-800 text-base md:text-lg leading-tight truncate">
              {video.icon} {video.title}
            </h3>
            <p className="text-gray-600 text-xs mt-0.5 truncate">{video.subtitle}</p>
          </div>
        </div>

        {/* ── Video player ── */}
        <div className="relative w-full aspect-video bg-black overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            controls
            preload="metadata"
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={video.src} type="video/mp4" />
            Browser Anda tidak mendukung pemutar video.
          </video>

          {/* Overlay badge "Sedang Diputar" */}
          {playing && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Sedang Diputar
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium">SE 2026 · BPS Tanjung Jabung Barat</p>
          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${video.accent}`} />
        </div>

      </div>
    </div>
  );
}
