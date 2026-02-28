import axios from 'axios';
import { User, Job, Application, Document as DocType, Insight, AuditLog, QuoteRequest, Plan, TalentDemand, CandidateStatus, QuoteOption, InterviewMeeting, ProposedTime } from './mockData';
export type { QuoteRequest, Plan, AuditLog, TalentDemand, CandidateStatus, QuoteOption, InterviewMeeting, ProposedTime };

// Use VITE_API_URL in production (e.g. '' for same-origin, or full URL for separate API)
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const BASE_URL = API_URL ? API_URL.replace(/\/api\/?$/, '') : '';
const API_BASE = API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFileUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Helper to generate IDs (for client-side needs if any)
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Current user state
let currentUser: User | null = null;

// Helper to get current user from localStorage
const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      return currentUser;
    } catch (e) {
      console.error('Failed to parse stored user', e);
      return null;
    }
  }
  return null;
};

const setCurrentUser = (user: User | null): void => {
  currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// Helper function to get auth token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  currentUser = null;
};

// Add interceptor to add token to every request
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string, role?: string) => {
    // Note: Use relative paths without leading slash for Axios baseURL integration
    const response = await apiClient.post('auth/login', { email, password, role });
    const { token, user } = response.data;
    setToken(token);
    setCurrentUser(user);
    return { token, user };
  },

  register: async (data: {
    email: string;
    password: string;
    role: 'candidate' | 'employer';
    firstName?: string;
    lastName?: string;
    companyName?: string;
  }) => {
    const response = await apiClient.post('auth/register', data);
    const { token, user } = response.data;
    setToken(token);
    setCurrentUser(user);
    return { token, user };
  },

  getMe: async () => {
    const response = await apiClient.get('auth/me');
    const { user } = response.data;
    setCurrentUser(user);
    return { user };
  },

  logout: () => {
    removeToken();
  },
};

// Candidate API
export const candidateAPI = {
  getPlans: async () => {
    const response = await apiClient.get('candidate/plans');
    return { plans: response.data.plans };
  },

  subscribeToPlan: async (planId: string) => {
    const response = await apiClient.post(`candidate/subscribe/${planId}`);
    return response.data;
  }
};

// Jobs and Applications APIs removed

// Profiles API
export const profilesAPI = {
  getCandidateProfile: async (id: string) => {
    const response = await apiClient.get(`profiles/candidate/${id}`);
    return response.data;
  },

  updateCandidateProfile: async (id: string, data: Partial<User>) => {
    const response = await apiClient.put(`profiles/candidate/${id}`, data);
    const updatedUser = response.data.user;
    if (updatedUser) {
      const current = getCurrentUser();
      if (current && current.id === id) {
        setCurrentUser({ ...updatedUser });
      }
    }
    return response.data;
  },

  getEmployerProfile: async (id: string) => {
    const response = await apiClient.get(`profiles/employer/${id}`);
    return response.data;
  },

  updateEmployerProfile: async (id: string, data: Partial<User>) => {
    const response = await apiClient.put(`profiles/employer/${id}`, data);
    const updatedUser = response.data.user;
    if (updatedUser) {
      const current = getCurrentUser();
      if (current && current.id === id) {
        setCurrentUser({ ...updatedUser });
      }
    }
    return response.data;
  },

  getProfileViews: async (id: string) => {
    const response = await apiClient.get(`profiles/candidate/${id}/views`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('profiles/dashboard/stats');
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  upload: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post('documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyDocuments: async () => {
    const response = await apiClient.get('documents/my-documents');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`documents/${id}`);
    return response.data;
  },

  getVerificationStatus: async () => {
    const response = await apiClient.get('documents/my-documents');
    return response.data;
  }
};

// Insights API
export const insightsAPI = {
  getAll: async (params?: { category?: string; featured?: boolean; published?: boolean }) => {
    const response = await apiClient.get('insights', { params });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`insights/${slug}`);
    return response.data;
  },

  create: async (data: Partial<Insight>) => {
    const response = await apiClient.post('insights', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Insight>) => {
    const response = await apiClient.put(`insights/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`insights/${id}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getEmployers: async () => {
    const response = await apiClient.get('admin/employers');
    return response.data;
  },

  getWorkers: async () => {
    const response = await apiClient.get('admin/workers');
    return response.data;
  },

  verifyEmployer: async (id: string, isVerified: boolean) => {
    const response = await apiClient.patch(`admin/employers/${id}/verify`, { isVerified });
    return response.data;
  },

  rejectEmployer: async (id: string) => {
    return adminAPI.verifyEmployer(id, false);
  },

  verifyWorker: async (id: string, isVerified: boolean) => {
    const response = await apiClient.patch(`admin/workers/${id}/verify`, { isVerified });
    return response.data;
  },

  rejectWorker: async (id: string) => {
    return adminAPI.verifyWorker(id, false);
  },

  updateWorkerBadge: async (userId: string, badgeType: 'gold' | 'blue' | 'none') => {
    const response = await apiClient.patch(`admin/worker/${userId}/badge`, { badgeType });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('staff/users');
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await apiClient.get('admin/audit-logs');
    return response.data;
  },

  getRetentionStats: async () => {
    const response = await apiClient.get('admin/retention-stats');
    return response.data;
  },
};

// Staff API
export const staffAPI = {
  getPendingCompanies: async () => {
    const response = await apiClient.get('staff/pending-companies');
    return response.data;
  },

  getPendingReviews: async () => {
    const response = await apiClient.get('staff/pending-reviews');
    return response.data;
  },

  getReviewsByCandidate: async (candidateId: string) => {
    const response = await apiClient.get(`staff/reviews/${candidateId}`);
    return response.data;
  },

  approveDocument: async (docId: string) => {
    const response = await apiClient.put(`staff/documents/${docId}/approve`);
    return response.data;
  },

  rejectDocument: async (docId: string, reason?: string) => {
    const response = await apiClient.put(`staff/documents/${docId}/reject`, { reason });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('staff/stats');
    return response.data;
  },

  getAllCandidateRelations: async () => {
    const response = await apiClient.get('staff/relations');
    return response.data;
  },

  verifyCandidate: async (id: string, isVerified: boolean, reason?: string, suggestedPlacementCost?: string) => {
    const response = await apiClient.put(`staff/candidates/${id}/verify`, { isVerified, reason, suggestedPlacementCost });
    return response.data;
  },

  rejectCandidate: async (id: string, reason: string) => {
    return staffAPI.verifyCandidate(id, false, reason);
  },

  getUsers: async () => {
    const response = await apiClient.get('staff/users');
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`staff/users/${id}`);
    return response.data;
  },

  addUser: async (userData: any) => {
    const response = await apiClient.post('staff/users', userData);
    return response.data;
  },

  getDomains: async () => {
    const response = await apiClient.get('staff/domains');
    return response.data;
  },

  getQuoteRequests: async () => {
    const response = await apiClient.get('staff/quote-requests');
    return response.data;
  },

  resolveQuoteRequest: async (requestId: string, status: 'approved' | 'rejected', costEstimate?: string) => {
    const response = await apiClient.put(`staff/quote-requests/${requestId}/resolve`, { status, costEstimate });
    return response.data;
  },

  verifyEmployer: async (id: string, isVerified: boolean, reason?: string) => {
    const response = await apiClient.put(`staff/employers/${id}/verify`, { isVerified, reason });
    return response.data;
  },

  addDomain: async (domainData: any) => {
    const response = await apiClient.post('staff/domains', domainData);
    return response.data;
  },

  updateDomain: async (id: string, domainData: any) => {
    const response = await apiClient.put(`staff/domains/${id}`, domainData);
    return response.data;
  },

  deleteDomain: async (id: string) => {
    const response = await apiClient.delete(`staff/domains/${id}`);
    return response.data;
  },
};

// Talent Pool API
export const talentPoolAPI = {
  getCandidates: async (params?: { skills?: string[]; location?: string; verified?: boolean }) => {
    const response = await apiClient.get('talent-pool/candidates', { params });
    return response.data;
  },

  getCandidateById: async (id: string) => {
    const response = await apiClient.get(`talent-pool/candidates/${id}`);
    return response.data;
  },

  updateCandidateStatus: async (candidateId: string, status: CandidateStatus, employerId?: string) => {
    const response = await apiClient.put(`talent-pool/relations/${candidateId}/status`, { status, employerId });
    return response.data;
  },

  getMyCandidateRelations: async () => {
    const response = await apiClient.get('talent-pool/my-relations');
    return response.data;
  },

  requestQuote: async (candidateId: string) => {
    const response = await apiClient.post('quotes', { candidateId });
    return response.data;
  },

  getMyQuoteRequests: async () => {
    const response = await apiClient.get('quotes/my');
    return response.data;
  },
};

// Talent Demands API
export const talentDemandsAPI = {
  create: async (data: Partial<TalentDemand>) => {
    const response = await apiClient.post('talent-demands', data);
    return response.data;
  },

  getMyDemands: async () => {
    const response = await apiClient.get('talent-demands/my');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`talent-demands/${id}`);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('talent-demands');
    return response.data;
  },

  suggestCandidate: async (demandId: string, candidateId: string) => {
    const response = await apiClient.post(`talent-demands/${demandId}/suggest`, { candidateId });
    return response.data;
  },

  addManualProfile: async (demandId: string, profile: any) => {
    const response = await apiClient.post(`talent-demands/${demandId}/manual-profile`, { profile });
    return response.data;
  },

  updateStatus: async (demandId: string, status: TalentDemand['status']) => {
    const response = await apiClient.put(`talent-demands/${demandId}/status`, { status });
    return response.data;
  },

  getSuggestedCandidates: async (demandId: string) => {
    const response = await apiClient.get(`talent-demands/${demandId}/suggested`);
    return response.data;
  }
};

// Interview API
export const interviewAPI = {
  schedule: async (data: { candidateId: string; employerId: string; title: string; proposedTimes: { datetime: string; duration: number }[]; notes?: string }) => {
    const response = await apiClient.post('interviews', data);
    return response.data;
  },

  respondToSlot: async (interviewId: string, slotId: string, accepted: boolean) => {
    const response = await apiClient.put(`interviews/${interviewId}/respond`, { slotId, accepted });
    return response.data;
  },

  cancel: async (interviewId: string) => {
    const response = await apiClient.put(`interviews/${interviewId}/cancel`);
    return response.data;
  },

  complete: async (interviewId: string) => {
    const response = await apiClient.put(`interviews/${interviewId}/complete`);
    return response.data;
  },

  getMyInterviews: async () => {
    const response = await apiClient.get('interviews/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`interviews/${id}`);
    return response.data;
  },

  getAllInterviews: async () => {
    const response = await apiClient.get('interviews');
    return response.data;
  }
};

// Quotes API
export const quotesAPI = {
  request: async (candidateId: string) => {
    const response = await apiClient.post('quotes', { candidateId });
    return response.data;
  },

  getMyRequests: async () => {
    const response = await apiClient.get('quotes/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`quotes/${id}`);
    return response.data;
  },

  selectOption: async (quoteId: string, optionId: string) => {
    const response = await apiClient.put(`quotes/${quoteId}/select-option`, { optionId });
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`quotes/${id}/status`, { status });
    return response.data;
  }
};

// Consent API
export const consentAPI = {
  request: async (candidateId: string, message?: string) => {
    const response = await apiClient.post('consent', { candidateId, message });
    return response.data;
  },
  getMyRequests: async () => {
    const response = await apiClient.get('consent/my-requests');
    return response.data;
  },
  respond: async (requestId: string, status: 'approved' | 'rejected') => {
    const response = await apiClient.patch(`consent/${requestId}/respond`, { status });
    return response.data;
  }
};

export const publicAPI = {
  getStats: async () => {
    const response = await apiClient.get('public/stats');
    return response.data;
  }
};
