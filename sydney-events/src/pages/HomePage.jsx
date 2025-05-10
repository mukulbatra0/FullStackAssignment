import React from 'react';
import { Link } from 'react-router-dom';
import EventsList from '../components/EventsList';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Sydney's
              <span className="block text-accent-200">Best Events</span>
            </h1>
            <p className="text-xl mb-8 text-gray-100 leading-relaxed max-w-2xl">
              Find and explore the latest events happening in the vibrant city of Sydney, Australia.
              From concerts to exhibitions, food festivals to workshops, we've got you covered!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/events"
                className="btn btn-accent inline-flex items-center"
              >
                <span>Explore All Events</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
              <Link
                to="/events?type=featured"
                className="btn btn-outline bg-white/10 text-white border-white/25 hover:bg-white/20"
              >
                Featured Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <Link 
              to="/events" 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View all events
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <EventsList limit={4} />
        </div>
      </div>

      {/* About Sydney Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 shadow-card">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">About Sydney, Australia</h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Sydney is Australia's largest city, known for its iconic Opera House, beautiful harbour, and vibrant cultural scene.
                  The city hosts hundreds of events throughout the year, from world-class performances to local community gatherings.
                </p>
                <p>
                  Our mission is to bring you the most comprehensive and up-to-date listing of events happening in Sydney.
                  Whether you're a local looking for weekend activities or a visitor planning your trip, we've got everything
                  you need to experience the best of what Sydney has to offer.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <Link 
                  to="/events" 
                  className="btn btn-primary"
                >
                  Find Events Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage; 