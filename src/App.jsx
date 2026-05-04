import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";

import Beranda from "./pages/Beranda";
import Registrasi from "./pages/Registrasi";
import KKD from "./pages/KKD";
import Ngibar from "./pages/Ngibar";
import ReportaSE from "./pages/ReportaSE";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <BrowserRouter>
      <div className="font-sans antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-16 flex-grow">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/registrasi" element={<Registrasi />} />
            <Route path="/kkd" element={<KKD />} />
            <Route path="/ngibar" element={<Ngibar />} />
            <Route path="/reporta-se" element={<ReportaSE />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
