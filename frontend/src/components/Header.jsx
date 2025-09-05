
import React from "react";
import { useNavigate } from "react-router-dom";
import logo11 from "../assets/logo11.png";

const Header = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState("landing");
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <img src={logo11} alt="Malang Ras Dandiya Logo" className="w-full h-full object-contain" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-base sm:text-lg bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 bg-clip-text text-transparent drop-shadow-sm truncate">
                Malang Ras Dandiya
              </h1>
              <p className="text-xs text-black-500 truncate">Event Management</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab("landing"); navigate("/"); }}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "landing" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab("booking"); navigate("/booking"); }}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "booking" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">🎟️ Book Tickets</span>
            </button>
            <button
              onClick={() => { setActiveTab("scanner"); navigate("/scanner"); }}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "scanner" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">📱 QR Scanner</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              aria-label="Toggle menu"
            >
              <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 bg-gray-100 rounded-xl shadow p-3 flex flex-col space-y-2 animate-fade-in">
            <button
              onClick={() => { setActiveTab("landing"); navigate("/"); setMenuOpen(false); }}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-left ${
                activeTab === "landing" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab("booking"); navigate("/booking"); setMenuOpen(false); }}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-left ${
                activeTab === "booking" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">🎟️ Book Tickets</span>
            </button>
            <button
              onClick={() => { setActiveTab("scanner"); navigate("/scanner"); setMenuOpen(false); }}
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-left ${
                activeTab === "scanner" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">📱 QR Scanner</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;