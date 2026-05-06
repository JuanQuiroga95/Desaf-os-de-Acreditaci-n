import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AITutor } from "@/components/AITutor";

const inter = Inter({ subsets: ["latin"] });
// ... (omitted meta for brevity)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen bg-background">
            {children}
          </main>
          <AITutor />
        </div>
      </body>
    </html>
  );
}
