/* const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.jobportal.com' 
  : 'http://localhost:3001/api'; */


const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || data;
  }

  // Auth endpoints
  async login(email: string, password: string, type: 'jobseeker' | 'employer') {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password, type }),
    });

    const result = await this.handleResponse<{ user: any; token: string }>(response);
    
    // Store token for future requests
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    
    return result;
  }

  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const result = await this.handleResponse<{ user: any; token: string }>(response);
    
    // Store token for future requests
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    
    return result;
  }

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    return this.handleResponse(response);
  }

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const result = await this.handleResponse<{ token: string }>(response);
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    
    return result;
  }

  // Job endpoints
  async getJobs(params?: { 
    search?: string; 
    location?: string; 
    category?: string; 
    experience?: string;
    jobType?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getJobById(id: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async createJob(jobData: any) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData),
    });

    return this.handleResponse(response);
  }

  async updateJob(id: string, jobData: any) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData),
    });

    return this.handleResponse(response);
  }

  async deleteJob(id: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async applyForJob(jobId: string, applicationData?: any) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(applicationData || {}),
    });

    return this.handleResponse(response);
  }

  async saveJob(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async unsaveJob(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/save`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getSavedJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/saved`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getAppliedJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/applied`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getFeaturedJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/featured`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getRecommendedJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/recommended`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Company endpoints
  async getCompanies(params?: { 
    search?: string; 
    location?: string; 
    industry?: string;
    size?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/companies?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getCompanyById(id: string) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getCompanyJobs(companyId: string, params?: any) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/jobs?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateCompanyProfile(companyData: any) {
    const response = await fetch(`${API_BASE_URL}/companies/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData),
    });

    return this.handleResponse(response);
  }

  // Application endpoints
  async getJobApplications(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateApplicationStatus(applicationId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse(response);
  }

  async getApplicationById(id: string) {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Analytics endpoints
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getJobStats(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/stats`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getCompanyStats() {
    const response = await fetch(`${API_BASE_URL}/companies/stats`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Search and filters
  async getJobCategories() {
    const response = await fetch(`${API_BASE_URL}/jobs/categories`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getLocations() {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // File upload
  async uploadFile(file: File, type: 'resume' | 'avatar' | 'company-logo') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Notifications
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async markNotificationAsRead(id: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();