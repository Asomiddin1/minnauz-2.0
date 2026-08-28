'use client';

import * as React from 'react';
import {
  ShoppingBag,
  BookOpen,
  Sparkles,
  Truck,
  Check,
  Star,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

interface StoreItem {
  id: string;
  title: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  description: string;
  inStock: boolean;
  tag?: string;
}

const STORE_ITEMS: StoreItem[] = [
  {
    id: 'b1',
    title: 'Minna no Nihongo I (Honsatsu + Tarjima)',
    category: 'Darsliklar',
    price: "120,000 so'm",
    rating: 5.0,
    image: '/banner_art.png',
    description: "N5 daraja uchun to'liq original yaponcha darslik va o'zbekcha tarjimasi bilan birga.",
    inStock: true,
    tag: 'Bestseller',
  },
  {
    id: 'b2',
    title: 'JLPT N5 Mock Testlar toʻplami (5 ta toʻliq sinov)',
    category: 'Test kitoblar',
    price: "85,000 so'm",
    rating: 4.9,
    image: '/banner_art.png',
    description: 'Imtihon oldi audio diski va rasmiy javob varaqalari (Answer sheet) bilan.',
    inStock: true,
    tag: 'Tavsiya',
  },
  {
    id: 'b3',
    title: 'Kanji Flashkartalari N5-N4 (300 ta karta)',
    category: 'Aksessuarlar',
    price: "95,000 so'm",
    rating: 4.8,
    image: '/banner_art.png',
    description: "Iyerogliflar, on/kun o'qilishlari va chiziqlar ketma-ketligi chizilgan laminatsiyalangan kartalar.",
    inStock: true,
  },
  {
    id: 'b4',
    title: 'Nihongo Sou Matome N4 (Grammatika & Dokkai)',
    category: 'Darsliklar',
    price: "110,000 so'm",
    rating: 4.9,
    image: '/banner_art.png',
    description: '6 haftalik intensiv JLPT N4 tayyorgarlik kursi uchun darslik.',
    inStock: true,
  },
];

export function StoreTab() {
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [orderSuccessId, setOrderSuccessId] = React.useState<string | null>(null);

  const categories = ['ALL', 'Darsliklar', 'Test kitoblar', 'Aksessuarlar'];

  const filtered = STORE_ITEMS.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  const handleOrder = (id: string) => {
    setOrderSuccessId(id);
    setTimeout(() => {
      setOrderSuccessId(null);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-amber-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>MinnaUz Store — Oʻquv materiallari doʻkoni</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Yapon tili darsliklari va qoʻllanmalar
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Oʻzbekiston boʻylab tezkor yetkazib berish (Toshkentda 24 soat). Sifatli kitoblar,
              mock testlar va flashkartalar.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-xs">
              <Truck className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Butun Oʻzbekiston</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-foreground">Sifat kafolati</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-foreground text-background shadow-xs'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {cat === 'ALL' ? 'Barchasi' : cat}
          </button>
        ))}
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              {/* Product Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-muted-foreground">{item.category}</span>
                {item.tag && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                    {item.tag}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h3 className="font-bold text-foreground text-base leading-snug">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-3 text-xs text-amber-500 font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                <span>{item.rating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">(baho)</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Narxi</div>
                <div className="text-base font-extrabold text-foreground">{item.price}</div>
              </div>

              <button
                onClick={() => handleOrder(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  orderSuccessId === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {orderSuccessId === item.id ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Buyurtma qilindi
                  </span>
                ) : (
                  'Buyurtma berish'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
