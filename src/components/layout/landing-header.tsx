
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LandingPageLogo } from '@/components/layout/landing-logo';

export const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-md border-b border-slate-800" : "bg-transparent"
    )}>
      <LandingPageLogo />
      <nav className="flex items-center gap-2">
        <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
      </nav>
    </header>
  );
};
