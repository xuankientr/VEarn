import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizes = {
    sm: 56,    // footer
    md: 48,    // navigation header
    lg: 48,    // navigation header (same as md)
    xl: 120,   // standalone pages (login/register)
  };

  const height = sizes[size];

  const content = (
    <Image
      src="/logo.png"
      alt="VEarn"
      width={height * 3}
      height={height}
      className="h-auto"
      style={{ width: 'auto', height: height }}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="VEarn"
      width={size * 3}
      height={size}
      className="h-auto"
      style={{ width: 'auto', height: size }}
      priority
    />
  );
}
