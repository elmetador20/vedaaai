import { Schema, model } from 'mongoose';

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  explanation: { type: String }
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  questionTypes: [{
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marks: { type: Number, required: true }
  }],
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: { type: String },
  fileUrl: { type: String },
  fileName: { type: String },
  fileContent: { type: String },
  status: {
    type: String,
    enum: ['draft', 'queued', 'processing', 'generating', 'formatting', 'completed', 'failed'],
    default: 'draft'
  },
  error: { type: String },
  generatedPaper: {
    sections: [SectionSchema]
  }
}, {
  timestamps: true
});

export const Assignment = model('Assignment', AssignmentSchema);
export default Assignment;
