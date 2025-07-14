
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { LandingPageLogo } from '@/components/layout/landing-logo';

export const LandingFooter = () => (
  <footer className="py-16 px-4 border-t border-slate-800 bg-background">
    <div className="container mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
          <LandingPageLogo />
           <p className="text-muted-foreground text-sm mt-3">A Human Brain Replica AI System</p>
           <div className="flex items-center gap-4 mt-6">
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors"><Github /></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></a>
           </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">For Business</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Business Overview</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Solutions</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Sales</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Safety</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/safety" className="text-muted-foreground hover:text-primary">Safety Approach</Link></li>
            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Security & Privacy</Link></li>
            <li><Link href="/safety" className="text-muted-foreground hover:text-primary">Trust & Transparency</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">More</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="text-muted-foreground hover:text-primary">News</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Stories</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Livestreams</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Podcast</Link></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Terms & Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Use</Link></li>
            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/safety" className="text-muted-foreground hover:text-primary">Security</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-primary">Other Policies</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-800 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Brahma AI. All rights reserved.
      </div>
    </div>
  </footer>
);
