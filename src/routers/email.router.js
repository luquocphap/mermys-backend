import express from 'express';
import { emailController } from '../controllers/email.controller.js';
import { protect } from '../common/middlewares/protect.middleware.js';
const emailRouter = express.Router();

// Tạo route CRUD
emailRouter.post('/', emailController.create);
emailRouter.get('/', protect,  emailController.findAll);
emailRouter.get('/:id', protect, emailController.findOne);
emailRouter.delete('/:id', protect, emailController.remove);

export default emailRouter;