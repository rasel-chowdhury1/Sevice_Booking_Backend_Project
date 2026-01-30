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
import rateLimit from 'express-rate-limit';


const app: Application = express();


// 👮 Rate Limiter Middleware (apply to all requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000000, // limit each IP to 100 requests per 15 min
  message: "🚫 Too many requests from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter); // 👈 Add before your routes

app.use(logHttpRequests);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://10.10.10.32:9000', // Allow only this origin for credentials
  'http://10.10.10.38:9000', 
  'http://204.197.173.195:9000',
  'http://204.197.173.195:4173',
  'https://gydes.netlify.app',
  'http://203.161.60.189:3010',
  "https://dashboard.gydes.app"
  // Add any other allowed origins here
];
//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests with no origin (e.g., mobile apps, curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow credentials
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
