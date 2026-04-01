import express from "express";
import authRouter from "./auth.router.js";
import productRouter from "./product.router.js";
import categoryRouter from "./category.router.js";
import emailRouter from "./email.router.js";
import orderRouter from "./order.router.js";

const rootRouter = express.Router();

rootRouter.use("/product", productRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/category", categoryRouter);
rootRouter.use('/email', emailRouter);
rootRouter.use("/order", orderRouter)



export default rootRouter;