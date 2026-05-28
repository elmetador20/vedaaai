'use client';

import { useState, useEffect } from "react";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Home, FileText, Library, Wrench } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["400", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('Assignments');

  useEffect(() => {
    if (pathname === '/' || pathname === '/create' || pathname.startsWith('/output') || pathname.startsWith('/progress')) {
      setActiveMobileTab('Assignments');
    } else if (pathname === '/home') {
      setActiveMobileTab('Home');
    } else if (pathname === '/library') {
      setActiveMobileTab('Library');
    } else if (pathname === '/toolkit') {
      setActiveMobileTab('AI Toolkit');
    }
  }, [pathname]);

  const mobileNavItems = [
    { name: "Home", href: "/home", icon: "/home2.png" },
    { name: "Assignments", href: "/", icon: "/Calendar.png" },
    { name: "Library", href: "/library", icon: "/lib.png" },
    { name: "AI Toolkit", href: "/toolkit", icon: "/Aii.png" },
  ];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f1f3f6] flex flex-col lg:flex-row text-slate-800">
        <div className="print:hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="lg:hidden flex items-center justify-between mx-3 mt-3 px-5 py-4 bg-white rounded-[16px] shadow-sm border border-slate-100 sticky top-3 z-20 print:hidden">
          <div className="flex items-center gap-2 h-[28px] w-[99px]">
            <img src="/logoblack.png" alt="VedaAI Logo" className="h-full object-contain" />

          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-white border" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
              <img src="/Avatar.png" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 lg:ml-[328px] print:ml-0 flex flex-col min-h-screen pb-20 lg:pb-0 lg:py-3 lg:pr-3">
          {children}
        </div>

        <nav className="lg:hidden fixed bottom-3 left-3 right-3 bg-[#111111] text-white py-3 px-4 flex justify-around rounded-[24px] z-30 shadow-lg border border-white/5 print:hidden">
          {mobileNavItems.map((item) => {
            const isActive = activeMobileTab === item.name;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveMobileTab(item.name)}
                className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <img 
                  src={item.icon} 
                  alt={item.name} 
                  className="w-5 h-5 object-contain transition-all"
                  style={{
                    filter: isActive ? 'brightness(0) invert(1)' : 'none',
                    opacity: isActive ? 1 : 0.4
                  }}
                />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-white font-bold" : "text-white/40"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </body>
    </html>
  );
}
