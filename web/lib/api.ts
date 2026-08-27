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

// === COURSES TYPES ===

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  coverImage?: string;
  author?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
  };
  totalLessons: number;
  totalModules: number;
  progress: number; // 0 - 100%
}

export interface CourseLessonSummary {
  id: string;
  title: string;
  japaneseTitle?: string;
  slug?: string;
  order: number;
  summary?: string;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'AVAILABLE';
  isCompleted: boolean;
  isLocked?: boolean;
  quizScore?: number | null;
  completedSections: string[];
  counts: {
    kotobaItems: number;
    bunpouItems: number;
    kanjiItems: number;
    renshuuItems: number;
  };
}

export interface CourseModuleDetails {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLessonSummary[];
}

export interface CourseDetailsResponse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  coverImage?: string;
  author?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
  };
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  modules: CourseModuleDetails[];
}

export interface KotobaItem {
  id: string;
  lessonId: string;
  word: string;
  furigana?: string;
  romaji?: string;
  meaningUz: string;
  meaningRu?: string;
  meaningEn?: string;
  partOfSpeech?: string;
  audioUrl?: string;
  sampleSentence?: string;
  sampleSentenceUz?: string;
  order: number;
}

export interface BunpouItem {
  id: string;
  lessonId: string;
  title: string;
  structure?: string;
  explanationUz: string;
  explanationRu?: string;
  examples: { japanese: string; romaji?: string; uzbek: string; russian?: string }[];
  order: number;
}

export interface KanjiItem {
  id: string;
  lessonId: string;
  character: string;
  onyomi?: string;
  kunyomi?: string;
  meaningUz: string;
  meaningRu?: string;
  strokeCount?: number;
  strokeOrderData?: string;
  radical?: string;
  examples: { word: string; reading: string; meaning: string }[];
  order: number;
}

export interface RenshuuItem {
  id: string;
  lessonId: string;
  type: 'QUIZ' | 'AUDIO_LISTENING' | 'FILL_BLANK' | 'MATCHING';
  question: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  order: number;
}

export interface UserDashboardStats {
  streakDays: number;
  wordsLearned: number;
  completedLessons: number;
  totalLessons: number;
  n5ProgressPercent: number;
  recentLessons: {
    id: string;
    title: string;
    japaneseTitle?: string;
    courseTitle: string;
    courseSlug: string;
    isCompleted: boolean;
    quizScore?: number | null;
  }[];
}

export interface LessonDetailsResponse {
  id: string;
  title: string;
  japaneseTitle?: string;
  slug?: string;
  order: number;
  videoUrl?: string;
  summary?: string;
  kaiwaScenario?: {
    topic?: string;
    partnerName?: string;
    goal?: string;
    sampleDialog?: { speaker: string; text: string; uz: string }[];
  };
  isLocked?: boolean;
  module: {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
  };
  navigation: {
    prevLesson: { id: string; title: string; order: number } | null;
    nextLesson: { id: string; title: string; order: number } | null;
  };
  content: {
    kotoba: KotobaItem[];
    bunpou: BunpouItem[];
    kanji: KanjiItem[];
    renshuu: RenshuuItem[];
  };
  userProgress: {
    completedSections: string[];
    quizScore?: number | null;
    isCompleted: boolean;
    lastStudiedAt?: string;
  };
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
      if (res.status === 401 && typeof window !== 'undefined') {
        const hadToken = !!localStorage.getItem('minna_access_token');
        if (hadToken && !cleanEndpoint.includes('/auth/otp') && !cleanEndpoint.includes('/auth/google')) {
          localStorage.removeItem('minna_access_token');
          localStorage.removeItem('minna_refresh_token');
          localStorage.removeItem('minna_user');
          const lang = localStorage.getItem('minna-lang') || 'uz';
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = `/${lang}/auth/login?revoked=true`;
          }
        }
      }

      const message =
        data.message ||
        (Array.isArray(data.message) ? data.message.join(', ') : 'Server xatoligi');
      throw new Error(message);
    }

    return data as T;
  }

  // === AUTH APIS ===
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

  async verifyOtp(email: string, code: string, deviceName?: string) {
    return this.request<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, deviceName }),
    });
  }

  async googleAuth(token: string, deviceName?: string) {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token, deviceName }),
    });
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  async getDevices() {
    return this.request<DeviceSession[]>('/auth/devices');
  }

  async revokeDevice(deviceId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/auth/devices/${deviceId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('minna_access_token');
        localStorage.removeItem('minna_refresh_token');
        localStorage.removeItem('minna_user');
      }
    }
  }

  // === STUDENT COURSES & LESSONS ===
  async getUserDashboardStats() {
    return this.request<UserDashboardStats>('/courses/user/stats');
  }

  async getCourses() {
    return this.request<CourseListItem[]>('/courses');
  }

  async getCourseDetails(courseIdOrSlug: string) {
    return this.request<CourseDetailsResponse>(`/courses/${courseIdOrSlug}`);
  }

  async getLesson(courseId: string, lessonId: string) {
    return this.request<LessonDetailsResponse>(`/courses/${courseId}/lessons/${lessonId}`);
  }

  async updateLessonProgress(
    courseId: string,
    lessonId: string,
    data: { completedSections?: string[]; quizScore?: number; isCompleted?: boolean },
  ) {
    return this.request<{ success: boolean; progress: any }>(
      `/courses/${courseId}/lessons/${lessonId}/progress`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  // === ADMIN PANEL APIS ===

  async getAdminUserStats() {
    return this.request<AdminUserStats>('/admin/users/stats');
  }

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

  async getAdminUser(id: string) {
    return this.request<AdminUserItem & { sessions: DeviceSession[] }>(`/admin/users/${id}`);
  }

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

  async deleteAdminUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async revokeAdminUserDevice(userId: string, deviceId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/users/${userId}/devices/${deviceId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // === ADMIN COURSES CRUD ===
  async getAdminTeachers() {
    return this.request<{ id: string; fullName?: string; email: string; avatarUrl?: string; role: string }[]>('/admin/courses/teachers');
  }

  async getAdminCourses() {
    return this.request<any[]>('/admin/courses');
  }

  async getAdminCourse(id: string) {
    return this.request<any>(`/admin/courses/${id}`);
  }

  async createAdminCourse(data: any) {
    return this.request<any>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCourse(id: string, data: any) {
    return this.request<any>(`/admin/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminCourse(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Modules
  async createAdminModule(courseId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminModule(courseId: string, moduleId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/modules/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminModule(courseId: string, moduleId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/courses/${courseId}/modules/${moduleId}`,
      { method: 'DELETE' },
    );
  }

  // Admin Lessons
  async createAdminLesson(courseId: string, moduleId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminLesson(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminLesson(courseId: string, lessonId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/courses/${courseId}/lessons/${lessonId}`,
      { method: 'DELETE' },
    );
  }

  // Admin Lesson Content
  async getAdminLessonContent(courseId: string, lessonId: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/content`);
  }

  async saveAdminKotoba(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kotoba`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminKotoba(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kotoba/${id}`, {
      method: 'DELETE',
    });
  }

  async saveAdminBunpou(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/bunpou`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminBunpou(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/bunpou/${id}`, {
      method: 'DELETE',
    });
  }

  async saveAdminKanji(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kanji`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminKanji(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kanji/${id}`, {
      method: 'DELETE',
    });
  }

  async saveAdminRenshuu(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/renshuu`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminRenshuu(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/renshuu/${id}`, {
      method: 'DELETE',
    });
  }

  // === FILE UPLOADS ===
  async uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('minna_access_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_URL}/upload/video`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Video yuklashda xatolik yuz berdi');
    }
    return data as { success: boolean; url: string; originalName: string; size: number; filename: string };
  }
}

export const api = new ApiClient();
