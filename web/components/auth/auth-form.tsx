'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

import { useLanguage } from '@/components/providers/language-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';

export function AuthForm() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [step, setStep] = React.useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Mock API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) return; // simple mock validation
    
    setIsLoading(true);
    // Mock API call to verify OTP
    setTimeout(() => {
      setIsLoading(false);
      router.push(`/${language}/dashboard`);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    // Mock Google Login
    router.push(`/${language}/dashboard`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left side - Branding/Illustration (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col justify-between bg-primary/5 p-12 lg:p-24 border-r">
        <div>
          <Logo />
          <h2 className="mt-8 text-3xl lg:text-4xl font-bold tracking-tight">
            Yapon tilini <br />
            <span className="text-primary">MinnaUz</span> bilan o'rganing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">
            JLPT ga tayyorgarlik, video darslar va AI Speaking Teacher orqali til o'rganishni keyingi bosqichga olib chiqing.
          </p>
        </div>
        
        <div className="relative w-full max-w-md aspect-square mx-auto bg-gradient-to-tr from-primary/20 to-transparent rounded-full flex items-center justify-center">
           <span className="text-9xl font-bold text-primary/30">あ</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t.footerText}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 relative">
        
        {/* Mobile Logo & Back */}
        <div className="flex md:hidden items-center justify-between mb-8">
          <Logo />
        </div>

        <Link href={`/${language}`} className="absolute top-8 right-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.home}
        </Link>

        <div className="w-full max-w-sm mx-auto md:mx-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Xush kelibsiz
            </h1>
            <p className="text-muted-foreground">
              {step === 'email' 
                ? 'Tizimga kirish uchun elektron pochtangizni kiriting.' 
                : `${email} manziliga yuborilgan 4 xonali kodni kiriting.`}
            </p>
          </div>

          {step === 'email' ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !email}>
                {isLoading ? 'Yuborilmoqda...' : 'Kodni olish'}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Yoki
                  </span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleGoogleLogin}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google orqali kirish
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="space-y-2">
                <Label htmlFor="otp">Tasdiqlash kodi</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="1234" 
                    maxLength={4}
                    className="pl-10 tracking-widest text-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required 
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || otp.length !== 4}>
                {isLoading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
              </Button>
              
              <div className="text-center pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep('email')} 
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Boshqa email kiritish
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
