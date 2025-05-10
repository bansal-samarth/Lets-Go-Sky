// controllers/bookingController.js
const Booking = require('../models/Booking');
const User = require('../models/User');
const Flight = require('../models/Flight');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createBooking = async (req, res) => {
  try {
    const { flightId, passengers } = req.body;
    const userId = req.user._id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the flight with dynamic pricing
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Calculate total price
    const totalPrice = flight.currentPrice * passengers.length;
    
    // Check if user has enough wallet balance
    if (user.walletBalance < totalPrice) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Create the booking
    const booking = new Booking({
      user: userId,
      flight: flightId,
      passengers,
      totalPrice,
      pnrNumber: 'TEMP_PNR' + Math.floor(Math.random() * 1000000),
    });
    
    // Update wallet balance
    user.walletBalance -= totalPrice;
    await user.save();
    
    // Update available seats
    flight.seatsAvailable -= passengers.length;
    await flight.save();
    
    // Save the booking
    const savedBooking = await booking.save();
    
    // Populate flight and user details
    await savedBooking.populate('flight user');
    
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const bookings = await Booking.find({ user: userId })
      .populate('flight')
      .sort('-createdAt');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const booking = await Booking.findOne({ _id: id, user: userId })
      .populate('flight user');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow cancellation if status is 'confirmed'
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // Refund user's wallet
    const user = await User.findById(userId);
    if (user) {
      user.walletBalance += booking.totalPrice;
      await user.save();
    }
    
    // Increase available seats on flight
    const flight = await Flight.findById(booking.flight);
    if (flight) {
      flight.seatsAvailable += booking.passengers.length;
      await flight.save();
    }
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Generate PDF ticket using Puppeteer
const puppeteer = require('puppeteer');
exports.generateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const booking = await Booking.findOne({ _id: id, user: userId }).populate('flight user');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Format dates in a nicer way
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    };

    const formatTime = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    };

    // Calculate flight duration
    const departureTime = new Date(booking.flight.departureTime);
    const arrivalTime = new Date(booking.flight.arrivalTime);
    const durationMs = arrivalTime - departureTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}h ${minutes}m`;

    // Build HTML template with modern design
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flight Ticket - ${booking.pnrNumber}</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            :root {
              --primary: #1a56db;
              --primary-dark: #1e40af;
              --primary-light: #e0e9ff;
              --secondary: #111827;
              --accent: #3b82f6;
              --gray-light: #f3f4f6;
              --gray: #d1d5db;
              --white: #ffffff;
              --border-radius: 12px;
              --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Poppins', sans-serif;
              background: var(--gray-light);
              color: var(--secondary);
              line-height: 1.6;
              padding: 20px;
            }
            
            .ticket-container {
              max-width: 800px;
              margin: 40px auto;
              background: var(--white);
              border-radius: var(--border-radius);
              overflow: hidden;
              box-shadow: var(--shadow);
            }
            
            .ticket-header {
              position: relative;
              background: linear-gradient(135deg, var(--primary), var(--primary-dark));
              color: var(--white);
              padding: 25px 30px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            
            .ticket-logo {
              font-size: 24px;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .ticket-logo i {
              background: var(--white);
              color: var(--primary);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .pnr-container {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
            
            .pnr-label {
              font-size: 12px;
              opacity: 0.8;
            }
            
            .pnr {
              font-size: 20px;
              font-weight: 600;
              letter-spacing: 1px;
            }

            .main-content {
              padding: 30px;
            }
            
            .flight-info {
              display: flex;
              align-items: center;
              margin-bottom: 30px;
              position: relative;
            }
            
            .departure, .arrival {
              flex: 1;
            }
            
            .city-code {
              font-size: 32px;
              font-weight: 700;
              color: var(--primary-dark);
            }
            
            .city-name {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 5px;
            }
            
            .datetime {
              font-size: 16px;
              font-weight: 500;
            }
            
            .flight-path {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 0 20px;
            }
            
            .airplane {
              color: var(--primary);
              font-size: 22px;
              margin: 10px 0;
              position: relative;
            }
            
            .airplane::before, .airplane::after {
              content: "";
              position: absolute;
              height: 2px;
              background: var(--gray);
              top: 50%;
              width: 70px;
            }
            
            .airplane::before {
              right: 30px;
            }
            
            .airplane::after {
              left: 30px;
            }
            
            .flight-duration {
              background: var(--primary-light);
              color: var(--primary-dark);
              font-size: 12px;
              font-weight: 600;
              padding: 4px 12px;
              border-radius: 20px;
            }
            
            .divider {
              width: 100%;
              height: 1px;
              background: var(--gray);
              margin: 20px 0;
              position: relative;
            }
            
            .divider::before, .divider::after {
              content: "";
              position: absolute;
              width: 20px;
              height: 20px;
              background: var(--gray-light);
              border-radius: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
            
            .divider::before {
              left: 0;
            }
            
            .divider::after {
              right: 0;
              transform: translate(50%, -50%);
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .detail-box {
              padding: 15px;
              background: var(--gray-light);
              border-radius: var(--border-radius);
            }
            
            .detail-box h3 {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 5px;
              font-weight: 500;
            }
            
            .detail-box p {
              font-size: 16px;
              font-weight: 600;
            }

            .passenger-section {
              margin: 30px 0;
            }
            
            .section-title {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 15px;
            }
            
            .section-title i {
              color: var(--primary);
            }
            
            .section-title h2 {
              font-size: 18px;
              font-weight: 600;
            }
            
            .passenger-list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 15px;
            }
            
            .passenger-card {
              background: var(--gray-light);
              border-radius: var(--border-radius);
              padding: 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .passenger-info h3 {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 5px;
            }
            
            .passenger-meta {
              font-size: 14px;
              color: #64748b;
            }
            
            .seat-number {
              background: var(--primary);
              color: var(--white);
              font-weight: 600;
              padding: 5px 10px;
              border-radius: 5px;
              font-size: 14px;
            }
            
            .payment-info {
              background: #f0f9ff;
              border-radius: var(--border-radius);
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 20px;
            }
            
            .payment-details span {
              font-size: 14px;
              color: #64748b;
            }
            
            .payment-details h3 {
              font-size: 22px;
              font-weight: 700;
              color: var(--primary-dark);
            }
            
            .payment-status {
              background: #dcfce7;
              color: #166534;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
            }

            .ticket-footer {
              background: #f8fafc;
              padding: 20px 30px;
              font-size: 12px;
              color: #64748b;
              border-top: 1px dashed var(--gray);
            }
            
            .footer-notice {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .footer-notice i {
              color: var(--primary);
            }
            
            .terms {
              margin-top: 10px;
            }
            
            .terms ul {
              list-style-type: none;
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
            }
            
            .terms li {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            
            .terms i {
              font-size: 10px;
              color: var(--primary);
            }

            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .ticket-container {
                box-shadow: none;
                margin: 0;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <div class="ticket-logo">
                <i class="fas fa-plane"></i>
                <span>SkyTicket</span>
              </div>
              <div class="pnr-container">
                <span class="pnr-label">BOOKING REFERENCE</span>
                <span class="pnr">${booking.pnrNumber}</span>
              </div>
            </div>
            
            <div class="main-content">
              <div class="flight-info">
                <div class="departure">
                  <div class="city-name">${booking.flight.departureCity}</div>
                  <div class="city-code">${booking.flight.departureAirportCode}</div>
                  <div class="datetime">
                    <div>${formatDate(booking.flight.departureTime)}</div>
                    <div>${formatTime(booking.flight.departureTime)}</div>
                  </div>
                </div>
                
                <div class="flight-path">
                  <div class="airplane">
                    <i class="fas fa-plane"></i>
                  </div>
                  <div class="flight-duration">${duration}</div>
                </div>
                
                <div class="arrival">
                  <div class="city-name">${booking.flight.arrivalCity}</div>
                  <div class="city-code">${booking.flight.arrivalAirportCode}</div>
                  <div class="datetime">
                    <div>${formatDate(booking.flight.arrivalTime)}</div>
                    <div>${formatTime(booking.flight.arrivalTime)}</div>
                  </div>
                </div>
              </div>
              
              <div class="details-grid">
                <div class="detail-box">
                  <h3>Airline</h3>
                  <p>${booking.flight.airline}</p>
                </div>
                <div class="detail-box">
                  <h3>Flight Number</h3>
                  <p>${booking.flight.flightNumber}</p>
                </div>
                <div class="detail-box">
                  <h3>Booking Date</h3>
                  <p>${formatDate(booking.bookingDate)}</p>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <div class="passenger-section">
                <div class="section-title">
                  <i class="fas fa-users"></i>
                  <h2>Passenger Details</h2>
                </div>
                
                <div class="passenger-list">
                  ${booking.passengers.map(p => `
                    <div class="passenger-card">
                      <div class="passenger-info">
                        <h3>${p.name}</h3>
                        <div class="passenger-meta">Age: ${p.age} | ${p.gender}</div>
                      </div>
                      <div class="seat-number">${p.seatNumber || 'TBD'}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="payment-info">
                <div class="payment-details">
                  <span>Total Amount Paid</span>
                  <h3>₹${booking.totalPrice.toFixed(2)}</h3>
                </div>
                <div class="payment-status">${booking.status}</div>
              </div>
            </div>
            
            <div class="ticket-footer">
              <div class="footer-notice">
                <i class="fas fa-info-circle"></i>
                <span>Important Information</span>
              </div>
              <div class="terms">
                <ul>
                  <li><i class="fas fa-circle"></i> Arrive 2 hours before departure</li>
                  <li><i class="fas fa-circle"></i> Carry valid ID proof</li>
                  <li><i class="fas fa-circle"></i> Ticket is non-transferable</li>
                  <li><i class="fas fa-circle"></i> Web check-in opens 48 hours before departure</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Launch headless Chrome
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const filePath = path.join(tempDir, `ticket_${booking.pnrNumber}.pdf`);

    await page.pdf({ 
      path: filePath, 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } 
    });
    
    await browser.close();

    // Stream PDF to client
    res.download(filePath, `SkyTicket_${booking.pnrNumber}.pdf`, err => {
      if (err) return res.status(500).json({ message: 'Error sending file' });
      fs.unlink(filePath, () => {});
    });

  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};