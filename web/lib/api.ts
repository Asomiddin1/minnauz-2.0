const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
const API_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'USER' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified?: boolean;
}

export interface AdminUserItem extends User {
  createdAt: string;
  updatedAt: string;
  activeDevicesCount: number;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserStats {
  totalUsers: number;
  verifiedUsers: number;
  totalAdmins: number;
  superAdmins: number;
  admins: number;
  teachers: number;
  standardUsers: number;
  activeSessions: number;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName?: string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  device: DeviceSession;
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('minna_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data.message ||
        (Array.isArray(data.message) ? data.message.join(', ') : 'Server xatoligi');
      throw new Error(message);
    }

    return data as T;
  }

  // 1. Send OTP
  async sendOtp(email: string) {
    return this.request<{
      success: boolean;
      message: string;
      expiresInSeconds: number;
      devCode?: string;
    }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // 2. Verify OTP
  async verifyOtp(email: string, code: string, deviceName?: string) {
    return this.request<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, deviceName }),
    });
  }

  // 3. Google Login
  async googleAuth(token: string, deviceName?: string) {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token, deviceName }),
    });
  }

  // 4. Get Current User Profile
  async getMe() {
    return this.request<User>('/auth/me');
  }

  // 5. Get User's Active Devices (Device Manager)
  async getDevices() {
    return this.request<DeviceSession[]>('/auth/devices');
  }

  // 6. Revoke a device session
  async revokeDevice(deviceId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/auth/devices/${deviceId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // 7. Logout
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Server error on logout can be safely ignored; client session is always cleaned up
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('minna_access_token');
        localStorage.removeItem('minna_refresh_token');
        localStorage.removeItem('minna_user');
      }
    }
  }

  // === ADMIN PANEL APIS ===

  // 8. Get Admin User Stats
  async getAdminUserStats() {
    return this.request<AdminUserStats>('/admin/users/stats');
  }

  // 9. Get Admin Users with filter and pagination
  async getAdminUsers(params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request<AdminUsersResponse>(endpoint);
  }

  // 10. Get Single Admin User
  async getAdminUser(id: string) {
    return this.request<AdminUserItem & { sessions: DeviceSession[] }>(`/admin/users/${id}`);
  }

  // 11. Create User
  async createAdminUser(data: {
    email: string;
    fullName?: string;
    role?: string;
    isVerified?: boolean;
  }) {
    return this.request<AdminUserItem>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 12. Update User
  async updateAdminUser(
    id: string,
    data: {
      fullName?: string;
      role?: string;
      isVerified?: boolean;
      avatarUrl?: string;
    },
  ) {
    return this.request<AdminUserItem>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 13. Delete User
  async deleteAdminUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // 14. Revoke User Device
  async revokeAdminUserDevice(userId: string, deviceId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/users/${userId}/devices/${deviceId}`,
      {
        method: 'DELETE',
      },
    );
  }
}

export const api = new ApiClient();
