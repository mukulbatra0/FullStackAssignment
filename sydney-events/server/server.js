const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

// Import scrapers
const scrapeEventbriteSydney = require('./scrapers/eventbriteSydney');

// Import routes
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/events', eventRoutes);

// Manual scraper trigger route (for testing and development)
app.get('/api/scrape/eventbrite', async (req, res) => {
  try {
    console.log('Manually triggered Eventbrite scraper...');
    const events = await scrapeEventbriteSydney();
    res.status(200).json({ 
      success: true, 
      message: `Successfully scraped ${events.length} events from Eventbrite`, 
      count: events.length 
    });
  } catch (error) {
    console.error('Error triggering Eventbrite scraper:', error);
    res.status(500).json({ success: false, message: 'Error triggering scraper', error: error.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Schedule scrapers to run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled event scrapers...');
  try {
    await scrapeEventbriteSydney();
    console.log('Scheduled scraping completed');
  } catch (error) {
    console.error('Error in scheduled scraping:', error);
  }
});

// Run scrapers on startup
const runScrapers = async () => {
  try {
    console.log('Running initial scraping...');
    await scrapeEventbriteSydney();
    console.log('Initial scraping completed');
  } catch (error) {
    console.error('Error in initial scraping:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  runScrapers();
});

module.exports = app; 