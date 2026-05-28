import { create } from 'zustand';

export interface Question {
  _id?: string;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Section {
  _id?: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  sections: Section[];
}

export interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate?: string;
  questionTypes: QuestionTypeConfig[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: 'draft' | 'queued' | 'processing' | 'generating' | 'formatting' | 'completed' | 'failed';
  error?: string;
  generatedPaper?: GeneratedPaper;
  fileName?: string;
  fileContent?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  loading: boolean;
  error: string | null;
  socketStatus: string | null;
  
  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<Assignment | null>;
  createAssignment: (data: Omit<Assignment, '_id' | 'status' | 'totalQuestions' | 'totalMarks' | 'createdAt' | 'updatedAt'>) => Promise<Assignment | null>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  setSocketStatus: (status: string | null) => void;
  updateAssignmentInList: (assignment: Assignment) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/assignments';

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
  socketStatus: null,

  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      set({ assignments: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAssignmentById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch assignment details');
      const data = await res.json();
      set({ currentAssignment: data, loading: false, socketStatus: data.status });
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  createAssignment: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create assignment');
      const newAssignment = await res.json();
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        currentAssignment: newAssignment,
        socketStatus: newAssignment.status,
        loading: false,
      }));
      return newAssignment;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  deleteAssignment: async (id: string) => {
    set({ error: null });
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete assignment');
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
        currentAssignment: state.currentAssignment?._id === id ? null : state.currentAssignment,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  regenerateAssignment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/${id}/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to regenerate paper');
      const updated = await res.json();
      set((state) => ({
        currentAssignment: updated,
        socketStatus: updated.status,
        assignments: state.assignments.map((a) => (a._id === id ? updated : a)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setSocketStatus: (status) => set({ socketStatus: status }),

  updateAssignmentInList: (assignment) => {
    set((state) => {
      const updatedList = state.assignments.map((a) =>
        a._id === assignment._id ? assignment : a
      );
      return {
        assignments: updatedList,
        currentAssignment: state.currentAssignment?._id === assignment._id ? assignment : state.currentAssignment,
        socketStatus: state.currentAssignment?._id === assignment._id ? assignment.status : state.socketStatus,
      };
    });
  },
}));
