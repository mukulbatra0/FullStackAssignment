import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  // Track image loading state
  const [imageError, setImageError] = useState(false);
  
  // Enhanced date formatting with better fallbacks
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date found: ${dateString}`);
        return 'Date TBA';
      }
      
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error(`Error formatting date: ${error}`);
      return 'Date TBA';
    }
  };

  // Format price to display real price information
  const formatPrice = (price) => {
    if (!price) return 'Free';
    
    // If it already has a dollar sign, it's likely a real price
    if (price.includes('$')) {
      return price;
    }
    
    // Check for common price terms
    const lowerPrice = price.toLowerCase();
    if (lowerPrice.includes('free') || lowerPrice.includes('complimentary')) {
      return 'Free';
    }
    
    // If it's just a number, add dollar sign
    if (/^\d+(\.\d{1,2})?$/.test(price)) {
      return `$${price}`;
    }
    
    return price;
  };

  // Use a local asset or inline SVG as fallback instead of external placeholder services
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EImage Not Available%3C/text%3E%3C/svg%3E";
  
  // Fix imageUrl if it's relative
  const fixImageUrl = (url) => {
    if (!url) return fallbackImage;
    
    // Check if the URL is a placeholder from the scraper
    if (url.includes('placehold.co')) {
      // Use our SVG fallback instead of external placeholder service
      return fallbackImage;
    }
    
    // If URL is relative (starts with '/'), make it absolute
    if (url.startsWith('/')) {
      // Check if URL is already absolute
      if (!/^https?:\/\//i.test(url)) {
        // Determine the correct base URL based on source or URL pattern
        if (event.source === 'WhatsOnSydney' || url.includes('whatson')) {
          return `https://whatson.cityofsydney.nsw.gov.au${url}`;
        } else {
          return `https://www.sydney.com${url}`;
        }
      }
    }
    
    // Return the URL as is if it's already absolute
    return url;
  };
  
  // Use event image if available and not in error state, otherwise use fallback
  const imageSource = !imageError && event.imageUrl ? fixImageUrl(event.imageUrl) : fallbackImage;

  // Format price - ensure we show the actual price from Eventbrite
  const displayPrice = formatPrice(event.price);

  return (
    <div className="card group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-100">
        <img
          className="absolute h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={imageSource}
          alt={event.title}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {event.category && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {event.category}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
          {event.source}
        </span>
      </div>
      
      <div className="flex-grow p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-2 line-clamp-2 text-gray-800 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h2>
        
        <div className="text-gray-600 mb-5 space-y-2">
          <div className="flex items-start text-sm">
            <svg className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <span className="font-medium">{formatDate(event.date)}</span>
              {event.time && <span className="block text-gray-500">{event.time}</span>}
            </div>
          </div>
          
          {event.location && (
            <div className="flex items-start text-sm">
              <svg className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          
          <div className="flex items-start text-sm">
            <svg className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{displayPrice}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <Link
            to={`/event/${event._id}`}
            className="btn btn-primary w-full"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 