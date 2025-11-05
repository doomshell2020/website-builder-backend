import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import session from 'express-session';
import AdminRouter from './src/routes/index';
import { errorHandler, badJsonHandler } from './src/middleware/index';

require('dotenv').config({ path: '.env.local' });

const app = express();

// ---------------------- Middleware ---------------------- //

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.0.77:3000",
  "http://192.168.0.77:5000",
  "http://localhost:5002",
  "http://webbuilder.local:3000",
  "https://navlok.doomshell.com",
  "https://navvistarinfra.doomshell.com",
  "https://website-builder-frontend-three.vercel.app",
  "https://api.doomshell.com",
  process.env.SITE_URL,
];

// ✅ CORS configuration (only this one, remove any extra app.use(cors()))
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow server-to-server or Postman requests

      // ✅ Allow fixed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ Allow any subdomain of website-builder-frontend-three.vercel.app
      const subdomainRegex = /^https?:\/\/([a-zA-Z0-9-]+)\.website-builder-frontend-three\.vercel\.app$/;
      if (subdomainRegex.test(origin)) {
        return callback(null, true);
      }

      // ❌ Otherwise, block it
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

// ---------------------- Static Files ---------------------- //
const UPLOAD_DIR =
  process.env.NODE_ENV === 'production'
    ? '/var/www/html/website-builder-backend/uploads'
    : path.join(process.cwd(), 'uploads');

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------- Other Middleware ---------------------- //
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------- Session ---------------------- //
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set true if using HTTPS
  })
);

// ---------------------- Logging ---------------------- //
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------- Routes ---------------------- //
app.use('/api', AdminRouter);
// app.use('/api/v1/admin', authMiddleware, AdminRouter);

// ---------------------- Error handlers ---------------------- //
app.use(badJsonHandler); // JSON validation errors
app.use(errorHandler as any); // generic error handler

export default app;
