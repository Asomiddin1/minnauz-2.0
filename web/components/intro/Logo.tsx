import Image from 'next/image'

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center mt-1 shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="MinnaUz Logo"
        width={40}
        height={40}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  )
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-10 w-10" />
      <span className="text-[19px] font-semibold tracking-[-0.045em] text-foreground">
        MinnaUz
      </span>
    </span>
  )
}