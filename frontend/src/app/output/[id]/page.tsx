'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, RefreshCw, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import Header from '@/components/Header';

export default function OutputPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const {
    currentAssignment,
    loading,
    error,
    fetchAssignmentById,
    regenerateAssignment,
  } = useAssignmentStore();

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id);
    }
  }, [id, fetchAssignmentById]);

  const handlePrint = async () => {
    if (!currentAssignment) return;
    const element = document.getElementById('question-paper-card');
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      const { default: html2canvasPro } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvasPro(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${currentAssignment.title.replace(/\s+/g, '_')}_Paper.pdf`);
      setIsGeneratingPdf(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsGeneratingPdf(false);
      window.print();
    }
  };

  const handleRegenerate = async () => {
    if (confirm('Are you sure you want to regenerate this question paper? The current version will be overwritten.')) {
      await regenerateAssignment(id);
      router.push(`/progress/${id}`);
    }
  };

  if (loading && !currentAssignment) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading exam paper...</p>
        </div>
      </div>
    );
  }

  if (error || !currentAssignment) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="text-center bg-white border border-slate-100 rounded-3xl p-8 max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to load paper</h3>
          <p className="text-sm text-slate-500 mb-6">{error || 'Assignment details are unavailable.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const paper = currentAssignment.generatedPaper;

  return (
    <>
      <div className="print:hidden">
        <Header title={currentAssignment.title} showBack />
      </div>

      <div className="print:p-0 p-8 flex-1 overflow-y-auto bg-slate-100/50 print:bg-white flex flex-col items-center">
        <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition shadow-sm ${
                showAnswerKey
                  ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-2 px-5 py-2 text-white rounded-full text-xs font-bold transition shadow-md ${
                isGeneratingPdf
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#ff4d00] hover:bg-[#e04400] shadow-orange-100'
              }`}
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Save as PDF
                </>
              )}
            </button>
          </div>
        </div>

        <div id="question-paper-card" className="w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl shadow-sm p-12 print:p-0 print:border-none print:shadow-none min-h-[1050px] flex flex-col font-serif relative">
          <div className="absolute top-4 right-6 text-[10px] text-slate-300 font-sans print:hidden">
            VedaAI Generated Document
          </div>

          <div className="text-center space-y-2 border-b-2 border-slate-800 pb-6 mb-6">
            <h1 className="text-2xl font-extrabold tracking-wide uppercase text-slate-950 font-serif">
              Delhi Public School
            </h1>
            <p className="text-xs font-sans font-bold tracking-widest text-slate-500 uppercase">
              Bokaro Steel City, Jharkhand
            </p>
            <h2 className="text-base font-bold text-slate-800 tracking-wide uppercase font-serif mt-4">
              ASSESSMENT: {currentAssignment.title.toUpperCase()}
            </h2>
            <div className="flex justify-between items-center text-xs font-sans text-slate-600 pt-4 px-2">
              <span>Time Allowed: 2 Hours</span>
              <span>Maximum Marks: {currentAssignment.totalMarks}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs font-sans text-slate-700 border border-slate-200 p-4 rounded-xl mb-8 print:border-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold">Student Name:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Roll Number:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Section:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4" />
            </div>
          </div>

          {paper?.sections && paper.sections.length > 0 ? (
            <div className="space-y-8 flex-1">
              {paper.sections.map((section, sIdx) => (
                <div key={section._id || sIdx} className="space-y-4">
                  <div className="border-b border-slate-300 pb-2">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      {section.title}
                    </h3>
                    <p className="text-xs italic text-slate-500 mt-1 font-sans">
                      {section.instruction}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {section.questions.map((question, qIdx) => (
                      <div key={question._id || qIdx} className="group relative">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <span className="text-sm font-medium text-slate-900 leading-relaxed font-serif">
                              <span className="mr-2 font-bold font-sans text-xs">{qIdx + 1}.</span>
                              {question.text}
                            </span>

                            {question.options && question.options.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 pl-6 pt-1">
                                {question.options.map((opt, oIdx) => {
                                  const isCorrectOpt = showAnswerKey && (
                                    (question.correctAnswer && (
                                      opt.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim() ||
                                      question.correctAnswer.toLowerCase().trim().includes(opt.toLowerCase().trim()) ||
                                      opt.toLowerCase().trim().includes(question.correctAnswer.toLowerCase().trim())
                                    )) ||
                                    (!question.correctAnswer && oIdx === 0)
                                  );

                                  return (
                                    <div
                                      key={oIdx}
                                      className={`flex items-center gap-2.5 text-xs font-sans px-3 py-1.5 rounded-lg border transition ${
                                        isCorrectOpt
                                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-medium'
                                          : 'bg-transparent border-transparent text-slate-700'
                                      }`}
                                    >
                                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] transition ${
                                        isCorrectOpt
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'bg-slate-50 border-slate-200 text-slate-500'
                                      }`}>
                                        {String.fromCharCode(97 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {showAnswerKey && (
                              <div className="mt-3 p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-1.5 text-xs font-sans print:bg-slate-50/50">
                                <div>
                                  <span className="font-bold text-slate-800 mr-1.5">
                                    {!question.options ? 'Model Answer:' : 'Correct Option:'}
                                  </span>
                                  <span className="text-slate-700 font-medium">
                                    {question.correctAnswer || (question.options ? question.options[0] : 'Refer to uploaded document content for specific key metrics.')}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 mr-1.5">Explanation:</span>
                                  <span className="text-slate-600 leading-relaxed">
                                    {question.explanation || 'Sample marking scheme definition and evaluation criteria for this question.'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 pt-0.5 font-sans">
                            <span className={`print:hidden inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              question.difficulty === 'Easy'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : question.difficulty === 'Moderate'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className="text-xs font-bold text-slate-800 shrink-0">
                              [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 italic text-sm">No structured sections were generated.</p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-8 mt-12 text-center text-[10px] font-sans text-slate-400">
            *** End of Question Paper ***
          </div>
        </div>
      </div>
    </>
  );
}
