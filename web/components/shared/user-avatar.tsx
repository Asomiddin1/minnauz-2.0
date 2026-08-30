'use client';

import * as React from 'react';

export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Prepend backend origin if relative path (e.g. /uploads/...)
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const apiOrigin = rawApiUrl.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${apiOrigin}${cleanPath}`;
}

const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-purple-600 to-violet-700',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-600 to-blue-700',
];

function getGradient(seed: string): string {
  if (!seed) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const local = email.split('@')[0];
    return local.slice(0, 2).toUpperCase();
  }
  return 'U';
}

export interface FrameConfig {
  key: string;
  name: string;
  badge: string;
  description: string;
  gradientClass: string;
  shadowClass: string;
  badgeIcon?: string;
  badgePosition?: 'corner' | 'top-center';
}

export const AVATAR_FRAMES: Record<string, FrameConfig> = {
  FRAME_SAKURA: {
    key: 'FRAME_SAKURA',
    name: 'Sakura Bahori',
    badge: '🌸',
    description: 'Yapon bahori va nozik sakura gulbarglari',
    gradientClass: 'bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-200 ring-2 ring-pink-400/40',
    shadowClass: 'shadow-[0_0_12px_rgba(244,114,182,0.5)]',
    badgeIcon: '🌸',
    badgePosition: 'corner',
  },
  FRAME_SAMURAI: {
    key: 'FRAME_SAMURAI',
    name: 'Samuray Qilichi',
    badge: '⚔️',
    description: 'Oltin metall va katana jasorat ramzi',
    gradientClass: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 ring-2 ring-amber-400/40',
    shadowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.55)]',
    badgeIcon: '⚔️',
    badgePosition: 'corner',
  },
  FRAME_SHOGUN: {
    key: 'FRAME_SHOGUN',
    name: 'Shogun Imperator Toji',
    badge: '👑',
    description: 'Oliy darajadagi imperator toji va oltin shon-sharaf',
    gradientClass: 'bg-gradient-to-tr from-purple-600 via-amber-400 to-yellow-300 ring-2 ring-yellow-400/50',
    shadowClass: 'shadow-[0_0_16px_rgba(234,179,8,0.6)]',
    badgeIcon: '👑',
    badgePosition: 'top-center',
  },
  FRAME_CYBERPUNK: {
    key: 'FRAME_CYBERPUNK',
    name: 'Neon Tokio',
    badge: '⚡',
    description: 'Futuristik neon Tokio kiber-estetikasi',
    gradientClass: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-blue-500 ring-2 ring-cyan-400/50',
    shadowClass: 'shadow-[0_0_14px_rgba(6,182,212,0.6)]',
    badgeIcon: '⚡',
    badgePosition: 'corner',
  },
  FRAME_FIRE: {
    key: 'FRAME_FIRE',
    name: 'Olovli Ajdaho',
    badge: '🔥',
    description: 'Alangali quvvat va olovli gʻoliblik',
    gradientClass: 'bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 ring-2 ring-orange-500/50',
    shadowClass: 'shadow-[0_0_14px_rgba(239,68,68,0.6)]',
    badgeIcon: '🔥',
    badgePosition: 'corner',
  },
};

export interface UserAvatarProps {
  user?: {
    fullName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    avatarFrame?: string | null;
    role?: string | null;
    isPro?: boolean | null;
  } | null;
  src?: string | null;
  name?: string | null;
  email?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  frame?: string | null;
  showFrame?: boolean;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

const SIZE_CONFIG = {
  xs: { box: 'h-6 w-6', text: 'text-[10px]', framePad: 'p-[1.5px]', showBadge: false, badgeSize: 'text-[8px]' },
  sm: { box: 'h-8 w-8', text: 'text-[11px]', framePad: 'p-[2px]', showBadge: false, badgeSize: 'text-[9px]' },
  md: { box: 'h-9 w-9', text: 'text-[12px]', framePad: 'p-[2.5px]', showBadge: true, badgeSize: 'text-[10px]' },
  lg: { box: 'h-11 w-11', text: 'text-[14px]', framePad: 'p-[3px]', showBadge: true, badgeSize: 'text-[12px]' },
  xl: { box: 'h-14 w-14', text: 'text-[18px]', framePad: 'p-[3.5px]', showBadge: true, badgeSize: 'text-[14px]' },
  '2xl': { box: 'h-16 w-16', text: 'text-[22px]', framePad: 'p-[4px]', showBadge: true, badgeSize: 'text-[16px]' },
};

export function UserAvatar({
  user,
  src,
  name,
  email,
  alt,
  size = 'md',
  frame: frameProp,
  showFrame = true,
  className = '',
  imgClassName = '',
  fallbackClassName = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const rawUrl = src || user?.avatarUrl;
  const resolvedUrl = React.useMemo(() => getMediaUrl(rawUrl), [rawUrl]);

  const displayName = name || user?.fullName;
  const displayEmail = email || user?.email;
  const initials = React.useMemo(
    () => getInitials(displayName, displayEmail),
    [displayName, displayEmail]
  );
  const gradient = React.useMemo(
    () => getGradient(displayEmail || displayName || 'default'),
    [displayEmail, displayName]
  );

  // Active frame: Agar user ramkani yechgan bo'lsa (null / NONE), oddiy ramkasiz ko'rinadi
  const activeFrameKey = frameProp !== undefined ? frameProp : user?.avatarFrame;
  const activeFrameConfig =
    showFrame && activeFrameKey && activeFrameKey !== 'NONE' && activeFrameKey !== 'none'
      ? AVATAR_FRAMES[activeFrameKey]
      : null;

  // Reset imgError if resolvedUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [resolvedUrl]);

  const sizeStyle = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // Core inner Avatar (Image or Gradient Initials)
  const renderInnerAvatar = () => {
    if (resolvedUrl && !imgError) {
      return (
        <img
          src={resolvedUrl}
          alt={alt || displayName || displayEmail || 'Avatar'}
          referrerPolicy="no-referrer"
          onError={() => {
            console.warn('Avatar image load failed for URL:', resolvedUrl);
            setImgError(true);
          }}
          className={`${sizeStyle.box} shrink-0 rounded-full object-cover ${
            activeFrameConfig ? 'border border-card/40' : 'border border-border/80'
          } shadow-xs ${imgClassName}`}
        />
      );
    }

    return (
      <div
        title={displayName || displayEmail || undefined}
        className={`${sizeStyle.box} ${sizeStyle.text} grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white shadow-xs select-none ${fallbackClassName}`}
      >
        {initials}
      </div>
    );
  };

  // If no frame, return inner avatar directly
  if (!activeFrameConfig) {
    return <div className={`inline-flex shrink-0 rounded-full ${className}`}>{renderInnerAvatar()}</div>;
  }

  // If has frame, wrap with animated / styled gradient frame
  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}>
      <div
        className={`rounded-full ${sizeStyle.framePad} ${activeFrameConfig.gradientClass} ${activeFrameConfig.shadowClass} transition-all duration-300`}
      >
        {renderInnerAvatar()}
      </div>

      {/* Decorative Frame Badge / Icon */}
      {sizeStyle.showBadge && activeFrameConfig.badgeIcon && (
        activeFrameConfig.badgePosition === 'top-center' ? (
          <span
            className={`absolute -top-2 left-1/2 -translate-x-1/2 drop-shadow-md select-none ${sizeStyle.badgeSize} pointer-events-none animate-bounce duration-1000`}
          >
            {activeFrameConfig.badgeIcon}
          </span>
        ) : (
          <span
            className={`absolute -bottom-1 -right-1 drop-shadow-md select-none ${sizeStyle.badgeSize} pointer-events-none`}
          >
            {activeFrameConfig.badgeIcon}
          </span>
        )
      )}
    </div>
  );
}
