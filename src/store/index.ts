import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'jobseeker' | 'employer';
  profile?: {
    company?: string;
    experience?: string;
    skills?: string[];
    location?: string;
    phone?: string;
    avatar?: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo: string;
    rating: number;
    reviews: number;
  };
  location: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postedDate: string;
  applicationDeadline: string;
  applicants: number;
  category: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  description: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  jobs?: Job[];
}

// Mock data for development
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: {
      id: '1',
      name: 'TechCorp Solutions',
      logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=100&h=100&fit=crop&crop=center',
      rating: 4.2,
      reviews: 1250
    },
    location: 'Mumbai',
    experience: '3-5 years',
    salary: '₹12-18 LPA',
    description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience in React.js development',
      'Strong understanding of JavaScript, HTML5, and CSS3',
      'Experience with state management libraries (Redux, Context API)',
      'Knowledge of modern authorization mechanisms, such as JSON Web Token'
    ],
    skills: ['React.js', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux'],
    jobType: 'Full-time',
    postedDate: '2024-01-15',
    applicationDeadline: '2024-02-15',
    applicants: 45,
    category: 'Software Development'
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: {
      id: '2',
      name: 'InnovateLab',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=100&h=100&fit=crop&crop=center',
      rating: 4.5,
      reviews: 890
    },
    location: 'Bangalore',
    experience: '1-3 years',
    salary: '₹10-15 LPA',
    description: 'Join our innovative team as a Full Stack Developer and work on cutting-edge projects. You will be responsible for developing both client-side and server-side architecture.',
    requirements: [
      'Strong proficiency in JavaScript, Node.js, and React',
      'Experience with databases (MongoDB, PostgreSQL)',
      'Knowledge of RESTful APIs and GraphQL',
      'Understanding of cloud platforms (AWS, Azure)'
    ],
    skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'AWS'],
    jobType: 'Full-time',
    postedDate: '2024-01-12',
    applicationDeadline: '2024-02-12',
    applicants: 67,
    category: 'Software Development'
  },
  {
    id: '3',
    title: 'Data Analyst',
    company: {
      id: '3',
      name: 'DataDriven Inc',
      logo: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?w=100&h=100&fit=crop&crop=center',
      rating: 4.0,
      reviews: 567
    },
    location: 'Pune',
    experience: '1-3 years',
    salary: '₹6-10 LPA',
    description: 'Seeking a detail-oriented Data Analyst to join our analytics team. You will be responsible for collecting, processing, and performing statistical analyses on large datasets.',
    requirements: [
      'Bachelor\'s degree in Statistics, Mathematics, or related field',
      'Proficiency in SQL and data visualization tools',
      'Experience with Python or R for data analysis',
      'Strong analytical and problem-solving skills'
    ],
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
    jobType: 'Full-time',
    postedDate: '2024-01-10',
    applicationDeadline: '2024-02-10',
    applicants: 32,
    category: 'Data Science'
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    company: {
      id: '1',
      name: 'TechCorp Solutions',
      logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=100&h=100&fit=crop&crop=center',
      rating: 4.2,
      reviews: 1250
    },
    location: 'Mumbai',
    experience: '1-3 years',
    salary: '₹8-12 LPA',
    description: 'Creative UI/UX Designer needed to create intuitive and engaging user experiences. You will be responsible for the entire design process from concept to final hand-off to developers.',
    requirements: [
      'Bachelor\'s degree in Design, HCI, or related field',
      'Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)',
      'Strong portfolio demonstrating UI/UX design skills',
      'Understanding of user-centered design principles'
    ],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research'],
    jobType: 'Full-time',
    postedDate: '2024-01-08',
    applicationDeadline: '2024-02-08',
    applicants: 28,
    category: 'Design'
  },
  {
    id: '5',
    title: 'Backend Developer',
    company: {
      id: '2',
      name: 'InnovateLab',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=100&h=100&fit=crop&crop=center',
      rating: 4.5,
      reviews: 890
    },
    location: 'Bangalore',
    experience: '3-5 years',
    salary: '₹14-20 LPA',
    description: 'Experienced Backend Developer to build scalable server-side applications. You will work with our engineering team to design and implement robust APIs and services.',
    requirements: [
      'Strong experience in Node.js and Express.js',
      'Database design and optimization skills',
      'Experience with microservices architecture',
      'Knowledge of containerization (Docker, Kubernetes)'
    ],
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'Docker', 'Microservices'],
    jobType: 'Full-time',
    postedDate: '2024-01-05',
    applicationDeadline: '2024-02-05',
    applicants: 89,
    category: 'Software Development'
  },
  {
    id: '6',
    title: 'Machine Learning Engineer',
    company: {
      id: '2',
      name: 'InnovateLab',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=100&h=100&fit=crop&crop=center',
      rating: 4.5,
      reviews: 890
    },
    location: 'Bangalore',
    experience: '3-5 years',
    salary: '₹15-22 LPA',
    description: 'ML Engineer to develop and deploy machine learning models at scale. You will work on exciting AI projects and help build the next generation of intelligent applications.',
    requirements: [
      'Master\'s degree in ML, AI, or related field',
      'Strong programming skills in Python',
      'Experience with ML frameworks (TensorFlow, PyTorch)',
      'Knowledge of MLOps and model deployment'
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLOps'],
    jobType: 'Full-time',
    postedDate: '2024-01-03',
    applicationDeadline: '2024-02-03',
    applicants: 156,
    category: 'Machine Learning'
  }
];

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=100&h=100&fit=crop&crop=center',
    rating: 4.2,
    reviews: 1250,
    description: 'Leading technology solutions provider focusing on innovative software development and digital transformation.',
    industry: 'Technology',
    size: '1000+',
    location: 'Mumbai',
    website: 'https://techcorp.com'
  },
  {
    id: '2',
    name: 'InnovateLab',
    logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=100&h=100&fit=crop&crop=center',
    rating: 4.5,
    reviews: 890,
    description: 'Innovation-driven company specializing in AI and machine learning solutions for enterprises.',
    industry: 'AI/ML',
    size: '501-1000',
    location: 'Bangalore',
    website: 'https://innovatelab.com'
  },
  {
    id: '3',
    name: 'DataDriven Inc',
    logo: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?w=100&h=100&fit=crop&crop=center',
    rating: 4.0,
    reviews: 567,
    description: 'Data analytics and business intelligence solutions for enterprises across various industries.',
    industry: 'Data Analytics',
    size: '201-500',
    location: 'Pune',
    website: 'https://datadriven.com'
  }
];

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, type: 'jobseeker' | 'employer') => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User['profile']>) => void;
  clearError: () => void;
}

interface JobState {
  jobs: Job[];
  companies: Company[];
  savedJobs: string[];
  appliedJobs: string[];
  isLoading: boolean;
  error: string | null;
  searchJobs: (query: string, filters?: any) => Job[];
  getJobById: (id: string) => Job | null;
  getCompanyById: (id: string) => Company | null;
  applyForJob: (jobId: string) => void;
  saveJob: (jobId: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, type: 'jobseeker' | 'employer') => {
        set({ isLoading: true, error: null });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data
        const mockUser: User = {
          id: '1',
          name: type === 'jobseeker' ? 'John Doe' : 'Jane Smith',
          email,
          type,
          profile: {
            location: type === 'jobseeker' ? 'Mumbai' : 'Bangalore',
            phone: '+91-9876543210',
            company: type === 'employer' ? 'TechCorp Solutions' : undefined,
            experience: type === 'jobseeker' ? '3-5 years' : undefined,
            skills: type === 'jobseeker' ? ['JavaScript', 'React', 'Node.js'] : undefined
          }
        };

        set({ user: mockUser, isLoading: false });
      },

      register: async (userData: Partial<User> & { password: string }) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: '1',
          name: userData.name || '',
          email: userData.email || '',
          type: userData.type || 'jobseeker',
          profile: userData.profile || {}
        };

        set({ user: mockUser, isLoading: false });
      },

      logout: () => {
        set({ user: null, error: null });
      },

      updateProfile: (profileData: Partial<User['profile']>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              profile: { ...user.profile, ...profileData }
            }
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,
      companies: mockCompanies,
      savedJobs: [],
      appliedJobs: [],
      isLoading: false,
      error: null,

      searchJobs: (query: string, filters?: any) => {
        const { jobs } = get();
        
        let filteredJobs = jobs;

        if (query) {
          filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.name.toLowerCase().includes(query.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
          );
        }

        if (filters?.location) {
          filteredJobs = filteredJobs.filter(job =>
            job.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        if (filters?.experience) {
          filteredJobs = filteredJobs.filter(job => job.experience === filters.experience);
        }

        if (filters?.category) {
          filteredJobs = filteredJobs.filter(job => job.category === filters.category);
        }

        if (filters?.jobType) {
          filteredJobs = filteredJobs.filter(job => job.jobType === filters.jobType);
        }

        return filteredJobs;
      },

      getJobById: (id: string) => {
        const { jobs } = get();
        return jobs.find(job => job.id === id) || null;
      },

      getCompanyById: (id: string) => {
        const { companies, jobs } = get();
        const company = companies.find(c => c.id === id);
        if (company) {
          // Add jobs for this company
          const companyJobs = jobs.filter(job => job.company.id === id);
          return { ...company, jobs: companyJobs };
        }
        return null;
      },

      applyForJob: (jobId: string) => {
        const { appliedJobs } = get();
        if (!appliedJobs.includes(jobId)) {
          set({ appliedJobs: [...appliedJobs, jobId] });
        }
      },

      saveJob: (jobId: string) => {
        const { savedJobs } = get();
        if (savedJobs.includes(jobId)) {
          set({ savedJobs: savedJobs.filter(id => id !== jobId) });
        } else {
          set({ savedJobs: [...savedJobs, jobId] });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'job-storage',
      partialize: (state) => ({ 
        savedJobs: state.savedJobs, 
        appliedJobs: state.appliedJobs 
      }),
    }
  )
);