'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, CheckSquare, Sparkles, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function HomePage() {
  const { assignments } = useAssignmentStore();

  const stats = [
    { name: 'Active Assignments', value: assignments.length, icon: BookOpen, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Total Students', value: 124, icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50' },
    { name: 'Completed Graded', value: 87, icon: CheckSquare, color: 'bg-violet-500', bg: 'bg-violet-50' },
    { name: 'Average Performance', value: '78%', icon: TrendingUp, color: 'bg-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 px-2.5 py-4 md:p-8 overflow-y-auto relative pb-24">
        <div className="flex items-start gap-3 mb-8">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-slate-800 leading-tight">Welcome back, Instructor</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Here is an overview of your classes, assets, and AI tools.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 leading-tight">{stat.name}</span>
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/create" className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition group">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-orange-500 transition">Create Assignment</h4>
                  <p className="text-xs text-slate-400 font-normal mt-1">Use AI to generate questions from text files or raw input.</p>
                </div>
              </Link>
              <Link href="/toolkit" className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition group">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition">Teacher's Toolkit</h4>
                  <p className="text-xs text-slate-400 font-normal mt-1">Generate lesson outlines, rubrics, and syllabus schedules.</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-6">Recent Activity</h3>
            <div className="space-y-4 flex-1">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Created Geometry Quiz</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Added 5 new files to Library</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">Yesterday</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Class Grade 10 average rose by 4%</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
