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

export interface UserAvatarProps {
  user?: {
    fullName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
  src?: string | null;
  name?: string | null;
  email?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

const SIZE_CONFIG = {
  xs: { box: 'h-6 w-6', text: 'text-[10px]' },
  sm: { box: 'h-8 w-8', text: 'text-[11px]' },
  md: { box: 'h-9 w-9', text: 'text-[12px]' },
  lg: { box: 'h-11 w-11', text: 'text-[14px]' },
  xl: { box: 'h-14 w-14', text: 'text-[18px]' },
  '2xl': { box: 'h-16 w-16', text: 'text-[22px]' },
};

export function UserAvatar({
  user,
  src,
  name,
  email,
  alt,
  size = 'md',
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

  // Reset imgError if resolvedUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [resolvedUrl]);

  const sizeStyle = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt={alt || displayName || displayEmail || 'Avatar'}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgError(true)}
        className={`${sizeStyle.box} shrink-0 rounded-full object-cover border border-border/80 shadow-xs ${className} ${imgClassName}`}
      />
    );
  }

  return (
    <div
      title={displayName || displayEmail || undefined}
      className={`${sizeStyle.box} ${sizeStyle.text} grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white shadow-xs select-none ${className} ${fallbackClassName}`}
    >
      {initials}
    </div>
  );
}
