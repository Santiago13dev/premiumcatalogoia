import express from 'express';
import { 
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
  searchComponents
} from '../controllers/componentsController.js';
import { authenticate } from '../middleware/auth.js';
import { validateComponent } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllComponents);
router.get('/search', searchComponents);
router.get('/:id', getComponentById);

// Protected routes (require authentication)
router.post('/', authenticate, validateComponent, createComponent);
router.put('/:id', authenticate, validateComponent, updateComponent);
router.delete('/:id', authenticate, deleteComponent);

export default router;