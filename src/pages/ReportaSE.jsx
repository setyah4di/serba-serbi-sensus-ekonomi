const NEWS_DATA = [
  {
    id: 1,
    tanggal: "27 Februari 2026",
    judul: "Ekonomi Kabupaten Tanjung Jabung Barat Tahun 2025 Tumbuh 5,28 Persen",
    url: "https://tanjabbarkab.bps.go.id",
    image: "https://picsum.photos/300/200?random=1",
  },
  {
    id: 2,
    tanggal: "28 Februari 2025",
    judul: "Pertumbuhan Ekonomi Kabupaten Tanjung Jabung Barat Tahun 2024",
    url: "https://tanjabbarkab.bps.go.id",
    image: "https://picsum.photos/300/200?random=2",
  },
  {
    id: 3,
    tanggal: "13 Desember 2024",
    judul: "Indeks Pembangunan Manusia (IPM) Kabupaten Tanjung Jabung Barat tahun 2024 mencapai 72,01",
    url: "https://tanjabbarkab.bps.go.id",
    image: "https://picsum.photos/300/200?random=3",
  },
  {
    id: 4,
    tanggal: "13 Desember 2024",
    judul: "Tingkat Pengangguran Terbuka (TPT) Agustus 2024 sebesar 3,20 persen",
    url: "https://tanjabbarkab.bps.go.id",
    image: "https://picsum.photos/300/200?random=4",
  },
  {
    id: 5,
    tanggal: "7 Agustus 2024",
    judul: "Persentase penduduk miskin di Kabupaten Tanjung Jabung Barat pada Maret 2024 sebesar 9,54 persen",
    url: "https://tanjabbarkab.bps.go.id",
    image: "https://picsum.photos/300/200?random=5",
  },
  {
    id: 6,
    tanggal: "1 April 2024",
    judul: "Ekonomi Kabupaten Tanjung Jabung Barat Tahun 2023 Tumbuh 3,51 Persen",
    url: "https://tanjabbarkab.bps.go.id",
    image: "https://picsum.photos/300/200?random=6",
  },
];

const BRS_DATA = [
  {
    id: 1,
    tanggal: "27 Februari 2026",
    judul: "Ekonomi Kabupaten Tanjung Jabung Barat Tahun 2025 Tumbuh 5,28 Persen",
    image: "https://picsum.photos/300/200?random=11",
    url: "#",
  },
  {
    id: 2,
    tanggal: "28 Februari 2025",
    judul: "Pertumbuhan Ekonomi Kabupaten Tanjung Jabung Barat Tahun 2024",
    image: "https://picsum.photos/300/200?random=12",
    url: "#",
  },
  {
    id: 3,
    tanggal: "13 Desember 2024",
    judul: "Indeks Pembangunan Manusia (IPM) Kabupaten Tanjung Jabung Barat tahun 2024 mencapai 72,01",
    image: "https://picsum.photos/300/200?random=13",
    url: "#",
  },
  {
    id: 4,
    tanggal: "13 Desember 2024",
    judul: "Tingkat Pengangguran Terbuka (TPT) Agustus 2024 sebesar 3,20 persen",
    image: "https://picsum.photos/300/200?random=14",
    url: "#",
  },
  {
    id: 5,
    tanggal: "7 Agustus 2024",
    judul: "Persentase penduduk miskin di Kabupaten Tanjung Jabung Barat pada Maret 2024 sebesar 9,54 persen",
    image: "https://picsum.photos/300/200?random=15",
    url: "#",
  },
  {
    id: 6,
    tanggal: "1 April 2024",
    judul: "Ekonomi Kabupaten Tanjung Jabung Barat Tahun 2023 Tumbuh 3,51 Persen",
    image: "https://picsum.photos/300/200?random=16",
    url: "#",
  },
];

const styles = `
  @keyframes zoomInFade {
    0%   { opacity: 0; transform: scale(0.85); }
    60%  { opacity: 1; transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes zoomInFadeItem {
    0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  .page-wrapper {
    animation: zoomInFade 0.6s ease-out forwards;
  }

  .news-card {
    animation: zoomInFadeItem 0.5s ease-out forwards;
    opacity: 0;
  }

  /* Thumbnail responsif: ukuran berubah sesuai layar */
  .thumb-brs {
    width: 7rem;
    height: 6rem;
    flex-shrink: 0;
    border-radius: 0.75rem;
    overflow: hidden;
    background: #f3f4f6;
  }

  .thumb-news {
    width: 6rem;
    height: 6rem;
    flex-shrink: 0;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #f3f4f6;
  }

  /* Di layar sangat kecil (<360px): thumbnail lebih kecil */
  @media (max-width: 360px) {
    .thumb-brs { width: 5rem; height: 5rem; }
    .thumb-news { width: 4.5rem; height: 4.5rem; }
    .title-brs { font-size: 0.95rem !important; }
    .title-news { font-size: 0.875rem !important; }
  }

  /* Di layar tablet (768px–1023px): 2 kolom dengan gap lebih lega */
  @media (min-width: 768px) {
    .thumb-brs { width: 8rem; height: 7rem; }
    .thumb-news { width: 7rem; height: 7rem; }
  }

  /* Di layar besar (>=1024px): thumbnail lebih besar */
  @media (min-width: 1024px) {
    .thumb-brs { width: 9rem; height: 7.5rem; }
    .thumb-news { width: 7.5rem; height: 7.5rem; }
  }

  /* Hover effect kartu */
  .card-link {
    text-decoration: none;
    display: flex;
    gap: 1rem;
    background: white;
    border-radius: 1rem;
    padding: 1rem;
    border: 1px solid #f3f4f6;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .card-link:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    transform: translateY(-2px);
  }
  .card-link:active {
    transform: scale(0.98);
  }

  img { display: block; width: 100%; height: 100%; object-fit: cover; }
`;

export default function ReportaSE() {
  return (
    <>
      <style>{styles}</style>

      <div className="page-wrapper min-h-screen bg-gray-100">

        {/* Container utama — padding responsif */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "clamp(1rem, 4vw, 2.5rem) clamp(0.75rem, 4vw, 1.5rem)",
          }}
        >

          {/* ── SEKSI BERITA RESMI STATISTIK ── */}
          <section style={{ marginBottom: "clamp(1.5rem, 4vw, 3rem)" }}>

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "clamp(1rem, 3vw, 1.5rem)",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "clamp(1.25rem, 3.5vw, 1.875rem)",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Berita Resmi Statistik
                </h2>
                <p style={{ color: "#6b7280", marginTop: "0.25rem", fontSize: "clamp(0.8rem, 2vw, 0.95rem)" }}>
                  BPS Kabupaten Tanjung Jabung Barat
                </p>
              </div>
              <animateTransform
                href="https://tanjabbarkab.bps.go.id/id/pressrelease"
                style={{
                  color: "#1d4ed8",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
                  whiteSpace: "nowrap",
                  alignSelf: "center",
                }}
              >
                Lihat Semua →
              </animateTransform>
            </div>

            {/* Grid BRS — 1 kolom di HP, 2 kolom di tablet+ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
                gap: "clamp(0.75rem, 2vw, 1.25rem)",
              }}
            >
              {BRS_DATA.map((item, index) => (
                <a
                  key={item.id}
                  href={item.url}
                  className="card-link news-card"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="thumb-brs">
                    <img src={item.image} alt={item.judul} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.4rem" }}>
                      {item.tanggal}
                    </p>
                    <h3
                      className="title-brs"
                      style={{
                        fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: 1.45,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.judul}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* ── SEKSI NEWS (bagian bawah) ── */}
          <section>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
                gap: "clamp(0.75rem, 2vw, 1rem)",
              }}
            >
              {NEWS_DATA.map((item, index) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link news-card"
                  style={{ animationDelay: `${(BRS_DATA.length + index) * 80}ms` }}
                >
                  <div className="thumb-news">
                    <img src={item.image} alt={item.judul} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.4rem" }}>
                      {item.tanggal}
                    </p>
                    <h3
                      className="title-news"
                      style={{
                        fontSize: "clamp(0.875rem, 2vw, 1.0625rem)",
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: 1.5,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.judul}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}