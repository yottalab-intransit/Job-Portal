import React from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Users, Briefcase, ArrowRight, Star } from 'lucide-react';
import { useJobStore } from '../store';
import JobCard from '../components/JobCard/JobCard';

const Home: React.FC = () => {
  const { jobs, companies } = useJobStore();
  const featuredJobs = jobs.slice(0, 3);

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '50,000+' },
    { icon: Users, label: 'Companies', value: '10,000+' },
    { icon: TrendingUp, label: 'Success Stories', value: '1M+' },
    { icon: Star, label: 'Average Rating', value: '4.8' },
  ];

  const categories = [
    { name: 'Software Development', jobs: '15,230', color: 'bg-purple-100 text-purple-800' },
    { name: 'Data Science', jobs: '8,450', color: 'bg-green-100 text-green-800' },
    { name: 'Design', jobs: '5,670', color: 'bg-blue-100 text-blue-800' },
    { name: 'Marketing', jobs: '4,320', color: 'bg-orange-100 text-orange-800' },
    { name: 'Sales', jobs: '6,890', color: 'bg-red-100 text-red-800' },
    { name: 'Machine Learning', jobs: '3,210', color: 'bg-indigo-100 text-indigo-800' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Find Your Dream Job
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Discover thousands of job opportunities from top companies. Your next career move starts here.
            </p>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Job title, keywords..."
                      className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Link
                    to="/jobs"
                    className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold text-center hover-lift"
                  >
                    Search Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <Link
              to="/jobs"
              className="flex items-center space-x-2 text-primary hover:text-primary-dark font-medium"
            >
              <span>View All Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Job Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore jobs across different industries and find the perfect match for your skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 hover-lift"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">{category.jobs} open positions</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                    Popular
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Top Companies</h2>
            <Link
              to="/companies"
              className="flex items-center space-x-2 text-primary hover:text-primary-dark font-medium"
            >
              <span>View All Companies</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {companies.slice(0, 6).map((company) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 hover-lift text-center"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 rounded-lg mx-auto mb-3 object-cover"
                />
                <h3 className="text-sm font-medium text-gray-900 mb-1">{company.name}</h3>
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span>{company.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold hover-lift"
            >
              Create Account
            </Link>
            <Link
              to="/jobs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;