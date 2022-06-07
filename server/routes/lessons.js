import Router from 'express';
import lessonsController from '../controllers/lessons.js';

const router = new Router();

router.post('/', lessonsController);

export default router;
