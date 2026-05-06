"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Trophy, 
  LayoutDashboard, 
  MessageSquare, 
  GraduationCap, 
  Users, 
  Settings, 
  PlusCircle, 
  LogOut,
  User 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStudentDashboard } from "@/app/actions/student";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (user?.role === "student" && user?.id) {
      getStudentDashboard(user.id)
        .then(res => {
          if (res.success) setProgress(res.globalProgress || 0);
        })
        .catch(err => console.error("Error cargando progreso sidebar:", err));
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
          { name: "Configuración", href: "/admin/settings", icon: Settings },
        ];
      case "teacher":
        return [
          { name: "Mis Clases", href: "/docente", icon: LayoutDashboard },
          { name: "Alumnos", href: "/docente/students", icon: Users },
          { name: "Crear Desafío", href: "/docente/new-challenge", icon: PlusCircle },
          { name: "Correcciones", href: "/docente/reviews", icon: Trophy },
        ];
      default:
        return [
          { name: "Mis Materias", href: "/", icon: LayoutDashboard },
          { name: "Desafíos", href: "/desafios", icon: BookOpen },
          { name: "Logros", href: "/logros", icon: Trophy },
          { name: "Tutor IA", href: "/tutor", icon: MessageSquare },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-screen border-r border-border bg-card flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 relative overflow-hidden rounded-full border border-border shadow-sm bg-white flex items-center justify-center p-1">
          <img 
            src="/logo.png" 
            alt="Escuela Ricardo Videla" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tighter leading-none mb-1 uppercase italic">Videla-Acredita</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black">Esc. N° 4-012</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
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

      <div className="p-4 mt-auto space-y-4">
        {user.role === "student" && (
          <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
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

        <div className="flex items-center gap-3 p-2 px-4 rounded-2xl bg-secondary/30 border border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate leading-none mb-1">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase">{user.role}</p>
          </div>
          <Link 
            href="/perfil"
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            title="Mi Perfil"
          >
            <User size={16} />
          </Link>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
