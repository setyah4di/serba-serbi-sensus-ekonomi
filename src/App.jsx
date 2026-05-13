// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
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
    <Navbar />

    <main className="pt-16 flex-grow">
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/registrasi" element={<Registrasi />} />
        <Route path="/tes-kompetensi" element={<TesKompetensi />} />
        <Route path="/tes-wawancara" element={<TesWawancara />} />
        <Route path="/pengumuman-administrasi" element={<PengumumanAdministrasi />} />
        <Route path="/kkd" element={<KKD />} />
        <Route path="/ngibar" element={<Ngibar />} />
        <Route path="/reporta-se" element={<ReportaSE />} />
      </Routes>
    </main>

    <Footer />

    <ScrollTopButton />
  </div>
</BrowserRouter>
  );
}