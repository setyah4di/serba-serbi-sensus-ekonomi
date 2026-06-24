import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import heroPng from "../assets/image/logo_bps.png";

const navLinks = [
  { label: "Beranda", path: "/" },
  { label: "Rekrutmen", path: "/registrasi" },
  { label: "Ngibar", path: "/ngibar" },
  { label: "KKD", path: "/kkd" },
  { label: "Reporta-SE", path: "/reporta-se" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const hideNavLinks = ["/linktree", "/monitoring-petugas","/monitoring-pml"].includes(location.pathname);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">

        {/* ── Logo (klik → Beranda) ── */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center overflow-hidden">
            <img
              src={heroPng}
              alt="BPS Logo"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<span class="text-blue-800 font-extrabold text-sm">BPS</span>';
              }}
            />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-black uppercase tracking-wide">
              Badan Pusat Statistik
            </p>
            <p className="text-xs text-black uppercase tracking-wide">
              Kabupaten Tanjung Jabung Barat
            </p>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        {!hideNavLinks && (
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map(({ label, path }) => {
              const active = location.pathname === path;
              return (
                <li key={label}>
                  <Link
                    to={path}
                    className={`text-sm font-semibold tracking-wide transition-colors pb-0.5 ${
                      active
                        ? "text-orange-500 border-b-2 border-orange-500"
                        : "text-gray-700 hover:text-orange-500"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── Mobile Hamburger ── */}
        {!hideNavLinks && (
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && !hideNavLinks && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
          {navLinks.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className="block text-sm font-semibold text-gray-700 hover:text-orange-500"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
