import { useState } from "react";
import { createPortal } from "react-dom";

import submit1 from "../assets/image/submit_pakta.png";
import submit2 from "../assets/image/submit_pakta1.png";
import submit3 from "../assets/image/submit_pakta2.png";

// ── Data Tutorial ─────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    img: submit1,
    title: "Langkah 1",
    alt: "Langkah 1 - Daftar Survei",
  },
  {
    img: submit2,
    title: "Langkah 2",
    alt: "Langkah 2 - Pilih Rekrutmen",
  },
  {
    img: submit3,
    title: "Langkah 3",
    alt: "Langkah 3 - Isi Data",
  },
];

export default function TutorialPaktaIntegritas() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section
      id="tutorial-pakta-integritas"
      className="py-16 px-4 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold tracking-[0.25em] uppercase px-4 py-2 rounded-full mb-4">
            Tutorial Pakta Integritas
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Cara Submit Pakta Integritas
          </h2>

          <p className="text-white/80 mt-3 text-sm md:text-base">
            Klik gambar untuk memperbesar tampilan tutorial
          </p>
        </div>

        {/* List Tutorial */}
        <div className="flex flex-col gap-8">
          {TUTORIAL_STEPS.map((step, i) => (
            <div
              key={i}
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Gambar */}
              <button
                type="button"
                onClick={() => setSelectedImage(step.img)}
                className="relative w-full overflow-hidden bg-gray-100"
              >
                <img
                  src={step.img}
                  alt={step.alt}
                  className="w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition duration-300 bg-white/90 px-5 py-2 rounded-full text-sm font-bold text-gray-800 shadow-lg">
                    🔍 Klik untuk memperbesar
                  </div>
                </div>
              </button>

              {/* Footer */}
              <div className="p-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold shadow-md">
                  {i + 1}
                </div>

                <div>
                  <h3 className="font-extrabold text-gray-800 text-lg">
                    {step.title}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    Tutorial submit pakta integritas
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     {/* ── Modal Fullscreen ───────────────────────── */}
{selectedImage &&
  createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-2"
      onClick={() => setSelectedImage(null)}
    >
      {/* Tombol Close */}
      <button
        onClick={() => setSelectedImage(null)}
        className="fixed top-4 right-6 z-[10000] 
                   bg-gray-900 backdrop-blur-md
                   w-12 h-12 rounded-full
                   text-white text-2xl font-bold
                   cursor-pointer"
      >
        ✕
      </button>

      {/* Gambar */}
      <img
        src={selectedImage}
        alt="Preview Tutorial"
        onClick={(e) => e.stopPropagation()}
       className="
        w-auto
        h-auto
        max-w-[90vw]
        max-h-[80vh]
        object-contain
        rounded-2xl
        shadow-2xl
        "
      />
    </div>,
    document.body
  )}
    </section>
  );
}