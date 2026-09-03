'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MessageSquare,
  BookOpen,
  Award,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { api, TeacherStudentItem } from '@/lib/api';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function TeacherStudentsPage() {
  const { lang, t } = useLang();

  const [students, setStudents] = React.useState<TeacherStudentItem[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = React.useState('');

  // Feedback modal
  const [feedbackStudent, setFeedbackStudent] = React.useState<TeacherStudentItem | null>(null);
  const [feedbackTitle, setFeedbackTitle] = React.useState('');
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [feedbackRating, setFeedbackRating] = React.useState<number>(5);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        api.getTeacherStudents({
          courseId: selectedCourseFilter || undefined,
          search: search.trim() || undefined,
        }),
        api.getTeacherCourses(),
      ]);
      setStudents(studentsRes || []);
      setCourses(coursesRes || []);
    } catch (err: any) {
      console.error('Failed to load teacher students', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseFilter, search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackStudent || !feedbackComment.trim()) return;
    try {
      setSubmitting(true);
      await api.sendTeacherFeedback({
        studentId: feedbackStudent.studentId,
        courseId: feedbackStudent.courseId,
        title: feedbackTitle.trim() || 'Ustozingizdan yangi baho va fikr-mulohaza',
        comment: feedbackComment.trim(),
        rating: Number(feedbackRating) || 5,
      });

      setFeedbackMsg({
        type: 'success',
        text: `${feedbackStudent.fullName} ga fikr-mulohaza va bildirishnoma muvaffaqiyatli yuborildi!`,
      });
      setFeedbackStudent(null);
      setFeedbackTitle('');
      setFeedbackComment('');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Xatolik yuz berdi' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            <Users className="h-3.5 w-3.5" />
            <span>Oʻquvchilar Monitoringi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Oʻquvchilarim va Progress Tahlili
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Kurslaringizda taʼlim olayotgan oʻquvchilar, darslarni oʻzlashtirish foizi va ularga shaxsiy tahliliy izoh (Feedback) yuboring.
          </p>
        </div>
      </div>

      {/* Alert */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Oʻquvchi ismi yoki emaili..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border/60 bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Course Filter dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-border/60 bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Barcha kurslar oʻquvchilari</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            Oʻquvchilar yuklanmoqda...
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-secondary/10 space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">Oʻquvchilar topilmadi</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Hozircha kurslaringizda darslarni boshlagan oʻquvchilar mavjud emas.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground font-bold text-[11px]">
                  <th className="py-3 px-4">Oʻquvchi</th>
                  <th className="py-3 px-4">Kurs</th>
                  <th className="py-3 px-4 text-center">Yakunlangan darslar</th>
                  <th className="py-3 px-4">Oʻzlashtirish foizi</th>
                  <th className="py-3 px-4 text-center">Oxirgi faollik</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {students.map((student) => (
                  <tr
                    key={`${student.studentId}_${student.courseId}`}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={student.avatarUrl}
                          name={student.fullName}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">
                            {student.fullName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black border border-primary/20">
                          {student.courseLevel}
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[180px]">
                          {student.courseTitle}
                        </span>
                      </div>
                    </td>

                    {/* Completed lessons */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-foreground">
                        {student.completedLessonsCount}
                      </span>
                      <span className="text-muted-foreground">
                        /{student.totalLessonsCount}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 w-36">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-primary">
                            {student.progressPercent}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Last activity */}
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {new Date(student.lastActivityAt).toLocaleDateString(
                        lang === 'uz' ? 'uz-UZ' : 'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackStudent(student);
                          setFeedbackTitle('Ustozingizdan tavsiya va baho 🎓');
                          setFeedbackComment('');
                          setFeedbackRating(5);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Feedback berish</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Talabaga Feedback yuborish
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackStudent(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/40 text-xs space-y-0.5">
              <p className="text-muted-foreground">Oʻquvchi:</p>
              <p className="font-bold text-foreground">{feedbackStudent.fullName}</p>
              <p className="text-[11px] text-muted-foreground">{feedbackStudent.courseTitle} ({feedbackStudent.progressPercent}% yakunlangan)</p>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Baho (Yulduzcha):</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 rounded-lg hover:bg-secondary cursor-pointer"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-muted-foreground ml-2">
                    {feedbackRating} / 5
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Mavzu / Sarlavha:</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Fikr-mulohaza, tavsiya va izoh:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Talabaning dars oʻzlashtirishi, xatoliklari yoki yutuqlari boʻyicha tavsiyalar..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Ushbu izoh talabaning profilinga va uning shaxsiy bildirishnomalariga yuboriladi.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting || !feedbackComment.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submitting ? 'Yuborilmoqda...' : 'Yuborish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
