import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <div className="relative inline-flex items-center justify-center shrink-0 h-7 w-7">
        <Image
          src="/logo.png"
          alt="MinnaUz Logo"
          width={32}
          height={32}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <span className="text-[19px] font-semibold tracking-[-0.045em] text-foreground">
        MinnaUz
      </span>
    </Link>
  );
}
