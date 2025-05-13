// controllers/flightController.js
const Flight = require('../models/Flight');

// Dynamic pricing logic
const updateDynamicPrice = async (flight, userId) => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  
  // Get user search history for this flight
  const userKey = userId.toString();
  let searchData = flight.searchCount.get(userKey) || { count: 0, lastSearchTime: null };
  
  // Reset count if last search was more than 5 minutes ago
  if (searchData.lastSearchTime && searchData.lastSearchTime < fiveMinutesAgo) {
    searchData.count = 0;
  }
  
  // Update search count and time
  searchData.count += 1;
  searchData.lastSearchTime = now;
  flight.searchCount.set(userKey, searchData);
  
  // Check if price increase needed (3+ searches within 5 min)
  if (searchData.count >= 3) {
    // Increase price by 10% if not already increased
    if (flight.currentPrice === flight.basePrice) {
      flight.currentPrice = Math.round(flight.basePrice * 1.1);
      
      // Schedule price reset after 10 minutes
      flight.priceResetTimers.push({
        resetTime: new Date(now.getTime() + 10 * 60 * 1000),
        originalPrice: flight.basePrice
      });
    }
  }
  
  // Check for price resets
  const resetsToProcess = flight.priceResetTimers.filter(timer => timer.resetTime <= now);
  if (resetsToProcess.length > 0) {
    flight.currentPrice = flight.basePrice;
    flight.priceResetTimers = flight.priceResetTimers.filter(timer => timer.resetTime > now);
  }
  
  await flight.save();
  return flight;
};

// Controller methods
exports.searchFlights = async (req, res) => {
  try {
    const { from, to, date, userId } = req.body;
    
    // Convert date string to Date object for comparison
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 7);
    
    let query = {
      departureAirportCode: from,
      arrivalAirportCode: to,
      departureTime: {
        $gte: searchDate,
        $lt: nextDay
      }
    };
    
    // Find all matching flights
    let flights = await Flight.find(query).sort('departureTime').limit(10);
    
    // Apply dynamic pricing for each flight if userId is provided
    if (userId) {
      const updatedFlights = [];
      for (let flight of flights) {
        const updatedFlight = await updateDynamicPrice(flight, userId);
        updatedFlights.push(updatedFlight);
      }
      flights = updatedFlights;
    }
    
    res.json(flights);
  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({});
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    let flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Apply dynamic pricing if userId is provided
    if (userId) {
      flight = await updateDynamicPrice(flight, userId);
    }
    
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    const flightData = req.body;
    
    // Set the current price equal to base price initially
    flightData.currentPrice = flightData.basePrice;
    
    const flight = new Flight(flightData);
    const savedFlight = await flight.save();
    
    res.status(201).json(savedFlight);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};