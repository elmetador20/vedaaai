import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  deleteAssignment,
  regenerateAssignment,
  enhancePromptController
} from '../controllers/assignment.controller';

const router = Router();

router.post('/', createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.delete('/:id', deleteAssignment);
router.post('/:id/regenerate', regenerateAssignment);
router.post('/enhance-prompt', enhancePromptController);

export default router;
