'use client';

import * as React from 'react';
import { Sparkles, Settings2, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export function AiLiveCallTab() {
  const { lang, t } = useLang();
  const [isAngry, setIsAngry] = React.useState(false);
  const [isMicMuted, setIsMicMuted] = React.useState(false);

  // Sinov uchun: Har 5 soniyada holat almashadi
  React.useEffect(() => {
    const interval = setInterval(() => setIsAngry((v) => !v), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 font-sans">
      
      {/* Header Banner - Sizning dizayningizga to'liq moslashtirilgan */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-red-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t?.ai?.title || 'AI Ustoz'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t?.ai?.title || 'Yuzma-yuz suhbat'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t?.ai?.subtitle || "Sun'iy intellekt bilan jonli ovozli muloqot. Yapon tilida erkin so'zlashishni mashq qiling!"}
            </p>
          </div>
          <button className="h-10 w-10 shrink-0 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer">
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Call Area - Chat Area'ning qolipida */}
      <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden flex flex-col items-center justify-between py-12 px-4 relative min-h-[560px]">
        
        {/* Jahl Matni */}
        <div className="z-10 text-center h-16 flex flex-col items-center justify-center mb-6">
          {isAngry && (
            <div className="animate-in fade-in zoom-in duration-300">
              <h3 className="text-2xl sm:text-3xl font-bold text-red-500 tracking-widest drop-shadow-sm">
                ИИ В ГНЕВЕ! 🤬
              </h3>
              <p className="text-red-500/80 text-sm sm:text-base mt-1 font-semibold tracking-wider">
                (DOMEN KENGAYISHI!)
              </p>
            </div>
          )}
        </div>

        {/* Markaziy Animatsiya / GIF */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full cursor-pointer" onClick={() => setIsAngry(!isAngry)}>
          
          {/* Orqa fon porlashi (Loyihangizdagi primary rangga asoslangan) */}
          <div className={`absolute w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full blur-[80px] transition-all duration-700 z-0 ${
            isAngry ? 'bg-red-500/30 scale-110' : 'bg-primary/20 scale-100'
          }`} />

          {isAngry ? (
            // --- SUKUNA HOLATI ---
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-red-500 animate-in zoom-in duration-500 z-10">
              <img 
                src="https://media1.tenor.com/m/iwXHwlY31ecAAAAC/yuji-itadori-suku.gif" 
                alt="Sukuna Angry" 
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(220,38,38,0.5)] mix-blend-overlay pointer-events-none"></div>
            </div>
          ) : (
            // --- XOTIRJAM HOLAT (To'lqinlar) ---
            <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-secondary/40 flex flex-col items-center justify-center shadow-xl border-4 border-border transition-all duration-500 hover:scale-105 z-10">
              <div className="flex items-center gap-2.5 sm:gap-3.5 mb-6">
                 {/* Ovoz to'lqinlari (Primary rang orqali) */}
                 <div className="w-2.5 sm:w-3.5 h-10 sm:h-16 bg-primary/60 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                 <div className="w-2.5 sm:w-3.5 h-16 sm:h-24 bg-primary/90 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
                 <div className="w-2.5 sm:w-3.5 h-12 sm:h-20 bg-primary/60 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                 <div className="w-2.5 sm:w-3.5 h-20 sm:h-32 bg-primary/70 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                 <div className="w-2.5 sm:w-3.5 h-10 sm:h-16 bg-primary/90 rounded-full animate-[pulse_1.1s_ease-in-out_infinite]" />
              </div>
              <span className="text-muted-foreground font-semibold text-sm sm:text-base tracking-widest mt-2">
                ИИ СЛУШАЕТ...
              </span>
            </div>
          )}
        </div>

        {/* Pastki tugmalar (Loyihangiz dizayniga mos) */}
        <div className="w-full flex justify-center items-center gap-6 z-10 mt-12">
          <button 
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
              isMicMuted 
                ? 'bg-secondary text-foreground' 
                : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {isMicMuted ? <MicOff className="w-6 h-6 sm:w-7 sm:h-7" /> : <Mic className="w-6 h-6 sm:w-7 sm:h-7" />}
          </button>
          
          <button className="w-28 h-14 sm:w-32 sm:h-16 rounded-[2rem] bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all cursor-pointer">
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
}