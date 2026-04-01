import { aiService } from "../services/ai.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
export const aiController = {
   async getRecommend(req, res, next) {
      try {
         const result = await aiService.recommendProducts(req);
         const response = responseSuccess(result, `Get recommend's ai successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   
};