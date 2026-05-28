import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { connectDB } from './utils/db';
import { initSocketServer } from './sockets/socket';
import { startWorker } from './queues/queue';
import assignmentRoutes from './routes/assignment.routes';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/assignments', assignmentRoutes);

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  initSocketServer(server);
  startWorker();

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
