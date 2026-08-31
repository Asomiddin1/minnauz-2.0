'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { NotificationItem, getMediaUrl } from '@/lib/api';

export interface DashboardSlide {
  id: string | number;
  tag: string;
  tagIcon: any;
  title: string;
  desc: string;
  btnText: string;
  btnUrl?: string | null;
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
    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] border border-border bg-card shadow-xs aspect-[16/7] xs:aspect-[16/6.5] sm:aspect-[21/8] md:aspect-[24/8] min-h-[170px] xs:min-h-[190px] sm:min-h-[220px] md:min-h-[250px] flex items-center group">
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;

        const handleButtonClick = () => {
          if (slide.actionType === 'PLAN_MODAL') {
            onOpenPlan();
          } else if (slide.actionType === 'NOTIFICATION_DETAIL' && slide.notification && onOpenNotification) {
            onOpenNotification(slide.notification);
          } else if (slide.actionType === 'LINK' && slide.btnUrl) {
            window.location.href = slide.btnUrl;
          } else if (slide.notification && onOpenNotification) {
            onOpenNotification(slide.notification);
          } else if (!slide.btnUrl) {
            onOpenPlan();
          }
        };

        return (
          <div
            key={slide.id}
            onClick={handleButtonClick}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* 1. Full-bleed Image: Yozuv rasmning o'zida bo'lgani sababli, rasm hech qanday xiralashtirishsiz 100% toza ko'rinadi */}
            {slide.image ? (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                  src={getMediaUrl(slide.image)}
                  alt={slide.title || 'Banner'}
                  fill
                  unoptimized
                  priority={index === 0}
                  className="object-cover object-center"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/15 via-background to-secondary/30" />
            )}

            {/* 2. Sleek "Batafsil" Button (O'ng pastki burchakda) */}
            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-[13px] font-semibold transition-all border border-white/25 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{slide.btnText || 'Batafsil'}</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>

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
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-background/70 backdrop-blur-md border border-border/80 text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer shadow-xs"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
            }}
            aria-label="Oldingi slayd"
            className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/70 backdrop-blur-md border border-border shadow-xs items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide((prev) => (prev + 1) % slides.length);
            }}
            aria-label="Keyingi slayd"
            className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/70 backdrop-blur-md border border-border shadow-xs items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator (Chap pastki burchakda) */}
          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 z-30 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slayd ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(i);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer shadow-xs ${
                  i === activeSlide ? 'w-5 sm:w-7 bg-white' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}