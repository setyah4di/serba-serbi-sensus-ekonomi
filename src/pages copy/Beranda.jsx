import { useEffect, useState } from "react";

export default function Beranda() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[520px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80')",
            transform: visible ? "scale(1)" : "scale(1.08)",
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
          <p className="text-orange-400 text-sm uppercase tracking-[0.3em] mb-3 font-semibold">
            Badan Pusat Statistik
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight">
            SERBA-SERBI<br />
            <span className="text-orange-400">SENSUS EKONOMI 2026</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 uppercase tracking-widest font-light">
            Kabupaten Tanjung Jabung Barat
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="bg-orange-500 py-16 px-4">
        <div className="max-w-4xl mx-auto text-gray-900">
          <p className="text-base md:text-lg leading-relaxed text-justify">
            <span className="font-extrabold">Mitra Statistik</span> BPS merupakan tenaga kerja yang
            direkrut oleh BPS untuk menunjang kegiatan statistik di BPS Kabupaten Tanjung Jabung
            Barat. Kegiatan ini merupakan{" "}
            <span className="font-extrabold underline">satu-satunya rekrutmen</span> yang
            diselenggarakan untuk seluruh kegiatan statistik BPS Kabupaten Tanjung Jabung Barat
            tahun 2025 dan{" "}
            <span className="font-extrabold">bukan merupakan rekrutmen CPNS/PPPK</span>. Rekrutmen
            ini bertujuan untuk menyusun{" "}
            <span className="font-extrabold italic">Database</span> Mitra Statistik BPS Kabupaten
            Tanjung Jabung Barat tahun 2025. Calon Mitra Statistik yang lolos akan berpeluang untuk
            menjadi petugas lapangan/pengolahan pada sensus/survei/kegiatan statistik lainnya di
            BPS Kabupaten Tanjung Jabung Barat selama tahun 2025.
          </p>
          <div className="mt-10 text-center">
            <p className="font-bold text-red-800 text-sm md:text-base bg-red-100 inline-block px-4 py-2 rounded-full">
              ⚠ Hati-hati penipuan mengatasnamakan BPS Kabupaten Tanjung Jabung Barat
            </p>
          </div>
        </div>
      </section>

      {/* ── CARDS ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2 uppercase tracking-wide">
            Menu Utama
          </h2>
          <div className="h-1 w-16 bg-orange-500 mx-auto mb-12 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📋", label: "Registrasi", desc: "Daftar sebagai Mitra Statistik SE 2026", path: "/registrasi", color: "bg-blue-600" },
              { icon: "📑", label: "KKD", desc: "Kelengkapan & Kesiapan Dokumen petugas", path: "/kkd", color: "bg-emerald-600" },
              { icon: "📊", label: "Ngibar", desc: "Monitoring progres lapangan harian", path: "/ngibar", color: "bg-purple-600" },
              { icon: "📈", label: "Reporta-SE", desc: "Pelaporan & rekapitulasi Sensus Ekonomi", path: "/reporta-se", color: "bg-orange-500" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.path}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-gray-800 text-base mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
