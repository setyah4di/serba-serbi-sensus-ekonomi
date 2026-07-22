import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import heroPng from "../assets/image/logo_bps.png";

const menuSections = [
  {
    sectionKey: "monitoring",
    sectionLabel: "MONITORING",
    items: [
      {
        key: "Monitoring Kecamatan",
        label: "Monitoring Kecamatan",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        badge: null,
      },
      {
        key: "Monitoring PML",
        label: "Monitoring PML",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        badge: null,
      },
    ],
  },
  {
    sectionKey: "anomali",
    sectionLabel: "ANOMALI",
    items: [
      {
        key: "Anomali Keluarga",
        label: "Anomali Keluarga",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
        ),
        badge: null,
      },
      {
        key: "Anomali Usaha",
        label: "Anomali Usaha",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        badge: null,
      },
    ],
  },
    {
    sectionKey: "tidak ditemukan",
    sectionLabel: "Tidak Ditemukan",
    items: [
      {
        key: "prelist tidak ditemukan",
        label: "Prelist Tidak Ditemukan",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
        ),
        badge: null,
      },
    
    ],
  },
  {
    sectionKey: "lainnya",
    sectionLabel: "Lainnya",
    items: [
      {
        key: "Reporta SE",
        label: "Reporta SE",
        icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 7v14m0-14a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2m0-12a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h4a2 2 0 002-2M6 8h1m-1 3h1m-1 3h1" />
      </svg>
    ),
        badge: null,
      },
    ],
  },
];

const pathMap = {
  "Monitoring Kecamatan": "/monitoring-petugas",
  "Monitoring PML": "/monitoring-pml",
  "Anomali Keluarga": "/anomali-keluarga",
  "Anomali Usaha": "/anomali-usaha",
  "Reporta SE": "/reportase",
  "prelist tidak ditemukan": "/prelist-tidak-ditemukan",
};

export default function Sidebar({ onMenuClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 relative
          ${collapsed ? "w-[72px]" : "w-[260px]"}`}
        style={{ background: "#FFFFFF" }}
      >
        {/* Decorative top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent, #f97316, transparent)",
          }}
        />

        {/* Logo / Brand */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-slate-100">
          <img
            src={heroPng}
            alt="Logo BPS"
            className="w-10 h-10 rounded-xl flex-shrink-0 object-contain"
            style={{
              background: "white",
              padding: "4px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          {!collapsed && (
            <div className="animate-slideIn">
              <p className="text-slate-700 text-[14px] font-semibold leading-tight">
                BPS Kabupaten Tanjung Jabung Barat
              </p>
            </div>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-300
            flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-300
            transition-colors z-10 shadow-md"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.sectionKey} className="mt-3 first:mt-0">
              {/* Section header */}
              {!collapsed && (
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-2">
                  {section.sectionLabel}
                </p>
              )}
              {collapsed && (
                <div className="my-2 mx-2 border-t border-slate-100" />
              )}

              {/* Section items */}
              {section.items.map((item) => {
                const isActive = location.pathname === pathMap[item.key];
                return (
                  <Link
                    key={item.key}
                    to={pathMap[item.key] || "#"}
                    onClick={() => {
                      if (onMenuClick) onMenuClick(item.key);
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                      ${isActive
                        ? "bg-orange-50 text-orange-500"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 transition-colors duration-200
                        ${isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"}`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={`text-sm font-medium truncate animate-slideIn ${isActive ? "font-semibold" : ""}`}>
                        {item.label}
                      </span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                    {!isActive && item.badge === "red" && !collapsed && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                    )}
                    {!isActive && item.badge === "red" && collapsed && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ===== Mobile Header ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={heroPng}
              alt="Logo BPS"
              className="w-9 h-9 object-contain rounded-lg"
            />
            <div className="text-sm font-semibold text-slate-700">
              BPS Tanjung Jabung Barat
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-600 hover:text-slate-900 p-1"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="bg-white border-t border-slate-100 px-4 py-3 space-y-1 shadow-lg">
            {menuSections.map((section) => (
              <div key={section.sectionKey} className="mt-3 first:mt-0">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-2">
                  {section.sectionLabel}
                </p>
                {section.items.map((item) => {
                  const isActive = location.pathname === pathMap[item.key];
                  return (
                    <Link
                      key={item.key}
                      to={pathMap[item.key]}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? "bg-orange-50 text-orange-500 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <span className={isActive ? "text-orange-500" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      {item.label}
                      {!isActive && item.badge === "red" && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}