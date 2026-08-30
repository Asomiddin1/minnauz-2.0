'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api, TestSubmitResponse } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { TestResultsView } from '@/components/dashboard/tests/test-results-view';

export default function TestResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const resultId = params.resultId as string;

  const [result, setResult] = React.useState<TestSubmitResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!resultId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .getJlptTestResult(resultId)
      .then((data: any) => {
        if (mounted) {
          setResult(data);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err?.message || 'Test natijasini yuklashda xatolik yuz berdi');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Natijalar tahlili yuklanmoqda...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-3xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-base font-bold text-foreground">Natija topilmadi</h2>
        <p className="text-xs text-muted-foreground">{error || 'Ushbu test natijasi mavjud emas yoki oʻchirilgan'}</p>
        <Link
          href={`/${lang}/dashboard/tests`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Testlar roʻyxatiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <TestResultsView
        result={result}
        onRetake={() => {
          const slug = (result as any).testSlug;
          if (slug) {
            router.push(`/${lang}/dashboard/tests/${slug}`);
          } else {
            router.push(`/${lang}/dashboard/tests`);
          }
        }}
      />
    </div>
  );
}
