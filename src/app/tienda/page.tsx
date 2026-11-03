"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { buyAvatar, buySkin, equipSkin, getStoreData, type StoreData } from "@/app/actions/store";
import { PREDEFINED_AVATARS } from "@/lib/avatars";
import { SKINS } from "@/lib/skins";
import { ACTIVITY_ITEM_COINS, GAME_COMPLETE_BONUS } from "@/lib/progress";
import SkinPreview from "@/components/world/SkinPreview";
import { useToast } from "@/context/ToastContext";
import { Building2, CheckCircle, Loader2, Lock, Star } from "lucide-react";
import confetti from "canvas-confetti";

export default function TiendaPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await getStoreData().catch(() => null);
    if (res?.success) {
      setStore(res.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    // Carga inicial de datos del servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const coins = store?.coins ?? 0;

  const run = async (
    id: string,
    action: () => Promise<{ success: boolean; message: string }>,
    celebrate: boolean,
  ) => {
    setBusy(id);
    const res = await action().catch(() => ({ success: false, message: "Error de conexión" }));
    if (res.success) {
      if (celebrate) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast(res.message, "success");
      await loadData();
    } else {
      showToast(res.message, "error");
    }
    setBusy(null);
  };

  if (!user || user.role !== "student") return null;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-primary/5 p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Tienda de Recompensas</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Skins para el Mundo y avatares con Monedas Videla
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Ganás monedas en <strong>Jugar</strong>: {ACTIVITY_ITEM_COINS} por cada reto nuevo,{" "}
            {GAME_COMPLETE_BONUS} de premio al completar un juego y 10 por cada desafío entregado.
          </p>
        </div>

        <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 flex items-center gap-4 relative z-10 shadow-lg shadow-primary/5">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
            <Star size={24} className="fill-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tu Saldo</p>
            <p className="text-2xl font-black text-foreground">
              {store ? coins : <Loader2 size={24} className="animate-spin inline" />}{" "}
              <span className="text-sm text-yellow-500">MV</span>
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold">
          No pudimos cargar tu saldo.
          <button onClick={loadData} className="rounded-lg border border-border px-3 py-1.5 font-bold">
            Reintentar
          </button>
        </div>
      )}

      <section id="skins" aria-labelledby="skins-titulo" className="mb-14 scroll-mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="skins-titulo" className="text-2xl font-black uppercase tracking-tighter">
              Skins para el Mundo
            </h2>
            <p className="text-sm text-muted-foreground">
              Cambian cómo se ve tu personaje cuando recorrés la ciudad. Se compran una vez y quedan tuyas.
            </p>
          </div>
          <Link
            href="/mundo"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold hover:border-primary/50"
          >
            <Building2 size={16} aria-hidden="true" /> Ir al Mundo
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {SKINS.map((skin) => {
            const owned = store?.ownedSkins.includes(skin.id) ?? false;
            const equipped = store?.skin === skin.id;
            const canAfford = coins >= skin.price;
            const missing = skin.price - coins;
            return (
              <li
                key={skin.id}
                className={`flex flex-col overflow-hidden rounded-3xl border-2 bg-card transition-all ${equipped ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex justify-center bg-gradient-to-b from-slate-800 to-slate-950 px-4 pt-4">
                  <SkinPreview skin={skin} className="h-32 w-24" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-black leading-tight">{skin.name}</h3>
                  <p className="flex-1 text-xs text-muted-foreground">{skin.description}</p>
                  <p className="flex items-center gap-1 text-sm font-black text-yellow-500">
                    {skin.price === 0 ? (
                      "Gratis"
                    ) : owned ? (
                      <span className="text-emerald-500">Ya es tuya</span>
                    ) : (
                      <>
                        <Star size={14} className="fill-yellow-500" aria-hidden="true" /> {skin.price} MV
                      </>
                    )}
                  </p>
                  {equipped ? (
                    <span className="flex items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/15 py-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                      <CheckCircle size={13} aria-hidden="true" /> Puesta
                    </span>
                  ) : owned ? (
                    <button
                      onClick={() => run(skin.id, () => equipSkin(skin.id), false)}
                      disabled={!store || busy !== null}
                      className="rounded-xl border border-primary/40 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                      {busy === skin.id ? <Loader2 size={13} className="mx-auto animate-spin" /> : "Ponerme esta"}
                    </button>
                  ) : (
                    <button
                      onClick={() => run(skin.id, () => buySkin(skin.id), true)}
                      disabled={!store || !canAfford || busy !== null}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest ${canAfford ? "bg-primary text-white shadow-lg shadow-primary/30 hover:brightness-110" : "cursor-not-allowed border border-border bg-secondary text-muted-foreground"}`}
                    >
                      {busy === skin.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : canAfford ? (
                        "Comprar y poner"
                      ) : (
                        <>
                          <Lock size={12} aria-hidden="true" /> Te faltan {missing}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="avatares-titulo">
        <h2 id="avatares-titulo" className="mb-1 text-2xl font-black uppercase tracking-tighter">
          Avatares de perfil
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">La foto que se ve en el menú y en los mensajes.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PREDEFINED_AVATARS.map((avatar) => {
            const isEquipped = store?.avatarId === avatar.url;
            const canAfford = coins >= avatar.price;

            return (
              <div key={avatar.id} className={`bg-card border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl ${isEquipped ? "border-primary shadow-primary/20" : "border-border hover:border-primary/50"}`}>
                <div className="p-6 bg-secondary/20 flex justify-center border-b border-border">
                  <div className={`w-32 h-32 rounded-full border-4 overflow-hidden bg-white shadow-inner ${isEquipped ? "border-primary" : "border-border"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        onClick={() => run(avatar.id, () => buyAvatar(avatar.id), true)}
                        disabled={!store || !canAfford || busy !== null}
                        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                          canAfford
                            ? "bg-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95"
                            : "bg-secondary text-muted-foreground cursor-not-allowed border border-border"
                        }`}
                      >
                        {busy === avatar.id ? <Loader2 size={14} className="animate-spin" /> : "Comprar y Equipar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
