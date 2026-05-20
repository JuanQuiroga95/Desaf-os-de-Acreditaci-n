import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-32 h-32 bg-secondary/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-border rotate-12">
          <Search size={64} className="text-muted-foreground opacity-50 -rotate-12" />
        </div>
        
        <h1 className="text-6xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-black uppercase tracking-widest text-foreground mb-6">
          Página Perdida
        </h2>
        
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] leading-relaxed mb-10 px-4">
          Lo que estabas buscando no está acá o fue movido.
        </p>

        <Link
          href="/"
          className="mx-auto w-fit bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary/20 hover:scale-110 transition-all flex items-center justify-center gap-3 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a Seguridad
        </Link>
      </div>
    </div>
  );
}
