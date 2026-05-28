'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, MoreVertical, Search, Filter, Trash2, Eye, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { useAssignmentStore, Assignment } from '@/store/useAssignmentStore';
import Header from '@/components/Header';

export default function Dashboard() {
  const router = useRouter();
  const { assignments, loading, fetchAssignments, deleteAssignment } = useAssignmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(id);
      setActiveMenu(null);
    }
  };

  const handleCardClick = (assignment: Assignment) => {
    if (assignment.status === 'completed') {
      router.push(`/output/${assignment._id}`);
    } else {
      router.push(`/progress/${assignment._id}`);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 px-2.5 py-4 md:p-8 overflow-y-auto relative pb-24">
        {(assignments.length > 0 || loading) && (
          <div className="flex items-start gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-slate-800 leading-tight">Assignments</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Manage and create assignments for your classes.</p>
            </div>
          </div>
        )}

        {assignments.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm mb-6">
            <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition px-2">
              <Filter className="w-4 h-4" />
              Filter By
            </button>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-xs font-semibold w-full sm:w-64 focus:outline-none focus:border-slate-300 text-slate-800"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 animate-pulse shadow-sm h-40 flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-slate-100 rounded-md w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="h-3 bg-slate-100 rounded-md w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
              <img src="/center.png" alt="No assignments" className="w-56 h-56 object-contain mb-6" />
              <img src="/text.png" alt="No assignments description" className="w-full max-w-[486px] h-auto object-contain mb-8" />
              <Link
                href="/create"
                className="flex items-center gap-2 px-6 py-3 bg-[#111] text-white rounded-full text-sm font-bold hover:bg-slate-900 transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Your First Assignment
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No assignments match your search query.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((a) => (
              <div
                key={a._id}
                onClick={() => handleCardClick(a)}
                className="bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm hover:shadow-md transition duration-300 cursor-pointer relative group flex flex-col justify-between h-[100px] w-full"
              >
                <div className="flex items-start justify-between px-2">
                  <h3 className="text-[24px] font-extrabold text-slate-800 pr-8 truncate font-[family-name:var(--font-bricolage-grotesque)] leading-[1.2] tracking-[-0.04em]">
                    {a.title}
                  </h3>
                  <div className="absolute right-3 top-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === a._id ? null : a._id);
                      }}
                      className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenu === a._id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-2 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(a);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 hover:bg-slate-50 transition text-left font-medium"
                        >
                          View Assignment
                        </button>
                        <button
                          onClick={(e) => handleDelete(a._id, e)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 transition text-left font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <span>
                    <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] font-extrabold text-slate-800 leading-[1.2] tracking-[-0.04em]">Assigned on</span>
                    <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] font-normal text-slate-500 leading-[1.2] tracking-[-0.04em]"> : {new Date(a.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                  </span>
                  <span>
                    <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] font-extrabold text-slate-800 leading-[1.2] tracking-[-0.04em]">Due</span>
                    <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] font-normal text-slate-500 leading-[1.2] tracking-[-0.04em]"> : {new Date(a.dueDate || new Date(a.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {assignments.length > 0 && (
          <div className="fixed bottom-6 left-1/2 lg:left-[calc(50%+128px)] -translate-x-1/2 z-30 print:hidden">
            <Link
              href="/create"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#111] hover:bg-slate-900 text-white rounded-full text-sm font-bold shadow-xl transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </Link>
          </div>
        )}

        <Link
          href="/create"
          className="fixed bottom-20 right-4 lg:hidden w-[46px] h-[46px] bg-white text-[#ff4d00] rounded-full flex items-center justify-center shadow-lg border border-slate-100 z-30 transition hover:bg-slate-50 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </Link>
      </main>
    </>
  );
}
