"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserCoins, buyAvatar, PREDEFINED_AVATARS } from "@/app/actions/store";
import { useToast } from "@/context/ToastContext";
import { Trophy, CheckCircle, Loader2, Star } from "lucide-react";
import confetti from "canvas-confetti";

export default function TiendaPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [coins, setCoins] = useState(0);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getUserCoins();
    if (res.success) {
      setCoins(res.coins);
      setCurrentAvatar(res.avatarId);
    }
    setIsLoading(false);
  };

  const handleBuy = async (avatarId: string, price: number) => {
    if (coins < price) {
      showToast("No tienes suficientes Monedas Videla", "error");
      return;
    }

    setIsBuying(avatarId);
    const res = await buyAvatar(avatarId);
    if (res.success) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast(res.message, "success");
      loadData(); // recargar
    } else {
      showToast(res.message, "error");
    }
    setIsBuying(null);
  };

  if (!user || user.role !== "student") return null;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-primary/5 p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Tienda de Recompensas</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Personaliza tu perfil con Monedas Videla
          </p>
        </div>

        <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 flex items-center gap-4 relative z-10 shadow-lg shadow-primary/5">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
            <Star size={24} className="fill-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tu Saldo</p>
            <p className="text-2xl font-black text-foreground">
              {isLoading ? <Loader2 size={24} className="animate-spin inline" /> : coins} <span className="text-sm text-yellow-500">MV</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {PREDEFINED_AVATARS.map((avatar) => {
          const isEquipped = currentAvatar === avatar.url;
          const canAfford = coins >= avatar.price;

          return (
            <div key={avatar.id} className={`bg-card border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl ${isEquipped ? 'border-primary shadow-primary/20' : 'border-border hover:border-primary/50'}`}>
              <div className="p-6 bg-secondary/20 flex justify-center border-b border-border">
                <div className={`w-32 h-32 rounded-full border-4 overflow-hidden bg-white shadow-inner ${isEquipped ? 'border-primary' : 'border-border'}`}>
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-black uppercase tracking-widest text-sm mb-4 text-center">{avatar.name}</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-center items-center gap-1 font-black text-yellow-500">
                    <Star size={16} className="fill-yellow-500" /> {avatar.price} MV
                  </div>
                  
                  {isEquipped ? (
                    <button disabled className="w-full py-3 rounded-xl bg-green-500/20 text-green-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-green-500/30">
                      <CheckCircle size={14} /> Equipado
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuy(avatar.id, avatar.price)}
                      disabled={!canAfford || isBuying === avatar.id}
                      className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                        canAfford 
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95' 
                          : 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                      }`}
                    >
                      {isBuying === avatar.id ? <Loader2 size={14} className="animate-spin" /> : "Comprar y Equipar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
