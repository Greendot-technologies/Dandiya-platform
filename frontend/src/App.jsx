import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import ModernBookingModal from "./components/ModernBookingModal";
import ModernQRScanner from "./components/ModernQRScanner";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-red-50/30 to-yellow-50/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(251,146,60,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(239,68,68,0.1),transparent_50%)]"></div>
          <div className="relative">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/booking" element={<ModernBookingModal />} />
              <Route path="/scanner" element={<ModernQRScanner />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;