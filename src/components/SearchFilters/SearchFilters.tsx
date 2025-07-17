import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string, filters: any) => void;
  initialQuery?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, {
      location,
      experience,
      category,
      jobType
    });
  };

  const clearFilters = () => {
    setLocation('');
    setExperience('');
    setCategory('');
    setJobType('');
    onSearch(query, {});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Job title, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Experience Level</option>
          <option value="0-1">0-1 years</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium hover-lift"
        >
          Search Jobs
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </span>
        </button>

        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Software Development">Software Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;