const axios = require('axios');
const cheerio = require('cheerio');
const Event = require('../models/Event');

const SOURCE = 'Eventbrite';
const BASE_URL = 'https://www.eventbrite.com.au';

async function scrapeEventbriteSydney() {
  try {
    console.log('Starting to scrape Eventbrite Sydney...');
    
    // Set custom headers to simulate a real browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/',
      'Cache-Control': 'no-cache'
    };
    
    // Try to fetch the events page
    const response = await axios.get(`${BASE_URL}/d/australia--sydney/events/`, { headers });
    const $ = cheerio.load(response.data);
    
    const events = [];
    let eventFound = false;

    // Try multiple potential selectors to find event cards
    const selectors = [
      // New potential selectors
      '.discover-search-results li', 
      '.discover-search-desktop-card',
      '.search-result-card',
      // Alternative data paths
      '[data-spec="search-card"]',
      '.eds-event-card',
      '.eds-card',
      // Very generic fallbacks
      '.event-card',
      'article'
    ];
    
    // Try each selector until we find some events
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      $(selector).each((i, element) => {
        try {
          // Look for title with multiple potential selectors
          let title = '';
          for (const titleSelector of ['.event-card__title', 'h2', 'h3', '.eds-event-card__title', '.eds-text-color--ui-800']) {
            title = $(element).find(titleSelector).text().trim();
            if (title) break;
          }

          // If we still don't have a title, try to get text from any heading element
          if (!title) {
            title = $(element).find('h1, h2, h3, h4, h5').first().text().trim();
          }
          
          // Find URL with multiple potential selectors
          let originalUrl = '';
          const link = $(element).find('a').first();
          if (link.length > 0) {
            const href = link.attr('href');
            originalUrl = href ? (href.startsWith('http') ? href : `${BASE_URL}${href}`) : '';
          }
          
          // Find image with multiple potential selectors
          let imageUrl = '';
          const img = $(element).find('img');
          if (img.length > 0) {
            imageUrl = img.attr('src') || img.attr('data-src') || '';
          }
          
          // Parse date with improved logic for Eventbrite-specific format
          let eventDate = new Date(); // Default to today
          let eventTime = '';
          
          // Enhanced date extraction for Eventbrite
          const dateSelectors = [
            '.event-card__date', 
            '.eds-text-color--ui-600', 
            '.date-info', 
            'time', 
            '[data-automation="event-date"]', 
            '[data-component="date"]',
            // Add more specific Eventbrite selectors
            '.eds-event-card-content__sub-title',
            '.eds-text-bs--fixed',
            // Date-related attribute selectors
            '[data-subcontent-key="date"]',
            '[aria-label*="date"]'
          ];
          
          for (const dateSelector of dateSelectors) {
            const dateElement = $(element).find(dateSelector);
            if (dateElement.length > 0) {
              const dateText = dateElement.text().trim();
              
              if (dateText && dateText.length > 5) {
                console.log(`Found date text: ${dateText}`);
                
                // Try specific Eventbrite date formats first
                // Format: "Day, Month DD" or "Day, DD Month"
                const eventbriteFormat = /(\w{3}),\s+(\w{3})\s+(\d{1,2})|(\w{3}),\s+(\d{1,2})\s+(\w{3})/i;
                const ebMatch = dateText.match(eventbriteFormat);
                
                if (ebMatch) {
                  // Either format 1: Day, Month DD
                  if (ebMatch[1] && ebMatch[2] && ebMatch[3]) {
                    const month = ebMatch[2];
                    const day = ebMatch[3];
                    const year = new Date().getFullYear(); // Current year
                    const dateStr = `${month} ${day}, ${year}`;
                    const parsedDate = new Date(dateStr);
                    
                    if (!isNaN(parsedDate.getTime())) {
                      eventDate = parsedDate;
                      console.log(`Parsed Eventbrite date: ${eventDate}`);
                      break;
                    }
                  } 
                  // Or format 2: Day, DD Month
                  else if (ebMatch[4] && ebMatch[5] && ebMatch[6]) {
                    const day = ebMatch[5];
                    const month = ebMatch[6];
                    const year = new Date().getFullYear(); // Current year
                    const dateStr = `${month} ${day}, ${year}`;
                    const parsedDate = new Date(dateStr);
                    
                    if (!isNaN(parsedDate.getTime())) {
                      eventDate = parsedDate;
                      console.log(`Parsed Eventbrite date: ${eventDate}`);
                      break;
                    }
                  }
                }
                
                // If Eventbrite specific format didn't work, try generic formats
                const parsedDate = new Date(dateText);
                if (!isNaN(parsedDate.getTime())) {
                  eventDate = parsedDate;
                  break;
                }
                
                // Handle other date formats (Eventbrite has many)
                // Try to match common formats:
                // - Day, Month Date, Year
                // - Month Date, Year
                // - Date Month Year
                const dateMatch = dateText.match(/(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i);
                if (dateMatch) {
                  // Format as expected by Date constructor
                  const formattedDate = `${dateMatch[2]} ${dateMatch[1]}, ${dateMatch[3]}`;
                  const newDate = new Date(formattedDate);
                  if (!isNaN(newDate.getTime())) {
                    eventDate = newDate;
                    break;
                  }
                }
                
                // Try another common format: Month Date
                const monthDateMatch = dateText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?/i);
                if (monthDateMatch) {
                  // Add current year if year not provided
                  const year = monthDateMatch[3] ? monthDateMatch[3] : new Date().getFullYear();
                  const formattedDate = `${monthDateMatch[1]} ${monthDateMatch[2]}, ${year}`;
                  const newDate = new Date(formattedDate);
                  if (!isNaN(newDate.getTime())) {
                    eventDate = newDate;
                    break;
                  }
                }
                
                // Extract time if present in the date text
                const timeMatch = dateText.match(/(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i);
                if (timeMatch) {
                  eventTime = timeMatch[0];
                }
              }
            }
          }
          
          // Extract location with improved selectors
          let locationText = '';
          for (const locationSelector of ['.event-card__location', '.location-info', '.eds-text-color--ui-600', '[data-component="venue"]', '.address', '.card-text--truncated__content']) {
            locationText = $(element).find(locationSelector).text().trim();
            if (locationText) break;
          }
          
          // Extract price with better selectors and pattern matching
          let priceText = '';
          
          // Improved price selectors specific to Eventbrite
          const priceSelectors = [
            '.event-card__price', 
            '.price-info', 
            '.eds-text-bl', 
            '[data-component="price"]', 
            '.price',
            '.eds-text-color--grey-600',
            // More specific Eventbrite price selectors
            '.eds-text-bs',
            '.eds-event-card-content__sub-title',
            // Price-related attribute selectors
            '[data-subcontent-key="price"]'
          ];
          
          for (const priceSelector of priceSelectors) {
            const foundPrice = $(element).find(priceSelector).text().trim();
            if (foundPrice) {
              // Try to extract the price value using regex patterns
              // Eventbrite typically shows price as "$XX" or "Starts at $XX"
              const priceMatch = foundPrice.match(/\$\s*\d+(\.\d{2})?|\bfree\b|\bcomplimentary\b|\bstarts at\s+\$\d+(\.\d{2})?/i);
              if (priceMatch) {
                priceText = priceMatch[0];
                console.log(`Found price: ${priceText}`);
              } else {
                // If no clear price pattern, just use whatever text we found
                priceText = foundPrice;
              }
              break;
            }
          }
          
          // If we still don't have a price, try a more aggressive approach by scraping the entire card
          if (!priceText) {
            const cardText = $(element).text();
            const priceMatch = cardText.match(/\$\s*\d+(\.\d{2})?|\bfree\b|\bcomplimentary\b|\bstarts at\s+\$\d+(\.\d{2})?/i);
            if (priceMatch) {
              priceText = priceMatch[0];
              console.log(`Found price in card text: ${priceText}`);
            }
          }
          
          // Default to "Free" if no price found
          if (!priceText) {
            priceText = 'Free';
          }
          
          // Extract category
          let category = '';
          for (const categorySelector of ['.event-card__tag', '.category-info', '.eds-text-bs', '[data-component="category"]']) {
            category = $(element).find(categorySelector).text().trim();
            if (category) break;
          }
          
          if (title && originalUrl) {
            events.push({
              title,
              date: eventDate,
              time: eventTime,
              location: locationText,
              imageUrl,
              originalUrl,
              price: priceText,
              category: category || 'Event',
              source: SOURCE
            });
            eventFound = true;
          }
        } catch (err) {
          console.error(`Error processing Eventbrite event: ${err.message}`);
        }
      });
      
      // If we found events with this selector, stop trying others
      if (eventFound) {
        console.log(`Found events using selector: ${selector}`);
        break;
      }
    }
    
    // If no events found, try the fallback approach
    if (events.length === 0) {
      // Fallback approach implementation remains the same
      console.log('No events found with standard selectors, trying fallback approach...');
      
      // Look for any links that might be events
      $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('/e/')) {
          // This is likely an event link
          try {
            const title = $(element).text().trim() || 'Eventbrite Event';
            const originalUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
            
            // Find an image near this link if possible
            const nearbyImage = $(element).find('img').attr('src') || $(element).parent().find('img').attr('src') || '';
            
            // Try to extract date from surrounding content
            let eventDate = new Date();
            let eventTime = '';
            let price = 'Free';
            
            const parentElement = $(element).parent().parent();
            const contextText = parentElement.text();
            
            // Look for date patterns
            const datePatterns = [
              // Date followed by time
              /(\d{1,2})[\/\s\-\.]{1}(\d{1,2})[\/\s\-\.]{1}(\d{4}|\d{2})(?:\s+at\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?)?/i,
              // Month name format
              /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?/i,
              // General date pattern
              /(\d{1,2})[\/\s\-\.]{1,2}(\d{1,2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\/\s\-\.]{1,2}(\d{4}|\d{2})/i
            ];
            
            for (const pattern of datePatterns) {
              const match = contextText.match(pattern);
              if (match) {
                // Try to parse the date
                const possibleDate = new Date(match[0]);
                if (!isNaN(possibleDate.getTime())) {
                  eventDate = possibleDate;
                  break;
                }
              }
            }
            
            // Look for time pattern
            const timeMatch = contextText.match(/(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i);
            if (timeMatch) {
              eventTime = timeMatch[0];
            }
            
            // Look for price
            const priceMatch = contextText.match(/\$\s*\d+(\.\d{2})?|\bfree\b|\bcomplimentary\b|\bstarts at\s+\$\d+(\.\d{2})?/i);
            if (priceMatch) {
              price = priceMatch[0];
            }
            
            events.push({
              title,
              date: eventDate,
              time: eventTime,
              imageUrl: nearbyImage,
              originalUrl,
              price,
              source: SOURCE
            });
          } catch (err) {
            console.error(`Error processing fallback Eventbrite event: ${err.message}`);
          }
        }
      });
    }

    console.log(`Found ${events.length} events from Eventbrite Sydney`);
    
    // Save events to database
    for (const event of events) {
      try {
        await Event.findOneAndUpdate(
          { originalUrl: event.originalUrl },
          event,
          { upsert: true, new: true }
        );
      } catch (err) {
        // Skip duplicate errors
        if (err.code !== 11000) {
          console.error(`Error saving event: ${err.message}`);
        }
      }
    }

    return events;
  } catch (error) {
    console.error(`Error scraping Eventbrite Sydney: ${error.message}`);
    console.error(`Error details: ${error.stack}`);
    return [];
  }
}

module.exports = scrapeEventbriteSydney; 