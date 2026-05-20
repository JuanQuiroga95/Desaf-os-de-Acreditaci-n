"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft, X, Edit2, Mail, Shield, Briefcase, GraduationCap, Search, Key, UserMinus } from "lucide-react";
import { getAllUsers, updateUser, deleteUser, adminResetUserPassword } from "@/app/actions/admin";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  // Modal states
  const [editModalUser, setEditModalUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "STUDENT" });
  
  // Password Reset sub-form state
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const u = await getAllUsers();
      setUsersList(u);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showToast("Error al cargar la lista de usuarios", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (targetUser: any) => {
    setEditModalUser(targetUser);
    setEditForm({
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role
    });
    setNewPassword("");
    setIsResettingPassword(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;

    try {
      const res = await updateUser(editModalUser.id, editForm as any);
      if (res.success) {
        showToast("Usuario actualizado con éxito", "success");
        setEditModalUser(null);
        loadData();
      } else {
        showToast(res.error || "Error al actualizar usuario", "error");
      }
    } catch (error) {
      showToast("Error de comunicación", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!editModalUser || !newPassword) {
      showToast("Escribe una nueva contraseña", "error");
      return;
    }
    
    setIsResettingPassword(true);
    try {
      const res = await adminResetUserPassword(editModalUser.id, newPassword);
      if (res.success) {
        showToast("Contraseña actualizada correctamente", "success");
        setNewPassword("");
      } else {
        showToast(res.error || "Error al actualizar contraseña", "error");
      }
    } catch (error) {
      showToast("Error de comunicación", "error");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDeleteUser = async (targetId: string, targetName: string) => {
    if (targetId === user?.id) {
      showToast("No podés eliminar tu propia cuenta de administrador", "error");
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${targetName}"? Esta acción borrará todo su historial.`)) {
      return;
    }

    try {
      const res = await deleteUser(targetId);
      if (res.success) {
        showToast("Usuario eliminado con éxito", "success");
        loadData();
      } else {
        showToast(res.error || "Error al eliminar usuario", "error");
      }
    } catch (error) {
      showToast("Error de comunicación", "error");
    }
  };

  // Filter and Search Logic
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="text-red-500" size={14} />;
      case "TEACHER":
        return <Briefcase className="text-blue-500" size={14} />;
      case "STUDENT":
      default:
        return <GraduationCap className="text-purple-500" size={14} />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "TEACHER":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "STUDENT":
      default:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
  };

  if (authLoading || isLoading) {
    return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Usuarios...</div>;
  }
  
  if (!user || user.role !== "admin") { 
    router.push("/login"); 
    return null; 
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/admin" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel Admin
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Gestión de <span className="text-primary">Usuarios</span>
        </h1>
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
          {usersList.length} usuarios registrados en la plataforma
        </p>
      </header>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[
            { id: "ALL", label: "TODOS" },
            { id: "ADMIN", label: "ADMINS" },
            { id: "TEACHER", label: "DOCENTES" },
            { id: "STUDENT", label: "ALUMNOS" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${roleFilter === tab.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE USUARIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/30 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-secondary`}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(u)} 
                    className="p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-all border border-border"
                    title="Editar datos y credenciales"
                  >
                    <Edit2 size={14} />
                  </button>
                  {u.id !== user.id && (
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.name)} 
                      className="p-2.5 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border"
                      title="Eliminar usuario"
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-black text-xl mb-1 leading-snug line-clamp-1">{u.name}</h3>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail size={12} />
                <span className="text-xs font-bold truncate" title={u.email}>{u.email}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getRoleBadgeStyle(u.role)}`}>
                {getRoleIcon(u.role)} {u.role}
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase">
                Creado: {new Date(u.createdAt).toLocaleDateString("es-AR")}
              </span>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
            <Users className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No se encontraron usuarios.</p>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN Y CAMBIO DE CONTRASEÑA */}
      <AnimatePresence>
        {editModalUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <div>
                  <h3 className="font-black uppercase italic tracking-tighter text-xl">Editar Credenciales</h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1">Usuario: {editModalUser.email}</p>
                </div>
                <button onClick={() => setEditModalUser(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto">
                {/* Formulario de Datos */}
                <form onSubmit={handleUpdateUser} className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-border/50 pb-2">Información Básica</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1">Nombre Completo</label>
                      <input 
                        required 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                        className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1">Correo Institucional (Usuario)</label>
                      <input 
                        required 
                        type="email" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                        className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1">Rol Jerárquico</label>
                    <select 
                      value={editForm.role} 
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} 
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="STUDENT" className="bg-background">ALUMNO</option>
                      <option value="TEACHER" className="bg-background">DOCENTE</option>
                      <option value="ADMIN" className="bg-background">ADMINISTRADOR</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-xl hover:scale-[1.01] transition-all">
                    Guardar Datos Básicos
                  </button>
                </form>

                {/* Restablecimiento de Contraseña */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                    <Key size={14} /> Restablecer Contraseña
                  </h4>
                  
                  <div className="bg-secondary/20 p-4 rounded-2xl border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-relaxed">
                      Escribe una nueva contraseña para sobrescribir la actual de forma inmediata. Las contraseñas se guardan de forma encriptada.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Nueva contraseña temporal" 
                      className="flex-1 bg-secondary/30 border border-border rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                    <button 
                      onClick={handleResetPassword}
                      disabled={isResettingPassword || !newPassword}
                      className="sm:w-48 py-4 bg-secondary text-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-border shadow hover:bg-border transition-all disabled:opacity-50"
                    >
                      {isResettingPassword ? "Cambiando..." : "Cambiar Clave"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
