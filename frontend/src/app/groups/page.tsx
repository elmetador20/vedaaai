'use client';

import React, { useState } from 'react';
import { Plus, Users, Search, BookOpen, Clock, Settings, GraduationCap, X, Trash2 } from 'lucide-react';
import Header from '@/components/Header';

interface Group {
  id: string;
  name: string;
  students: number;
  activeAssignments: number;
  attendance: string;
  color: string;
  roster: string[];
}

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Grade 10 - Mathematics', students: 5, activeAssignments: 2, attendance: '96%', color: 'border-emerald-100 bg-emerald-50/20', roster: ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'David Lee', 'Emma Watson'] },
    { id: '2', name: 'Grade 12 - Physics Mechanics', students: 4, activeAssignments: 1, attendance: '94%', color: 'border-blue-100 bg-blue-50/20', roster: ['Franklin D', 'Grace Hopper', 'Henry Ford', 'Isaac Newton'] },
    { id: '3', name: 'Grade 9 - Organic Chemistry', students: 3, activeAssignments: 3, attendance: '91%', color: 'border-violet-100 bg-violet-50/20', roster: ['Jack Sparrow', 'Katherine G', 'Leonardo D'] },
    { id: '4', name: 'Grade 11 - English Literature', students: 4, activeAssignments: 0, attendance: '98%', color: 'border-amber-100 bg-amber-50/20', roster: ['Mary Shelley', 'Oscar Wilde', 'Percy Bysshe', 'William Shakespeare'] },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGrade, setNewGroupGrade] = useState('Grade 10');
  
  const [selectedRosterGroup, setSelectedRosterGroup] = useState<Group | null>(null);
  const [newStudentName, setNewStudentName] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const colors = [
      'border-emerald-100 bg-emerald-50/20',
      'border-blue-100 bg-blue-50/20',
      'border-violet-100 bg-violet-50/20',
      'border-amber-100 bg-amber-50/20'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newGroup: Group = {
      id: Date.now().toString(),
      name: `${newGroupGrade} - ${newGroupName}`,
      students: 0,
      activeAssignments: 0,
      attendance: '100%',
      color: randomColor,
      roster: []
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Are you sure you want to delete this class group?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedRosterGroup) return;

    const updatedGroups = groups.map(g => {
      if (g.id === selectedRosterGroup.id) {
        const newRoster = [...g.roster, newStudentName.trim()];
        const updatedGroup = {
          ...g,
          roster: newRoster,
          students: newRoster.length
        };
        setSelectedRosterGroup(updatedGroup);
        return updatedGroup;
      }
      return g;
    });

    setGroups(updatedGroups);
    setNewStudentName('');
  };

  const handleRemoveStudent = (student: string) => {
    if (!selectedRosterGroup) return;

    const updatedGroups = groups.map(g => {
      if (g.id === selectedRosterGroup.id) {
        const newRoster = g.roster.filter(s => s !== student);
        const updatedGroup = {
          ...g,
          roster: newRoster,
          students: newRoster.length
        };
        setSelectedRosterGroup(updatedGroup);
        return updatedGroup;
      }
      return g;
    });

    setGroups(updatedGroups);
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="flex-1 px-2.5 py-4 md:p-8 overflow-y-auto relative pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-slate-800 leading-tight">My Groups</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Manage and track student progress inside your classroom cohorts.</p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-[#111] text-white rounded-full text-xs font-bold hover:bg-slate-900 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center gap-3 shadow-sm mb-6">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Student Groups"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-xs font-semibold w-full sm:w-64 focus:outline-none focus:border-slate-300 text-slate-800"
            />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center text-slate-400 font-medium">
            No class groups found. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-bold text-slate-800">{group.name}</h3>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-slate-400 hover:text-red-500 transition p-1 hover:bg-slate-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl text-center">
                      <Users className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
                      <span className="block text-xs font-bold text-slate-800">{group.students}</span>
                      <span className="text-[10px] text-slate-400">Students</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-center">
                      <BookOpen className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
                      <span className="block text-xs font-bold text-slate-800">{group.activeAssignments}</span>
                      <span className="text-[10px] text-slate-400">Active</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-center">
                      <GraduationCap className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
                      <span className="block text-xs font-bold text-slate-800">{group.attendance}</span>
                      <span className="text-[10px] text-slate-400">Avg. Grade</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] border-t border-slate-100 -mx-6 -mb-6 px-6 py-4 rounded-b-[32px] flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 font-normal text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Last updated: Today
                  </span>
                  <button
                    onClick={() => setSelectedRosterGroup(group)}
                    className="text-[#ff4d00] hover:underline"
                  >
                    View Roster
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateGroup} className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-slate-800 mb-4">Create Class Group</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Grade Level</label>
                  <select
                    value={newGroupGrade}
                    onChange={(e) => setNewGroupGrade(e.target.value)}
                    className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800 bg-white"
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Subject / Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Biology"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#111] text-white rounded-full text-xs font-bold hover:bg-slate-900 transition mt-6">
                  Save Group
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedRosterGroup && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setSelectedRosterGroup(null)}
                className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-slate-800 mb-1">{selectedRosterGroup.name}</h3>
              <p className="text-xs text-slate-400 font-medium mb-6">Student Roster ({selectedRosterGroup.students})</p>

              <form onSubmit={handleAddStudent} className="flex gap-2 mb-4">
                <input
                  type="text"
                  required
                  placeholder="New Student Name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800"
                />
                <button type="submit" className="px-4 bg-[#111] text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition shrink-0">
                  Add
                </button>
              </form>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {selectedRosterGroup.roster.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-normal">No students in this group yet.</p>
                ) : (
                  selectedRosterGroup.roster.map((student, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-2.5 bg-slate-50 rounded-xl">
                      <span className="text-xs font-semibold text-slate-700">{student}</span>
                      <button
                        onClick={() => handleRemoveStudent(student)}
                        className="text-slate-400 hover:text-red-500 transition text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
