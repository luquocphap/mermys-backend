import express from "express"
import { productController } from "../controllers/product.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";
import { uploadMemoryStorage } from "../common/multer/memory-storage.multer.js";

const productRouter = express.Router();

// READ
productRouter.get("", 
productController.findAll
);

productRouter.get("/:productId", 
productController.findOne
);

// CREATE
productRouter.post("/", protect, productController.create);
productRouter.post("/:productId/image", protect, uploadMemoryStorage.single('image'), productController.postImage);
productRouter.post("/:productId/quantities", protect, productController.addQuantityToProduct);

// UPDATE
productRouter.put("/:productId", protect, productController.update);

// DELETE
productRouter.delete("/:productId", protect, productController.delete)
export default productRouter;