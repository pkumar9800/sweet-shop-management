import express from "express"

const app = express()
app.use(express.json({limit: "16kb"}))

import userRoutes from './routes/user.routes.js';
import sweetRoutes from './routes/sweet.routes.js'

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sweets', sweetRoutes);

export default app