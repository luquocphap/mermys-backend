import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import { protect } from '../common/middlewares/protect.middleware.js';
const orderRouter = express.Router();

// Tạo route CRUD
orderRouter.post('/', orderController.create);
orderRouter.get('/', protect, orderController.findAll);
orderRouter.get('/:id', protect, orderController.findOne);
orderRouter.delete('/:id', protect, orderController.remove);

export default orderRouter;