'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Send,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function TeacherAnnouncementsPage() {
  const { lang, t } = useLang();

  const [courses, setCourses] = React.useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const res = await api.getTeacherCourses();
        setCourses(res || []);
        if (res && res.length > 0) {
          setSelectedCourseId(res[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses for announcement', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !title.trim() || !message.trim()) return;
    try {
      setSubmitting(true);
      const res = await api.sendTeacherAnnouncement({
        courseId: selectedCourseId,
        title: title.trim(),
        message: message.trim(),
      });

      setFeedbackMsg({
        type: 'success',
        text: res.message || 'Eʼlon barcha talabalarga muvaffaqiyatli yuborildi!',
      });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground">
          Yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            <Bell className="h-3.5 w-3.5" />
            <span>Xabarnomalar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Kurs Talabalariga Eʼlon Yuborish
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Oʻz kursingizdagi barcha oʻquvchilarga tezkor yangiliklar, qoʻshimcha vazifalar yoki dars oʻzgarishlari haqida bildirishnoma yuboring.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Card */}
      {courses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Sizda biriktirilgan kurslar yoʻq</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Eʼlon yuborish uchun avval sizga kurs biriktirilgan boʻlishi kerak.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleSendAnnouncement} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                Kursni tanlang:
              </label>
              <select
                required
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border/60 bg-secondary/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Eʼlon sarlavhasi:
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: 3-dars yangilandi yoki Shanba kungi jonli muloqot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Eʼlon matni:
              </label>
              <textarea
                required
                rows={5}
                placeholder="Talabalarga yetkazmoqchi boʻlgan toʻliq xabar matningiz..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground">
                Ushbu eʼlon kursning barcha faol oʻquvchilari bildirishnomalar paneliga avtomatik yuboriladi.
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !message.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Yuborilmoqda...' : 'Eʼlonni barcha oʻquvchilarga yuborish'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
