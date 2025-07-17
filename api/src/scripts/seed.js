const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        type: 'jobseeker',
        profile: {
          phone: '+91-9876543210',
          location: 'Mumbai',
          bio: 'Experienced software developer with 5+ years in web development',
          experience: '3-5 years',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
          education: [{
            degree: 'Bachelor of Technology',
            institution: 'IIT Mumbai',
            year: 2018,
            field: 'Computer Science'
          }]
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@techcorp.com',
        password: hashedPassword,
        type: 'employer',
        profile: {
          phone: '+91-9876543211',
          location: 'Bangalore',
          company: 'TechCorp Solutions',
          industry: 'Technology',
          website: 'https://techcorp.com'
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike@innovatelab.com',
        password: hashedPassword,
        type: 'employer',
        profile: {
          phone: '+91-9876543212',
          location: 'Pune',
          company: 'InnovateLab',
          industry: 'AI/ML',
          website: 'https://innovatelab.com'
        }
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: hashedPassword,
        type: 'jobseeker',
        profile: {
          phone: '+91-9876543213',
          location: 'Delhi',
          bio: 'Data scientist passionate about machine learning and analytics',
          experience: '1-3 years',
          skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'TensorFlow']
        }
      }
    ]);

    console.log('Created users');

    // Create companies
    const companies = await Company.create([
      {
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider focusing on innovative software development and digital transformation.',
        industry: 'Technology',
        size: '1000+',
        location: {
          headquarters: 'Mumbai',
          offices: [
            { city: 'Mumbai', country: 'India' },
            { city: 'Bangalore', country: 'India' },
            { city: 'Pune', country: 'India' }
          ]
        },
        website: 'https://techcorp.com',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&crop=center',
        founded: 2010,
        owner: users[1]._id,
        employees: [{ user: users[1]._id, role: 'admin' }],
        benefits: ['Health Insurance', 'Flexible Work Hours', 'Remote Work Options', 'Professional Development'],
        rating: {
          overall: 4.2,
          workLifeBalance: 4.0,
          compensation: 4.5,
          careerGrowth: 4.0,
          management: 4.2,
          totalReviews: 1250
        },
        isVerified: true,
        tags: ['Software Development', 'Innovation', 'Growth']
      },
      {
        name: 'InnovateLab',
        description: 'Innovation-driven company specializing in AI and machine learning solutions for enterprises.',
        industry: 'AI/ML',
        size: '501-1000',
        location: {
          headquarters: 'Bangalore',
          offices: [
            { city: 'Bangalore', country: 'India' },
            { city: 'Hyderabad', country: 'India' }
          ]
        },
        website: 'https://innovatelab.com',
        logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center',
        founded: 2015,
        owner: users[2]._id,
        employees: [{ user: users[2]._id, role: 'admin' }],
        benefits: ['Stock Options', 'Learning Budget', 'Flexible Hours', 'Health Insurance'],
        rating: {
          overall: 4.5,
          workLifeBalance: 4.3,
          compensation: 4.7,
          careerGrowth: 4.6,
          management: 4.4,
          totalReviews: 890
        },
        isVerified: true,
        tags: ['AI', 'Machine Learning', 'Innovation']
      },
      {
        name: 'DataDriven Inc',
        description: 'Data analytics and business intelligence solutions for enterprises across various industries.',
        industry: 'Data Analytics',
        size: '201-500',
        location: {
          headquarters: 'Pune',
          offices: [
            { city: 'Pune', country: 'India' },
            { city: 'Mumbai', country: 'India' }
          ]
        },
        website: 'https://datadriven.com',
        logo: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=100&h=100&fit=crop&crop=center',
        founded: 2012,
        owner: users[1]._id, // Using same owner for demo
        employees: [{ user: users[1]._id, role: 'admin' }],
        benefits: ['Performance Bonus', 'Health Insurance', 'Training Programs'],
        rating: {
          overall: 4.0,
          workLifeBalance: 3.8,
          compensation: 4.2,
          careerGrowth: 4.0,
          management: 3.9,
          totalReviews: 567
        },
        isVerified: true,
        tags: ['Data Analytics', 'Business Intelligence']
      }
    ]);

    console.log('Created companies');

    // Create jobs
    const jobs = await Job.create([
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows. You will ensure that these components and the overall application are robust and easy to maintain.',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '3+ years of experience in React.js development',
          'Strong understanding of JavaScript, HTML5, and CSS3',
          'Experience with state management libraries (Redux, Context API)',
          'Knowledge of modern authorization mechanisms, such as JSON Web Token',
          'Familiarity with RESTful APIs'
        ],
        skills: ['React.js', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux'],
        location: 'Mumbai',
        remote: false,
        jobType: 'Full-time',
        experience: '3-5 years',
        salary: {
          min: 1200000,
          max: 1800000,
          currency: 'INR',
          period: 'yearly',
          displayText: '₹12-18 LPA'
        },
        category: 'Software Development',
        company: companies[0]._id,
        postedBy: users[1]._id,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        featured: true,
        benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget'],
        applicationsCount: 45,
        viewsCount: 234
      },
      {
        title: 'Full Stack Developer',
        description: 'Join our innovative team as a Full Stack Developer and work on cutting-edge projects. You will be responsible for developing both client-side and server-side architecture, ensuring the responsiveness of applications, and working alongside graphic designers for web design features.',
        requirements: [
          'Strong proficiency in JavaScript, Node.js, and React',
          'Experience with databases (MongoDB, PostgreSQL)',
          'Knowledge of RESTful APIs and GraphQL',
          'Understanding of cloud platforms (AWS, Azure)',
          'Experience with version control systems (Git)',
          'Strong problem-solving skills'
        ],
        skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'AWS'],
        location: 'Bangalore',
        remote: true,
        jobType: 'Full-time',
        experience: '1-3 years',
        salary: {
          min: 1000000,
          max: 1500000,
          currency: 'INR',
          period: 'yearly',
          displayText: '₹10-15 LPA'
        },
        category: 'Software Development',
        company: companies[1]._id,
        postedBy: users[2]._id,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        featured: true,
        benefits: ['Stock Options', 'Remote Work', 'Health Insurance'],
        applicationsCount: 67,
        viewsCount: 456
      },
      {
        title: 'Data Analyst',
        description: 'Seeking a detail-oriented Data Analyst to join our analytics team. You will be responsible for collecting, processing, and performing statistical analyses on large datasets. You will help translate data into valuable insights that can be used to improve business decisions.',
        requirements: [
          'Bachelor\'s degree in Statistics, Mathematics, or related field',
          'Proficiency in SQL and data visualization tools',
          'Experience with Python or R for data analysis',
          'Strong analytical and problem-solving skills',
          'Experience with Excel and statistical software',
          'Excellent communication skills'
        ],
        skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
        location: 'Pune',
        remote: false,
        jobType: 'Full-time',
        experience: '1-3 years',
        salary: {
          min: 600000,
          max: 1000000,
          currency: 'INR',
          period: 'yearly',
          displayText: '₹6-10 LPA'
        },
        category: 'Data Science',
        company: companies[2]._id,
        postedBy: users[1]._id,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        benefits: ['Performance Bonus', 'Training Programs'],
        applicationsCount: 32,
        viewsCount: 189
      },
      {
        title: 'UI/UX Designer',
        description: 'Creative UI/UX Designer needed to create intuitive and engaging user experiences. You will be responsible for the entire design process from concept to final hand-off to developers.',
        requirements: [
          'Bachelor\'s degree in Design, HCI, or related field',
          'Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)',
          'Strong portfolio demonstrating UI/UX design skills',
          'Understanding of user-centered design principles',
          'Experience with prototyping and wireframing',
          'Knowledge of HTML/CSS is a plus'
        ],
        skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research'],
        location: 'Mumbai',
        remote: false,
        jobType: 'Full-time',
        experience: '1-3 years',
        salary: {
          min: 800000,
          max: 1200000,
          currency: 'INR',
          period: 'yearly',
          displayText: '₹8-12 LPA'
        },
        category: 'Design',
        company: companies[0]._id,
        postedBy: users[1]._id,
        applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        benefits: ['Creative Freedom', 'Latest Tools', 'Flexible Hours'],
        applicationsCount: 28,
        viewsCount: 167
      },
      {
        title: 'Backend Developer',
        description: 'Experienced Backend Developer to build scalable server-side applications. You will work with our engineering team to design and implement robust APIs and services.',
        requirements: [
          'Strong experience in Node.js and Express.js',
          'Database design and optimization skills',
          'Experience with microservices architecture',
          'Knowledge of containerization (Docker, Kubernetes)',
          'Understanding of security best practices',
          'Experience with cloud platforms'
        ],
        skills: ['Node.js', 'Express.js', 'PostgreSQL', 'Docker', 'Microservices'],
        location: 'Bangalore',
        remote: true,
        jobType: 'Full-time',
        experience: '3-5 years',
        salary: {
          min: 1400000,
          max: 2000000,
          currency: 'INR',
          period: 'yearly',
          displayText: '₹14-20 LPA'
        },
        category: 'Software Development',
        company: companies[1]._id,
        postedBy: users[2]._id,
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        featured: true,
        benefits: ['Stock Options', 'Remote Work', 'Learning Budget'],
        applicationsCount: 89,
        viewsCount: 523
      },
      {
        title: 'Machine Learning Engineer',
        description: 'ML Engineer to develop and deploy machine learning models at scale. You will work on exciting AI projects and help build the next generation of intelligent applications.',
        requirements: [
          'Master\'s degree in ML, AI, or related field',
          'Strong programming skills in Python',
          'Experience with ML frameworks (TensorFlow, PyTorch)',
          'Knowledge of MLOps and model deployment',
          'Understanding of statistical methods',
          'Experience with cloud ML services'
        ],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLOps'],
        location: 'Bangalore',
        remote: false,
        jobType: 'Full-time',
        experience: '3-5 years',
        salary: {
          min: 1500000,
          max: 2200000,
          currency: 'INR',
          period: 'yearly',
          displayText: '₹15-22 LPA'
        },
        category: 'Machine Learning',
        company: companies[1]._id,
        postedBy: users[2]._id,
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        featured: true,
        urgent: true,
        benefits: ['Research Time', 'Conference Budget', 'Latest Hardware'],
        applicationsCount: 156,
        viewsCount: 789
      }
    ]);

    console.log('Created jobs');

    // Update company job counts
    for (const company of companies) {
      const jobCount = jobs.filter(job => job.company.toString() === company._id.toString()).length;
      await Company.findByIdAndUpdate(company._id, { jobsCount: jobCount });
    }

    console.log('Updated company job counts');

    console.log('✅ Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Job Seeker: john@example.com / password123');
    console.log('Job Seeker: sarah@example.com / password123');
    console.log('Employer: jane@techcorp.com / password123');
    console.log('Employer: mike@innovatelab.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();