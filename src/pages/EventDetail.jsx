import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmailVerification from '../components/EmailVerification';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showVerification, setShowVerification] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Check if user is already verified
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.isVerified) {
          setVerifiedUser(parsedUser);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);
  
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
  
  const handleVerificationComplete = (user) => {
    setVerifiedUser(user);
    setShowVerification(false);
  };
  
  const handleGetTickets = async () => {
    if (!verifiedUser || !verifiedUser.email || !id) {
      setShowVerification(true);
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.registerEmailAndRedirect({
        email: verifiedUser.email,
        optIn: true,
        eventId: id
      });
      
      // Redirect to the original event website
      window.location.href = response.redirectUrl;
    } catch (err) {
      console.error('Error submitting verified email:', err);
      setError('Something went wrong. Please try again.');
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Go Back
        </button>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">Event not found.</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Events
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Image */}
        <div className="w-full h-[300px] md:h-[400px] overflow-hidden">
          <img 
            src={event.imageUrl || fallbackImage} 
            alt={event.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
        </div>
        
        <div className="p-6">
          {/* Event Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <p className="text-sm text-gray-500">
              Source: {event.source}
            </p>
          </div>
          
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Date & Time</h3>
              <p className="text-gray-600">
                {formatDate(event.date)}
              </p>
              {event.time && (
                <p className="text-gray-600 mt-1">{event.time}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Location</h3>
              <p className="text-gray-600">
                {event.location || 'Location not specified'}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Price</h3>
              <p className="text-gray-600">{displayPrice(event)}</p>
            </div>
          </div>
          
          {/* Event Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Event</h2>
            <div className="prose prose-blue max-w-none text-gray-700">
              {event.description ? (
                <p>{event.description}</p>
              ) : (
                <p>No description available for this event.</p>
              )}
            </div>
          </div>
          
          {/* Event Category Tag */}
          {event.category && (
            <div className="mb-8">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </span>
            </div>
          )}
          
          {/* Get Tickets Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Get Tickets</h2>
            
            {showVerification ? (
              <EmailVerification onVerificationComplete={handleVerificationComplete} />
            ) : (
              <div>
                {verifiedUser ? (
                  <div className="mb-4">
                    <p className="text-green-600 mb-4">
                      Your email ({verifiedUser.email}) has been verified.
                    </p>
                    <button
                      onClick={handleGetTickets}
                      className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      disabled={submitting}
                    >
                      {submitting ? 'Processing...' : 'Get Tickets'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVerification(true)}
                    className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Verify Email to Continue
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 