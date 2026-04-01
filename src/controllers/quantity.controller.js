import { quantityService } from "../services/quantity.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
export const quantityController = {
   async create(req, res, next) {
      try {
         const result = await quantityService.create(req);
         const response = responseSuccess(result, `Create quantity successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findAll(req, res, next) {
      try {
         const result = await quantityService.findAll(req);
         const response = responseSuccess(result, `Get all quantitys successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findOne(req, res, next) {
      try {
         const result = await quantityService.findOne(req);
         const response = responseSuccess(result, `Get quantity #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async update(req, res, next) {
      try {
         const result = await quantityService.update(req);
         const response = responseSuccess(result, `Update quantity #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async remove(req, res, next) {
      try {
         const result = await quantityService.remove(req);
         const response = responseSuccess(result, `Remove quantity #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   }
};