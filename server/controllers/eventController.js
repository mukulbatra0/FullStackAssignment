const Event = require('../models/Event');
const User = require('../models/User');

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, type } = req.query;
    
    // Build query
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle type parameter (for featured events)
    if (type === 'featured') {
      query.featured = true;
    }
    
    // Temporarily comment out date filtering to show all events including past ones
    // Only show upcoming events (today and future)
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // query.date = { $gte: today };
    
    // Execute query with pagination
    const events = await Event.find(query)
      .sort({ date: 1 }) // Sort by date ascending (soonest first)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Process events to ensure dates and prices are properly formatted
    const processedEvents = events.map(event => {
      const eventObj = event.toObject();
      
      // Ensure date is a valid date object
      if (eventObj.date) {
        const date = new Date(eventObj.date);
        if (!isNaN(date.getTime())) {
          eventObj.date = date.toISOString();
        } else {
          // If date is invalid, set to current date
          eventObj.date = new Date().toISOString();
        }
      }
      
      // Ensure price is properly formatted
      if (eventObj.price) {
        // If price doesn't already have a dollar sign and is not "Free" or similar
        if (!eventObj.price.includes('$') && 
            !eventObj.price.toLowerCase().includes('free') && 
            !eventObj.price.toLowerCase().includes('complimentary')) {
          // Check if it's a number
          if (/^\d+(\.\d{1,2})?$/.test(eventObj.price)) {
            eventObj.price = `$${eventObj.price}`;
          }
        }
      } else {
        eventObj.price = 'Free';
      }
      
      return eventObj;
    });
    
    // Get total count
    const count = await Event.countDocuments(query);
    
    res.status(200).json({
      events: processedEvents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalEvents: count
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Process event to ensure date and price are properly formatted
    const eventObj = event.toObject();
    
    // Ensure date is a valid date object
    if (eventObj.date) {
      const date = new Date(eventObj.date);
      if (!isNaN(date.getTime())) {
        eventObj.date = date.toISOString();
      } else {
        // If date is invalid, set to current date
        eventObj.date = new Date().toISOString();
      }
    }
    
    // Ensure price is properly formatted
    if (eventObj.price) {
      // If price doesn't already have a dollar sign and is not "Free" or similar
      if (!eventObj.price.includes('$') && 
          !eventObj.price.toLowerCase().includes('free') && 
          !eventObj.price.toLowerCase().includes('complimentary')) {
        // Check if it's a number
        if (/^\d+(\.\d{1,2})?$/.test(eventObj.price)) {
          eventObj.price = `$${eventObj.price}`;
        }
      }
    } else {
      eventObj.price = 'Free';
    }
    
    res.status(200).json(eventObj);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.status(200).json(categories.filter(cat => cat)); // Filter out null/undefined
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register user email and redirect
exports.registerEmailAndRedirect = async (req, res) => {
  try {
    const { email, optIn, eventId } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find the event to get the redirect URL
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Save user email if opted in
    if (optIn) {
      await User.findOneAndUpdate(
        { email },
        { email, optIn },
        { upsert: true, new: true }
      );
    }
    
    // Return the redirect URL
    res.status(200).json({ redirectUrl: event.originalUrl });
  } catch (error) {
    console.error('Error processing email registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 