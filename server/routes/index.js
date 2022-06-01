import Express from 'express';
import rootController from '../controllers/root.js';

const router = Express.Router();
router.get('/', rootController);

export default router;
