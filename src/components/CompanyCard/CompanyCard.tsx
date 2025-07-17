import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, Briefcase } from 'lucide-react';
import { Company } from '../../store';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <Link to={`/companies/${company.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover-lift border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={company.logo}
            alt={company.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
              {company.name}
            </h3>
            <p className="text-gray-600 text-sm">{company.industry}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {company.rating} ({company.reviews} reviews)
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {company.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{company.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{company.size} employees</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-primary">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-medium">View Open Positions</span>
            </div>
            <span className="text-xs text-gray-500">
              {company.jobs?.length || 0} jobs
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;