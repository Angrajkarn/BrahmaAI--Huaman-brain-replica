
import Link from 'next/link';
import { BrahmaLogoIcon } from '@/components/layout/brahma-logo-icon';

export const LandingPageLogo = () => (
    <Link href="/" className="flex items-center gap-3 group" aria-label="Brahma Home">
      <BrahmaLogoIcon className="h-8 w-8 group-hover:opacity-80 transition-opacity" />
      <div>
        <h1 className="font-bold text-2xl gradient-text leading-tight">Brahma</h1>
        <p className="text-xs text-muted-foreground leading-tight -mt-0.5 group-hover:text-foreground transition-colors">Your Brain Replica</p>
      </div>
    </Link>
);
