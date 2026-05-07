import videoBupati from "../assets/video/KKD_Bupati.mp4";
import videoPajak from "../assets/video/KKD_Pajak.mp4";

export default function KKD() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800">Komunikasi, Koordinasi, dan Diplomasi</h1>
          <p className="text-gray-500 text-sm mt-1">video sambutan kegiatan Sensus Ekonomi 2026</p>
          <div className="h-1 w-16 bg-orange-400 mt-4 rounded-full" />
        </div>

        {/* ── Layout video ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Video Bupati — Horizontal 16:9, mengisi sisa ruang */}
          <div className="flex-1 min-w-0">
            <VideoCard
              src={videoPajak}
              title="Sambutan Dari KPPN Pajak "
              subtitle="Tanjung Jabung Barat"
              badge="Horizontal"
              badgeColor="bg-blue-100 text-blue-700"
              aspect="aspect-video"
            />
          </div>

          {/* Video Pajak — Vertikal 9:16, lebar tetap */}
          <div className="w-full lg:w-60 flex-shrink-0">
            <VideoCard
              src={videoBupati}
              title="Sambutan Dari Bupati "
              subtitle="Kabupaten Tanjung Jabung Barat"
              badge="Vertikal"
              badgeColor="bg-purple-100 text-purple-700"
              aspect="aspect-[9/16]"
            />
          </div>

        </div>

      </div>
    </div>
  );
}

// ── VideoCard ─────────────────────────────────────────────────────────────────
function VideoCard({ src, title, subtitle, badge, badgeColor, aspect }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

      {/* Wrapper rasio — aspect-video = 16:9 | aspect-[9/16] = 9:16 */}
      <div className={`relative w-full ${aspect} bg-black`}>
        <video
          className="absolute inset-0 w-full h-full object-contain"
          controls
          preload="metadata"
          playsInline
        >
          <source src={src} type="video/mp4" />
          Browser Anda tidak mendukung pemutar video.
        </video>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${badgeColor}`}>
          {badge}
        </span>
        <h3 className="font-extrabold text-gray-800 text-base leading-tight mt-2">{title}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
      </div>

    </div>
  );
}
