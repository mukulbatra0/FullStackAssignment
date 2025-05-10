import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [emailError, setEmailError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await api.getEventById(id);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details. Please try again later.');
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(null);
  };
  
  const handleGetTickets = async (e) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (!id) return;
    
    try {
      setSubmitting(true);
      const response = await api.registerEmailAndRedirect({
        email,
        optIn,
        eventId: id
      });
      
      // Redirect to the original event website
      window.location.href = response.redirectUrl;
    } catch (err) {
      console.error('Error submitting email:', err);
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format price - ensure we show the actual price, not just "Free"
  const displayPrice = (event) => {
    if (!event) return 'Free';
    return event.price === undefined || event.price === null ? 'Free' : event.price;
  };

  // Fallback placeholder image
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3ENo Image Available%3C/text%3E%3C/svg%3E";

  // Fix image URL if needed (handle relative URLs)
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
        if (event?.source === 'WhatsOnSydney' || url.includes('whatson')) {
          return `https://whatson.cityofsydney.nsw.gov.au${url}`;
        } else {
          return `https://www.sydney.com${url}`;
        }
      }
    }
    
    // Return the URL as is if it's already absolute
    return url;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || 'Event not found'}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Events
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            {event.imageUrl ? (
              <img 
                src={fixImageUrl(event.imageUrl)} 
                alt={event.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {event.source}
              </span>
              {event.category && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-2">
                  {event.category}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            
            <div className="text-gray-600 mb-6 space-y-2">
              <div className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.date)}</span>
                {event.time && <span className="ml-1">• {event.time}</span>}
              </div>
              
              {event.location && (
                <div className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              )}
              
              <div className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{displayPrice(event)}</span>
              </div>
            </div>
            
            {event.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{event.description}</p>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Get Tickets</h2>
              <form onSubmit={handleGetTickets}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="opt-in"
                        name="opt-in"
                        type="checkbox"
                        checked={optIn}
                        onChange={(e) => setOptIn(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="opt-in" className="font-medium text-gray-700">
                        Subscribe to updates
                      </label>
                      <p className="text-gray-500">
                        I would like to receive updates about events in Sydney
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Get Tickets'
                    )}
                  </button>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    You will be redirected to the event's website after submission
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 