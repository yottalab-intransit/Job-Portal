import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Star, ExternalLink, ArrowLeft, Globe, Briefcase } from 'lucide-react';
import { useJobStore } from '../store';
import JobCard from '../components/JobCard/JobCard';

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCompanyById } = useJobStore();
  
  const company = getCompanyById(id!);
  
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">The company you're looking for doesn't exist.</p>
          <Link
            to="/companies"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Browse Companies
          </Link>
        </div>
      </div>
    );
  }

  // Get jobs from this company
  const companyJobs = company.jobs || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/companies"
          className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Companies</span>
        </Link>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-indigo-700">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="relative px-8 py-6">
            <div className="flex items-start space-x-6 -mt-16 relative z-10">
              <img
                src={company.logo}
                alt={company.name}
                className="w-24 h-24 rounded-lg object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1 pt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{company.industry}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{company.size} employees</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{company.rating} ({company.reviews} reviews)</span>
                  </div>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-primary hover:text-primary-dark transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {company.name}</h2>
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{companyJobs.length} jobs available</span>
                </div>
              </div>
              
              {companyJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {companyJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions</h3>
                  <p className="text-gray-600">
                    This company doesn't have any open positions at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Founded</span>
                  <span className="font-medium">2010</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employees</span>
                  <span className="font-medium">{company.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{company.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{company.location}</span>
                </div>
                <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center">
                  <span className="text-gray-500">Map View</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Health Insurance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Flexible Work Hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Remote Work Options</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Professional Development</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Stock Options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;