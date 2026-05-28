'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, ChevronDown, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title = 'Assignment', showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="hidden lg:block w-full pb-3 print:hidden z-10">
      <header className="flex items-center justify-between h-[56px] pl-6 pr-3 bg-white border border-slate-100 rounded-[16px] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-slate-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-400 ml-1">Assignment</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm relative transition text-slate-600">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#ff4d00] rounded-full border-white border" />
          </button>

          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-100 rounded-full shadow-sm cursor-pointer hover:bg-slate-50 transition">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200">
              <img src="/Avatar.png" alt="John Doe Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-slate-800">John Doe</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </header>
    </div>
  );
}
