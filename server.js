import express from "express";
import rootRouter from "./src/routers/root.router.js";
import { appError } from "./src/common/helpers/error.helper.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logApi } from "./src/common/middlewares/log-api.middleware.js";
import { initLoginGooglePassport } from "./src/common/passport/login-google.passport.js";
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from "./src/common/swagger/init.swagger.js";
import { initSocket } from "./src/common/socket/init.socket.js";
import { FRONTEND_URL } from "./src/common/constant/app.constant.js";


const app = express();

// app.use((req, res, next) => {
//     console.log(req.headers);
    
//     res.setHeader("access-control-allow-methods", "GET,HEAD,PUT,PATCH,DELETE,POST");
//     res.setHeader("access-control-allow-headers", "content-type");
//     res.setHeader("access-control-allow-origin", "http://localhost:3000");

//     next();
// })

app.set('trust proxy', 1);

app.use(cors({ origin: ["http://localhost:8080", FRONTEND_URL], credentials: true }))
app.get("", (req, res, next) => {
    res.json("Hello world")
});


// chuyển json thành object trong js
app.use(express.json());
// Lấy cookie
app.use(cookieParser());

initLoginGooglePassport();

app.use(express.static("public"))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(logApi);
app.use("/api", rootRouter)
app.use(appError)

const httpServer = initSocket(app);

const PORT = 3069
const server = httpServer.listen(PORT, () => {
    console.log(`Server online at port: ${PORT}`)
})

server.requestTimeout = 0