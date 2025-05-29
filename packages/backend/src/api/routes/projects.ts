import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

interface Project {
  id: number;
  name: string;
  status: string;
}

// Mock data - replace with database in production
let projects: Project[] = [
  { id: 1, name: 'Project Alpha', status: 'Active' },
  { id: 2, name: 'Project Beta', status: 'Deploying' }
];

// Middleware to check validation results
function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Get all projects
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json(projects);
});

// Get project by ID
router.get(
  '/:id', 
  authenticateToken, 
  param('id').isInt(), 
  validate,
  (req: AuthRequest, res: Response) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  }
);

// Create new project
router.post(
  '/',
  authenticateToken,
  body('name').isString().notEmpty(),
  validate,
  (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    const newProject: Project = {
      id: projects.length + 1,
      name,
      status: 'Active'
    };

    projects.push(newProject);
    res.status(201).json(newProject);
  }
);

// Update project status
router.patch(
  '/:id/status',
  authenticateToken,
  param('id').isInt(),
  body('status').isString().notEmpty(),
  validate,
  (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const project = projects.find(p => p.id === parseInt(req.params.id));

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    res.json(project);
  }
);

export default router;
