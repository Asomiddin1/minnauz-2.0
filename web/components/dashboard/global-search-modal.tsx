'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  BookOpen,
  BookA,
  Type,
  GraduationCap,
  Sparkles,
  Bot,
  Crown,
  Store,
  Compass,
  ArrowRight,
  Loader2,
  Lock,
  CornerDownLeft,
  Command,
} from 'lucide-react';
import { api, GlobalSearchResult } from '@/lib/api';
import { useLang } from '@/lib/i18n';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = 'ALL' | 'LESSONS' | 'VOCAB' | 'KANJI' | 'TESTS' | 'PAGES';

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { lang, t } = useLang();
  const sDict = t?.globalSearch;

  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategory>('ALL');
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<GlobalSearchResult | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Auto-focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setData(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or header
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  React.useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      // Load default quick pages
      api.globalSearch('').then((res) => {
        setData(res);
        setLoading(false);
      });
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      api
        .globalSearch(query)
        .then((res) => {
          setData(res);
          setSelectedIndex(0);
        })
        .catch((err) => {
          console.error('Search error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Flatten items for arrow key navigation based on active category
  const flatItems = React.useMemo(() => {
    if (!data) return [];
    const res = data.results;
    const items: {
      type: 'lesson' | 'vocab' | 'kanji' | 'test' | 'page' | 'course';
      id: string;
      title: string;
      subtitle?: string;
      badge?: string;
      url: string;
      extra?: any;
    }[] = [];

    // Lessons
    if (selectedCategory === 'ALL' || selectedCategory === 'LESSONS') {
      res.lessons.forEach((l) => {
        items.push({
          type: 'lesson',
          id: `lesson-${l.id}`,
          title: l.title,
          subtitle: `${l.courseTitle} • ${l.japaneseTitle || (sDict?.orderLesson || `${l.order}-dars`).replace('{order}', String(l.order))}`,
          badge: l.courseLevel,
          url: `/${lang}/dashboard/courses/${l.courseId}/lessons/${l.id}`,
          extra: l,
        });
      });
    }

    // Vocab (Kotoba)
    if (selectedCategory === 'ALL' || selectedCategory === 'VOCAB') {
      res.vocab.forEach((v) => {
        items.push({
          type: 'vocab',
          id: `vocab-${v.id}`,
          title: v.word,
          subtitle: `${v.furigana ? `[${v.furigana}] ` : ''}${v.meaningUz}`,
          badge: v.courseLevel,
          url: `/${lang}/dashboard?tab=vocab`,
          extra: v,
        });
      });
    }

    // Kanji
    if (selectedCategory === 'ALL' || selectedCategory === 'KANJI') {
      res.kanji.forEach((k) => {
        items.push({
          type: 'kanji',
          id: `kanji-${k.id}`,
          title: k.character,
          subtitle: `${k.onyomi ? `音: ${k.onyomi} ` : ''}${k.meaningUz}`,
          badge: k.courseLevel,
          url: `/${lang}/dashboard?tab=kanji`,
          extra: k,
        });
      });
    }

    // Tests
    if (selectedCategory === 'ALL' || selectedCategory === 'TESTS') {
      res.tests.forEach((t) => {
        const minLabel = sDict?.minutes ? sDict.minutes.replace('{minutes}', '').trim() : 'daqiqa';
        items.push({
          type: 'test',
          id: `test-${t.id}`,
          title: t.title,
          subtitle: `JLPT ${t.level} • ${t.durationMinutes} ${minLabel}`,
          badge: t.level,
          url: `/${lang}/dashboard/tests/${t.slug}`,
          extra: t,
        });
      });
    }

    // Pages & Navigation
    if (selectedCategory === 'ALL' || selectedCategory === 'PAGES') {
      res.pages.forEach((p) => {
        items.push({
          type: 'page',
          id: `page-${p.id}`,
          title: p.title,
          subtitle: p.subtitle,
          badge: sDict?.pageBadge || 'Boʻlim',
          url: p.url.startsWith('/') ? `/${lang}${p.url}` : p.url,
          extra: p,
        });
      });
    }

    return items;
  }, [data, selectedCategory, lang, sDict]);

  // Keyboard navigation inside results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flatItems[selectedIndex];
      if (target) {
        handleNavigate(target.url);
      }
    }
  };

  const handleNavigate = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-20 bg-black/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center gap-3">
          <div className="text-primary shrink-0">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={sDict?.placeholder || 'Platformadan qidiring: darslar, soʻzlar, kanji, testlar...'}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/70 outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border border-border bg-secondary/60 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 border-b border-border/40 bg-secondary/30 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: sDict?.catAll || 'Barchasi' },
            { id: 'LESSONS', label: sDict?.catLessons || '📚 Darslar' },
            { id: 'VOCAB', label: sDict?.catVocab || '📖 Lugʻat' },
            { id: 'KANJI', label: sDict?.catKanji || '🈸 Kanji' },
            { id: 'TESTS', label: sDict?.catTests || '📝 Testlar' },
            { id: 'PAGES', label: sDict?.catPages || '🧭 Sahifalar' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id as SearchCategory);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-foreground text-background font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {flatItems.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-bold text-foreground">{sDict?.emptyTitle || 'Hech narsa topilmadi'}</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {query
                  ? (sDict?.emptyDescQuery || '«{query}» boʻyicha natija topilmadi. Boshqa soʻz bilan urinib koʻring.').replace('{query}', query)
                  : (sDict?.emptyDescNoQuery || 'Qidiruv soʻzini kiriting.')}
              </p>
            </div>
          ) : (
            flatItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigate(item.url)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/25 shadow-2xs'
                      : 'hover:bg-secondary/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon by Type */}
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 font-bold ${
                        item.type === 'lesson'
                          ? 'bg-blue-500/15 text-blue-500'
                          : item.type === 'vocab'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : item.type === 'kanji'
                          ? 'bg-amber-500/15 text-amber-500 font-japanese text-lg'
                          : item.type === 'test'
                          ? 'bg-purple-500/15 text-purple-500'
                          : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {item.type === 'lesson' && <BookOpen className="h-4 w-4" />}
                      {item.type === 'vocab' && <BookA className="h-4 w-4" />}
                      {item.type === 'kanji' && <span>{item.title}</span>}
                      {item.type === 'test' && <GraduationCap className="h-4 w-4" />}
                      {item.type === 'page' && <Compass className="h-4 w-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold truncate ${
                            item.type === 'kanji'
                              ? 'font-japanese text-base'
                              : 'text-foreground'
                          }`}
                        >
                          {item.title}
                        </span>

                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-secondary text-muted-foreground shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <span>{sDict?.btnGo || 'Oʻtish'}</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="p-3 border-t border-border/40 bg-secondary/20 flex items-center justify-between text-[11px] text-muted-foreground px-4">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-card border border-border text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.2 rounded bg-card border border-border text-[10px] font-mono">
                ↓
              </kbd>
              <span>{sDict?.navigateHint || 'harakatlanish'}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-card border border-border text-[10px] font-mono">
                ↵
              </kbd>
              <span>{sDict?.selectHint || 'tanlash'}</span>
            </span>
          </div>

          <span>
            {flatItems.length > 0 && (sDict?.resultsCount || '{count} ta natija').replace('{count}', String(flatItems.length))}
          </span>
        </div>
      </div>
    </div>
  );
}
