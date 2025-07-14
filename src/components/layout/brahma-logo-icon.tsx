import * as React from 'react';
import { cn } from '@/lib/utils';

export const BrahmaLogoIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('h-8 w-8', className)}
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent))" />
      </linearGradient>
    </defs>
    {/* Outer brain-like shape */}
    <path
      d="M24 4C14.0589 4 6 12.0589 6 22C6 31.9411 14.0589 40 24 40C28.4716 40 32.553 38.4326 35.6569 35.8883"
      stroke="url(#logo-gradient)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M24 44C33.9411 44 42 35.9411 42 26C42 16.0589 33.9411 8 24 8C19.5284 8 15.447 9.56739 12.3431 12.1117"
      stroke="url(#logo-gradient)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Inner core/node */}
    <circle cx="24" cy="24" r="4" fill="url(#logo-gradient)" />
  </svg>
);
