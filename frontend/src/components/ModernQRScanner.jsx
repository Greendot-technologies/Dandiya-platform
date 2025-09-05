import React, { useState } from "react";
import axios from "axios";

const ModernQRScanner = () => {
  const [qrData, setQrData] = useState("");
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const backendURL = "http://localhost:5000";

  const handleScanQR = async () => {
    if (!qrData.trim()) {
      setError("Please enter QR code data");
      return;
    }

    // Validate QR data is JSON and has required fields
    let parsed;
    try {
      parsed = JSON.parse(qrData);
      if (!parsed.booking_id || !parsed.ticket_no) {
        setError("QR code data missing booking_id or ticket_no");
        return;
      }
    } catch (e) {
      setError("QR code data is not valid JSON");
      return;
    }

    setLoading(true);
    setError("");
    setScanning(true);
    
    try {
      const response = await axios.post(`${backendURL}/api/qr/details`, {
        qr_data: qrData
      });

      if (response.data.success) {
        setTicketDetails(response.data.ticket_info);
        setScanning(false);
      } else {
        setError("Invalid QR code");
        setScanning(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to scan QR code or QR code not found");
      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUsed = async () => {
    if (!ticketDetails) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/api/qr/mark-used`, {
        booking_id: ticketDetails.booking_id,
        ticket_number: ticketDetails.ticket_number
      });

      if (response.data.success) {
        setTicketDetails(prev => ({
          ...prev,
          is_used: true,
          used_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to mark ticket as used");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setQrData("");
    setTicketDetails(null);
    setError("");
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            📱 Ticket Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QR Scanner
          </h1>
          <p className="text-gray-600 text-lg">Verify and manage event tickets</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!ticketDetails ? (
            // Scanner Interface
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📸</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan QR Code</h2>
                <p className="text-gray-600">Enter or paste the QR code data to verify ticket</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    QR Code Data:
                  </label>
                  <div className="relative">
                    <textarea
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      placeholder="Paste QR code data here..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="4"
                    />
                    {scanning && (
                      <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl flex items-center justify-center">
                        <div className="text-blue-600 font-medium">Scanning...</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <span>{error}</span>
                  </div>
                )}
                
                <button
                  onClick={handleScanQR}
                  disabled={loading || !qrData.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scanning...
                    </div>
                  ) : (
                    "🔍 Scan QR Code"
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-12 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  How to use:
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">1.</span>
                      <span>Ask customer to show their ticket QR code</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">2.</span>
                      <span>Copy the QR data and paste it above</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">3.</span>
                      <span>Click scan to verify ticket authenticity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">4.</span>
                      <span>Mark as used after entry is granted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Ticket Details View
            <div className="p-8">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  ticketDetails.is_used 
                    ? 'bg-red-100' 
                    : 'bg-green-100'
                }`}>
                  <span className="text-3xl">
                    {ticketDetails.is_used ? '🚫' : '✅'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {ticketDetails.is_used ? 'Ticket Used' : 'Valid Ticket'}
                </h2>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  ticketDetails.is_used 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ticketDetails.is_used ? '❌ Already Used' : '✅ Ready for Entry'}
                </div>
              </div>

              {/* Ticket Information */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎟️</span>
                  <h3 className="text-xl font-bold text-gray-800">Malang Ras Dandiya 2025</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">#{ticketDetails.booking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Number:</span>
                      <span className="font-semibold">{ticketDetails.ticket_number} of {ticketDetails.total_tickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Name:</span>
                      <span className="font-semibold">{ticketDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-sm">{ticketDetails.email}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold">{ticketDetails.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Date:</span>
                      <span className="font-semibold">{new Date(ticketDetails.booking_date).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Time:</span>
                      <span className="font-semibold">5:00 PM onwards</span>
                    </div>
                    {ticketDetails.used_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Used At:</span>
                        <span className="font-semibold text-sm text-red-600">
                          {new Date(ticketDetails.used_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!ticketDetails.is_used ? (
                  <button
                    onClick={handleMarkAsUsed}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Marking...
                      </div>
                    ) : (
                      "✅ Mark as Used & Allow Entry"
                    )}
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-500 py-4 px-6 rounded-xl font-semibold text-lg text-center">
                    🚫 Ticket Already Used
                  </div>
                )}
                
                <button
                  onClick={resetScanner}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                >
                  📸 Scan Another
                </button>
              </div>

              {/* Additional Info */}
              {!ticketDetails.is_used && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">Important:</span>
                  </div>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• Verify ID proof matches the ticket holder name</li>
                    <li>• Check if the event date matches today's date</li>
                    <li>• Mark as used only after allowing entry</li>
                    <li>• Each ticket can only be used once</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {!ticketDetails && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-green-500">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">Valid</div>
              <div className="text-gray-600 text-sm">Authentic Tickets</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-red-500">
              <div className="text-2xl mb-2">🚫</div>
              <div className="text-2xl font-bold text-red-600">Used</div>
              <div className="text-gray-600 text-sm">Already Scanned</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-blue-500">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-2xl font-bold text-blue-600">Scan</div>
              <div className="text-gray-600 text-sm">Quick Verification</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernQRScanner;