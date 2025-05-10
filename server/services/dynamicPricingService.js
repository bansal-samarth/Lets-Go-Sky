const FlightAttempt = require('../models/FlightAttempt');
const cron = require('node-cron');

const FIVE_MINUTES = 5 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

const dynamicPricingService = {
    recordAttempt: async (flightId) => {
        let flightAttempt = await FlightAttempt.findOne({ flightId });
        if (!flightAttempt) {
            flightAttempt = new FlightAttempt({ flightId, attempts: [] });
        }

        // Remove attempts older than 5 minutes
        const now = Date.now();
        flightAttempt.attempts = flightAttempt.attempts.filter(
            attempt => (now - new Date(attempt.timestamp).getTime()) < FIVE_MINUTES
        );

        // Add current attempt
        flightAttempt.attempts.push({ timestamp: new Date() });

        // Check for price increase condition
        if (flightAttempt.attempts.length >= 3 && flightAttempt.currentPriceMultiplier === 1) {
            flightAttempt.currentPriceMultiplier = 1.10;
            flightAttempt.lastPriceIncreaseTime = new Date();
            console.log(`Price increased for flight ${flightId} to 110%`);
        }

        await flightAttempt.save();
        return flightAttempt;
    },

    getCurrentPriceMultiplier: async (flightId) => {
        const flightAttempt = await FlightAttempt.findOne({ flightId });
        if (!flightAttempt) {
            return 1; // No attempts, base price
        }
        return flightAttempt.currentPriceMultiplier;
    },

    // Scheduled job to reset prices
    schedulePriceResets: () => {
        // Run every minute to check for prices to reset
        cron.schedule('* * * * *', async () => {
            console.log('Running price reset check...');
            const now = Date.now();
            const attemptsToReset = await FlightAttempt.find({
                currentPriceMultiplier: { $gt: 1 },
                lastPriceIncreaseTime: { $lte: new Date(now - TEN_MINUTES) }
            });

            for (const attempt of attemptsToReset) {
                attempt.currentPriceMultiplier = 1;
                attempt.lastPriceIncreaseTime = null; // Clear this
                attempt.attempts = []; // Clear attempts as price is reset
                await attempt.save();
                console.log(`Price reset for flight ${attempt.flightId}`);
            }
        });
    }
};

module.exports = dynamicPricingService;