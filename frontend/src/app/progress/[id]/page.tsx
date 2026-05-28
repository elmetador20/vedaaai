'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, Hourglass, Bot, FileCheck, Layers } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { getSocket } from '@/utils/socket';
import Header from '@/components/Header';

export default function ProgressPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    currentAssignment,
    socketStatus,
    fetchAssignmentById,
    setSocketStatus,
  } = useAssignmentStore();

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id).then((assignment) => {
        if (assignment && assignment.status === 'completed') {
          router.push(`/output/${id}`);
        }
      });

      const socket = getSocket();
      socket.emit('join', id);

      socket.on('status-update', (payload: any) => {
        setSocketStatus(payload.status);
        if (payload.status === 'completed') {
          router.push(`/output/${id}`);
        }
      });

      return () => {
        socket.off('status-update');
      };
    }
  }, [id, fetchAssignmentById, setSocketStatus, router]);

  const stages = [
    { key: 'queued', label: 'Job Queued', desc: 'Waiting in the system processing queue', icon: Hourglass },
    { key: 'processing', label: 'Processing Files', desc: 'Preparing instructions and documents', icon: Layers },
    { key: 'generating', label: 'AI Generating Questions', desc: 'Synthesizing evaluation sections and marks', icon: Bot },
    { key: 'formatting', label: 'Formatting Exam Paper', desc: 'Beautifying margins, spacing, and schema structure', icon: FileCheck },
    { key: 'completed', label: 'Completed', desc: 'Assessment paper is ready!', icon: CheckCircle2 },
  ];

  const getStageIndex = (status: string) => {
    return stages.findIndex((s) => s.key === status);
  };

  const currentIdx = getStageIndex(socketStatus || currentAssignment?.status || 'queued');
  const isFailed = socketStatus === 'failed' || currentAssignment?.status === 'failed';

  return (
    <>
      <Header title="Generating Question Paper" showBack />
      <main className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50/50">
        <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
          <div className="mb-6 relative flex justify-center">
            {isFailed ? (
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
            ) : socketStatus === 'completed' ? (
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center animate-spin">
                <Loader2 className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isFailed
              ? 'Generation Failed'
              : socketStatus === 'completed'
              ? 'Assessment Ready!'
              : 'Creating Exam Paper using Gemini AI...'}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-10">
            {isFailed
              ? 'An error occurred while creating questions. Please review the parameters and try again.'
              : 'We are creating custom sections, difficulty levels, and marking bounds.'}
          </p>

          <div className="space-y-6 text-left max-w-md mx-auto">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isCompleted = !isFailed && idx < currentIdx;
              const isActive = !isFailed && idx === currentIdx;
              const isPending = isFailed || idx > currentIdx;

              return (
                <div key={stage.key} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                      isCompleted
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : isActive
                        ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <span className="text-xs font-bold">✓</span>
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    {idx < stages.length - 1 && (
                      <div className={`w-0.5 h-10 transition-colors duration-300 ${
                        idx < currentIdx ? 'bg-slate-900' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h4 className={`text-sm font-bold transition-colors duration-300 ${
                      isActive ? 'text-indigo-600' : isPending ? 'text-slate-400' : 'text-slate-800'
                    }`}>
                      {stage.label}
                    </h4>
                    <p className={`text-xs mt-0.5 transition-colors duration-300 ${
                      isActive ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {isFailed && (
            <div className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100 text-left max-w-md mx-auto">
              <span className="text-xs font-bold text-red-700 block mb-1">Error Details</span>
              <span className="text-xs text-red-600">
                {currentAssignment?.error || 'Failed to generate structure from LLM payload.'}
              </span>
              <button
                onClick={() => router.push(`/create`)}
                className="mt-4 flex items-center gap-2 w-full justify-center py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Go Back and Modify Form
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
