import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Users } from 'lucide-react';
import { Job, useJobStore } from '../../store';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { saveJob, savedJobs } = useJobStore();
  const isSaved = savedJobs.includes(job.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveJob(job.id);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Link to={`/jobs/${job.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover-lift border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600">{job.company.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{job.applicants} applicants</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{timeAgo(job.postedDate)}</span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {job.jobType}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>★</span>
            <span>{job.company.rating}</span>
            <span>({job.company.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;