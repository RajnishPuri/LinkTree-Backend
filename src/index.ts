require('dotenv').config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { dbConnect } from './config/dbConnect';
import { getProfileData } from './controllers/profile.controllers';
import userRouter from './routes/user.routes';
import profileRouter from './routes/profile.routes';


const PORT = process.env.PORT || "";

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: '*',
    credentials: true,
}));

app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/:userName', getProfileData as any);
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    dbConnect();
});

