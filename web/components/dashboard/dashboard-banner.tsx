'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Target, X } from 'lucide-react';
import { NotificationItem, getMediaUrl } from '@/lib/api';

export interface DashboardSlide {
  id: string | number;
  tag: string;
  tagIcon: any;
  title: string;
  desc: string;
  btnText: string;
  btnUrl: string | null;
  btnIcon: any;
  image: string;
  actionType?: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';
  notification?: NotificationItem | null;
  isDismissible?: boolean;
}

interface DashboardBannerProps {
  slides: DashboardSlide[];
  onOpenPlan: () => void;
  onOpenNotification?: (notification: NotificationItem) => void;
  onDismissSlide?: (slideId: string | number) => void;
}

export function DashboardBanner({
  slides,
  onOpenPlan,
  onOpenNotification,
  onDismissSlide,
}: DashboardBannerProps) {
  const [activeSlide, setActiveSlide] = React.useState(0);

  // Keep activeSlide within valid range
  React.useEffect(() => {
    if (activeSlide >= slides.length && slides.length > 0) {
      setActiveSlide(0);
    }
  }, [slides.length, activeSlide]);

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-xs min-h-[360px] sm:min-h-[300px] flex items-center group">
      {slides.map((slide, index) => {
        const TagIcon = slide.tagIcon;
        const BtnIcon = slide.btnIcon;
        const isActive = index === activeSlide;

        const handleButtonClick = () => {
          if (slide.actionType === 'PLAN_MODAL') {
            onOpenPlan();
          } else if (slide.actionType === 'NOTIFICATION_DETAIL' && slide.notification && onOpenNotification) {
            onOpenNotification(slide.notification);
          } else if (!slide.btnUrl) {
            onOpenPlan();
          }
        };

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image or Gradient */}
            {slide.image ? (
              <Image
                src={getMediaUrl(slide.image)}
                alt={slide.title}
                fill
                unoptimized
                priority={index === 0}
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3]/20 via-background to-secondary/40" />
            )}

            {/* MOBILE OVERLAY FIX: Telefonda shaffof (to-transparent), Desktopda to'qroq */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent md:from-background/95 md:via-background/80 md:to-background/30 dark:from-background/85 dark:via-background/40 dark:to-transparent dark:md:from-background dark:md:via-background/90 dark:md:to-background/40" />

            {/* Dismiss "X" Button */}
            {slide.isDismissible && onDismissSlide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismissSlide(slide.id);
                }}
                aria-label="Bannerni yopish"
                title="Bannerni yopish"
                className="absolute top-4 right-4 z-30 grid h-8 w-8 place-items-center rounded-full bg-background/60 backdrop-blur-md border border-border/80 text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer shadow-xs"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="relative z-20 h-full flex flex-col justify-center p-6 sm:p-10 w-full md:w-3/4 lg:w-2/3">
              <div
                className={`space-y-5 transition-all duration-700 delay-100 ${
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm px-3.5 py-1 text-[12px] font-semibold text-foreground">
                    <TagIcon className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>{slide.tag}</span>
                  </div>
                </div>

                <h1 className="headline text-[28px] sm:text-[38px] font-bold tracking-tight text-foreground leading-[1.15]">
                  {slide.title}
                </h1>

                <p className="text-[15px] sm:text-[16px] text-foreground/80 leading-relaxed max-w-lg font-medium drop-shadow-sm line-clamp-3">
                  {slide.desc}
                </p>

                {/* Optional Action Button */}
                {Boolean(slide.btnText && slide.btnText.trim()) && (
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    {slide.actionType === 'LINK' && slide.btnUrl ? (
                      <Link href={slide.btnUrl}>
                        <button className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-7 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#005bb5] active:scale-[0.98] shadow-md cursor-pointer">
                          {BtnIcon && <BtnIcon className="h-4.5 w-4.5" />}
                          <span>{slide.btnText}</span>
                        </button>
                      </Link>
                    ) : (
                      <button
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-7 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#005bb5] active:scale-[0.98] shadow-md cursor-pointer"
                      >
                        {BtnIcon && <BtnIcon className="h-4.5 w-4.5" />}
                        <span>{slide.btnText}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border shadow-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-background/60 backdrop-blur-md border border-border shadow-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer shadow-sm ${
                  i === activeSlide ? 'w-8 bg-[#0071e3]' : 'w-2 bg-border/80 hover:bg-border backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}