import Router from 'express';
import rootController from '../controllers/root.js';

const router = new Router();

router.get('/', rootController);

export default router;
