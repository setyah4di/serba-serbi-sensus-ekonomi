export default function PrelistTidakDitemukan() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6">

        {/* Background Glow */}
        <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-orange-300/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-amber-300/20 blur-3xl animate-pulse"></div>

        {/* Floating Decorations */}
        <div className="absolute top-20 left-24 w-5 h-5 rounded-full bg-orange-400 animate-float"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 rounded-full bg-orange-300 animate-float-delay"></div>
        <div className="absolute top-40 right-28 w-6 h-6 rounded-full bg-amber-400 animate-float"></div>
        <div className="absolute bottom-24 right-24 w-4 h-4 rounded-full bg-orange-500 animate-float-delay"></div>

        {/* Card */}
        <div className="relative z-10 max-w-xl w-full">

          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-orange-100 shadow-2xl p-10 text-center">

            {/* Icon */}
            <div className="mx-auto mb-8 w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl animate-bounceSlow">

              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
                />
              </svg>

            </div>

            <h1 className="text-5xl font-black text-gray-800 mb-5 animate-gradient">
              COMING SOON
            </h1>

            <div className="w-28 h-1 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 mx-auto mb-8 animate-pulse"></div>

            <p className="text-gray-500 leading-relaxed text-lg">
              Halaman ini masih dalam tahap
              <span className="font-bold text-orange-500">
                {" "}pengembangan
              </span>.
              <br />
              Nantikan fitur terbaru yang akan segera tersedia.
            </p>

            {/* Loading */}
            <div className="flex justify-center mt-10 gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-400 animate-dot1"></span>
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-dot2"></span>
              <span className="w-3 h-3 rounded-full bg-orange-600 animate-dot3"></span>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              🚀 Tim sedang mempersiapkan fitur prelist tidak ditemukan
            </p>

          </div>

        </div>

      </div>

      <style>{`

      @keyframes float{
        0%,100%{
          transform:translateY(0px);
        }
        50%{
          transform:translateY(-18px);
        }
      }

      .animate-float{
        animation:float 4s ease-in-out infinite;
      }

      .animate-float-delay{
        animation:float 4s ease-in-out infinite;
        animation-delay:2s;
      }

      @keyframes bounceSlow{
        0%,100%{
          transform:translateY(0);
        }
        50%{
          transform:translateY(-12px);
        }
      }

      .animate-bounceSlow{
        animation:bounceSlow 2.5s infinite;
      }

      @keyframes gradient{
        0%{
          opacity:.8;
          transform:scale(.98);
        }
        50%{
          opacity:1;
          transform:scale(1.03);
        }
        100%{
          opacity:.8;
          transform:scale(.98);
        }
      }

      .animate-gradient{
        animation:gradient 3s ease-in-out infinite;
      }

      @keyframes dot{
        0%,80%,100%{
          transform:scale(0.5);
          opacity:.4;
        }
        40%{
          transform:scale(1.2);
          opacity:1;
        }
      }

      .animate-dot1{
        animation:dot 1.4s infinite;
      }

      .animate-dot2{
        animation:dot 1.4s infinite;
        animation-delay:.2s;
      }

      .animate-dot3{
        animation:dot 1.4s infinite;
        animation-delay:.4s;
      }

      `}</style>

    </>
  );
}