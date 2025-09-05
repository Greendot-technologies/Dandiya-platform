import React from "react";
import { useNavigate } from "react-router-dom";
import logo2 from "../assets/logo2.jpeg";
import bgVideo from "../assets/bg.mp4";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Hero Section with Video Background */}
      <div className="relative h-screen w-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-center text-white relative z-20">
            <img src={logo2} alt="Malang Ras Dandiya" className="mx-auto w-40 mb-6" />
            {/* <h1 className="text-5xl md:text-6xl font-bold mb-4">Malang Ras Dandiya 2025</h1> */}
            <p className="text-xl mb-6">Chh. Sambhaji Nagar's Biggest Navratri Celebration</p>
            <button
              onClick={() => navigate("/booking")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-8 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition duration-300"
            >
              Book Tickets Now
            </button>
          </div>
        </div>
      </div>


      {/* Event Details */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          <span className="inline-block animate-gradient-x">Event Highlights</span>
        </h2>
        <p className="text-lg text-center mb-10 text-gray-700 font-medium">
          Join us for the most spectacular Dandiya celebration of the year. Experience traditional dance, modern music, and unforgettable memories.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:-translate-y-2 hover:scale-105 hover:bg-gradient-to-br hover:from-pink-100 hover:via-yellow-100 hover:to-green-100 hover:shadow-2xl cursor-pointer group">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">💃</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-600 transition-colors duration-300">Live Dandiya & Garba</h3>
            <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Experience traditional dances with professional groups.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:-translate-y-2 hover:scale-105 hover:bg-gradient-to-br hover:from-yellow-100 hover:via-blue-100 hover:to-green-100 hover:shadow-2xl cursor-pointer group">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">🎵</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-300">Live Music</h3>
            <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Live dhol, DJ, and Bollywood beats.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:-translate-y-2 hover:scale-105 hover:bg-gradient-to-br hover:from-green-100 hover:via-pink-100 hover:to-yellow-100 hover:shadow-2xl cursor-pointer group">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">🎁</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors duration-300">Exciting Prizes</h3>
            <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Win in Dandiya King & Queen contests.</p>
          </div>
        </div>
      </div>


      {/* Venue Info */}
      <div className="max-w-7xl mx-auto py-16 px-4 bg-gray-100 rounded-lg">
        <h2 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          <span className="inline-block animate-gradient-x">Venue Details</span>
        </h2>
        <p className="text-xl text-center mb-10 text-gray-700 font-medium">
          Located in the heart of Chh. Sambhaji Nagar, our venue offers the perfect setting for an unforgettable Dandiya celebration.
        </p>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Venue Image and label */}
          <div className="flex-1 w-full">
            <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Regal Lawns & Hall"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
                <h3 className="text-white text-2xl font-bold">Regal Lawns & Hall</h3>
                {/* <p className="text-gray-200 text-sm">Capacity: 500+ People</p> */}
              </div>
            </div>
          </div>
          {/* Venue Info Cards */}
          <div className="flex-1 w-full flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Address Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-xl transition-all border-l-4 border-blue-400">
                <div className="flex items-center gap-2 text-blue-500 text-xl font-bold"><span>📍</span> Address</div>
                <div className="text-gray-700 text-sm">
                    
                 Beed Bypass Rd, Darshan Vihar Colony,<br/>
                Mirajgave Nagari, Chhatrapati Sambhajinagar,<br/>
                 Maharashtra 431009
                </div>
              </div>
              {/* Timing Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-xl transition-all border-l-4 border-purple-400">
                <div className="flex items-center gap-2 text-purple-500 text-xl font-bold"><span>⏰</span> Timing</div>
                <div className="text-gray-700 text-sm">7:00 PM – 11:00 PM</div>
              </div>
              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-xl transition-all border-l-4 border-green-400">
                <div className="flex items-center gap-2 text-green-500 text-xl font-bold"><span>📞</span> Contact</div>
                <div className="text-gray-700 text-sm">+91 98765 43210</div>
              </div>
              {/* Amenities Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-xl transition-all border-l-4 border-pink-400">
                <div className="flex items-center gap-2 text-pink-500 text-xl font-bold"><span>🏷️</span> Venue Amenities</div>
                <ul className="text-gray-700 text-sm space-y-1 mt-1">
                  <li className="flex items-center gap-2"><span className="text-blue-500">🚗</span> Valet Parking</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">🟢</span> Air Conditioned</li>
                  <li className="flex items-center gap-2"><span className="text-purple-500">📶</span> Free WiFi</li>
                  <li className="flex items-center gap-2"><span className="text-red-500">🔒</span> Security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Venue Map */}
        <div className="bg-gray-200 p-6 rounded-lg shadow mt-10">
          <iframe
            // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15129.981768473693!2d75.891!3d19.878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd684!2sAurangabad!5e0!3m2!1sen!2sin!4v1699999999"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.7542083029725!2d75.3499744!3d19.850350299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdba27a8820d35b%3A0x8ba350e85183604b!2sRegal%20Lawns%20%26%20Hall!5e0!3m2!1sen!2sin!4v1756382969521!5m2!1sen!2sin"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Venue Map"
          ></iframe>
        </div>
      </div>



      {/* Terms and Conditions */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          <span className="inline-block animate-gradient-x">Terms & Conditions</span>
        </h2>
        <p className="text-xl text-center mb-6 text-gray-700 font-medium">
          Please read and understand our terms and conditions before booking your tickets.
        </p>
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-10 flex items-center gap-3">
          <span className="text-2xl text-orange-500">⚠️</span>
          <span className="font-semibold text-orange-700">Important:</span>
          <span className="text-orange-700">By purchasing tickets, you agree to all terms and conditions listed below. Please ensure you read them carefully before proceeding with your booking.</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Entry Requirements */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-xl transition-all border-t-4 border-purple-400">
            <div className="flex items-center gap-2 text-purple-500 text-2xl font-bold mb-2"><span>🛡️</span> Entry Requirements</div>
            <ul className="text-gray-700 text-base space-y-2 list-disc list-inside">
              <li>Valid ticket/pass required for entry</li>
              <li>Age verification may be required (18+ event)</li>
              <li>Photo ID mandatory for entry</li>
              <li>No outside food or beverages allowed</li>
            </ul>
          </div>
          {/* Dress Code & Conduct */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-xl transition-all border-t-4 border-blue-400">
            <div className="flex items-center gap-2 text-blue-500 text-2xl font-bold mb-2"><span>🧑‍🎤</span> Dress Code & Conduct</div>
            <ul className="text-gray-700 text-base space-y-2 list-disc list-inside">
              <li>Traditional or ethnic wear preferred</li>
              <li>Respectful behavior expected at all times</li>
              <li>No smoking or alcohol consumption allowed</li>
              <li>Photography restrictions in certain areas</li>
            </ul>
          </div>
          {/* Cancellation Policy */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-xl transition-all border-t-4 border-pink-400">
            <div className="flex items-center gap-2 text-pink-500 text-2xl font-bold mb-2"><span>🔄</span> Cancellation Policy</div>
            <ul className="text-gray-700 text-base space-y-2 list-disc list-inside">
              <li>Tickets are non-refundable after purchase</li>
              <li>Event cancellation will result in full refund</li>
              <li>Date changes subject to availability</li>
              <li>Transfer of tickets allowed with prior notice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;