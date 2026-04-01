import { responseSuccess } from "../common/helpers/response.helper.js";
import { productService } from "../services/product.service.js"

export const productController = {
    async findAll (req, res, next) {
        const result = await productService.findAll(req);
        const response = responseSuccess(result, "Lấy danh sách product thành công")
        res.status(201).json(response);
    },

    async findOne (req, res, next) {
        const result = await productService.findOne(req);
        const response = responseSuccess(result, "Lấy danh sách product thành công")
        res.status(201).json(response);
    },

    async create(req, res, next) {
        const result = await productService.create(req);
        const response = responseSuccess(result, "Tạo product thành công")
        res.status(201).json(response);
    },

    async update(req, res, next) {
        const result = await productService.update(req);
        const response = responseSuccess(result, "Update product thành công")
        res.status(200).json(response);
    },

    async delete(req, res, next) {
        const result = await productService.delete(req);
        const response = responseSuccess(result, "Delete product thành công")
        res.status(200).json(response);
    },

    async postImage(req, res, next) {
        const result = await productService.postImage(req);
        const response = responseSuccess(result, "Delete product thành công")
        res.status(200).json(response);
    },

    async addQuantityToProduct(req, res, next) {
        const result = await productService.addQuantityToProduct(req);
        const response = responseSuccess(result, "Thêm quantity cho sản phẩm thành công")
        res.status(201).json(response);
    }
}