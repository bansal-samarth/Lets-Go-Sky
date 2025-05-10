// seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config({ path: './.env' });

// Models
const Flight = require('./models/Flight');
const User = require('./models/User');
const Booking = require('./models/Booking');

// Config
const connectDB = require('./config/db');

// Connect to DB
connectDB();

// Sample data
const airlines = ['IndiGo', 'SpiceJet', 'Air India', 'Vistara', 'GoAir'];
const aircrafts = ['Airbus A320', 'Boeing 737', 'Boeing 777', 'Airbus A380', 'Bombardier Q400'];

// Airport codes
const airports = [
  { city: 'Delhi', airport: 'Indira Gandhi International Airport', code: 'DEL' },
  { city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj International Airport', code: 'BOM' },
  { city: 'Bangalore', airport: 'Kempegowda International Airport', code: 'BLR' },
  { city: 'Chennai', airport: 'Chennai International Airport', code: 'MAA' },
  { city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose International Airport', code: 'CCU' },
  { city: 'Hyderabad', airport: 'Rajiv Gandhi International Airport', code: 'HYD' },
  { city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel International Airport', code: 'AMD' },
  { city: 'Goa', airport: 'Dabolim Airport', code: 'GOI' },
  { city: 'Pune', airport: 'Pune Airport', code: 'PNQ' },
  { city: 'Jaipur', airport: 'Jaipur International Airport', code: 'JAI' }
];

// Utilities
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateFlightNumber = airline => `${airline.substring(0,2).toUpperCase()}${getRandomNumber(1000,9999)}`;
const generateFutureDate = (daysAhead = 8) => {
  const date = new Date();
  date.setDate(date.getDate() + getRandomNumber(1, daysAhead));
  date.setHours(getRandomNumber(0,23), getRandomNumber(0,59), 0, 0);
  return date;
};

// Generate unique flights
function generateFlights(count = 2000) {
  const flights = [];
  const usedFlightNumbers = new Set();

  while (flights.length < count) {
    const dep = airports[getRandomNumber(0, airports.length - 1)];
    let arr;
    do {
      arr = airports[getRandomNumber(0, airports.length - 1)];
    } while (arr.code === dep.code);

    const airline = airlines[getRandomNumber(0, airlines.length - 1)];
    const aircraft = aircrafts[getRandomNumber(0, aircrafts.length - 1)];

    // ensure unique flightNumber
    let flightNumber;
    do {
      flightNumber = generateFlightNumber(airline);
    } while (usedFlightNumbers.has(flightNumber));
    usedFlightNumbers.add(flightNumber);

    const departureTime = generateFutureDate();
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + getRandomNumber(2,5));

    const basePrice = getRandomNumber(2000,3000);

    flights.push({
      flightNumber,
      airline,
      departureCity: dep.city,
      departureAirport: dep.airport,
      departureAirportCode: dep.code,
      arrivalCity: arr.city,
      arrivalAirport: arr.airport,
      arrivalAirportCode: arr.code,
      departureTime,
      arrivalTime,
      basePrice,
      currentPrice: basePrice,
      seatsAvailable: getRandomNumber(30,180),
      aircraft,
      searchCount: {},
      priceResetTimers: []
    });
  }

  return flights;
}

// Import data into DB
async function importData() {
  try {
    await Flight.deleteMany();
    await User.deleteMany();
    await Booking.deleteMany();

    // Create users
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      walletBalance: 50000,
      isAdmin: true
    };
    const regularUser = {
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      walletBalance: 50000,
      isAdmin: false
    };
    await User.create([adminUser, regularUser]);

    // Generate and insert flights
    const flights = generateFlights();
    await Flight.insertMany(flights);

    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
}

// Destroy data
async function destroyData() {
  try {
    await Flight.deleteMany();
    await User.deleteMany();
    await Booking.deleteMany();
    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
}

// Command-line execution
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
