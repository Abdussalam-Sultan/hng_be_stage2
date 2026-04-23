
const PORT = 3000;
import express from 'express';
import cors from 'cors';
import route from './route.js';
import { connectDB } from './db.js';
import { seedProfiles } from './seed.js';

const app = express();
app.use(cors());
await connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
seedProfiles();
app.use('/api', route);

export default app;
