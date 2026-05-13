"use client";

import { useState, useEffect, useMemo } from "react";

  const NAMA_LULUS = [
  "Siska Handayani",
  "Jhon Sadarman Purba",
  "Rizka Tulzannah",
  "Rhefy Dian Brillian",
  "Alfiqri",
  "Puput Mentari",
  "Katon Zanza Anaqu",
  "Fitri Hariyati",
  "Siti Muslimah",
  "Kevin Halomoan Hutagalung",
  "Eka Mayasari",
  "Reski",
  "Robi Setioko",
  "Ilham Musliadi",
  "Ricky Efriansyah",
  "Randi Sugitok",
  "Wella",
  "Wella",
  "Sugianto",
  "Albrian Dafinsa",
  "Nurul Fadila",
  "Abd Rahman",
  "Achmad Husaen",
  "Nafasya Chaira Maidipa",
  "Nurhani",
  "Ilham Gunawan",
  "Vani Ulina Munthe",
  "Riris Silitonga",
  "Gabriela Spanic Aritonang",
  "Ferdinan Pandiangan",
  "Arif Elwan Prabowo",
  "Mutiara Anesa Putri",
  "Putri Nurhidayati",
  "Rahmatiah",
  "Sahriansyah",
  "M Farid Wajdi",
  "Juwanda Francisco Sinaga",
  "Samson Ambarita",
  "Ade Saputra",
  "Hadromi",
  "Joni Iskandar",
  "Salamudin",
  "Yuli Fitriani",
  "Mardiah",
  "Putri Sekar Sari",
  "Rosanti",
  "Nadia Izzatin Nisa",
  "Ghufron Vanani",
  "Rinda",
  "Sumini",
  "M Ali Akbar",
  "Elarita",
  "Yuni Arnita",
  "Linda Istna Mawaddah",
  "Harry Ratul Jannah",
  "Prayoga Pangestu",
  "M. Sandi Maulana",
  "Mona Br Siahaan",
  "Citra Annisa",
  "Yonithri Sherlyna",
  "M. Erfan Wardana",
  "Desti Fertiwi",
  "Muhammad Ilyas",
  "Vifi Febrian",
  "Muchamad Rizki Wahyudi",
  "Sunarlin, S. Pd",
  "Al-Reyza Dewangga",
  "Ella Yolanda",
  "Adi Prasetyo",
  "Shinta Almira",
  "Muhajir Sulthon",
  "Nurafni",
  "Novita Seni Wahyuni",
  "Friska Bintang Saputri",
  "Tiara Sabrina",
  "Witri Nurhikmah",
  "Rafif",
  "Syafira Maulida",
  "Selli Noviriani",
  "M.Sopiyanto",
  "Nur Kalbi",
  "Fitriyani",
  "Agung Rizki Dwi Putra",
  "Yunita Sari",
  "Ana Fitriana",
  "Sira Sindia",
  "Ahmad Muhaimin",
  "Debi Satrio",
  "Miftakhul Arif",
  "Asela Komala Sari",
  "Muhammad Akbar",
  "Tri Wahono Widodo",
  "Jihan Syakirah",
  "M Muklas Adi Putra",
  "Aprianti",
  "Siti Soleha",
  "Prafmanto",
  "Rizky Septiana Ningrum",
  "Agnan Chakim Ramadhan",
  "Nur Azizah",
  "Ernawati",
  "Hanifan Dicky Permana",
  "Muhammad Syamsul Arifin",
  "Nani Sofiyani",
  "Devi Ratna Sari",
  "M. Habiburrahman",
  "Nurul Febriyana",
  "Anisa Dwi Panira",
  "Arasman",
  "Chandana Putra",
  "Rudi Desta Yandri",
  "Muhammad Difa' Abdillah",
  "Ahmad Surya Irawan",
  "Fadila Habsah Perangi-Angin",
  "Desi Ayundari",
  "Novi Apriani",
  "Hanik Purwati",
  "Putri Ayu Ningsih",
  "M Ali",
  "Desi Liana",
  "Eka Susilawati",
  "Rizki Anshori",
  "Erik Sernando",
  "Bela Kurnia Sari",
  "Supriyadi Ramadhan",
  "Megawati",
  "Anisa Melinda",
  "Indah Minarsih",
  "Muhammad Nazmi",
  "Muhammad Hamdani",
  "Dini Sri Wulandari",
  "Malasari",
  "Yaumul Mashud",
  "Retna Swita",
  "Cahya Indah Sari",
  "Kamaria Ulpa",
  "Roma Kusuma Dewi",
  "Muhajir",
  "Muhammad El Farisy Wardana",
  "Deni Arisman",
  "Khairul Anwar",
  "Sholikhul Hadi",
  "Muhammad Syaiful Bahri",
  "Cici Triani",
  "May Kristiani Simarmata",
  "Immanuel Pabri Marbun",
  "Noer Hidayat MJ",
  "Retno Evri Yunita",
  "Siti Makiyah",
  "Arini Astari",
  "Iryuvelamea Anggiah",
  "Novi Lyanti Siahaan",
  "Mualip Alvian",
  "M. Nur Abdullah",
  "Siti Maemunah",
  "Nuh Saini",
  "Laurent Clarita Sinaga",
  "Muhammad Adi Prasetyo",
  "Mujianto",
  "Zafira Rizki Ethaviana",
  "Sukiman",
  "Muhayidin",
  "Nihlatus Shofiyyah",
  "Moeh Lexsy Setiyono",
  "Arnika Sari",
  "Ovi Oktavia Dewi",
];
const PER_PAGE = 10;



export default function PengumumanAdministrasi() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Reset halaman setiap kali search berubah
//   useEffect(() => {
//     setPage(1);
// }, [search]); // Hanya depend ke search, tidak perlu setPage


  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NAMA_LULUS;
    return NAMA_LULUS.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Nomor urut global (bukan per-page)
  const startNo = (page - 1) * PER_PAGE + 1;

  // Buat range tombol paginasi
  const pageButtons = () => {
    const range = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { range.push(1); if (left > 2) range.push("..."); }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages) { if (right < totalPages - 1) range.push("..."); range.push(totalPages); }
    return range;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff8f0 0%, #fff3e8 50%, #ffecd6 100%)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* ===== HEADER ===== */}
      <div
        style={{
          background: "linear-gradient(135deg, #F28C28 0%, #e07820 60%, #c96610 100%)",
          padding: "40px 24px 32px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(242,140,40,0.35)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-24px)",
          transition: "all 0.7s ease",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: "999px",
            padding: "6px 18px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.95)", fontWeight: "600", letterSpacing: "1px" }}>
            REKRUTMEN MITRA BPS 2026
          </span>
        </div>

        <div style={{ fontSize: "36px", marginBottom: "10px" }}>📋</div>

        <h1
          style={{
            color: "white",
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 8px",
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Pengumuman Seleksi Administrasi
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", margin: 0 }}>
          Daftar peserta yang dinyatakan <strong>LULUS</strong> tahapan seleksi administrasi
        </p>

        {/* Stat strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "👥", label: "Total Peserta Lulus", val: NAMA_LULUS.length },
            { icon: "📅", label: "Tanggal Pengumuman", val: "13 Mei 2026" },
            { icon: "⏭️", label: "Tahap Selanjutnya", val: "Seleksi Kompetensi" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: "12px",
                padding: "12px 20px",
                minWidth: "140px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "2px" }}>{s.icon}</div>
              <div style={{ color: "white", fontWeight: "800", fontSize: "16px" }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== KONTEN ===== */}
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "32px 16px 60px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s ease 0.2s",
        }}
      >
        {/* Info Banner */}
        <div
          style={{
            background: "#fff9f0",
            border: "1.5px solid #F28C28",
            borderLeft: "5px solid #F28C28",
            borderRadius: "12px",
            padding: "14px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
            Peserta yang namanya tercantum di bawah ini <strong>wajib mengikuti tahap Seleksi Kompetensi</strong>.
            Apabila nama Anda tidak tercantum, Anda dinyatakan tidak lulus tahap seleksi administrasi.
            Keputusan panitia bersifat mutlak dan tidak dapat diganggu gugat.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <span
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: "#F28C28",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Cari nama peserta..."
            style={{
              width: "100%",
              padding: "14px 16px 14px 46px",
              borderRadius: "12px",
              border: "2px solid #fde9cc",
              fontSize: "15px",
              outline: "none",
              background: "white",
              boxSizing: "border-box",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: "0 2px 8px rgba(242,140,40,0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#F28C28";
              e.target.style.boxShadow = "0 0 0 4px rgba(242,140,40,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#fde9cc";
              e.target.style.boxShadow = "0 2px 8px rgba(242,140,40,0.08)";
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "999px",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                fontSize: "12px",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Info hasil */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            {search
              ? <>Ditemukan <strong style={{ color: "#F28C28" }}>{filtered.length}</strong> dari {NAMA_LULUS.length} peserta</>
              : <>Menampilkan <strong style={{ color: "#F28C28" }}>{startNo}–{Math.min(page * PER_PAGE, filtered.length)}</strong> dari <strong style={{ color: "#1f2937" }}>{filtered.length}</strong> peserta</>
            }
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
            Halaman {page} / {totalPages || 1}
          </p>
        </div>

        {/* Tabel */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid #fde9cc",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "linear-gradient(90deg, #F28C28, #e07820)",
                }}
              >
                <th
                  style={{
                    padding: "14px 20px",
                    textAlign: "center",
                    color: "white",
                    fontWeight: "800",
                    fontSize: "13px",
                    letterSpacing: "1px",
                    width: "60px",
                  }}
                >
                  NO
                </th>
                <th
                  style={{
                    padding: "14px 20px",
                    textAlign: "left",
                    color: "white",
                    fontWeight: "800",
                    fontSize: "13px",
                    letterSpacing: "1px",
                  }}
                >
                  NAMA PESERTA
                </th>
                <th
                  style={{
                    padding: "14px 20px",
                    textAlign: "center",
                    color: "white",
                    fontWeight: "800",
                    fontSize: "13px",
                    letterSpacing: "1px",
                    width: "120px",
                  }}
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "60px 20px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "15px",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                    Nama "<strong>{search}</strong>" tidak ditemukan dalam daftar.
                  </td>
                </tr>
              ) : (
                paginated.map((nama, i) => {
                  const globalNo = startNo + i;
                  const isEven = i % 2 === 0;
                  return (
                    <tr
                      key={globalNo}
                      style={{
                        background: isEven ? "white" : "#fffaf5",
                        transition: "background 0.15s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#fff3e0")}
                      onMouseOut={(e) => (e.currentTarget.style.background = isEven ? "white" : "#fffaf5")}
                    >
                      {/* No */}
                      <td
                        style={{
                          padding: "13px 20px",
                          textAlign: "center",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#F28C28",
                          borderBottom: "1px solid #fef3e2",
                        }}
                      >
                        {globalNo}
                      </td>

                      {/* Nama */}
                      <td
                        style={{
                          padding: "13px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1f2937",
                          borderBottom: "1px solid #fef3e2",
                        }}
                      >
                        {/* Highlight teks pencarian */}
                        {search.trim()
                          ? highlightMatch(nama, search.trim())
                          : nama}
                      </td>

                      {/* Status */}
                      <td
                        style={{
                          padding: "13px 20px",
                          textAlign: "center",
                          borderBottom: "1px solid #fef3e2",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "#dcfce7",
                            color: "#15803d",
                            fontWeight: "700",
                            fontSize: "11px",
                            padding: "4px 12px",
                            borderRadius: "999px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          ✓ LULUS
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINASI ===== */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "2px solid #fde9cc",
                background: page === 1 ? "#f9fafb" : "white",
                color: page === 1 ? "#d1d5db" : "#F28C28",
                fontWeight: "700",
                fontSize: "14px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ‹
            </button>

            {pageButtons().map((btn, i) =>
              btn === "..." ? (
                <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: "14px" }}>…</span>
              ) : (
                <button
                  key={btn}
                  onClick={() => setPage(btn)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: "10px",
                    border: btn === page ? "2px solid #F28C28" : "2px solid #fde9cc",
                    background: btn === page ? "#F28C28" : "white",
                    color: btn === page ? "white" : "#374151",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    minWidth: "40px",
                    transition: "all 0.15s",
                    boxShadow: btn === page ? "0 4px 12px rgba(242,140,40,0.3)" : "none",
                  }}
                  onMouseOver={(e) => {
                    if (btn !== page) e.currentTarget.style.borderColor = "#F28C28";
                  }}
                  onMouseOut={(e) => {
                    if (btn !== page) e.currentTarget.style.borderColor = "#fde9cc";
                  }}
                >
                  {btn}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "2px solid #fde9cc",
                background: page === totalPages ? "#f9fafb" : "white",
                color: page === totalPages ? "#d1d5db" : "#F28C28",
                fontWeight: "700",
                fontSize: "14px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ›
            </button>
          </div>
        )}

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            marginTop: "32px",
            fontSize: "12px",
            color: "#9ca3af",
            lineHeight: "1.7",
          }}
        >
          Pengumuman ini bersifat resmi dari <strong>BPS Kabupaten Tanjung Jabung Barat</strong>.<br />
          Untuk informasi lebih lanjut hubungi panitia rekrutmen.
        </p>
      </div>
    </div>
  );
}

// Highlight teks yang cocok dengan query pencarian
function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "#fde68a",
          color: "#92400e",
          borderRadius: "3px",
          padding: "0 2px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
