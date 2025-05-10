import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import api from '../services/api';

const EventsList = ({ category, search, limit, type }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        // Explicitly use default values for undefined dependencies
        const limitValue = limit || 12;
        const categoryValue = category || '';
        const searchValue = search || '';
        const typeValue = type || '';
        
        const data = await api.getEvents(
          currentPage, 
          limitValue, 
          categoryValue || undefined, 
          searchValue || undefined,
          typeValue || undefined
        );
        console.log('API Response:', data); // Log the full response
        setEventsData(data);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  // Ensuring dependencies don't have undefined or trailing commas
  }, [currentPage, category || '', search || '', limit || 12, type || '']);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to count events by source
  const getEventCounts = () => {
    if (!eventsData?.events) return {};
    
    const counts = {};
    eventsData.events.forEach(event => {
      counts[event.source] = (counts[event.source] || 0) + 1;
    });
    
    return counts;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!eventsData || eventsData.events.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
        <p>
          No events found
          {category ? ` in category "${category}"` : ''}
          {search ? ` matching "${search}"` : ''}
          {type === 'featured' ? ' in featured events' : ''}.
        </p>
      </div>
    );
  }

  const eventCounts = getEventCounts();

  return (
    <div>
      {/* Debug button - only visible for development */}
      <div className="mb-4">
        <button 
          className="text-xs bg-gray-200 px-2 py-1 rounded" 
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
        
        {showDebug && (
          <div className="mt-2 p-4 bg-gray-100 rounded text-sm">
            <h4 className="font-bold">Debug Information</h4>
            <p>Total Events: {eventsData.totalEvents}</p>
            <p>Current Page: {eventsData.currentPage} of {eventsData.totalPages}</p>
            <p>Events on this page: {eventsData.events.length}</p>
            <h5 className="font-bold mt-2">Events by Source:</h5>
            <ul>
              {Object.entries(eventCounts).map(([source, count]) => (
                <li key={source}>{source}: {count}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {eventsData.events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {/* Pagination */}
      {eventsData.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {[...Array(eventsData.totalPages)].map((_, index) => {
              const page = index + 1;
              // Show only nearby pages for better UX when there are many pages
              if (
                page === 1 ||
                page === eventsData.totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span
                    key={page}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === eventsData.totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === eventsData.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default EventsList; 