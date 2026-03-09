import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'mark' | 'wordmark';
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = '', variant = 'full' }) => {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'mark' ? className : ''}
      aria-label="GitForge AI logo mark"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4d55e5" />
          <stop offset="100%" stopColor="#6272f1" />
        </linearGradient>
        <linearGradient id="logo-icon" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c7d7fd" stopOpacity="0.9" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="48" height="48" rx="12" fill="url(#logo-bg)" />

      {/* Subtle inner highlight */}
      <rect x="1" y="1" width="46" height="23" rx="11.5" fill="white" fillOpacity="0.05" />

      {/* Graph nodes */}
      <circle cx="24" cy="11" r="3.5" fill="url(#logo-icon)" />
      <circle cx="12" cy="31" r="3.5" fill="url(#logo-icon)" />
      <circle cx="36" cy="31" r="3.5" fill="url(#logo-icon)" />

      {/* Connection lines */}
      <line x1="24" y1="14.5" x2="12" y2="27.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="24" y1="14.5" x2="36" y2="27.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="15.5" y1="31" x2="32.5" y2="31" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Center merge marker */}
      <circle cx="24" cy="31" r="2.2" fill="white" fillOpacity="0.35" />

      {/* Bolt / spark */}
      <path
        d="M27 17.5l-4.5 8h4l-2.5 7.5 7-10.5h-4.5l1.5-5z"
        fill="white"
        fillOpacity="0.95"
        filter="url(#logo-glow)"
      />
    </svg>
  );

  if (variant === 'mark') return mark;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {mark}
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-surface-900">
            Git<span className="text-forge-600">Forge</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-400 mt-0.5">
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
