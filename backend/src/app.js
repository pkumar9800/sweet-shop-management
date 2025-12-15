import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import router
import userRoutes from './routes/user.routes.js';
import sweetRoutes from './routes/sweet.routes.js';
import healthcheckRouter from "./routes/healthcheck.routes.js";

//declare route
app.use("/", healthcheckRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sweets', sweetRoutes);

export default app