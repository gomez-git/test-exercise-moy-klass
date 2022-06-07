import Router from 'express';
import rootRouter from './root.js';
import lessonsRouter from './lessons.js';

const router = new Router();

router.use('/', rootRouter);
router.use('/lessons', lessonsRouter);

export default router;
