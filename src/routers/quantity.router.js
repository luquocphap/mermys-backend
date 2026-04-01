import express from 'express';
import { quantityController } from '../controllers/quantity.controller.js';
const quantityRouter = express.Router();

// Tạo route CRUD
// quantityRouter.post('/', quantityController.create);
quantityRouter.get('/', quantityController.findAll);
quantityRouter.get('/:id', quantityController.findOne);
// quantityRouter.patch('/:id', quantityController.update);
// quantityRouter.delete('/:id', quantityController.remove);

export default quantityRouter;