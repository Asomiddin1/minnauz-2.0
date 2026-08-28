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

export interface ActiveCourseStats {
  id: string;
  slug: string;
  title: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  nextLesson?: {
    id: string;
    title: string;
    japaneseTitle?: string;
    order: number;
    summary?: string;
    category?: string;
    progressPercent: number;
  } | null;
}

export interface WeeklyActivityDay {
  day: string; // 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'
  date: string;
  minutes: number;
  height: string;
  active: boolean;
}

export interface UserStudyTimeStats {
  totalMinutes: number;
  totalHours: number;
  totalMinutesRemainder: number;
  todayMinutes: number;
  todayHours: number;
  todayMinutesRemainder: number;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  weeklyProgressPercent: number;
  weeklyActivity: WeeklyActivityDay[];
}

export interface UserStudyPlan {
  targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  weeklyGoalHours: number;
  dailyMinutes: number;
  targetMonths: number;
  isConfigured: boolean;
}

export interface BannerItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
  tagIcon: string;
  image: string;
  btnText: string;
  btnUrl?: string | null;
  btnIcon: string;
  actionType: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';
  notificationId?: string | null;
  order: number;
  isActive: boolean;
  isDismissible: boolean;
  targetAudience: 'ALL' | 'USER' | 'TEACHER';
  notification?: NotificationItem | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  content?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  actionUrl?: string | null;
  actionText?: string | null;
  audience: 'ALL' | 'USER' | 'TEACHER' | 'INDIVIDUAL';
  type: 'INFO' | 'ANNOUNCEMENT' | 'SYSTEM' | 'UPDATE' | 'PROMO';
  isPublished?: boolean;
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
  readCount?: number;
  hasBanner?: boolean;
}

export interface CreateBannerDto {
  title: string;
  desc: string;
  tag?: string;
  tagIcon?: string;
  image?: string;
  btnText?: string;
  btnUrl?: string;
  btnIcon?: string;
  actionType?: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';
  notificationId?: string;
  order?: number;
  isActive?: boolean;
  isDismissible?: boolean;
  targetAudience?: 'ALL' | 'USER' | 'TEACHER';
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  actionUrl?: string;
  actionText?: string;
  audience?: 'ALL' | 'USER' | 'TEACHER' | 'INDIVIDUAL';
  targetUserId?: string;
  type?: 'INFO' | 'ANNOUNCEMENT' | 'SYSTEM' | 'UPDATE' | 'PROMO';
  isPublished?: boolean;
  createBanner?: boolean;
  bannerTag?: string;
  bannerImage?: string;
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
  activeCourse?: ActiveCourseStats | null;
  studyTime?: UserStudyTimeStats;
  studyPlan?: UserStudyPlan;
  activeDates?: number[];
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
  private refreshPromise: Promise<boolean> | null = null;

  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('minna_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async tryRefreshTokens(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const refreshToken = localStorage.getItem('minna_refresh_token');
    if (!refreshToken) return false;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (!res.ok) return false;
          const data = (await res.json()) as {
            accessToken?: string;
            refreshToken?: string;
          };
          if (!data.accessToken || !data.refreshToken) return false;
          localStorage.setItem('minna_access_token', data.accessToken);
          localStorage.setItem('minna_refresh_token', data.refreshToken);
          return true;
        } catch {
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
      ...this.getAuthHeader(),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        const hadToken = !!localStorage.getItem('minna_access_token');
        const isAuthEndpoint =
          cleanEndpoint.includes('/auth/otp') ||
          cleanEndpoint.includes('/auth/google') ||
          cleanEndpoint.includes('/auth/refresh');
        if (hadToken && !isAuthEndpoint) {
          if (!isRetry && (await this.tryRefreshTokens())) {
            return this.request<T>(endpoint, options, true);
          }
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

  async logStudyTime(minutes: number = 1) {
    return this.request<{ success: boolean }>('/courses/user/study-time', {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
  }

  async getStudyPlan() {
    return this.request<UserStudyPlan>('/courses/user/study-plan');
  }

  async saveStudyPlan(data: Partial<UserStudyPlan>) {
    return this.request<UserStudyPlan>('/courses/user/study-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === BANNERS API ===
  async getBanners() {
    return this.request<BannerItem[]>('/banners');
  }

  async getAllBannersAdmin() {
    return this.request<BannerItem[]>('/banners/admin');
  }

  async createBanner(data: CreateBannerDto) {
    return this.request<BannerItem>('/banners/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBanner(id: string, data: Partial<CreateBannerDto>) {
    return this.request<BannerItem>(`/banners/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleBannerActive(id: string) {
    return this.request<BannerItem>(`/banners/admin/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async reorderBanners(bannerIds: string[]) {
    return this.request<{ success: boolean; message: string }>('/banners/admin/reorder', {
      method: 'PUT',
      body: JSON.stringify({ bannerIds }),
    });
  }

  async deleteBanner(id: string) {
    return this.request<{ success: boolean; message: string }>(`/banners/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // === NOTIFICATIONS API ===
  async getUserNotifications() {
    return this.request<NotificationItem[]>('/notifications');
  }

  async getNotificationById(id: string) {
    return this.request<NotificationItem>(`/notifications/${id}`);
  }

  async getUnreadNotificationCount() {
    return this.request<{ unreadCount: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    });
  }

  async getAllNotificationsAdmin() {
    return this.request<NotificationItem[]>('/notifications/admin');
  }

  async createNotification(data: CreateNotificationDto) {
    return this.request<NotificationItem>('/notifications/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteNotification(id: string) {
    return this.request<{ success: boolean; message: string }>(`/notifications/admin/${id}`, {
      method: 'DELETE',
    });
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
