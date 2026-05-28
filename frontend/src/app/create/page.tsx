'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, Upload, Calendar, ArrowRight, ArrowLeft, Mic } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import Header from '@/components/Header';

const QuestionTypeSchema = z.object({
  type: z.string().min(1, 'Select a type'),
  count: z.number().min(1, 'Min 1'),
  marks: z.number().min(1, 'Min 1'),
});

const AssignmentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(QuestionTypeSchema).min(1, 'At least one question type is required'),
  additionalInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof AssignmentFormSchema>;

const PRESET_QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
];

export default function CreateAssignment() {
  const router = useRouter();
  const createAssignment = useAssignmentStore((state) => state.createAssignment);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(AssignmentFormSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      questionTypes: [
        { type: 'Multiple Choice Questions', count: 4, marks: 1 },
        { type: 'Short Questions', count: 3, marks: 2 },
      ],
      additionalInstructions: '',
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionTypes',
  });

  const watchQuestionTypes = watch('questionTypes') || [];

  const totalQuestions = watchQuestionTypes.reduce((sum, q) => sum + (q.count || 0), 0);
  const totalMarks = watchQuestionTypes.reduce((sum, q) => sum + ((q.count || 0) * (q.marks || 0)), 0);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      dueDate: values.dueDate || undefined,
      questionTypes: values.questionTypes,
      additionalInstructions: values.additionalInstructions,
      fileName: fileName || undefined,
      fileContent: fileContent || undefined,
    };

    const result = await createAssignment(payload);
    if (result) {
      router.push(`/progress/${result._id}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);

      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          if (!(window as any).pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            document.head.appendChild(script);
            await new Promise((res) => {
              script.onload = res;
            });
          }

          const pdfjsLib = (window as any).pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

          const fileReader = new FileReader();
          fileReader.onload = async function () {
            try {
              const typedarray = new Uint8Array(this.result as ArrayBuffer);
              const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
              }
              setFileContent(fullText);
            } catch (err) {
              console.error(err);
            }
          };
          fileReader.readAsArrayBuffer(file);
        } catch (err) {
          console.error(err);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFileContent(event.target.result as string);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <>
      <Header title="Create Assignment" showBack />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full" />
            </div>
            <span className="text-[20px] font-bold text-slate-800 leading-tight">Create Assignment</span>
          </div>
          <p className="text-xs text-slate-500">Set up a new assignment for your students</p>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-slate-800 h-full w-1/2" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Assignment Details</h3>
              <p className="text-xs text-slate-400">Basic information about your assignment</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Quiz on Electricity"
                {...register('title')}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition text-slate-800 ${
                  errors.title ? 'border-red-300' : 'border-slate-100'
                }`}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-2xl p-6 text-center relative group hover:bg-slate-50 transition cursor-pointer">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-slate-500" />
                </div>
                {fileName ? (
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">{fileName}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileName(null);
                        setFileContent(null);
                      }}
                      className="text-xs text-red-500 font-semibold mt-1"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-slate-800">
                      Choose a file or drag & drop it here
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      JPEG, PNG, upto 10MB
                    </span>
                    <button
                      type="button"
                      className="mt-3 px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-semibold shadow-sm hover:bg-slate-50 transition"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center -mt-2">
              Upload images of your preferred document/image
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  {...register('dueDate')}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition text-slate-800 ${
                    errors.dueDate ? 'border-red-300' : 'border-slate-100'
                  }`}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Question Type</label>
                <div className="hidden lg:flex gap-4 text-xs font-bold text-slate-600 uppercase tracking-wider mr-8">
                  <span className="w-36 text-center">No. of Questions</span>
                  <span className="w-36 text-center">Marks</span>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    {/* Desktop Question Row */}
                    <div className="hidden lg:flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                      <div className="flex-1 flex items-center gap-3">
                        <select
                          {...register(`questionTypes.${index}.type`)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-300 text-slate-800"
                        >
                          {PRESET_QUESTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-36 flex justify-center">
                          <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-full px-2 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.count || 0;
                                if (val > 1) setValue(`questionTypes.${index}.count`, val - 1);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-sm font-semibold transition"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-slate-800">
                              {watchQuestionTypes[index]?.count || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.count || 0;
                                setValue(`questionTypes.${index}.count`, val + 1);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-sm font-semibold transition"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="w-36 flex justify-center">
                          <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-full px-2 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.marks || 0;
                                if (val > 1) setValue(`questionTypes.${index}.marks`, val - 1);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-sm font-semibold transition"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-slate-800">
                              {watchQuestionTypes[index]?.marks || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.marks || 0;
                                setValue(`questionTypes.${index}.marks`, val + 1);
                              }}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-sm font-semibold transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Question Card */}
                    <div className="lg:hidden bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <select
                          {...register(`questionTypes.${index}.type`)}
                          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-300 text-slate-800"
                        >
                          {PRESET_QUESTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. of Questions</span>
                          <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.count || 0;
                                if (val > 1) setValue(`questionTypes.${index}.count`, val - 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-xs font-semibold transition"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {watchQuestionTypes[index]?.count || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.count || 0;
                                setValue(`questionTypes.${index}.count`, val + 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-xs font-semibold transition"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marks</span>
                          <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.marks || 0;
                                if (val > 1) setValue(`questionTypes.${index}.marks`, val - 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-xs font-semibold transition"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {watchQuestionTypes[index]?.marks || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const val = watchQuestionTypes[index]?.marks || 0;
                                setValue(`questionTypes.${index}.marks`, val + 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-slate-600 hover:shadow-sm text-xs font-semibold transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append({ type: 'Multiple Choice Questions', count: 5, marks: 1 })}
                className="flex items-center gap-3 text-sm font-bold text-slate-800 hover:text-slate-900 transition mt-4 group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-slate-800 transition shadow-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add Question Type</span>
              </button>
            </div>

            <div className="flex flex-col items-end gap-1 text-slate-500 font-semibold text-sm pt-4 border-t border-slate-50">
              <div>Total Questions : <span className="text-slate-800 font-bold">{totalQuestions}</span></div>
              <div>Total Marks : <span className="text-slate-800 font-bold">{totalMarks}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Additional Information (For better output)
              </label>
              <div className="relative">
                <textarea
                  placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                  {...register('additionalInstructions')}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-slate-300 transition text-slate-800 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-4 bottom-4 p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8 pb-8">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-50 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              type="submit"
              disabled={!isValid || !fileName}
              className="flex items-center gap-2 px-8 py-3 bg-[#111] text-white rounded-full text-sm font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
