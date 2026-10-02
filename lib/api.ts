import {
  User,
  PropertySummary,
  PropertyDetail,
  Agent,
  PagedResult,
  SiteSettings,
  PublicStats,
  TourBooking,
  Inquiry,
  Favorite,
  AdminDashboard,
  AuthChallengeResponse,
  AuthVerifyResponse,
} from './types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends and receives HttpOnly 're_auth' cookie
  });

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    let errorData = null;
    try {
      errorData = await res.json();
      if (errorData?.errors && typeof errorData.errors === 'object') {
        const msgs = Object.values(errorData.errors).flat() as string[];
        if (msgs.length > 0) {
          errorDetail = msgs.join(' ');
        } else {
          errorDetail = errorData.detail || errorData.title || errorData.message || errorDetail;
        }
      } else {
        errorDetail = errorData?.detail || errorData?.title || errorData?.message || errorDetail;
      }
    } catch {
      // not JSON
    }
    throw new ApiError(errorDetail, res.status, errorData);
  }

  // Check if 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword?: string;
      agreeToTerms?: boolean;
    }) =>
      request<AuthChallengeResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword || data.password,
          agreeToTerms: data.agreeToTerms ?? true,
        }),
      }),

    login: (data: { identifier: string; password: string }) =>
      request<AuthChallengeResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    sendOtp: (data: { challengeToken: string; channel: 'Email' | 'Sms' | string }) =>
      request<{ message: string; destination: string; devCode?: string }>('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    verifyOtp: (data: { challengeToken: string; code: string }) =>
      request<AuthVerifyResponse>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    forgotPassword: (data: { identifier: string }) =>
      request<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    resetPassword: (data: { identifier: string; code: string; newPassword: string }) =>
      request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: () =>
      request<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      }),

    me: () => request<User>('/api/auth/me'),
  },

  account: {
    updateProfile: (data: { fullName: string }) =>
      request<User>('/api/account/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/api/account/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    requestContactChange: (data: { type: 'Email' | 'Phone'; newValue: string }) =>
      request<{ message: string; destination: string }>('/api/account/change-contact/request', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    confirmContactChange: (data: { code: string }) =>
      request<User>('/api/account/change-contact/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  properties: {
    getAll: (params: {
      search?: string;
      city?: string;
      propertyType?: string;
      listingType?: string;
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      isFeatured?: boolean;
      status?: string;
      sortBy?: string;
      page?: number;
      pageSize?: number;
    } = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          q.append(key, String(val));
        }
      });
      return request<PagedResult<PropertySummary>>(`/api/properties?${q.toString()}`);
    },

    getById: (id: number) => request<PropertyDetail>(`/api/properties/${id}`),

    getCities: () => request<string[]>('/api/properties/cities'),
  },

  agents: {
    getAll: () => request<Agent[]>('/api/agents'),
  },

  settings: {
    get: () => request<SiteSettings>('/api/settings'),
  },

  stats: {
    get: () => request<PublicStats>('/api/stats'),
  },

  inquiries: {
    create: (data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      propertyId?: number;
    }) =>
      request<{ message: string; inquiryId: number }>('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  favorites: {
    getAll: () => request<Favorite[]>('/api/favorites'),
    add: (propertyId: number) =>
      request<{ message: string }>(`/api/favorites/${propertyId}`, { method: 'POST' }),
    remove: (propertyId: number) =>
      request<{ message: string }>(`/api/favorites/${propertyId}`, { method: 'DELETE' }),
  },

  tours: {
    book: (data: {
      propertyId: number;
      preferredDate: string;
      clientName?: string;
      clientEmail?: string;
      clientPhone?: string;
      notes?: string;
    }) =>
      request<{ message: string; bookingId: number }>('/api/tours', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMy: () => request<TourBooking[]>('/api/tours/my'),

    cancel: (id: number) =>
      request<{ message: string }>(`/api/tours/${id}/cancel`, {
        method: 'POST',
      }),
  },

  admin: {
    getDashboard: () => request<AdminDashboard>('/api/admin/dashboard'),

    properties: {
      getAll: (params: { search?: string; city?: string; propertyType?: string; listingType?: string; status?: string; page?: number; pageSize?: number } = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            q.append(key, String(val));
          }
        });
        return request<PagedResult<PropertySummary>>(`/api/admin/properties?${q.toString()}`);
      },

      getById: (id: number) => request<PropertyDetail>(`/api/admin/properties/${id}`),

      create: (data: any) =>
        request<{ id: number; message: string }>('/api/admin/properties', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      update: (id: number, data: any) =>
        request<{ message: string }>(`/api/admin/properties/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),

      delete: (id: number) =>
        request<{ message: string }>(`/api/admin/properties/${id}`, {
          method: 'DELETE',
        }),

      addImage: (id: number, data: { imageUrl: string; sortOrder?: number }) =>
        request<{ message: string; imageId: number }>(`/api/admin/properties/${id}/images`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      reorderImages: (id: number, items: { imageId: number; sortOrder: number }[]) =>
        request<{ message: string }>(`/api/admin/properties/${id}/images`, {
          method: 'PUT',
          body: JSON.stringify(items),
        }),

      deleteImage: (id: number, imageId: number) =>
        request<{ message: string }>(`/api/admin/properties/${id}/images/${imageId}`, {
          method: 'DELETE',
        }),
    },

    agents: {
      getAll: () => request<Agent[]>('/api/admin/agents'),
      create: (data: any) =>
        request<{ message: string; agentId: number }>('/api/admin/agents', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: number, data: any) =>
        request<{ message: string }>(`/api/admin/agents/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: number) =>
        request<{ message: string }>(`/api/admin/agents/${id}`, {
          method: 'DELETE',
        }),
    },

    tours: {
      getAll: (params: { status?: string; search?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number } = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            q.append(key, String(val));
          }
        });
        return request<PagedResult<TourBooking>>(`/api/admin/tours?${q.toString()}`);
      },

      updateStatus: (id: number, data: { status: string; adminNote?: string }) =>
        request<{ message: string }>(`/api/admin/tours/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
    },

    inquiries: {
      getAll: (params: { status?: string; search?: string; page?: number; pageSize?: number } = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            q.append(key, String(val));
          }
        });
        return request<PagedResult<Inquiry>>(`/api/admin/inquiries?${q.toString()}`);
      },

      updateStatus: (id: number, status: string) =>
        request<{ message: string }>(`/api/admin/inquiries/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),

      reply: (id: number, message: string) =>
        request<{ message: string }>(`/api/admin/inquiries/${id}/reply`, {
          method: 'POST',
          body: JSON.stringify({ message }),
        }),
    },

    users: {
      getAll: (params: { search?: string; page?: number; pageSize?: number } = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            q.append(key, String(val));
          }
        });
        return request<PagedResult<User>>(`/api/admin/users?${q.toString()}`);
      },

      toggleActive: (id: number, isActive: boolean) =>
        request<{ message: string }>(`/api/admin/users/${id}/active`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive }),
        }),
    },

    settings: {
      update: (data: SiteSettings) =>
        request<{ message: string }>('/api/admin/settings', {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },

    uploads: {
      upload: async (file: File, folder: 'properties' | 'agents' = 'properties') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        return request<{ url: string; relativePath: string; fileName: string; size: number }>('/api/admin/uploads', {
          method: 'POST',
          body: formData,
        });
      },
    },
  },
};
