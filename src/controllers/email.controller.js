import { emailService } from "../services/email.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
export const emailController = {
   async create(req, res, next) {
      try {
         const result = await emailService.create(req);
         const response = responseSuccess(result, `Create email successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findAll(req, res, next) {
      try {
         const result = await emailService.findAll(req);
         const response = responseSuccess(result, `Get all emails successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async findOne(req, res, next) {
      try {
         const result = await emailService.findOne(req);
         const response = responseSuccess(result, `Get email #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },
   async remove(req, res, next) {
      try {
         const result = await emailService.remove(req);
         const response = responseSuccess(result, `Remove email #${req.params.id} successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   }
};