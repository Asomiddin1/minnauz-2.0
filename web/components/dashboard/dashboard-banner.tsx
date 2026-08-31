'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-border bg-card shadow-xs min-h-[430px] sm:min-h-[320px] md:min-h-[290px] flex items-center group">
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
            {/* 1. Full Height Image: Mobilda pastga markazlashgan, Desktopda o'ngga mahkamlangan */}
            {slide.image ? (
              <div className="absolute inset-0 z-0">
                <Image
                  src={getMediaUrl(slide.image)}
                  alt={slide.title}
                  fill
                  unoptimized
                  priority={index === 0}
                  className="object-contain sm:object-cover object-bottom sm:object-right md:object-right-center"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/15 via-background to-secondary/30" />
            )}

            {/* 2. Responsive Seamless Gradient:
                - Mobilda: Tepadan pastga qarab gradient (matn tepada ochiq turadi, rasm pastda ko'rinadi)
                - Desktopda (sm+): Chapdan o'ngga qarab silliq gradient (matn chapda, rasm o'ngda)
            */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-card via-card/85 via-50% to-transparent sm:hidden" />
            <div className="hidden sm:block absolute inset-0 z-[1] bg-gradient-to-r from-card via-card/95 via-45% to-transparent" />

            {/* 3. Matn va tugmalar qismi */}
            <div className="relative z-10 h-full flex flex-col justify-start sm:justify-center p-6 sm:p-9 md:p-11 max-w-full sm:max-w-[70%] md:max-w-[58%] lg:max-w-[52%]">
              <div
                className={`space-y-3 sm:space-y-4 transition-all duration-700 delay-100 ${
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                {slide.tag && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 backdrop-blur-md px-3.5 py-1 text-[12px] font-semibold text-foreground shadow-xs">
                      {TagIcon && <TagIcon className="h-3.5 w-3.5 text-[#0071e3]" />}
                      <span>{slide.tag}</span>
                    </div>
                  </div>
                )}

                <h2 className="text-[22px] sm:text-[30px] md:text-[34px] font-bold tracking-tight text-foreground leading-[1.2]">
                  {slide.title}
                </h2>

                {slide.desc && (
                  <p className="text-[13px] sm:text-[15px] text-muted-foreground leading-relaxed font-medium line-clamp-2 sm:line-clamp-3">
                    {slide.desc}
                  </p>
                )}

                {Boolean(slide.btnText && slide.btnText.trim()) && (
                  <div className="pt-1 sm:pt-2">
                    {slide.actionType === 'LINK' && slide.btnUrl ? (
                      <Link href={slide.btnUrl}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 sm:px-7 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-semibold text-white transition-all hover:bg-[#005bb5] active:scale-[0.98] shadow-md cursor-pointer"
                        >
                          {BtnIcon && <BtnIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />}
                          <span>{slide.btnText}</span>
                        </button>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-6 sm:px-7 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-semibold text-white transition-all hover:bg-[#005bb5] active:scale-[0.98] shadow-md cursor-pointer"
                      >
                        {BtnIcon && <BtnIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />}
                        <span>{slide.btnText}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                className="absolute top-4 right-4 z-30 grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur-md border border-border/80 text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer shadow-xs"
              >
                <X className="h-4 w-4" />
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
            onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            aria-label="Oldingi slayd"
            className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/70 backdrop-blur-md border border-border shadow-xs items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            aria-label="Keyingi slayd"
            className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/70 backdrop-blur-md border border-border shadow-xs items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-background cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-4 left-6 sm:left-9 md:left-11 z-30 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slayd ${i + 1}`}
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeSlide ? 'w-7 bg-[#0071e3]' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}