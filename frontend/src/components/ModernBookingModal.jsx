import React, { useState } from "react";
import logo11 from "../assets/logo11.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ModernBookingModal = () => {
  // Removed isOpen state, always show booking form
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [ticketData, setTicketData] = useState({
    booking_date: "",
    pass_type: [], // allow multiple selection
    ticket_counts: {
      couple: 0,
      girls: 0,
      boys: 0
    }
  });
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const backendURL = "http://localhost:5000";

  // Helper function to get total tickets
  const getTotalTickets = () => {
    return ticketData.ticket_counts.couple + ticketData.ticket_counts.girls + ticketData.ticket_counts.boys;
  };

  // Helper function to calculate total amount
  const getTotalAmount = () => {
    return (ticketData.ticket_counts.couple * 400) + 
           (ticketData.ticket_counts.girls * 200) + 
           (ticketData.ticket_counts.boys * 200);
  };

  const handleTicketSubmit = async () => {
    const totalTickets = getTotalTickets();
    if (!ticketData.booking_date || totalTickets === 0) {
      alert("Please select date and at least one ticket");
      return;
    }
    // Validation: Boys pass only if Girl pass is selected
    if (ticketData.ticket_counts.boys > 0 && ticketData.ticket_counts.girls === 0) {
      alert("At least one Girl ticket must be booked before booking Boys ticket.");
      return;
    }
    setLoading(true);
    try {
      // Fix: Send the actual ticket counts instead of undefined tickets object
      const ticketsObj = ticketData.ticket_counts;
      const num_tickets = totalTickets;
      
      const res = await axios.post(`${backendURL}/api/booking`, {
        booking_date: ticketData.booking_date,
        tickets: ticketsObj, // This should now contain {couple: x, girls: y, boys: z}
        num_tickets,
      });
      if (res.data.success) {
        setBookingId(res.data.booking.id);
        setStep(2);
      } else {
        alert("Failed to create booking");
      }
    } catch (err) {
      console.error(err);
      alert("API error: couldn't create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    if (!userData.name || !userData.email || !userData.phone) {
      alert("Please fill all user details");
      return;
    }
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userData.email)) {
      setEmailError("Please enter a valid email address");
      return;
    } else if (!userData.email.endsWith("@gmail.com")) {
      setEmailError("Only @gmail.com email addresses are allowed");
      return;
    } else {
      setEmailError("");
    }
    if (!/^\d{10}$/.test(userData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    } else {
      setPhoneError("");
    }
    setLoading(true);
    try {
      const res = await axios.post(`${backendURL}/api/user`, {
        booking_id: bookingId,
        ...userData,
      });
      if (res.data.success) {
        setStep(3);
      } else {
        alert("Failed to add user details");
      }
    } catch (err) {
      console.error(err);
      alert("API error: couldn't add user details");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const ok = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!ok) return alert("Failed to load Razorpay SDK");

    setLoading(true);
    try {
      const amount = getTotalAmount();
      const orderRes = await axios.post(`${backendURL}/api/payment`, {
        booking_id: bookingId,
        amount,
      });
      const { order } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name:"Malang Ras Dandiya 2025",
        description: `Booking for ${getTotalTickets()} ticket(s)`,
        image: window.location.origin + '/assets/logo11.png',
        prefill: { name: userData.name, email: userData.email, contact: userData.phone },
        handler: async function (response) {
          try {
            const confirmRes = await axios.post(`${backendURL}/api/payment/confirm`, {
              booking_id: bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (confirmRes.data.success) {
              setStep(4);
            } else {
              alert("Payment confirmed but failed at backend");
            }
          } catch (err) {
            console.error(err);
            alert("Error confirming payment");
          }
        },
        theme: { color: "#e11d48" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error creating payment order");
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setBookingId(null);
    setTicketData({ 
      booking_date: "", 
      pass_type: [], 
      ticket_counts: { couple: 0, girls: 0, boys: 0 }
    });
    setUserData({ name: "", email: "", phone: "" });
  };

  // Handle pass type selection and ticket count changes
  const handlePassTypeChange = (type, checked) => {
    let selected = [...ticketData.pass_type];
    let newCounts = { ...ticketData.ticket_counts };

    if (checked) {
      if (type === "couple") {
        selected = ["couple"];
        newCounts = { couple: 1, girls: 0, boys: 0 };
      } else {
        selected = selected.filter(opt => opt !== "couple");
        if (!selected.includes(type)) {
          selected.push(type);
        }
        if (type === "girls") {
          newCounts[type] = Math.max(1, newCounts[type]);
        } else if (type === "boys") {
          if (newCounts.girls === 0) {
            alert("At least one Girl ticket must be booked before booking Boys ticket.");
            return;
          }
          newCounts[type] = Math.max(1, newCounts[type]);
        }
        newCounts.couple = 0;
      }
    } else {
      selected = selected.filter(opt => opt !== type);
      newCounts[type] = 0;
      // If girls is unchecked, also uncheck boys
      if (type === "girls" && selected.includes("boys")) {
        selected = selected.filter(opt => opt !== "boys");
        newCounts.boys = 0;
      }
    }

    setTicketData({ 
      ...ticketData, 
      pass_type: selected,
      ticket_counts: newCounts
    });
  };

  const updateTicketCount = (type, increment) => {
    const newCounts = { ...ticketData.ticket_counts };
    
    if (increment) {
      newCounts[type] += 1;
    } else {
      newCounts[type] = Math.max(0, newCounts[type] - 1);
    }

    // If count becomes 0, remove from pass_type array
    let newPassTypes = [...ticketData.pass_type];
    if (newCounts[type] === 0) {
      newPassTypes = newPassTypes.filter(t => t !== type);
      // If girls becomes 0 and boys is selected, remove boys too
      if (type === "girls" && newPassTypes.includes("boys")) {
        newPassTypes = newPassTypes.filter(t => t !== "boys");
        newCounts.boys = 0;
      }
    } else if (newCounts[type] > 0 && !newPassTypes.includes(type)) {
      // If count becomes > 0, add to pass_type array
      if (type === "boys" && newCounts.girls === 0) {
        alert("At least one Girl ticket must be booked before booking Boys ticket.");
        return;
      }
      newPassTypes.push(type);
    }

    setTicketData({
      ...ticketData,
      pass_type: newPassTypes,
      ticket_counts: newCounts
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-6">
        </div>

        {/* Book your ticket */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-auto">
              <h3 className="text-center text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Book Your Ticket</h3>
              <div className="space-y-5 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Event Date</label>
                  <input
                    type="date"
                    value={ticketData.booking_date}
                    onChange={(e) => setTicketData({ ...ticketData, booking_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Pass Type</label>
                  <div className="space-y-4">
                    {/* Couple Pass */}
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <label className="inline-flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={ticketData.pass_type.includes("couple")}
                          onChange={e => handlePassTypeChange("couple", e.target.checked)}
                          disabled={ticketData.pass_type.includes("girls") || ticketData.pass_type.includes("boys")}
                          className="mr-2"
                        />
                        <span className="font-semibold">Couple Pass (₹400)</span>
                      </label>
                      {ticketData.pass_type.includes("couple") && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <button
                            onClick={() => updateTicketCount("couple", false)}
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-xl font-semibold">{ticketData.ticket_counts.couple}</span>
                          <button
                            onClick={() => updateTicketCount("couple", true)}
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Girls Pass */}
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <label className="inline-flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={ticketData.pass_type.includes("girls")}
                          onChange={e => handlePassTypeChange("girls", e.target.checked)}
                          disabled={ticketData.pass_type.includes("couple")}
                          className="mr-2"
                        />
                        <span className="font-semibold">Girl (₹200)</span>
                      </label>
                      {ticketData.pass_type.includes("girls") && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <button
                            onClick={() => updateTicketCount("girls", false)}
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-xl font-semibold">{ticketData.ticket_counts.girls}</span>
                          <button
                            onClick={() => updateTicketCount("girls", true)}
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Boys Pass */}
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <label className="inline-flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={ticketData.pass_type.includes("boys")}
                          onChange={e => handlePassTypeChange("boys", e.target.checked)}
                          disabled={ticketData.pass_type.includes("couple")}
                          className="mr-2"
                        />
                        <span className="font-semibold">Boy (₹200)</span>
                      </label>
                      {ticketData.pass_type.includes("boys") && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <button
                            onClick={() => updateTicketCount("boys", false)}
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-xl font-semibold">{ticketData.ticket_counts.boys}</span>
                          <button
                            onClick={() => updateTicketCount("boys", true)}
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Total Summary */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Tickets: <span className="font-bold">{getTotalTickets()}</span></div>
                    <div className="text-sm text-gray-600">Total Amount: <span className="font-bold text-green-600">₹{getTotalAmount()}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={handleTicketSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 rounded-lg font-semibold shadow-md hover:from-pink-600 hover:to-orange-500 transition duration-300"
                >
                  {loading ? "Processing..." : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personal details - unchanged */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-auto">
              <h3 className="text-center text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Personal Details</h3>
              <div className="space-y-5 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={e => {
                      setUserData({ ...userData, email: e.target.value });
                      setEmailError("");
                    }}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${emailError ? 'border-red-500' : ''}`}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={userData.phone}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setUserData({ ...userData, phone: val });
                      if (val.length === 10) {
                        setPhoneError("");
                      }
                    }}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none ${phoneError ? 'border-red-500' : ''}`}
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg bg-white hover:bg-gray-100 font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={handleUserSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 rounded-lg font-semibold shadow-md hover:from-pink-600 hover:to-orange-500 transition duration-300"
                >
                  {loading ? "Processing..." : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary - Updated to show separate ticket counts */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-auto">
              <h3 className="text-lg text-center  font-bold mb-2 text-gray-800">Order Summary</h3>
              <div className="bg-blue-50 rounded-xl p-5 mb-4">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div className="text-gray-600 font-medium">Event:</div>
                  <div className="text-right font-semibold text-gray-800">Malang Ras Dandiya 2025</div>
                  <div className="text-gray-600 font-medium">Date:</div>
                  <div className="text-right font-semibold text-gray-800">{ticketData.booking_date}</div>
                  
                  {/* Show each ticket type separately */}
                  {ticketData.ticket_counts.couple > 0 && (
                    <>
                      <div className="text-gray-600 font-medium">Couple Pass:</div>
                      <div className="text-right font-semibold text-gray-800">{ticketData.ticket_counts.couple} × ₹400</div>
                    </>
                  )}
                  {ticketData.ticket_counts.girls > 0 && (
                    <>
                      <div className="text-gray-600 font-medium">Girls:</div>
                      <div className="text-right font-semibold text-gray-800">{ticketData.ticket_counts.girls} × ₹200</div>
                    </>
                  )}
                  {ticketData.ticket_counts.boys > 0 && (
                    <>
                      <div className="text-gray-600 font-medium">Boys:</div>
                      <div className="text-right font-semibold text-gray-800">{ticketData.ticket_counts.boys} × ₹200</div>
                    </>
                  )}
                  
                  <div className="col-span-2 border-t border-gray-200 my-2"></div>
                  <div className="text-gray-600 font-medium">Total Tickets:</div>
                  <div className="text-right font-semibold text-gray-800">{getTotalTickets()}</div>
                  <div className="text-lg font-bold text-gray-700">Grand Total:</div>
                  <div className="text-lg font-extrabold text-right text-gray-900">₹{getTotalAmount()}</div>
                </div>
              </div>
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-1">Contact Details:</h5>
                <div className="text-sm text-gray-700">
                  <div>{userData.name}</div>
                  <div>{userData.phone}</div>
                  <div>{userData.email}</div>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg bg-white hover:bg-gray-100 font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 rounded-lg font-semibold shadow-md hover:from-pink-600 hover:to-orange-500 transition duration-300"
                >
                  {loading ? "Processing..." : `Pay Now`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation step - unchanged */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#bbf7d0"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9"/></svg>
              </div>
              <h2 className="text-3xl font-extrabold text-green-600 mb-1 flex items-center gap-2">Booking Confirmed!</h2>
              <p className="text-green-700 text-lg mb-2">Your tickets have been sent to your email!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Show booking details with separate ticket counts */}
              <div className="bg-white rounded-xl shadow p-5 flex-1 min-w-[280px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-800">Booking Details</span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Confirmed</span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><span className="font-medium">Booking ID:</span> <span className="font-mono">NF{bookingId || 'XXXX'}</span></div>
                  <div><span className="font-medium">Payment Status:</span> <span className="text-green-600 font-semibold">Paid</span></div>
                  <div><span className="font-medium">Total Amount:</span> <span className="text-pink-600 font-bold text-lg">₹{getTotalAmount()}</span></div>
                </div>
              </div>
              
              {/* Updated tickets display */}
              <div className="bg-white rounded-xl shadow p-5 flex-1 min-w-[280px]">
                <span className="font-bold text-lg text-gray-800 block mb-2">Your Tickets</span>
                <div className="space-y-2">
                  {ticketData.ticket_counts.couple > 0 && (
                    <div className="flex items-center justify-between bg-pink-50 rounded px-3 py-2">
                      <span className="font-medium text-gray-700">Couple Pass</span>
                      <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded">{ticketData.ticket_counts.couple} × ₹400</span>
                    </div>
                  )}
                  {ticketData.ticket_counts.girls > 0 && (
                    <div className="flex items-center justify-between bg-pink-50 rounded px-3 py-2">
                      <span className="font-medium text-gray-700">Girls</span>
                      <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded">{ticketData.ticket_counts.girls} × ₹200</span>
                    </div>
                  )}
                  {ticketData.ticket_counts.boys > 0 && (
                    <div className="flex items-center justify-between bg-pink-50 rounded px-3 py-2">
                      <span className="font-medium text-gray-700">Boys</span>
                      <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded">{ticketData.ticket_counts.boys} × ₹200</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rest of confirmation display unchanged */}
              <div className="bg-white rounded-xl shadow p-5 flex-1 min-w-[280px]">
                <span className="font-bold text-lg text-gray-800 block mb-2">Customer Information</span>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center gap-2"><span className="bg-pink-100 text-pink-600 rounded-full px-2 py-1 font-bold">P</span> {userData.name}</div>
                  <div className="flex items-center gap-2"><span className="material-icons text-base text-gray-400">email</span> {userData.email}</div>
                  <div className="flex items-center gap-2"><span className="material-icons text-base text-gray-400">phone</span> {userData.phone}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-5 flex-1 min-w-[280px]">
                <span className="font-bold text-lg text-gray-800 block mb-2">Event Information</span>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center gap-2"><span className="material-icons text-purple-400">event</span> {ticketData.booking_date}</div>
                  <div className="flex items-center gap-2"><span className="material-icons text-orange-400">schedule</span> 7:00 PM onwards</div>
                  <div className="flex items-center gap-2"><span className="material-icons text-green-400">location_on</span> Shivaji Ground, Aurangabad</div>
                </div>
              </div>
            </div>
            
            {/* <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl shadow p-5">
                <span className="font-bold text-lg text-blue-700 block mb-2">Important Reminders</span>
                <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
                  <li>Carry a valid photo ID and this e-ticket to the venue</li>
                  <li>Gates open at 4:00 PM on event day</li>
                  <li>Traditional attire is encouraged for the best experience</li>
                  <li>Check your email for detailed event information</li>
                </ul>
              </div>
            </div> */}
            <button onClick={resetBooking} className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition duration-300" >
              Book Again
            </button>
          </div>
        )}
      </div>
    );
  };

  export default ModernBookingModal;