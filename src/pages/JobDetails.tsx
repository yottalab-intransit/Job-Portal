import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Calendar, Bookmark, BookmarkCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { useJobStore } from '../store';
import { useAuthStore } from '../store';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getJobById, saveJob, savedJobs, applyForJob, appliedJobs } = useJobStore();
  const { user } = useAuthStore();
  
  const job = getJobById(id!);
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link
            to="/jobs"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedJobs.includes(job.id);
  const hasApplied = appliedJobs.includes(job.id);

  const handleSave = () => {
    saveJob(job.id);
  };

  const handleApply = () => {
    if (user) {
      applyForJob(job.id);
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs</span>
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <Link
                    to={`/companies/${job.company.id}`}
                    className="text-lg text-primary hover:text-primary-dark transition-colors"
                  >
                    {job.company.name}
                  </Link>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600">
                      {job.company.rating} ({job.company.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSave}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    isSaved
                      ? 'border-primary text-primary bg-purple-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  <span>{isSaved ? 'Saved' : 'Save Job'}</span>
                </button>
                
                {user && user.type === 'jobseeker' && (
                  <button
                    onClick={handleApply}
                    disabled={hasApplied}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      hasApplied
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark hover-lift'
                    }`}
                  >
                    {hasApplied ? 'Applied' : 'Apply Now'}
                  </button>
                )}
                
                {!user && (
                  <Link
                    to="/login"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium hover-lift"
                  >
                    Sign In to Apply
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{job.experience}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{job.applicants} applicants</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Posted {timeAgo(job.postedDate)}</span>
              </div>
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {job.jobType}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose max-w-none text-gray-700">
                    <p>{job.description}</p>
                  </div>
                </section>

                {/* Requirements */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Skills */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Industry</span>
                      <p className="font-medium">{job.company.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Company Size</span>
                      <p className="font-medium">1000-5000 employees</p>
                    </div>
                    <Link
                      to={`/companies/${job.company.id}`}
                      className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
                    >
                      <span>View Company Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Job Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Job Type</span>
                      <p className="font-medium">{job.jobType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Category</span>
                      <p className="font-medium">{job.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Application Deadline</span>
                      <p className="font-medium">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Similar Jobs */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-3">
                    <Link
                      to="/jobs/2"
                      className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">Full Stack Developer</h4>
                      <p className="text-sm text-gray-600">InnovateLab • Bangalore</p>
                    </Link>
                    <Link
                      to="/jobs/5"
                      className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">Backend Developer</h4>
                      <p className="text-sm text-gray-600">InnovateLab • Bangalore</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;