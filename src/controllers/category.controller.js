import { categoryService } from "../services/category.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
export const categoryController = {
   async create(req, res, next) {
      try {
         const result = await categoryService.create(req);
         const response = responseSuccess(result, `Create category successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findAll(req, res, next) {
      try {
         const result = await categoryService.findAll(req);
         const response = responseSuccess(result, `Get all categorys successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findOne(req, res, next) {
      try {
         const result = await categoryService.findOne(req);
         const response = responseSuccess(result, `Get category #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async update(req, res, next) {
      try {
         const result = await categoryService.update(req);
         const response = responseSuccess(result, `Update category #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async remove(req, res, next) {
      try {
         const result = await categoryService.remove(req);
         const response = responseSuccess(result, `Remove category #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   }
};