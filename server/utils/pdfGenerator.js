// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a flight ticket PDF
 * @param {Object} booking - The booking object with populated flight and user
 * @returns {Promise<string>} - Path to the generated PDF file
 */
exports.generateTicketPDF = async (booking) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument();
      const filename = `ticket_${booking.pnrNumber}.pdf`;
      const tempDir = path.join(__dirname, '../temp');
      const filePath = path.join(tempDir, filename);
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add content to PDF
      doc.fontSize(25).text('E-Ticket', { align: 'center' });
      doc.moveDown();
      
      // Add logo/header
      doc.rect(50, 50, doc.page.width - 100, 50).stroke();
      doc.fontSize(18).text('SkyFly Airlines', 100, 65);
      doc.fontSize(10).text('Your journey, our responsibility', 100, 85);
      
      // Ticket details
      doc.moveDown(2);
      doc.fontSize(16).text('Booking Details', { underline: true });
      doc.moveDown();
      
      doc.fontSize(12).text(`PNR: ${booking.pnrNumber}`, { continued: true })
        .text(`   Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}`, { align: 'right' });
      
      // Flight info box
      doc.moveDown();
      doc.rect(50, doc.y, doc.page.width - 100, 100).stroke();
      
      // Left side - departure
      const yStart = doc.y + 10;
      doc.fontSize(14).text(booking.flight.departureAirportCode, 70, yStart);
      doc.fontSize(10).text(booking.flight.departureCity, 70, yStart + 20);
      doc.fontSize(12).text(new Date(booking.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 70, yStart + 40);
      doc.fontSize(10).text(new Date(booking.flight.departureTime).toLocaleDateString(), 70, yStart + 55);
      
      // Right side - arrival
      doc.fontSize(14).text(booking.flight.arrivalAirportCode, doc.page.width - 120, yStart);
      doc.fontSize(10).text(booking.flight.arrivalCity, doc.page.width - 120, yStart + 20);
      doc.fontSize(12).text(new Date(booking.flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), doc.page.width - 120, yStart + 40);
      doc.fontSize(10).text(new Date(booking.flight.arrivalTime).toLocaleDateString(), doc.page.width - 120, yStart + 55);
      
      // Middle - flight details
      doc.fontSize(12).text(booking.flight.airline, doc.page.width / 2 - 50, yStart + 15, { width: 100, align: 'center' });
      doc.fontSize(10).text(`Flight: ${booking.flight.flightNumber}`, doc.page.width / 2 - 50, yStart + 35, { width: 100, align: 'center' });
      doc.fontSize(10).text(`Aircraft: ${booking.flight.aircraft}`, doc.page.width / 2 - 50, yStart + 50, { width: 100, align: 'center' });
      
      // Draw arrow
      doc.moveTo(130, yStart + 30)
         .lineTo(doc.page.width - 130, yStart + 30)
         .stroke();
      
      // Passenger details
      doc.moveDown(4);
      doc.fontSize(16).text('Passenger Details', { underline: true });
      doc.moveDown();
      
      // Table header
      const tableTop = doc.y;
      doc.fontSize(10)
         .text('Name', 50, tableTop)
         .text('Age', 250, tableTop)
         .text('Gender', 300, tableTop)
         .text('Seat', 380, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke();
      
      // Table rows
      let yPosition = tableTop + 25;
      booking.passengers.forEach((passenger, index) => {
        doc.fontSize(10)
           .text(passenger.name, 50, yPosition)
           .text(passenger.age.toString(), 250, yPosition)
           .text(passenger.gender, 300, yPosition)
           .text(passenger.seatNumber || 'TBD', 380, yPosition);
        
        yPosition += 20;
      });
      
      // Payment details
      doc.moveDown(4);
      doc.fontSize(14).text('Payment Information', { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(`Payment Method: Wallet`);
      doc.fontSize(10).text(`Amount Paid: Rs ${booking.totalPrice.toFixed(2)}`);
      doc.fontSize(10).text(`Status: ${booking.status.toUpperCase()}`);
      
      // Terms and conditions
      doc.moveDown(2);
      doc.fontSize(8).text('Important Information:', { bold: true });
      doc.fontSize(8).text('• Check-in counters close 45 minutes before departure for domestic flights.');
      doc.fontSize(8).text('• Carry valid photo identification for all passengers.');
      doc.fontSize(8).text('• This is a computer-generated document and needs no signature.');
      
      // Footer
      doc.fontSize(8).text('For any assistance, contact our 24x7 customer care: 1800-123-4567', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
      // When the stream is finished, resolve with the file path
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};