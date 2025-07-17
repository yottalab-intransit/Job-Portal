import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Mail, Edit, Briefcase, BookmarkCheck, Clock, TrendingUp, Users, Star } from 'lucide-react';
import { useAuthStore } from '../store';
import { useJobStore } from '../store';
import JobCard from '../components/JobCard/JobCard';

const Dashboard: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { jobs, savedJobs, appliedJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    experience: user?.profile?.experience || '',
    skills: user?.profile?.skills?.join(', ') || '',
    company: user?.profile?.company || ''
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your dashboard</h2>
          <Link
            to="/login"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const userSavedJobs = jobs.filter(job => savedJobs.includes(job.id));
  const userAppliedJobs = jobs.filter(job => appliedJobs.includes(job.id));

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      phone: profileData.phone,
      location: profileData.location,
      experience: profileData.experience,
      skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s),
      company: profileData.company
    });
    setIsEditingProfile(false);
  };

  const stats = user.type === 'jobseeker' 
    ? [
        { icon: BookmarkCheck, label: 'Saved Jobs', value: savedJobs.length, color: 'text-primary' },
        { icon: Clock, label: 'Applied Jobs', value: appliedJobs.length, color: 'text-green-600' },
        { icon: TrendingUp, label: 'Profile Views', value: '24', color: 'text-purple-600' },
        { icon: Star, label: 'Profile Rating', value: '4.8', color: 'text-yellow-600' },
      ]
    : [
        { icon: Briefcase, label: 'Posted Jobs', value: '3', color: 'text-primary' },
        { icon: Users, label: 'Applications', value: '87', color: 'text-green-600' },
        { icon: TrendingUp, label: 'Views', value: '156', color: 'text-purple-600' },
        { icon: Star, label: 'Company Rating', value: '4.5', color: 'text-yellow-600' },
      ];

  const tabs = user.type === 'jobseeker'
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'applied', label: 'Applied Jobs' },
        { id: 'saved', label: 'Saved Jobs' },
        { id: 'profile', label: 'Profile' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'jobs', label: 'Posted Jobs' },
        { id: 'applications', label: 'Applications' },
        { id: 'profile', label: 'Company Profile' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">
                  {user.type === 'jobseeker' ? 'Job Seeker' : 'Employer'}
                  {user.profile?.company && ` at ${user.profile.company}`}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  {user.profile?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {user.type === 'employer' && (
              <Link
                to="/post-job"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium hover-lift"
              >
                Post New Job
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
                
                {user.type === 'jobseeker' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-3">Recent Applications</h3>
                      {userAppliedJobs.length > 0 ? (
                        <div className="space-y-3">
                          {userAppliedJobs.slice(0, 3).map((job) => (
                            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900">{job.title}</h4>
                              <p className="text-sm text-gray-600">{job.company.name}</p>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Applied
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No applications yet</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-3">Saved Jobs</h3>
                      {userSavedJobs.length > 0 ? (
                        <div className="space-y-3">
                          {userSavedJobs.slice(0, 3).map((job) => (
                            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900">{job.title}</h4>
                              <p className="text-sm text-gray-600">{job.company.name}</p>
                              <span className="text-xs text-primary bg-purple-100 px-2 py-1 rounded-full">
                                Saved
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No saved jobs yet</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">3 new applications received for "Senior Frontend Developer"</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">Job posting "Full Stack Developer" has 67 views</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Applied Jobs Tab */}
            {activeTab === 'applied' && user.type === 'jobseeker' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Applied Jobs</h2>
                {userAppliedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userAppliedJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-4">Start applying to jobs to track your applications here.</p>
                    <Link
                      to="/jobs"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === 'saved' && user.type === 'jobseeker' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Jobs</h2>
                {userSavedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userSavedJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookmarkCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs</h3>
                    <p className="text-gray-600 mb-4">Save jobs you're interested in to view them here.</p>
                    <Link
                      to="/jobs"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {user.type === 'jobseeker' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience
                          </label>
                          <input
                            type="text"
                            value={profileData.experience}
                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., 3-5 years"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={profileData.company}
                            onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>

                    {user.type === 'jobseeker' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Skills (comma-separated)
                        </label>
                        <textarea
                          value={profileData.skills}
                          onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                          placeholder="e.g., JavaScript, React, Node.js"
                        />
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{user.profile?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">{user.profile?.location || 'Not provided'}</p>
                      </div>
                      {user.type === 'jobseeker' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Experience</label>
                            <p className="text-gray-900">{user.profile?.experience || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Skills</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {user.profile?.skills?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                                >
                                  {skill}
                                </span>
                              )) || <p className="text-gray-900">Not provided</p>}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Company</label>
                          <p className="text-gray-900">{user.profile?.company || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;