"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { AITutor } from "@/components/AITutor";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex">
      {!isLoginPage && user && <Sidebar />}
      <main className={cn(
        "flex-1 min-h-screen bg-background transition-all duration-300",
        !isLoginPage && user ? "lg:ml-64 pt-16 lg:pt-0" : ""
      )}>
        {children}
      </main>
      {!isLoginPage && user && <AITutor />}
    </div>
  );
}
