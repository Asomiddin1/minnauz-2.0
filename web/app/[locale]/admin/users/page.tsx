'use client';

import * as React from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Shield,
  MoreVertical,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Check,
} from 'lucide-react';
import { api, AdminUserItem, DeviceSession } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<AdminUserItem | null>(null);
  const [deleteUser, setDeleteUser] = React.useState<AdminUserItem | null>(null);
  const [viewDevicesUser, setViewDevicesUser] = React.useState<{
    user: AdminUserItem;
    sessions: DeviceSession[];
  } | null>(null);

  // Form states
  const [formEmail, setFormEmail] = React.useState('');
  const [formName, setFormName] = React.useState('');
  const [formAvatarUrl, setFormAvatarUrl] = React.useState('');
  const [formRole, setFormRole] = React.useState('USER');
  const [formVerified, setFormVerified] = React.useState(false);
  const [formBusy, setFormBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        page,
        limit,
      });
      setUsers(res.items);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // 1. Open Create Modal
  const openCreateModal = () => {
    setFormEmail('');
    setFormName('');
    setFormRole('USER');
    setFormVerified(false);
    setFormError(null);
    setCreateModalOpen(true);
  };

  // 2. Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim()) {
      setFormError('Email manzil kiritilishi shart');
      return;
    }
    setFormBusy(true);
    setFormError(null);
    try {
      await api.createAdminUser({
        email: formEmail.trim(),
        fullName: formName.trim() || undefined,
        role: formRole,
        isVerified: formVerified,
      });
      setCreateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi');
    } finally {
      setFormBusy(false);
    }
  };

  // 3. Open Edit Modal
  const openEditModal = (u: AdminUserItem) => {
    setEditUser(u);
    setFormName(u.fullName || '');
    setFormAvatarUrl(u.avatarUrl || '');
    setFormRole(u.role);
    setFormVerified(u.isVerified ?? false);
    setFormError(null);
  };

  // 4. Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setFormBusy(true);
    setFormError(null);
    try {
      await api.updateAdminUser(editUser.id, {
        fullName: formName.trim() || undefined,
        role: formRole,
        isVerified: formVerified,
        avatarUrl: formAvatarUrl.trim() || undefined,
      });
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi');
    } finally {
      setFormBusy(false);
    }
  };

  // 5. Submit Delete
  const handleDeleteSubmit = async () => {
    if (!deleteUser) return;
    setFormBusy(true);
    try {
      await api.deleteAdminUser(deleteUser.id);
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Oʻchirishda xatolik yuz berdi');
    } finally {
      setFormBusy(false);
    }
  };

  // 6. View Devices
  const handleViewDevices = async (u: AdminUserItem) => {
    try {
      const details = await api.getAdminUser(u.id);
      setViewDevicesUser({ user: u, sessions: details.sessions });
    } catch (err: any) {
      alert(err.message || 'Qurilmalarni yuklashda xatolik');
    }
  };

  // 7. Revoke Device
  const handleRevokeDevice = async (userId: string, deviceId: string) => {
    try {
      await api.revokeAdminUserDevice(userId, deviceId);
      if (viewDevicesUser) {
        setViewDevicesUser({
          ...viewDevicesUser,
          sessions: viewDevicesUser.sessions.filter((s) => s.deviceId !== deviceId),
        });
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Qurilmani bekor qilishda xatolik');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Admin
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Ustoz
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
            Oʻquvchi
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="headline text-[28px] font-bold text-foreground">
            Foydalanuvchilar Boshqaruvi
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Jami {total} ta foydalanuvchi roʻyxatdan oʻtgan
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0071e3] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Yangi Foydalanuvchi</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki email boʻyicha qidirish..."
            className="h-10 w-full rounded-xl border border-border bg-secondary/30 pl-9 pr-20 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-secondary px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-secondary/80"
          >
            Qidiruv
          </button>
        </form>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: '', label: 'Barchasi' },
            { id: 'USER', label: 'Oʻquvchilar' },
            { id: 'TEACHER', label: 'Ustozlar' },
            { id: 'ADMIN', label: 'Adminlar' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setRoleFilter(tab.id);
                setPage(1);
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                roleFilter === tab.id
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Users Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                <th className="py-3.5 px-5 font-semibold">Foydalanuvchi</th>
                <th className="py-3.5 px-4 font-semibold">Rol</th>
                <th className="py-3.5 px-4 font-semibold">Holat</th>
                <th className="py-3.5 px-4 font-semibold">Qurilmalar</th>
                <th className="py-3.5 px-4 font-semibold">Sana</th>
                <th className="py-3.5 px-5 text-right font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground mb-2" />
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Hech qanday foydalanuvchi topilmadi
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} size="md" />
                        <div className="overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground truncate">
                              {u.fullName || u.email.split('@')[0]}
                            </p>
                            {u.avatarUrl?.includes('google') ? (
                              <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                Google
                              </span>
                            ) : u.avatarUrl ? (
                              <span className="shrink-0 rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400">
                                Profil rasmi
                              </span>
                            ) : (
                              <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Email OTP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-muted-foreground truncate">
                            <span>{u.email}</span>
                            {!u.fullName && (
                              <span className="text-[10px] text-muted-foreground/70">
                                (ism kiritilmagan)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">{getRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div>
                          {u.isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Tasdiqlangan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3 w-3" />
                              <span>Kutilmoqda</span>
                            </span>
                          )}
                        </div>
                        <div>
                          {u.activeDevicesCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Faol ({u.activeDevicesCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                              Hali kirmagan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Devices */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewDevices(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{u.activeDevicesCount} ta qurilma</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-muted-foreground text-[12px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Tahrirlash"
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteUser(u)}
                          disabled={u.id === currentUser?.id}
                          title={u.id === currentUser?.id ? "Oʻzingizni oʻchira olmaysiz" : "Oʻchirish"}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-secondary/20">
            <p className="text-[12px] text-muted-foreground">
              Koʻrsatilmoqda: <strong>{(page - 1) * limit + 1}</strong> -{' '}
              <strong>{Math.min(page * limit, total)}</strong> / <strong>{total}</strong> ta
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-[12px] font-semibold text-foreground">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Modal: CREATE USER */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="headline text-[18px] font-bold text-foreground">
                Yangi Foydalanuvchi Qoʻshish
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Email manzil *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="h-10 w-full rounded-xl border border-border bg-secondary/30 px-3.5 text-[13px] text-foreground outline-none focus:border-primary focus:bg-card"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Toʻliq ismi (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ali Valiyev"
                  className="h-10 w-full rounded-xl border border-border bg-secondary/30 px-3.5 text-[13px] text-foreground outline-none focus:border-primary focus:bg-card"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Foydalanuvchi roli
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-secondary/30 px-3.5 text-[13px] text-foreground outline-none focus:border-primary focus:bg-card"
                >
                  <option value="USER">Oʻquvchi (USER)</option>
                  <option value="TEACHER">Ustoz (TEACHER)</option>
                  <option value="ADMIN">Admin (ADMIN)</option>
                  <option value="SUPER_ADMIN">Super Admin (SUPER_ADMIN)</option>
                </select>
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createVerified"
                    checked={formVerified}
                    onChange={(e) => setFormVerified(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#0071e3]"
                  />
                  <label htmlFor="createVerified" className="text-[13px] text-foreground select-none cursor-pointer">
                    Emailni avtomatik tasdiqlangan qilish
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 pl-6">
                  Belgilanmasa, foydalanuvchi hisobi birinchi marta tizimga kirguncha "Kutilmoqda" boʻladi.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={formBusy}
                  className="rounded-xl bg-[#0071e3] px-5 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {formBusy ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: EDIT USER */}
      {editUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="headline text-[18px] font-bold text-foreground">
                  Foydalanuvchini Tahrirlash
                </h3>
                <p className="text-[12px] text-muted-foreground">{editUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Toʻliq ismi
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ali Valiyev"
                  className="h-10 w-full rounded-xl border border-border bg-secondary/30 px-3.5 text-[13px] text-foreground outline-none focus:border-primary focus:bg-card"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Avatar (Profil rasmi)
                </label>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={formAvatarUrl || undefined}
                    name={formName}
                    email={editUser.email}
                    size="lg"
                  />
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formAvatarUrl}
                      onChange={(e) => setFormAvatarUrl(e.target.value)}
                      placeholder="https://... yoki /uploads/..."
                      className="h-10 w-full rounded-xl border border-border bg-secondary/30 px-3.5 text-[13px] text-foreground outline-none focus:border-primary focus:bg-card"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Rasm havolasini kiriting yoki boʻsh qoldiring
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Foydalanuvchi roli
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-secondary/30 px-3.5 text-[13px] text-foreground outline-none focus:border-primary focus:bg-card"
                >
                  <option value="USER">Oʻquvchi (USER)</option>
                  <option value="TEACHER">Ustoz (TEACHER)</option>
                  <option value="ADMIN">Admin (ADMIN)</option>
                  <option value="SUPER_ADMIN">Super Admin (SUPER_ADMIN)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editVerified"
                  checked={formVerified}
                  onChange={(e) => setFormVerified(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#0071e3]"
                />
                <label htmlFor="editVerified" className="text-[13px] text-foreground select-none">
                  Hisob tasdiqlangan (isVerified)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-xl border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-secondary"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={formBusy}
                  className="rounded-xl bg-[#0071e3] px-5 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {formBusy ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: DELETE CONFIRMATION */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="headline text-[18px] font-bold text-foreground">
              Foydalanuvchini oʻchirish
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              Haqiqatan ham <strong className="text-foreground">{deleteUser.email}</strong> hisobini va unga tegishli barcha maʼlumotlarni oʻchirmoqchimisiz?
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="rounded-xl border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-secondary"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={formBusy}
                onClick={handleDeleteSubmit}
                className="rounded-xl bg-destructive px-5 py-2 text-[13px] font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {formBusy ? 'Oʻchirilmoqda...' : 'Oʻchirish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: VIEW DEVICE SESSIONS */}
      {viewDevicesUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="headline text-[18px] font-bold text-foreground">
                  Ulangan Qurilmalar
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  {viewDevicesUser.user.email} · {viewDevicesUser.sessions.length} ta faol sessiya
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewDevicesUser(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {viewDevicesUser.sessions.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-muted-foreground">
                  Faol qurilmalar mavjud emas
                </p>
              ) : (
                viewDevicesUser.sessions.map((s) => (
                  <div
                    key={s.deviceId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-secondary/30 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground">
                        {s.os?.toLowerCase().includes('windows') || s.os?.toLowerCase().includes('mac') ? (
                          <Laptop className="h-4 w-4" />
                        ) : (
                          <Smartphone className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">
                          {s.deviceName || `${s.browser || 'Brauzer'} (${s.os || 'Nomaʼlum'})`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          IP: {s.ipAddress || 'Lokal'} · Faollik:{' '}
                          {new Date(s.lastActiveAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeDevice(viewDevicesUser.user.id, s.deviceId)}
                      className="rounded-lg bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
                    >
                      Bekor qilish
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setViewDevicesUser(null)}
                className="rounded-xl border border-border px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-secondary"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
