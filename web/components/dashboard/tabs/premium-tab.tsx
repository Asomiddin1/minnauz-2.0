'use client';

import * as React from 'react';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  tag?: string;
  isFree?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Bepul',
    price: "0 so'm",
    period: '/ doimiy',
    description: 'Yapon tilini mustaqil boshlash va platforma bilan tanishish uchun.',
    features: [
      'Hiragana va Katakana toʻliq alifbosi',
      'JLPT N5 kirish darslari',
      'Asosiy lugʻat va soʻz boyligi mashqlari',
      'Kunlik AI Sensei sinov savollari',
    ],
    isFree: true,
  },
  {
    id: 'monthly',
    name: 'Oylik Pro',
    price: "79 000 so'm",
    period: '/ oyiga',
    description: 'Yapon tilini intensiv va cheklovlarsiz boshlamoqchi boʻlganlar uchun.',
    features: [
      'Barcha JLPT N5, N4, N3 darslari',
      'Cheksiz AI Speaking (Kaiwa) mashgʻulotlari',
      'Barcha audio va video darslar',
      'Mock testlar va reyting tizimi',
      'Reklamalarsiz interfeys',
    ],
  },
  {
    id: 'annual',
    name: 'Yillik Cheksiz',
    price: "499 000 so'm",
    period: '/ yiliga',
    description: 'N5 dan N2 gacha barcha bosqichlarni kafolat bilan zabt eting.',
    features: [
      'Barcha kurslar va yangi chiqadigan darslar',
      '40% gacha katta tejash',
      'Cheksiz AI Sensei tahlil va mashqlari',
      'VIP Yapon tili jamoasi aʼzoligi',
      'Yuklab olinadigan PDF qoʻllanmalar',
      'Yaponiyada oʻqish va ishlash konsultatsiyasi',
    ],
    popular: true,
    tag: 'Eng tejamkor',
  },
];

export function PremiumTab() {
  const [selectedPlan, setSelectedPlan] = React.useState('annual');
  const [isSuccessModal, setIsSuccessModal] = React.useState(false);

  const handleCheckout = (planId: string) => {
    setSelectedPlan(planId);
    setIsSuccessModal(true);
  };

  const currentPlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-yellow-500/10 p-6 sm:p-10 text-center shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3.5 py-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
            <Crown className="h-4 w-4" />
            <span>MinnaUz Pro Obuna</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Yapon tilini cheklovlarsiz oʻrganing
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI Speaking, barcha darajadagi darslar, toʻliq video darsliklar va professional mock
            testlar siz uchun ochiq.
          </p>
        </div>
      </div>

      {/* Tarif Kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all ${
              plan.popular
                ? 'border-yellow-500/50 bg-gradient-to-b from-card via-card to-yellow-500/5 shadow-lg ring-2 ring-yellow-500/20'
                : 'border-border bg-card shadow-xs hover:border-primary/40'
            }`}
          >
            {plan.tag && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-500 text-black text-[11px] font-bold uppercase tracking-wider shadow-sm">
                {plan.tag}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div
                  className={`p-2 rounded-xl ${
                    plan.popular
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <Crown className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{plan.period}</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                {plan.description}
              </p>

              <div className="space-y-3 border-t border-border/60 pt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tarif imkoniyatlari
                </div>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60">
              {plan.isFree ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-secondary text-muted-foreground cursor-not-allowed opacity-80"
                >
                  Joriy tarif (Bepul)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCheckout(plan.id)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm ${
                    plan.popular
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                  }`}
                >
                  Obunani faollashtirish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Bar */}
      <div className="rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Xavfsiz va tezkor toʻlov usullari</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Payme, Click, Uzum Bank va xalqaro Visa/Mastercard kartalari orqali lahzada toʻlang.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Payme</span>
          <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Click</span>
          <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Uzum</span>
          <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Visa</span>
        </div>
      </div>

      {/* To'lov Modali */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-yellow-500/10 text-yellow-500 mx-auto">
              <Crown className="h-8 w-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">Toʻlovni amalga oshirish</h3>
              <p className="text-xs text-muted-foreground">
                Tanlangan tarif:{' '}
                <span className="font-bold text-foreground">
                  {currentPlan.name} ({currentPlan.price})
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['Payme', 'Click', 'Uzum Bank', 'Visa / Mastercard'].map((gate) => (
                <button
                  key={gate}
                  type="button"
                  onClick={() => setIsSuccessModal(false)}
                  className="p-3.5 rounded-2xl border border-border bg-secondary/50 font-bold text-xs text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                >
                  {gate}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsSuccessModal(false)}
              className="w-full py-2.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-secondary cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}