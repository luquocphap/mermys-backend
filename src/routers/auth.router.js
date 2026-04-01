import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { protect } from '../common/middlewares/protect.middleware.js';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.get("/get-info", protect, authController.getInfo);
authRouter.post("/refresh-token", authController.refreshToken);


export default authRouter;