"use client";

import { useState, useEffect, useMemo } from "react";

const PESERTA_16_MEI = [
  "Siska Handayani","Jhon Sadarman Purba","Robi Setioko","Ilham Musliadi",
  "Randi Sugitok","Achmad Husaen","Gabriela Spanic Aritonang","Arif Elwan Prabowo",
  "Juwanda Francisco Sinaga","Samson Ambarita","Puput Mentari","Rahmatiah",
  "Mardiah","Linda Istna Mawaddah","Nur Azizah","M Ali Eka Susilawati",
  "Rizka Tulzannah","M Farid Wajdi","Nurul Febriyana","Muhammad Hamdani Alfiqri",
  "Abd Rahman","Putri Sekar Sari","Siti Muslimah","Ade Saputra",
  "Yuli Fitriani","Rinda","Rafif Selli Noviriani","Nur Kalbi",
  "Wella Putri Nurhidayati","Muchamad Rizki Wahyudi","Shinta Almira","Witri Nurhikmah",
  "Rizky Septiana Ningrum","Rhefy Dian Brillian","Reski","Ilham Gunawan",
  "Hadromi Salamudin","Desti Fertiwi","Muhammad Ilyas","Sahriansyah Supriyadi Ramadhan",
  "Miftakhul Arif","Agnan Chakim Ramadhan","Ernawati Hanifan","Dicky Permana",
  "Ahmad Surya Irawan","Eka Mayasari","Sugianto","Sumini",
  "Sunarlin S.Pd","Adi Prasetyo","Fitriyani","Yunita Sari",
  "Tri Wahono Widodo","M Muklas Adi Putra","Aprianti Prafmanto","Devi Ratna Sari",
  "Katon Zanza Anaqu","Nurul Fadila","Nafasya Chaira Maidipa","Nurhani Vani",
  "Ulina Munthe","Ferdinan Pandiangan","Mutiara Anesa Putri","Yuni Arnita",
  "Nurafni","Friska Bintang Saputri","Tiara Sabrina","Syafira Maulida",
  "Jihan Syakirah Arasman","Muhammad Difa' Abdillah","Kevin Halomoan Hutagalung","Ricky Efriansyah",
  "Albrian Dafinsa","Riris Silitonga","Joni Iskandar","Yonithri Sherlyna",
  "Al-Reyza Dewangga",
];

const PESERTA_17_MEI = [
  "Ella Yolanda","Debi Satrio Chandana Putra","Rudi Desta Yandri","Cahya Indah Sari",
  "Siti Maemunah","Nuh Saini","Muhammad Adi Prasetyo","Megawati",
  "Malasari Nani Sofiyani","Rizki Anshori","Deni Arisman","M Ali Akbar",
  "Elarita Harry","Ratul Jannah","Prayoga Pangestu","M. Sandi Maulana",
  "Citra Annisa","M. Erfan Wardana","Sira Sindia","Asela Komala Sari",
  "Muhammad Akbar","Yaumul Mashud","Siti Makiyah","Moeh Lexsy Setiyono",
  "Ovi Oktavia Dewi","Rizky Septiana Ningrum","Kamaria Ulpa","Roma Kusuma Dewi",
  "Khairul Anwar Sukiman","Hamdani Muhammad","Syamsul Arifin Muhajir Sulthon","Erik Sernando",
  "Bela Kurnia Sari","Sholikhul Hadi","Cici Triani","Mujianto",
  "Fadila Habsah Perangi-Angin","Muhammad Syaiful Bahri","May Kristiani Simarmata","Noer Hidayat MJ",
  "Novi Lyanti Siahaan","Muhayidin","M. Habiburrahman","Anisa Dwi Panira",
  "Desi Ayundari","Hanik Purwati","Putri Ayu Ningsih","Indah Minarsih",
  "Muhajir Muhammad El Farisy Wardana","Arini Astari","Nihlatus Shofiyyah","Mona Br Siahaan",
  "Vifi Febrian","Novita Seni Wahyuni","M. Sopiyanto","Agung Rizki Dwi Putra",
  "Ana Fitriana","Ahmad Muhaimin","Anisa Melinda","Muhammad Nazmi",
  "Dini Sri Wulandari","Mualip Alvian","M. Nur Abdullah","Zafira Rizki Ethaviana",
  "Novi Apriani","Retna Swita","Immanuel Pabri Marbun","Retno Evri Yunita",
  "Laurent Clarita Sinaga","Arnika Sari",
];

function TabelPeserta({ tanggal, data, warna }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? data.filter((n) => n.toLowerCase().includes(q)) : data;
  }, [search, data]);

  const totalPage = Math.ceil(filtered.length / PER_PAGE);
  const currentData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const pageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPage, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
      {/* Header */}
      <div style={{ backgroundColor: warna }} className="px-5 py-4">
        <h2 className="text-white font-black text-base tracking-widest uppercase flex items-center gap-2">
          📅 Peserta Wawancara — {tanggal}
        </h2>
        <p className="text-white/80 text-xs mt-0.5">{data.length} peserta terdaftar</p>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Cari nama peserta..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
        {search && (
          <p className="text-xs text-gray-500 mt-1.5">
            Ditemukan <span className="font-bold text-gray-700">{filtered.length}</span> peserta
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 font-bold text-gray-600 w-12">No</th>
              <th className="text-left px-5 py-3 font-bold text-gray-600">Nama Peserta</th>
              <th className="text-left px-5 py-3 font-bold text-gray-600 w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-400 text-sm">
                  Nama tidak ditemukan
                </td>
              </tr>
            ) : (
              currentData.map((nama, i) => {
                const globalIdx = (page - 1) * PER_PAGE + i;
                return (
                  <tr
                    key={globalIdx}
                    className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-400 font-medium">
                      {search ? globalIdx + 1 : (page - 1) * PER_PAGE + i + 1}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {search ? (
                        <HighlightText text={nama} query={search} />
                      ) : (
                        nama
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: "#FFF3E0",
                          color: "#E65100",
                        }}
                      >
                        Terjadwal
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPage > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-500">
            Halaman <span className="font-bold text-gray-700">{page}</span> dari{" "}
            <span className="font-bold text-gray-700">{totalPage}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ‹
            </button>
            {pageNumbers().map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className="w-8 h-8 rounded-lg text-xs font-bold border transition-colors"
                style={
                  n === page
                    ? { backgroundColor: warna, color: "#fff", borderColor: warna }
                    : { borderColor: "#e5e7eb", color: "#374151" }
                }
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
              className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPage)}
              disabled={page === totalPage}
              className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HighlightText({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function TesWawancara() {
  const [visible, setVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMulaiWawancara = () => setShowConfirm(true);

  const handleKonfirmasi = () => {
    window.open(
      "https://docs.google.com/forms/d/17TTxy86Nx0cnlw7fOgz9yaxjnuWSUxQRzKZr-kQx33A/edit",
      "_blank"
    );
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] to-[#ddeeff]">
      {/* Header */}
      <div
        className="bg-[#F28C28] text-white py-8 px-6 text-center shadow-lg"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-30px)",
          transition: "all 0.7s ease",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-4xl mb-2">🔊</div>
          <h1 className="text-2xl font-black tracking-widest uppercase mb-1">
            Tes Wawancara
          </h1>
          <p className="text-orange-100 text-sm font-medium tracking-wide">
            Seleksi Mitra Tambahan BPS Kab. Tanjung Jabung Barat — Tahap III
          </p>
        </div>
      </div>

      {/* Info Bar */}
      <div
        className="bg-white border-b border-blue-100 py-4 px-6"
        style={{ opacity: visible ? 1 : 0, transition: "all 0.7s ease 0.15s" }}
      >
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-[#2196F3] text-lg">📅</span>
            <span><span className="font-bold text-gray-800">16 - 17 Mei</span> 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2196F3] text-lg">⏱</span>
            <span><span className="font-bold text-gray-800">±30 Menit</span> per Peserta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2196F3] text-lg">🎦</span>
            <span className="font-bold text-gray-800">Zoom Meeting</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* Panduan Wawancara */}
        <div
          className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.3s",
          }}
        >
          <div className="bg-[#F28C28] px-5 py-4">
            <h2 className="text-white font-black text-base tracking-widest uppercase flex items-center gap-2">
              📋 Panduan Wawancara
            </h2>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-3">
              {[
                "Hadir 15 menit sebelum jadwal wawancara Anda dimulai.",
                "Berpakaian rapi dan sopan (kemeja/blus formal, hindari kaos polos).",
                "Wawancara dilakukan melalui Zoom Meeting.",
                "Durasi wawancara sekitar 30 menit per peserta.",
                "Matikan atau silent-kan ponsel selama sesi wawancara berlangsung.",
                "Jawab pertanyaan dengan jujur, lugas, dan percaya diri.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#F28C28" }}
                  >
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabel 16 Mei */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.45s",
          }}
        >
          <TabelPeserta
            tanggal="16 Mei 2026"
            data={PESERTA_16_MEI}
            warna="#F28C28"
          />
        </div>

        {/* Tabel 17 Mei */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.55s",
          }}
        >
          <TabelPeserta
            tanggal="17 Mei 2026"
            data={PESERTA_17_MEI}
            warna="#F28C28"
          />
        </div>

        {/* Tombol Konfirmasi */}
        <div
          className="text-center pb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease 0.65s",
          }}
        >
          <p className="text-sm text-gray-500 mb-4 font-medium">
            Konfirmasikan kehadiran wawancara Anda melalui form berikut:
          </p>
          <button
            onClick={handleMulaiWawancara}
className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] active:scale-95 text-white font-black text-lg py-4 px-12 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl tracking-widest uppercase"          >
            Mulai Wawancara
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            style={{ animation: "zoomIn 0.3s ease" }}
          >
            <div className="text-5xl mb-4">🎤</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">Konfirmasi Kehadiran?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Anda akan diarahkan ke link Zoom Meeting kehadiran wawancara. Pastikan anda sudah siap.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleKonfirmasi}
                className="flex-1 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d9770d] text-white font-bold text-sm transition-colors"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}