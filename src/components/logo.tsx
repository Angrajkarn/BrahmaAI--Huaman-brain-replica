
import { BrahmaLogoIcon } from '@/components/layout/brahma-logo-icon';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
  isLink?: boolean;
}

export function Logo({
  className,
  iconSize = 28,
  textSize = "text-2xl",
  showText = true,
  isLink = true, // Default to true for general use
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <BrahmaLogoIcon style={{ height: iconSize, width: iconSize }} />
      {showText && (
        <span className={`font-headline font-bold ${textSize} gradient-text group-data-[state=collapsed]:hidden`}>
          Brahma
        </span>
      )}
    </div>
  );

  if (isLink) {
    return <Link href="/dashboard" className="flex items-center gap-2">{content}</Link>;
  }

  return content;
}
