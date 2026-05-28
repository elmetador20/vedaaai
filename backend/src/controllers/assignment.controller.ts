import { Request, Response } from 'express';
import { Assignment } from '../models/assignment.model';
import { assignmentQueue } from '../queues/queue';

export async function createAssignment(req: Request, res: Response) {
  try {
    const { title, dueDate, questionTypes, additionalInstructions, fileName, fileContent } = req.body;

    const totalQuestions = questionTypes.reduce((sum: number, q: any) => sum + q.count, 0);
    const totalMarks = questionTypes.reduce((sum: number, q: any) => sum + q.count * q.marks, 0);

    const assignment = new Assignment({
      title,
      dueDate,
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions,
      fileName,
      fileContent,
      status: 'queued'
    });

    await assignment.save();
    await assignmentQueue.add(
      'generate-paper',
      { assignmentId: assignment._id.toString() },
      { attempts: 5, backoff: { type: 'fixed', delay: 60000 } }
    );

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAssignments(req: Request, res: Response) {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAssignmentById(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function regenerateAssignment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    assignment.status = 'queued';
    assignment.error = '';
    await assignment.save();

    await assignmentQueue.add(
      'generate-paper',
      { assignmentId: assignment._id.toString() },
      { attempts: 5, backoff: { type: 'fixed', delay: 60000 } }
    );

    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

import { enhancePrompt } from '../services/gemini.service';

export async function enhancePromptController(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'prompt string is required' });
      return;
    }

    const enhanced = await enhancePrompt(prompt);
    res.json({ enhancedPrompt: enhanced });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
