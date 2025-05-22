import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventsList from '../components/EventsList';
import api from '../services/api';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || '';
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set('category', value);
    } else {
      newParams.delete('category');
    }
    
    setSearchParams(newParams);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search');
    
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    
    setSearchParams(newParams);
  };
  
  const clearFilters = () => {
    setSearchParams({});
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          {type === 'featured' ? 'Featured Events' : 'Sydney Events'}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              name="search"
              placeholder="Search events..."
              defaultValue={search}
              className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition duration-300"
            >
              Search
            </button>
          </form>
          
          {/* Category Filter */}
          <div className="flex items-center">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {!loading &&
                categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
          
          {/* Clear Filters */}
          {(category || search || type) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(category || search || type) && (
        <div className="mb-6">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-gray-600">Active filters:</span>
            {category && (
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                Category: {category}
              </span>
            )}
            {search && (
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                Search: {search}
              </span>
            )}
            {type === 'featured' && (
              <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                Featured Events
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Events List */}
      <EventsList category={category} search={search} type={type} />
    </div>
  );
};

export default EventsPage; 