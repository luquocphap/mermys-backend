import express from 'express';
import { aiController } from '../controllers/ai.controller.js';
const aiRouter = express.Router();

// Tạo route CRUD
aiRouter.post('/', aiController.getRecommend);

export default aiRouter;