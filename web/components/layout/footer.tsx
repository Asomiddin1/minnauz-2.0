'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { useLanguage } from '@/components/providers/language-provider';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t.heroSubtitle}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t.footerPlatform}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#courses" className="hover:text-foreground transition-colors">{t.courses}</Link></li>
              <li><Link href="#jlpt" className="hover:text-foreground transition-colors">{t.jlpt}</Link></li>
              <li><Link href="#ai-speaking" className="hover:text-foreground transition-colors">{t.aiSpeaking}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t.footerCompany}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-foreground transition-colors">{t.about}</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">{t.contact}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t.footerLegal}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">{t.privacy}</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">{t.terms}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t.footerText}</p>
          <div className="mt-4 md:mt-0">
            {/* Additional bottom links or localized selectors if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
