# Job Portal API

A comprehensive REST API for a job portal application built with Express.js, MongoDB, and Node.js.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Job Seekers & Employers)
  - Refresh token support
  - Password reset functionality

- **User Management**
  - User registration and login
  - Profile management
  - Account deactivation/reactivation

- **Job Management**
  - Create, read, update, delete jobs
  - Job search with filters
  - Featured jobs
  - Job categories and statistics

- **Company Management**
  - Company profiles
  - Employee management
  - Company verification

- **Application System**
  - Job applications
  - Application status tracking
  - Interview scheduling
  - Application notes and feedback

- **File Upload**
  - Resume uploads
  - Profile pictures
  - Company logos
  - File type validation and size limits

- **Dashboard & Analytics**
  - User-specific dashboards
  - Application analytics
  - Job performance metrics

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/job-portal
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The API will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "type": "jobseeker",
  "profile": {
    "phone": "+91-9876543210",
    "location": "Mumbai"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "type": "jobseeker"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Job Endpoints

#### Get All Jobs
```http
GET /jobs?search=developer&location=mumbai&page=1&limit=20
```

#### Get Job by ID
```http
GET /jobs/:id
```

#### Create Job (Employers only)
```http
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Frontend Developer",
  "description": "Job description...",
  "location": "Mumbai",
  "jobType": "Full-time",
  "experience": "3-5 years",
  "category": "Software Development",
  "skills": ["React", "JavaScript"],
  "requirements": ["3+ years experience"],
  "applicationDeadline": "2024-12-31"
}
```

#### Apply for Job (Job Seekers only)
```http
POST /jobs/:jobId/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "coverLetter": "I am interested in this position...",
  "resume": "/uploads/resumes/resume.pdf"
}
```

### Company Endpoints

#### Get All Companies
```http
GET /companies?search=tech&industry=technology
```

#### Get Company by ID
```http
GET /companies/:id
```

#### Create Company (Employers only)
```http
POST /companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TechCorp Solutions",
  "description": "Leading technology company...",
  "industry": "Technology",
  "size": "1000+",
  "location": {
    "headquarters": "Mumbai"
  },
  "website": "https://techcorp.com"
}
```

### File Upload Endpoints

#### Upload File
```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
type: "resume" | "avatar" | "company-logo"
```

### Dashboard Endpoints

#### Get Dashboard Stats
```http
GET /dashboard/stats
Authorization: Bearer <token>
```

#### Get Analytics (Employers only)
```http
GET /dashboard/analytics?period=30d
Authorization: Bearer <token>
```

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables

## File Upload Limits

- Maximum file size: 5MB
- Allowed types: JPEG, PNG, GIF, PDF
- Files are stored in `/uploads` directory

## Database Schema

### User Model
- Authentication and profile information
- Role-based (jobseeker/employer)
- Profile data specific to user type

### Job Model
- Job postings with detailed information
- Search indexing for title, description, skills
- Application tracking

### Company Model
- Company profiles and information
- Employee management
- Rating and review system

### Application Model
- Job application tracking
- Status management
- Interview scheduling

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- File upload validation

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start src/server.js --name "job-portal-api"
pm2 startup
pm2 save
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.