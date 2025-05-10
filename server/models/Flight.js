// models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  airline: {
    type: String,
    required: true
  },
  departureCity: {
    type: String,
    required: true
  },
  departureAirport: {
    type: String,
    required: true
  },
  departureAirportCode: {
    type: String,
    required: true
  },
  arrivalCity: {
    type: String,
    required: true
  },
  arrivalAirport: {
    type: String,
    required: true
  },
  arrivalAirportCode: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  seatsAvailable: {
    type: Number,
    required: true,
    default: 60
  },
  aircraft: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Dynamic pricing tracking
flightSchema.add({
  priceResetTimers: [{
    resetTime: Date,
    originalPrice: Number
  }],
  searchCount: {
    type: Map,
    of: {
      count: Number,
      lastSearchTime: Date
    },
    default: {}
  }
});

const Flight = mongoose.model('Flight', flightSchema);
module.exports = Flight;