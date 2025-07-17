import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobStore } from '../store';
import SearchFilters from '../components/SearchFilters/SearchFilters';
import JobCard from '../components/JobCard/JobCard';
import { Filter, Grid, List } from 'lucide-react';

const Jobs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { searchJobs } = useJobStore();
  const [jobs, setJobs] = useState([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  const initialQuery = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  useEffect(() => {
    const filters = initialCategory ? { category: initialCategory } : {};
    const results = searchJobs(initialQuery, filters);
    setJobs(results);
  }, [initialQuery, initialCategory, searchJobs]);

  const handleSearch = (query: string, filters: any) => {
    const results = searchJobs(query, filters);
    
    // Sort results
    const sortedResults = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'salary':
          // Extract numeric value from salary string for comparison
          const getSalaryValue = (salary: string) => {
            const match = salary.match(/₹(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          return getSalaryValue(b.salary) - getSalaryValue(a.salary);
        case 'applicants':
          return a.applicants - b.applicants;
        default:
          return 0;
      }
    });
    
    setJobs(sortedResults);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // Re-apply current search with new sorting
    const filters = initialCategory ? { category: initialCategory } : {};
    handleSearch(initialQuery, filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Jobs</h1>
          <p className="text-gray-600">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            {initialQuery && ` for "${initialQuery}"`}
            {initialCategory && ` in ${initialCategory}`}
          </p>
        </div>

        <SearchFilters onSearch={handleSearch} initialQuery={initialQuery} />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
              <option value="applicants">Fewest Applicants</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {jobs.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or explore different job categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;