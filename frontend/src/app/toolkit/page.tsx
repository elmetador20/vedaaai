'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, CheckSquare, MessageSquare, ArrowRight, X, Loader2, Copy, Download, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';

export default function ToolkitPage() {
  const [selectedTool, setSelectedTool] = useState<{ id: string; name: string } | null>(null);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 10');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: 'planner', name: 'AI Lesson Planner', desc: 'Generate complete unit syllabus guidelines and weekly curriculum outlines.', icon: Sparkles, category: 'Planning', color: 'text-amber-500 bg-amber-50' },
    { id: 'rubric', name: 'Grading Rubric Maker', desc: 'Create exact standard grading matrices for classroom assessments.', icon: CheckSquare, category: 'Grading', color: 'text-blue-500 bg-blue-50' },
    { id: 'comments', name: 'Personalized Feedback', desc: 'Formulate constructive card comments based on student performance.', icon: MessageSquare, category: 'Reporting', color: 'text-emerald-500 bg-emerald-50' },
    { id: 'sheets', name: 'Quick Practice Worksheet', desc: 'Create math problems or vocabulary practices in minutes.', icon: FileText, category: 'Practice', color: 'text-violet-500 bg-violet-50' },
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !selectedTool) return;

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      let output = '';
      const currentTopic = topic.trim();

      if (selectedTool.id === 'planner') {
        output = `# Lesson Plan: ${currentTopic}
**Grade Level:** ${grade}
**Duration:** 3 Weeks (15 Sessions)

## Overview
This syllabus plan introduces students to key conceptual foundations of ${currentTopic}. Students will analyze core equations, theories, and practical applications through hands-on activities.

## Weekly Outlines
* **Week 1: Fundamentals & Definition**
  - Session 1: Terminology and basic paradigms.
  - Session 2: Core mechanics and theoretical equations.
  - Session 3: Lab simulation and practical experiments.
* **Week 2: Advanced Formulations**
  - Session 4: Inter-system variables and dynamics.
  - Session 5: Analytical problem solving worksheets.
* **Week 3: Practical Projects**
  - Session 6: Classroom group project presentation.
  - Session 7: Grading review and revision practice.

## Core Assessment Criteria
- Conceptual homework: 30%
- Practical classroom lab: 40%
- Final term paper review: 30%`;
      } else if (selectedTool.id === 'rubric') {
        output = `# Grading Rubric Matrix: ${currentTopic}
**Target Level:** ${grade}

| Grading Criteria | Excellent (4 pts) | Proficient (3 pts) | Developing (2 pts) | Novice (1 pt) |
|---|---|---|---|---|
| **Accuracy** | Direct and completely correct application to ${currentTopic}. | Minor errors, mostly accurate methods. | Conceptual flaws in applying formulas. | Completely incorrect methods. |
| **Logic** | Flawless analytical progression and derivation. | Clearly structured steps with minor notes. | Fragmented logic flow, needs guidance. | No logical structure present. |
| **Presentation** | Elegant formatting, legible labels and charts. | Clean worksheets with slight omissions. | Disorganized outlines, hard to read. | Missing work sheets completely. |`;
      } else if (selectedTool.id === 'comments') {
        output = `# Report Card Comments Feed: ${currentTopic}
**Grade Context:** ${grade}

### High Achiever Comment:
"Student has shown exemplary proficiency in understanding the core foundations of ${currentTopic}. Their analytical questions are precise, and their projects set a high standard for the classroom. Keep up the brilliant work!"

### Moderate Performer Comment:
"Student demonstrates a stable grasp of the primary concepts of ${currentTopic}. They perform consistently on tests but could benefit from dedicating extra study time to resolving advanced practice formulas. Active classroom participation is encouraged."

### Struggling Student Comment:
"Student is currently working to master the basic structures of ${currentTopic}. They require regular feedback and should join weekly revision reviews to strengthen their core conceptual framework."`;
      } else {
        output = `# Practice Worksheet: ${currentTopic}
**Subject Class:** ${grade}
**Student Name:** _____________________

## Part A: Multiple Choice Questions
1. What is the primary operational parameter of ${currentTopic}?
   - A) System Entropy
   - B) Standard Vector Constant
   - C) Delta Value Variable
   - D) Kinetic Resistance

2. Which formula best represents the state calculation in ${currentTopic}?
   - A) E = mc²
   - B) F = ma
   - C) V = IR
   - D) Custom Context Delta = α + β

## Part B: Short Answer Questions
1. Outline the main environmental factors that impact the equilibrium of ${currentTopic}.
   __________________________________________________________________
   __________________________________________________________________

2. Solve for the local variable dynamic if initial state conditions match standard constants.
   __________________________________________________________________
   __________________________________________________________________`;
      }

      setResult(output);
      setLoading(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result || !selectedTool) return;
    const element = document.createElement("a");
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTool.name.replace(/\s+/g, '_')}_${topic.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Header />
      <main className="flex-1 px-2.5 py-4 md:p-8 overflow-y-auto relative pb-24">
        <div className="flex items-start gap-3 mb-8">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-slate-800 leading-tight">AI Teacher's Toolkit</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Unlock helper utilities powered by artificial intelligence to save planning hours.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool);
                  setTopic('');
                  setResult(null);
                }}
                className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{tool.category}</span>
                    <div className={`p-3 rounded-2xl ${tool.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-[#ff4d00] transition mb-2">{tool.name}</h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">{tool.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff4d00] mt-6 group-hover:gap-2.5 transition-all">
                  Open Tool
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {selectedTool && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setSelectedTool(null);
                  setResult(null);
                }}
                className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="text-base font-bold text-slate-800">{selectedTool.name}</h3>
              </div>

              {!loading && !result && (
                <form onSubmit={handleGenerate} className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">Enter details below to generate resources using AI.</p>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Topic / Syllabus Theme</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Introduction to Thermodynamics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Target Grade Level</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800 bg-white"
                    >
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#111] text-white rounded-full text-xs font-bold hover:bg-slate-900 transition mt-6">
                    Generate Content
                  </button>
                </form>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ff4d00] mb-4" />
                  <p className="text-sm font-bold text-slate-700">AI is thinking...</p>
                  <p className="text-xs text-slate-400 mt-1">Generating custom educational outlines for your classes.</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500">Output Generated Successfully</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-[11px] font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-slate-900">
                    {result}
                  </div>
                  <button
                    onClick={() => setResult(null)}
                    className="w-full py-3 border border-slate-200 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 mt-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset & Generate New
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
