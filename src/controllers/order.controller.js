import { orderService } from "../services/order.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
export const orderController = {
   async create(req, res, next) {
      try {
         const result = await orderService.create(req);
         const response = responseSuccess(result, `Create order successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findAll(req, res, next) {
      try {
         const result = await orderService.findAll(req);
         const response = responseSuccess(result, `Get all orders successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findOne(req, res, next) {
      try {
         const result = await orderService.findOne(req);
         const response = responseSuccess(result, `Get order #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async remove(req, res, next) {
      try {
         const result = await orderService.remove(req);
         const response = responseSuccess(result, `Remove order #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   }
};