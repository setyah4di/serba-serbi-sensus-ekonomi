import rekrut1 from "../assets/rekrut_1.png";
import rekrut2 from "../assets/rekrut_2.png";
import rekrut3 from "../assets/rekrut_3.png";
import rekrut4 from "../assets/rekrut_4.png";

// ---- data langkah tutorial ----
const TUTORIAL_STEPS = [
  {
    img: rekrut1,
    alt: "Langkah 1 - Daftar Survei",
    poin: [
      <>Calon melakukan pendaftaran dengan cara klik <b>"Daftar Survei"</b>.</>,
      <>Pada menu pencarian ketik <b>"rekrutmen"</b> lalu klik tombol <b>cari</b>.</>,
    ],
  },
  {
    img: rekrut2,
    alt: "Langkah 2 - Pilih Rekrutmen",
    poin: [
      <>Lalu akan muncul <b>"Rekrutmen Mitra BPS 2025"</b>.</>,
      <>Klik <b>"Daftar"</b>.</>,
    ],
  },
  {
    img: rekrut3,
    alt: "Langkah 3 - Isi Data",
    poin: [
      <>Pilih Wilayah <b>"Gunungkidul"</b> dan Jabatan <b>"Mitra 2025"</b>.</>,
      <>Klik <b>"Daftar"</b>.</>,
    ],
  },
  {
    img: rekrut4,
    alt: "Langkah 4 - Tunggu Konfirmasi",
    poin: [
      <>Calon mitra menunggu untuk dikonfirmasi oleh Panitia Rekrutmen pada saat <b>Seleksi Administrasi</b>.</>,
    ],
  },
];

export default function TutorialPendaftaran() {
  return (
    <section id="tutorial-pendaftaran" className="py-12 px-6 bg-[#F28C28]">
      <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden">
        
        <div className="px-8 pt-8 pb-4 text-center">
          <h2 className="text-base font-bold tracking-widest text-gray-800 uppercase">
            Pendaftaran Rekrutmen
          </h2>

          <hr className="border-gray-200 mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {TUTORIAL_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex flex-col border-gray-100
                ${i % 2 === 0 ? "md:border-r" : ""}
                ${i < 2 ? "border-b" : ""}
              `}
            >
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-center">
                <img
                  src={step.img}
                  alt={step.alt}
                  className="w-full max-h-56 object-contain rounded"
                />
              </div>

              <div className="p-5">
                <ul className="space-y-2">
                  {step.poin.map((p, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-xs text-gray-700 leading-relaxed"
                    >
                      <span className="text-[#F28C28] mt-0.5 flex-shrink-0">
                        ▪
                      </span>

                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </section>
  );
}