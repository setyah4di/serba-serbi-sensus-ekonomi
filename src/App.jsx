// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import ScrollToTop from "./components/ScrollTop"; // Import ScrollToTop
import ScrollTopButton from "./components/ScrollTopButton"; // Import ScrollToTop

import Beranda from "./pages/Beranda";
import Registrasi from "./pages/Registrasi";
import KKD from "./pages/KKD";
import Ngibar from "./pages/Ngibar";
import ReportaSE from "./pages/ReportaSE";
import TesKompetensi from "./pages/TesKompetensi";
import TesWawancara from "./pages/TesWawancara";
import PengumumanAdministrasi from "./pages/PengumumanAdministrasi";
import PengumumanAkhir from "./pages/PengumumanAkhir";
import Linktree from "./pages/Linktree";
import MonitoringPetugas from "./pages/MonitoringPetugas";
import MonitoringPml from "./pages/MonitoringPml";
import MonitoringAnomaliKeluarga from "./pages/AnomaliKeluarga";
import MonitoringAnomaliUsaha from "./pages/AnomaliUsaha";
import PrelistTidakDitemukan from "./pages/PrelistTidakDitemukan";
import HasilNgibar from "./pages/HasilNgibar";
import KeberadaanUM from "./pages/KeberadaanUM";
import KeberadaanKeluargaKhusus from "./pages/KeberadaanKeluargaKhusus";
import KeberadaanBumdes from "./pages/KeberadaanBumdes";
import EksplorasiData from "./pages/EksplorasiData";
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="font-sans antialiased flex flex-col min-h-screen">
        <RouteWrapper />

        <Footer />

        <ScrollTopButton />
      </div>
    </BrowserRouter>
  );
}

function RouteWrapper() {
  const { pathname } = useLocation();

  const sidebarPages = [
    "/monitoring-petugas",
    "/monitoring-pml",
    "/anomali-keluarga",
    "/anomali-usaha",
    "/keberadaan-um",
    "/reportase",
    "/prelist-tidak-ditemukan",
    "/hasil-ngibar",
    "/eksplorasi-data",
    "/keberadaan-keluarga-khusus",
    "/keberadaan-bumdes",
  ];

  const showSidebar = sidebarPages.includes(pathname);

  if (showSidebar) {
    return (
      <div className="flex flex-1 min-h-screen min-w-0">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-16 md:pt-0">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/registrasi" element={<Registrasi />} />
            <Route path="/tes-kompetensi" element={<TesKompetensi />} />
            <Route path="/tes-wawancara" element={<TesWawancara />} />
            <Route path="/pengumuman-administrasi" element={<PengumumanAdministrasi />} />
            <Route path="/pengumuman-akhir" element={<PengumumanAkhir />} />
            <Route path="/kkd" element={<KKD />} />
            <Route path="/linktree" element={<Linktree />} />
            <Route path="/monitoring-petugas" element={<MonitoringPetugas />} />
            <Route path="/monitoring-pml" element={<MonitoringPml />} />
            <Route path="/anomali-keluarga" element={<MonitoringAnomaliKeluarga />} />
            <Route path="/anomali-usaha" element={<MonitoringAnomaliUsaha />} />
            <Route path="/prelist-tidak-ditemukan" element={<PrelistTidakDitemukan />} />
            <Route path="/keberadaan-um" element={<KeberadaanUM />} />
            <Route path="/keberadaan-keluarga-khusus" element={<KeberadaanKeluargaKhusus />} />
            <Route path="/keberadaan-bumdes" element={<KeberadaanBumdes />} />
            <Route path="/eksplorasi-data" element={<EksplorasiData />} />
            <Route path="/hasil-ngibar" element={<HasilNgibar />} />
            <Route path="/reportase" element={<ReportaSE />} />
            <Route path="/ngibar" element={<Ngibar />} />
            <Route path="/reporta-se" element={<ReportaSE />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 flex-grow min-w-0">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/registrasi" element={<Registrasi />} />
          <Route path="/tes-kompetensi" element={<TesKompetensi />} />
          <Route path="/tes-wawancara" element={<TesWawancara />} />
          <Route path="/pengumuman-administrasi" element={<PengumumanAdministrasi />} />
          <Route path="/pengumuman-akhir" element={<PengumumanAkhir />} />
          <Route path="/kkd" element={<KKD />} />
          <Route path="/linktree" element={<Linktree />} />
          <Route path="/monitoring-petugas" element={<MonitoringPetugas />} />
          <Route path="/monitoring-pml" element={<MonitoringPml />} />
          <Route path="/anomali-keluarga" element={<MonitoringAnomaliKeluarga />} />
          <Route path="/anomali-usaha" element={<MonitoringAnomaliUsaha />} />
          <Route path="/ngibar" element={<Ngibar />} />
          <Route path="/reporta-se" element={<ReportaSE />} />
        </Routes>
      </main>
    </>
  );
}