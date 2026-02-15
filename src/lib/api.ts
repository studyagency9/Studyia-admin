import axios from 'axios';

// Configuration des environnements
const isDev = import.meta.env.DEV;
const baseURL = 'https://studyiacareer-backend-qpmpz.ondigitalocean.app/api';

// Extension des types Axios pour inclure metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

// Configuration Axios avec retry et timeout augmenté pour Render
const apiConfig = {
  baseURL,
  timeout: 30000, // 30s timeout pour gérer les cold starts de Render
  headers: {
    'Content-Type': 'application/json',
  },
};

const api = axios.create(apiConfig);

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Ajouter timestamp pour debugging
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses - logging et gestion erreurs avec retry
api.interceptors.response.use(
  (response) => {
    // Logging des performances en dev
    if (isDev) {
      const duration = new Date().getTime() - response.config.metadata.startTime.getTime();
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Retry automatique pour les timeouts, erreurs réseau et connexion reset (max 3 tentatives)
    if (
      (error.code === 'ECONNABORTED' || 
       error.code === 'ECONNRESET' || 
       error.code === 'ERR_NETWORK' || 
       error.code === 'ERR_CONNECTION_RESET' ||
       !error.response) &&
      !originalRequest._retry &&
      (originalRequest._retryCount = originalRequest._retryCount || 0) < 3
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount++;
      
      console.log(`Retry attempt ${originalRequest._retryCount} for ${originalRequest.method?.toUpperCase()} ${originalRequest.url} (${error.code})`);
      
      // Attendre avant de retry (progressif: 2s, 4s, 6s)
      const delay = 2000 * originalRequest._retryCount;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(originalRequest);
    }
    
    // Gestion centralisée des erreurs
    if (error.response?.status === 401) {
      // Token expiré ou invalide - logout automatique
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Logging détaillé en dev
    if (isDev) {
      console.error('=== API ERROR DETAILS ===');
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method);
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', error.response?.data);
      console.error('Request Data:', error.config?.data);
      console.error('Headers:', error.config?.headers);
      console.error('Base URL:', error.config?.baseURL);
      console.error('Full Error:', error);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('==========================');
    }
    
    return Promise.reject(error);
  }
);

// Endpoints API centralisés
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/login',
    PROFILE: (userId: string) => `/admin/users/${userId}`,
    REFRESH: '/admin/refresh',
  },
  DASHBOARD: {
    STATS: '/admin/stats/dashboard',
    KPI: '/admin/stats/dashboard',
  },
  INVOICES: {
    LIST: '/invoices',
    STATS: '/invoices/stats',
    EXPORT: '/invoices/export',
    DETAIL: (id: string) => `/invoices/${id}`,
    CREATE: '/invoices',
    UPDATE: (id: string) => `/invoices/${id}`,
    UPDATE_STATUS: (id: string) => `/invoices/${id}/status`,
    UPLOAD_PDF: (id: string) => `/invoices/${id}/upload-pdf`,
    DOWNLOAD_PDF: (id: string) => `/invoices/${id}/download-pdf`,
    CHECK_PDF: (id: string) => `/invoices/${id}/check-pdf`,
    DELETE_PDF: (id: string) => `/invoices/${id}/pdf`,
    DELETE: (id: string) => `/invoices/${id}`,
  },
  ACCOUNTING: {
    SUMMARY: '/accounting/summary',
    DEBTS: '/accounting/debts',
    COMMISSIONS: '/accounting/commissions',
    REVENUE_BREAKDOWN: '/accounting/revenue-breakdown',
    EXPORT: '/accounting/export',
  },
  USERS: {
    LIST: '/admin/users/',
    CREATE: '/admin/users/',
    UPDATE: (id: string) => `/admin/users/${id}`,
    DELETE: (id: string) => `/admin/users/${id}`,
  },
  CVS: {
    LIST: '/admin/cvs',
    CREATE: '/admin/cvs',
    UPDATE: (id: string) => `/admin/cvs/${id}`,
  },
  PARTNERS: {
    LIST: '/admin/partners',
    CREATE: '/admin/partners',
    UPDATE: (id: string) => `/admin/partners/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/partners/${id}/status`,
  },
  ASSOCIATES: {
    LIST: '/admin/associates',
    CREATE: '/admin/associates',
    UPDATE: (id: string) => `/admin/associates/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/associates/${id}/status`,
  },
  FINANCE: {
    STATS: '/admin/stats/financial',
    PAYMENTS: '/admin/payments',
    PAYMENT_DETAIL: (id: string) => `/admin/payments/${id}`,
    REVENUE_BY_PERIOD: '/admin/stats/revenue-by-period',
    TOP_CVS: '/admin/stats/top-cvs',
    WITHDRAWALS: '/admin/withdrawals',
    UPDATE_WITHDRAWAL: (id: string) => `/admin/withdrawals/${id}/status`,
  },
  SETTINGS: {
    GENERAL: '/admin/settings',
    USERS: '/admin/settings/users',
  },
  PERSONNEL: {
    LIST: '/admin/personnel',
  },
} as const;

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  admin?: T; // Pour compatibilité avec format admin
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Services API spécialisés
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<{ admin: any; accessToken: string }>>(API_ENDPOINTS.AUTH.LOGIN, credentials),
  
  getProfile: (userId: string) =>
    api.get<ApiResponse<{ admin: any }>>(API_ENDPOINTS.AUTH.PROFILE(userId)),
  
  refreshToken: () =>
    api.post<ApiResponse<{ accessToken: string }>>(API_ENDPOINTS.AUTH.REFRESH),
};

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<any>>(API_ENDPOINTS.DASHBOARD.STATS),
  
  getKpi: () =>
    api.get<ApiResponse<any>>(API_ENDPOINTS.DASHBOARD.KPI),
};

export const usersService = {
  getList: () =>
    api.get<ApiResponse<{ users: any[]; total: number }>>('/admin/users/'),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/admin/users/', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/admin/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/admin/users/${id}`),
};

export const cvsService = {
  getList: () =>
    api.get<ApiResponse<{ cvs: any[]; total: number; page: number; limit: number }>>(API_ENDPOINTS.CVS.LIST),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.CVS.CREATE, data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.CVS.UPDATE(id), data),
};

export const partnersService = {
  getList: () =>
    api.get<ApiResponse<{ partners: any[]; total: number }>>(API_ENDPOINTS.PARTNERS.LIST),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.PARTNERS.CREATE, data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.PARTNERS.UPDATE(id), data),
  
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.PARTNERS.UPDATE_STATUS(id), { status }),
};

export const associatesService = {
  getList: () =>
    api.get<ApiResponse<{ associates: any[]; total: number }>>(API_ENDPOINTS.ASSOCIATES.LIST),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>(API_ENDPOINTS.ASSOCIATES.CREATE, data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ASSOCIATES.UPDATE(id), data),
  
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.ASSOCIATES.UPDATE_STATUS(id), { status }),
};

export const financeService = {
  getStats: () =>
    api.get<ApiResponse<any>>(API_ENDPOINTS.FINANCE.STATS),
  
  getPayments: (params?: {
    page?: number;
    limit?: number;
    isDirectPurchase?: boolean;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ApiResponse<{ payments: any[]; total: number; page: number; limit: number; stats: any }>>(
      API_ENDPOINTS.FINANCE.PAYMENTS, 
      { params }
    ),
  
  getPaymentById: (id: string) =>
    api.get<ApiResponse<{ payment: any }>>(API_ENDPOINTS.FINANCE.PAYMENT_DETAIL(id)),
  
  getRevenueByPeriod: (params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ApiResponse<{ period: string; stats: any[] }>>(API_ENDPOINTS.FINANCE.REVENUE_BY_PERIOD, { params }),
  
  getTopCVs: (params?: {
    limit?: number;
    period?: 'week' | 'month' | 'year';
  }) =>
    api.get<ApiResponse<{ topCVs: any[]; total: number; period: string }>>(API_ENDPOINTS.FINANCE.TOP_CVS, { params }),
  
  getWithdrawals: () =>
    api.get<ApiResponse<{ withdrawals: any[]; total: number }>>(API_ENDPOINTS.FINANCE.WITHDRAWALS),
  
  updateWithdrawalStatus: (id: string, status: string) =>
    api.put<ApiResponse<any>>(API_ENDPOINTS.FINANCE.UPDATE_WITHDRAWAL(id), { status }),
};

// Invoice Service
export const invoicesService = {
  getList: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientType?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => api.get(API_ENDPOINTS.INVOICES.LIST, { params }),
  
  getStats: (params?: {
    startDate?: string;
    endDate?: string;
  }) => api.get(API_ENDPOINTS.INVOICES.STATS, { params }),
  
  export: (params?: {
    format?: 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
  }) => api.get(API_ENDPOINTS.INVOICES.EXPORT, {
    params,
    responseType: 'blob',
  }),
  
  getById: (id: string) => api.get(API_ENDPOINTS.INVOICES.DETAIL(id)),
  
  create: (data: any) => api.post(API_ENDPOINTS.INVOICES.CREATE, data),
  
  update: (id: string, data: any) => api.put(API_ENDPOINTS.INVOICES.UPDATE(id), data),
  
  updateStatus: (id: string, data: {
    status: string;
    paymentDate?: string;
    paymentMethod?: string;
    notes?: string;
  }) => api.put(API_ENDPOINTS.INVOICES.UPDATE_STATUS(id), data),
  
  uploadPDF: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post(API_ENDPOINTS.INVOICES.UPLOAD_PDF(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  downloadPDF: (id: string) => api.get(API_ENDPOINTS.INVOICES.DOWNLOAD_PDF(id), {
    responseType: 'blob',
  }),
  
  checkPDF: (id: string) => api.get(API_ENDPOINTS.INVOICES.CHECK_PDF(id)),
  
  deletePDF: (id: string) => api.delete(API_ENDPOINTS.INVOICES.DELETE_PDF(id)),
  
  delete: (id: string) => api.delete(API_ENDPOINTS.INVOICES.DELETE(id)),
};

// Accounting Service
export const accountingService = {
  getFinancialSummary: (params?: {
    startDate?: string;
    endDate?: string;
  }) => api.get(API_ENDPOINTS.ACCOUNTING.SUMMARY, { params }),
  
  getDebts: (params?: {
    partnerId?: string;
    status?: string;
  }) => api.get(API_ENDPOINTS.ACCOUNTING.DEBTS, { params }),
  
  getCommissions: (params?: {
    commercialId?: string;
    status?: string;
  }) => api.get(API_ENDPOINTS.ACCOUNTING.COMMISSIONS, { params }),
  
  getRevenueBreakdown: (params?: {
    startDate?: string;
    endDate?: string;
  }) => api.get(API_ENDPOINTS.ACCOUNTING.REVENUE_BREAKDOWN, { params }),
  
  export: (params?: {
    format?: 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
  }) => api.get(API_ENDPOINTS.ACCOUNTING.EXPORT, {
    params,
    responseType: 'blob',
  }),
};

// Service Email pour l'assistante
export const emailService = {
  // Récupérer les emails entrants (IMAP - Admin seulement)
  getInboxEmails: async (params?: {
    limit?: number;
    offset?: number;
    folder?: string;
    unreadOnly?: boolean;
    search?: string;
  }) => {
    try {
      const response = await api.get('/emails', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inbox emails:', error);
      throw error;
    }
  },

  // Récupérer un email spécifique
  getEmailById: async (id: string) => {
    try {
      const response = await api.get(`/emails/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email:', error);
      throw error;
    }
  },

  // Marquer un email comme lu/non lu
  markEmailAsRead: async (id: string, isRead: boolean) => {
    try {
      const response = await api.put(`/emails/${id}/read`, { isRead });
      return response.data;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  },

  // Supprimer un email
  deleteEmail: async (id: string) => {
    try {
      const response = await api.delete(`/emails/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  },

  // Obtenir les statistiques de la boîte mail
  getEmailStats: async () => {
    try {
      const response = await api.get('/emails/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  },

  // Télécharger une pièce jointe
  downloadAttachment: async (emailId: string, filename: string) => {
    try {
      const response = await api.get(`/emails/${emailId}/attachments/${filename}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  },

  // Vérifier la santé du service IMAP (utiliser les stats comme health check)
  checkImapHealth: async () => {
    try {
      const response = await api.get('/emails/stats');
      return {
        success: true,
        data: {
          imapService: 'connected',
          imapHost: 'imap.hostinger.com',
          imapPort: 993,
          secure: true,
          user: 'contact@studyia.net',
          stats: response.data.stats
        }
      };
    } catch (error: any) {
      console.error('Error checking IMAP health:', error);
      return {
        success: false,
        error: error.message || 'Service IMAP indisponible'
      };
    }
  },

  // Tester la connexion IMAP (utiliser les stats comme test)
  testImapConnection: async () => {
    try {
      const response = await api.get('/emails/stats');
      return {
        success: true,
        message: 'Connexion IMAP testée avec succès',
        data: response.data.stats
      };
    } catch (error: any) {
      console.error('Error testing IMAP connection:', error);
      return {
        success: false,
        error: error.message || 'Erreur de connexion IMAP'
      };
    }
  },

  // Envoyer un email de contact
  sendContactEmail: async (formData: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => {
    try {
      const response = await api.post('/contact', formData);
      return response.data;
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  },

  // Tester le service email (SMTP)
  testEmailService: async () => {
    try {
      const response = await api.post('/test-email', {
        testEmail: 'test@studyia.net'
      });
      return response.data;
    } catch (error) {
      console.error('Error testing email service:', error);
      throw error;
    }
  },

  // Vérifier l'état du service email (SMTP)
  checkEmailHealth: async () => {
    try {
      const response = await api.get('/email-health');
      return response.data;
    } catch (error) {
      console.error('Error checking email health:', error);
      throw error;
    }
  }
};

// Personnel Service
export const personnelService = {
  getList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) =>
    api.get<ApiResponse<{ personnel: any[]; pagination: any }>>(API_ENDPOINTS.PERSONNEL.LIST, { params }),
};

export default api;
