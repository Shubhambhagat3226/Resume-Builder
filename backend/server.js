import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js';
import userRouter from './routes/UserRouter.js';

import path from 'path';
import { fileURLToPath } from 'url';
import ResumeRouter from './routes/ResumeRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));

// CONNECT DB
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use('/api/auth', userRouter);
app.use('/api/resume', ResumeRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
    }
}));


// ROUTES
app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});