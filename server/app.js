import Express from 'express';
import router from './routes/index.js';

const app = new Express();

app.use(router);

export default app;
