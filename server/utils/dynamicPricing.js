// utils/dynamicPricing.js
/**
 * Handles dynamic pricing logic for flights
 * Price increases by 10% after 3 searches within 5 minutes
 * Resets to original price after 10 minutes
 */
const Flight = require('../models/Flight');

exports.updateFlightPrice = async (flightId, userId) => {
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) return null;

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    // Process any pending price resets first
    const resetsToProcess = flight.priceResetTimers.filter(timer => timer.resetTime <= now);
    if (resetsToProcess.length > 0) {
      flight.currentPrice = flight.basePrice;
      flight.priceResetTimers = flight.priceResetTimers.filter(timer => timer.resetTime > now);
    }
    
    // Get user search history for this flight
    const userKey = userId.toString();
    let searchData = flight.searchCount.get(userKey) || { count: 0, lastSearchTime: null };
    
    // Reset count if last search was more than 5 minutes ago
    if (searchData.lastSearchTime && new Date(searchData.lastSearchTime) < fiveMinutesAgo) {
      searchData.count = 0;
    }
    
    // Update search count and time
    searchData.count += 1;
    searchData.lastSearchTime = now;
    flight.searchCount.set(userKey, searchData);
    
    // Check if price increase needed (3+ searches within 5 min)
    if (searchData.count >= 3 && flight.currentPrice === flight.basePrice) {
      flight.currentPrice = Math.round(flight.basePrice * 1.1);
      
      // Schedule price reset after 10 minutes
      flight.priceResetTimers.push({
        resetTime: new Date(now.getTime() + 10 * 60 * 1000),
        originalPrice: flight.basePrice
      });
    }
    
    await flight.save();
    return flight;
  } catch (error) {
    console.error('Error updating flight price:', error);
    return null;
  }
};