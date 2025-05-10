// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  passengers: [{
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    seatNumber: String
  }],
  bookingDate: {
    type: Date,
    default: Date.now
  },
  pnrNumber: {
    type: String,
    // required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentInfo: {
    method: {
      type: String,
      default: 'wallet'
    },
    status: {
      type: String,
      default: 'completed'
    }
  }
}, {
  timestamps: true
});

// Generate unique PNR
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.pnrNumber) { // Added !this.pnrNumber for safety, though isNew should cover
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    // Ensure PNR uniqueness (optional, but good for robustness if you expect high volume)
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loop

    while (!isUnique && attempts < maxAttempts) {
        pnr = ''; // Reset PNR for each attempt
        for (let i = 0; i < 6; i++) {
            pnr += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        // Check if this PNR already exists
        const existingBooking = await mongoose.model('Booking').findOne({ pnrNumber: pnr });
        if (!existingBooking) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        // Could not generate a unique PNR after several attempts
        // Fallback or error handling, e.g., make PNR longer or add timestamp
        pnr = pnr + Date.now().toString().slice(-3); // Simple fallback
        // Or: return next(new Error('Could not generate a unique PNR number.'));
    }
    this.pnrNumber = pnr;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;