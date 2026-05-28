'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Wrench, Library, Settings, Sparkles, GraduationCap, X } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();

  const [activeTab, setActiveTab] = React.useState('Assignments');

  React.useEffect(() => {
    if (pathname === '/' || pathname === '/create' || pathname.startsWith('/output') || pathname.startsWith('/progress')) {
      setActiveTab('Assignments');
    } else if (pathname === '/home') {
      setActiveTab('Home');
    } else if (pathname === '/groups') {
      setActiveTab('My Groups');
    } else if (pathname === '/toolkit') {
      setActiveTab('AI Teacher\'s Toolkit');
    } else if (pathname === '/library') {
      setActiveTab('My Library');
    }
  }, [pathname]);

  const navItems = [
    { name: 'Home', href: '/home', icon: '/home.png' },
    { name: 'My Groups', href: '/groups', icon: '/groups.png' },
    { name: 'Assignments', href: '/', icon: '/file-text.png', count: assignments.length },
    { name: 'AI Teacher\'s Toolkit', href: '/toolkit', icon: '/Ai.png' },
    { name: 'My Library', href: '/library', icon: '/library.png', count: 32 },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 print:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-[304px] bg-white p-6 flex-col h-[calc(100vh-24px)] rounded-[16px] shadow-[0px_32px_48px_rgba(0,0,0,0.2)] fixed left-3 top-3 z-50 transition-all duration-300 print:hidden
        ${isOpen ? 'flex' : 'hidden lg:flex'}
      `}>
        <div className="flex items-center justify-between mb-8 h-20">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VedaAI Logo" className="h-20 object-contain" />
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      <Link
        href="/create"
        className="flex items-center justify-center gap-[10px] w-full h-[42px] border-4 border-transparent text-white rounded-full text-sm font-semibold hover:opacity-90 transition mb-8"
        style={{
          background: 'linear-gradient(#272727, #272727) padding-box, linear-gradient(to bottom, #FF7950, #C0350A) border-box',
        }}
      >
        <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400" />
        Create Assignment
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${isActive
                ? 'bg-[#CECECE]/50 text-slate-900 font-bold'
                : 'text-slate-400 hover:bg-[#CECECE]/20 hover:text-slate-900 font-medium'
                }`}
            >
              <div className="flex items-center gap-3">
                {typeof item.icon === 'string' ? (
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`w-5 h-5 object-contain transition-opacity duration-200 ${isActive ? 'opacity-90' : 'opacity-40 group-hover:opacity-90'
                      }`}
                  />
                ) : (
                  React.createElement(item.icon, {
                    className: `w-5 h-5 ${isActive ? 'text-slate-800' : 'text-slate-400'}`
                  })
                )}
                <span>{item.name}</span>
              </div>
              {typeof item.count === 'number' && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#ff4d00] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-4 p-4 bg-[#f1f3f6] rounded-[24px]">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/Avatar.png" alt="Delhi Public School Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[15px] font-bold text-[#1e293b] leading-tight mb-0.5">Delhi Public School</h4>
            <p className="text-xs text-slate-500 font-normal">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
