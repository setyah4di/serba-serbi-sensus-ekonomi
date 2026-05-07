import { useEffect, useState,useRef } from "react";
import { Link } from "react-router-dom";
import berandaBg from "../assets/image/beranda.JPG"

function useScrollZoom() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

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
      
      <section  ref={heroRef} className="relative h-screen min-h-[520px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
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
      
      <section  className="bg-orange-400 py-16 px-4">
        <div ref={introRef} className="max-w-4xl mx-auto text-gray-900"  style={{
      transform: introVisible ? "scale(1)" : "scale(0.9)",
      opacity: introVisible ? 1 : 0,
      transition: "all 0.8s ease",
    }}>
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
        <div   ref={cardRef}
    className="max-w-5xl mx-auto"
    style={{
      transform: cardVisible ? "scale(1)" : "scale(0.95)",
      opacity: cardVisible ? 1 : 0,
      transition: "all 0.8s ease",
    }}>
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2 uppercase tracking-wide">
            Menu Utama
          </h2>
          <div className="h-1 w-16 bg-orange-500 mx-auto mb-12 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📋", label: "Rekrutmen", desc: "Daftar sebagai Mitra Statistik SE 2026", path: "/registrasi", color: "bg-blue-600" },
              { icon: "📑", label: "KKD", desc: "Komunikasi, Koordinasi, dan Diplomasi", path: "/kkd", color: "bg-emerald-600" },
              { icon: "📊", label: "Ngibar", desc: "Ngisi Bareng Data Usaha", path: "/ngibar", color: "bg-purple-600" },
              { icon: "📈", label: "Reporta-SE", desc: "Pelaporan & rekapitulasi Sensus Ekonomi", path: "/reporta-se", color: "bg-orange-500" },
            ].map((item,i) => (
              <Link
                key={item.label}
                to={item.path}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
                style={{
                transform: cardVisible ? "scale(1)" : "scale(0.8)",
                opacity: cardVisible ? 1 : 0,
                transition: `all 0.6s ease ${i * 0.15}s`,
                }}
            >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-gray-800 text-base mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
