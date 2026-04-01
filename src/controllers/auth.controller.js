
import { authService } from "../services/auth.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
export const authController = {
   async login(req, res, next) {
      try {
         const result = await authService.login(req);
         const response = responseSuccess(result, `Login auth successfully`);
         
         res.cookie('accessToken', token, {
         httpOnly: true, // Chống XSS
         secure: true,   // BẮT BUỘC: Chỉ gửi cookie qua HTTPS (Render/Vercel đều có HTTPS)
         sameSite: 'none', // BẮT BUỘC: Cho phép gửi cookie chéo domain (Cross-site)
         maxAge: 24 * 60 * 60 * 1000 // 1 ngày
      });

      // Làm tương tự với refreshToken
      res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: 24 * 60 * 60 * 1000
      });
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async logout(req, res, next) {
      try {
         const result = await authService.logout(req);
         const response = responseSuccess(result, `Login auth successfully`);
         
         res.clearCookie("accessToken");
         res.clearCookie("refreshToken");
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async register(req, res, next) {
      try {
         const result = await authService.register(req);
         const response = responseSuccess(result, `Register all auths successfully`);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },

   async getInfo(req, res, next){
      const result = await authService.getInfo(req);
      const response = responseSuccess(result, `Get info successfully`);
      res.status(response.statusCode).json(response);
   },

   async refreshToken(req, res, next) {
      try {
         const result = await authService.refreshToken(req);
         const response = responseSuccess(result, `refreshToken auth successfully`);
         
         res.cookie("accessToken", result.accessToken);
         res.cookie("refreshToken", result.refreshToken);
         res.status(response.statusCode).json(response);
      } catch (err) {
         next(err);
      }
   },
   
}