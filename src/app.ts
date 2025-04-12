/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middleware/globalErrorhandler';
// import notFound from './app/middleware/notfound';
import router from './app/routes';
import notFound from './app/middleware/notfound';
import { logHttpRequests } from './app/utils/logger';
const app: Application = express();
app.use(logHttpRequests);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://204.197.173.195:9000',    // your deployed frontend
  'http://localhost:9000',          // local dev frontend
  'http://192.168.0.101:3000',      // mobile browser in same WiFi
  'https://yourfrontend.com',       // custom domain frontend
  "*"
];
//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),
);

// Remove duplicate static middleware
// app.use(app.static('public'));

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Guide Project server is running');
});


app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
