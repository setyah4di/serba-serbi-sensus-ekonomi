"use client";

import { useState, useEffect, useMemo } from "react";
import TutorialPaktaIntegritas from "../element/TutorialPaktaIntegritas";

const PESERTA_LULUS = [
  // ── BATANG ASAM ──
  {  nama: "Achmad Husaen" },
  {  nama: "Debi Satrio" },
  {  nama: "Ilham Musliadi" },       // fix: Utama→Cadangan
  {  nama: "Rudi Desta Yandri" },
  {  nama: "Randi Sugitok" },
  {  nama: "Arif Elwan Prabowo" },
  {  nama: "Chandana Putra" },
  {  nama: "Gabriela Spanic Aritonang" }, // fix: Utama→Cadangan
  {  nama: "Muhammad Adi Prasetyo" },
  {  nama: "Robi Setioko" },
  {  nama: "Siti Maemunah" },
  {  nama: "Ella Yolanda" },
  {  nama: "Siska Handayani" },         // tambah baru
  {  nama: "Jhon Sadarman Purba" },
  {  nama: "Nuh Saini" },
  {  nama: "Samson Ambarita" },

  // ── BETARA ──
  {  nama: "Rahmatiah" },                 // fix: Utama→Cadangan
  {  nama: "Malasari" },                     // fix: Cadangan→Utama
  {  nama: "Mardiah" },                      // tambah baru
  {  nama: "Eka Susilawati" },            // fix: Utama→Cadangan
  {  nama: "M Ali" },                        // fix: Cadangan→Utama
  {  nama: "Megawati" },
  {  nama: "Puput Mentari" },             // fix: Utama→Cadangan
  {  nama: "Nur Azizah" },                   // fix: Cadangan→Utama

  // ── BRAM ITAM ──
  {  nama: "M Farid Wajdi" },         // tambah baru
  {  nama: "Nani Sofiyani" },         // tambah baru

  // ── MERLUNG ──
  {  nama: "Ovi Oktavia Dewi" },           // tambah baru
  {  nama: "Yuli Fitriani" },
  {  nama: "Nur Kalbi" },
  {  nama: "Siti Makiyah" },
  {  nama: "Moeh Lexsy Setiyono" },     // fix: Utama→Cadangan
  {  nama: "Muhammad Akbar" },             // fix: Cadangan→Utama
  {  nama: "Selli Noviriani" },
  {  nama: "Yaumul Mashud" },           // fix: Utama→Cadangan
  {  nama: "Asela Komala Sari" },          // tambah baru
  {  nama: "Sira Sindia" },
  {  nama: "Siti Muslimah" },
  {  nama: "Ade Saputra" },
  {  nama: "Rafif" },                   // fix: Utama→Cadangan

  // ── MUARA PAPALIK ──
  { nama: "Sukiman" },              // fix: Cadangan→Utama
  { nama: "Shinta Almira" },
  { nama: "Wella" },
  { nama: "Muchamad Rizki Wahyudi" },
  { nama: "Witri Nurhikmah" },   // tambah baru
  { nama: "Kamaria Ulpa" },         // fix: Cadangan→Utama
  { nama: "Khairul Anwar" },     // fix: Utama→Cadangan
  { nama: "Roma Kusuma Dewi" },     // fix: Cadangan→Utama
  { nama: "Rizky Septiana Ningrum" },

  // ── PENGABUAN ──
  {  nama: "Desi Liana" },
  {  nama: "Nadia Izzatin Nisa" },
  {  nama: "Siti Soleha" },           // fix: Utama→Cadangan
  {  nama: "Ghufron Vanani" },           // fix: Cadangan→Utama
  {  nama: "Fitri Hariyati" },
  {  nama: "Rosanti" },
  {  nama: "Iryuvelamea Anggiah" },

  // ── RENAH MENDALUH ──
  {  nama: "Cici Triani" },      // fix: Utama→Cadangan
  {  nama: "Mujianto" },            // fix: Cadangan→Utama
  {  nama: "Muhajir Sulthon" },  // fix: Utama→Cadangan
  {  nama: "Sholikhul Hadi" },      // fix: Cadangan→Utama
  {  nama: "Reski" },
  {  nama: "Salamudin" },
  {  nama: "Bela Kurnia Sari" },
  {  nama: "Desti Fertiwi" },    // fix: Utama→Cadangan
  {  nama: "Rhefy Dian Brillian" }, // fix: Cadangan→Utama
  {  nama: "Hadromi" },             // tambah baru
  {  nama: "Muhammad Ilyas" },
  {  nama: "Ilham Gunawan" },

  // ── SEBERANG KOTA ──
  {  nama: "Supriyadi Ramadhan" },
  {  nama: "Sahriansyah" },

  // ── SENYERANG ──
  {  nama: "Muhajir" },
  {  nama: "Hanik Purwati" },
  {  nama: "Putri Ayu Ningsih" },     // fix: Utama→Cadangan
  {  nama: "M Muklas Adi Putra" },    // tambah baru
  {  nama: "M. Habiburrahman" },
  {  nama: "Sunarlin, S. Pd" },       // tambah baru
  {  nama: "Fitriyani" },                // tambah baru
  {  nama: "Muhammad El Farisy Wardana" }, // tambah baru

  // ── TEBING TINGGI ──
  {  nama: "Katon Zanza Anaqu" },    // tambah baru
  {  nama: "Muhammad Syaiful Bahri" }, // tambah baru
  {  nama: "Ahmad Muhaimin" },
  {  nama: "Ernawati" },
  {  nama: "Vani Ulina Munthe" },    // tambah baru
  {  nama: "Ahmad Surya Irawan" },   // tambah baru
  {  nama: "Muhayidin" },
  {  nama: "Noer Hidayat MJ" },   // fix: Utama→Cadangan
  {  nama: "Mona Br Siahaan" },      // tambah baru
  {  nama: "Nurul Fadila" }, // tambah baru
  {  nama: "Mutiara Anesa Putri" },         // fix: Cadangan→Utama
  {  nama: "Nurhani" },
  {  nama: "Yuni Arnita" },
  {  nama: "Agung Rizki Dwi Putra" },
  {  nama: "Ana Fitriana" },
  {  nama: "Fadila Habsah Perangi-Angin" }, // fix: Utama→Cadangan

  // ── TUNGKAL ILIR ──
  {  nama: "Alfiqri" },            // tambah baru
  {  nama: "Elarita" },
  {  nama: "Mualip Alvian" },      // tambah baru
  {  nama: "Muhammad Nazmi" },        // tambah baru
  {  nama: "Abd Rahman" },         // fix: Utama→Cadangan
  {  nama: "M. Sandi Maulana" },   // tambah baru
  {  nama: "Putri Sekar Sari" },   // tambah baru

  // ── TUNGKAL ULU ──
  {  nama: "Arnika Sari" },            // fix: Cadangan→Utama
  {  nama: "Novi Apriani" },
  {  nama: "Retno Evri Yunita" },
  {  nama: "Albrian Dafinsa" },
  {  nama: "Joni Iskandar" },
  {  nama: "Yonithri Sherlyna" },
  {  nama: "Retna Swita" },         // fix: Utama→Cadangan
  {  nama: "Immanuel Pabri Marbun" },  // fix: Cadangan→Utama
  {  nama: "Kevin Halomoan Hutagalung" },
  {  nama: "Laurent Clarita Sinaga" },
  {  nama: "Ricky Efriansyah" },    // fix: Utama→Cadangan
  {  nama: "Riris Silitonga" },        // fix: Cadangan→Utama
];

const PER_PAGE = 15;

export default function PengumumanAkhir() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

 const scrollToTutorial = () => {
    setTimeout(() => {
      document
        .getElementById("tutorial-pakta-integritas")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };


  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PESERTA_LULUS.filter((p) => {
      const matchQ = !q || p.nama.toLowerCase().includes(q) ;
      return matchQ;
    });
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startNo = (page - 1) * PER_PAGE + 1;

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff8f0 0%, #fff3e8 50%, #ffecd6 100%)", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #F28C28 0%, #e07820 60%, #c96610 100%)", padding: "40px 24px 32px", textAlign: "center", boxShadow: "0 8px 32px rgba(242,140,40,0.35)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-24px)", transition: "all 0.7s ease" }}>
        {/* <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "999px", padding: "6px 18px", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.95)", fontWeight: "600", letterSpacing: "1px" }}>REKRUTMEN MITRA BPS 2026</span>
        </div>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏆</div> */}
        <h1 style={{ color: "white", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          Pengumuman Seleksi Akhir
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", margin: 0 }}>
          Daftar peserta yang dinyatakan <strong>LULUS</strong> 
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "24px", flexWrap: "wrap" }}>
          {[
            { icon: "👥", label: "Total Peserta", val: PESERTA_LULUS.length },
            { icon: "📅", label: "Tanggal Pengumuman", val: "22 Mei 2026" },
            // { icon: "⏭️", label: "Tahap Selanjutnya", val: "Submit Pakta Integritas" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.18)", borderRadius: "12px", padding: "12px 20px", minWidth: "130px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <div style={{ fontSize: "20px", marginBottom: "2px" }}>{s.icon}</div>
              <div style={{ color: "white", fontWeight: "800", fontSize: "16px" }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KONTEN */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 16px 60px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>

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
  {/* <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span> */}

  <div style={{ flex: 1 }}>
  <p
    style={{
      margin: 0,
      fontSize: "15px",
      color: "#92400e",
      lineHeight: "1.6",
      textAlign: "center",
    }}
  >
    <strong style={{ color: "#000" }}>
      Peserta yang lolos seleksi tahap akhir
    </strong>{" "}
    
    wajib melakukan{" "}

    <strong style={{ color: "#000" }}>
      submit pakta integritas
    </strong>{" "}
    
    di aplikasi sobat BPS.
    untuk tutorialnya dapat klik tulisan dibawah ini
  </p>

  <div style={{ textAlign: "center", marginTop: "3px" }}>
    <button
      onClick={() => {
        scrollToTutorial();
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#F28C28",
        fontWeight: "700",
        textDecoration: "underline",
        fontSize: "20px",
      }}
    >
      tutorial submit pakta integritas ↓
    </button>
  </div>
</div>
</div>
        {/* Search + Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#F28C28", pointerEvents: "none" }}>🔍</span>
            <input
              type="text" value={search} onChange={handleSearch}
              placeholder="Cari nama peserta"
              style={{ width: "100%", padding: "14px 16px 14px 46px", borderRadius: "12px", border: "2px solid #fde9cc", fontSize: "15px", outline: "none", background: "white", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(242,140,40,0.08)" }}
              onFocus={(e) => { e.target.style.borderColor = "#F28C28"; }}
              onBlur={(e) => { e.target.style.borderColor = "#fde9cc"; }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "#f3f4f6", border: "none", borderRadius: "999px", width: "24px", height: "24px", cursor: "pointer", fontSize: "12px", color: "#6b7280" }}>✕</button>
            )}
          </div>
          
        </div>

        {/* Info hasil */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            {search
              ? <>Ditemukan <strong style={{ color: "#F28C28" }}>{filtered.length}</strong> dari {PESERTA_LULUS.length} peserta</>
              : <>Menampilkan <strong style={{ color: "#F28C28" }}>{startNo}–{Math.min(page * PER_PAGE, filtered.length)}</strong> dari <strong style={{ color: "#1f2937" }}>{filtered.length}</strong> peserta</>
            }
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>Halaman {page} / {totalPages || 1}</p>
        </div>

        {/* Tabel */}
        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #fde9cc" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #F28C28, #e07820)" }}>
                <th style={{ padding: "14px 16px", textAlign: "center", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", width: "50px" }}>NO</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px" }}>NAMA PESERTA</th>
                <th style={{ padding: "14px 16px", textAlign: "center", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", width: "130px" }}>KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center", color: "#9ca3af", fontSize: "15px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                    Tidak ditemukan hasil untuk "<strong>{search}</strong>"
                  </td>
                </tr>
              ) : (() => {
                const spans = {};
                let lastKec = null;
                paginated.forEach((p, i) => {
                  if (p.kecamatan !== lastKec) {
                    let count = 0;
                    for (let j = i; j < paginated.length; j++) {
                      if (paginated[j].kecamatan === p.kecamatan) count++;
                      else break;
                    }
                    spans[i] = count;
                    lastKec = p.kecamatan;
                  }
                });

                return paginated.map((p, i) => {
                  const globalNo = startNo + i;
                  const isEven = i % 2 === 0;

                  return (
                    <tr key={i} style={{ background: isEven ? "white" : "#fffaf5", transition: "background 0.15s" }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#fff3e0")}
                      onMouseOut={(e) => (e.currentTarget.style.background = isEven ? "white" : "#fffaf5")}
                    >
                      <td style={{ padding: "13px 16px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#F28C28", borderBottom: "1px solid #fef3e2" }}>
                        {globalNo}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: "600", color: "#1f2937", borderBottom: "3px solid #fef3e2" }}>
                        {search.trim() ? highlightMatch(p.nama, search.trim()) : p.nama}
                      </td>
                      <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid #fef3e2" }}>
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
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        {totalPages > 1 && (
          <div style={{ display: "flex", marginBottom: "48px", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "24px", flexWrap: "wrap" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "9px 16px", borderRadius: "10px", border: "2px solid #fde9cc", background: page === 1 ? "#f9fafb" : "white", color: page === 1 ? "#d1d5db" : "#F28C28", fontWeight: "700", fontSize: "14px", cursor: page === 1 ? "not-allowed" : "pointer" }}>‹</button>
            {pageButtons().map((btn, i) =>
              btn === "..." ? (
                <span key={`e-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: "14px" }}>…</span>
              ) : (
                <button key={btn} onClick={() => setPage(btn)} style={{ padding: "9px 14px", borderRadius: "10px", border: btn === page ? "2px solid #F28C28" : "2px solid #fde9cc", background: btn === page ? "#F28C28" : "white", color: btn === page ? "white" : "#374151", fontWeight: "700", fontSize: "14px", cursor: "pointer", minWidth: "40px", boxShadow: btn === page ? "0 4px 12px rgba(242,140,40,0.3)" : "none" }}>{btn}</button>
              )
            )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "9px 16px", borderRadius: "10px", border: "2px solid #fde9cc", background: page === totalPages ? "#f9fafb" : "white", color: page === totalPages ? "#d1d5db" : "#F28C28", fontWeight: "700", fontSize: "14px", cursor: page === totalPages ? "not-allowed" : "pointer" }}>›</button>
          </div>
        )}

        <TutorialPaktaIntegritas />

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "#9ca3af", lineHeight: "1.7" }}>
          Pengumuman ini bersifat resmi dari <strong>BPS Kabupaten Tanjung Jabung Barat</strong>.<br />
          Untuk informasi lebih lanjut hubungi panitia rekrutmen.
        </p>
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#fde68a", color: "#92400e", borderRadius: "3px", padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}