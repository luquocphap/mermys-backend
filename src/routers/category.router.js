import express from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { protect } from '../common/middlewares/protect.middleware.js';
const categoryRouter = express.Router();

// Tạo route CRUD
categoryRouter.post('/', categoryController.create);
categoryRouter.get('/', categoryController.findAll);
categoryRouter.get('/:id', protect,categoryController.findOne);
categoryRouter.patch('/:id', protect, categoryController.update);
categoryRouter.delete('/:id', protect, categoryController.remove);

export default categoryRouter;