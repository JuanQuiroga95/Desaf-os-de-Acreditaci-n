"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Trophy,
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Users,
  Users2,
  Settings,
  PlusCircle,
  LogOut,
  User,
  Sun,
  Moon,
  Calendar,
  Brain,
  AlertTriangle,
  Download,
  HelpCircle,
  Menu,
  X,
  Compass,
  Layers,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useTheme } from "@/context/ThemeContext";
import { useTour } from "@/context/TourContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStudentDashboard } from "@/app/actions/student";
import confetti from "canvas-confetti";
import { useToast } from "@/context/ToastContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { hasTour, resetTour } = useTour();
  const [progress, setProgress] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      showToast("Para instalar en iPhone: Toca 'Compartir' y luego 'Agregar a Inicio'. En Android: Toca los 3 puntos y 'Instalar App'.", "success");
    }
  };

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          zIndex: 9999
        });
        showToast("¡Estás on fire! 🔥 Sigue así.", "success");
        return 0;
      }
      return newCount;
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };

  // Elimino llamada duplicada a getStudentDashboard para mejorar performance.
  // El progreso debería venir por Context o props si es necesario en toda la app.
  useEffect(() => {
    if (user?.role === "student") {
      // Por ahora hardcodeamos a 0 o podríamos leerlo de un nuevo ProgressContext
      // setProgress(0);
    }
  }, [user]);

  if (isLoading || !user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case "admin":
        return [
          { name: "Control Admin", href: "/admin", icon: LayoutDashboard },
          { name: "Materias", href: "/admin/subjects", icon: BookOpen },
          { name: "Docentes", href: "/admin/teachers", icon: Users },
          { name: "Usuarios", href: "/admin/users", icon: Users },
          { name: "Manual de Uso", href: "/manual", icon: HelpCircle },
        ];
      case "teacher":
        return [
          { name: "Mis Clases", href: "/docente", icon: LayoutDashboard },
          { name: "Alumnos", href: "/docente/students", icon: Users },
          { name: "Unidades", href: "/docente/unidades", icon: Layers },
          { name: "Crear Encuentro", href: "/docente/new-challenge", icon: PlusCircle },
          { name: "Correcciones", href: "/docente/reviews", icon: Trophy },
          { name: "Mensajes", href: "/mensajes", icon: MessageSquare },
          { name: "Alertas", href: "/docente/alertas", icon: AlertTriangle },
          { name: "Exportar Actas", href: "/docente/export", icon: Download },
          { name: "Manual de Uso", href: "/manual", icon: HelpCircle },
        ];
      default:
        return [
          { name: "Mis Materias", href: "/", icon: LayoutDashboard },
          { name: "Desafíos", href: "/desafios", icon: BookOpen },
          { name: "Logros", href: "/logros", icon: Trophy },
          { name: "Mensajes", href: "/mensajes", icon: MessageSquare },
          { name: "Tutor IA", href: "/tutor", icon: Brain },
          { name: "Calendario", href: "/calendario", icon: Calendar },
          { name: "Simulacro IA", href: "/simulacro", icon: Brain },
          { name: "Tienda", href: "/tienda", icon: Trophy },
          { name: "Manual de Uso", href: "/manual", icon: HelpCircle },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center gap-3">
        <div 
          onClick={handleLogoClick}
          className="w-12 h-12 relative overflow-hidden rounded-full border border-border shadow-sm bg-white flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition-transform"
        >
          <img 
            src="/logo.png" 
            alt="Escuela Ricardo Videla" 
            className="w-full h-full object-contain scale-110"
          />
        </div>
        <div className="flex flex-col flex-1">
          <span className="font-black text-sm tracking-tighter leading-none mb-1 uppercase italic">Videla-Acredita</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black">Mejor en tu Escuela 2026</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 shrink-0 space-y-3">
        {user.role === "student" && (
          <div className="bg-secondary/50 rounded-2xl p-3 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tu Progreso</span>
              <span className="text-xs font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 ease-out progress-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm uppercase shrink-0 border border-primary/10 overflow-hidden">
              {user.avatarId ? (
                <img src={user.avatarId} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate leading-none mb-1 uppercase tracking-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-widest">{user.role}</p>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {hasTour && (
            <button
              onClick={resetTour}
              className="flex items-center justify-center gap-2 py-2 w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest transition-colors border border-primary/20 group"
            >
              <Compass size={14} className="group-hover:rotate-45 transition-transform duration-300" />
              Instrucciones
            </button>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/30 px-1 gap-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
            >
              {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
              {theme === "dark" ? "Claro" : "Oscuro"}
            </button>
            <Link
              href="/perfil"
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
            >
              <User size={12} />
              Perfil
            </Link>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all bg-primary/10 px-2 py-1 rounded-md text-primary"
            >
              <Download size={12} />
              Instalar
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg hover:bg-secondary transition-all"
        aria-label="Abrir menú"
      >
        <Menu size={22} className="text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop: fixed, mobile: slide-in */}
      <aside className={cn(
        "w-64 h-[100dvh] border-r border-border bg-card flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300",
        // Mobile: hidden by default, slide in when open
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible
        "lg:translate-x-0"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
