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

// ---------------------- CORS (Allow Origins) ---------------------- //
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman, server-to-server, or same-origin requests
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);
        const hostname = url.hostname;

        // ✅ Allow main domains
        if (
          hostname === "baaraat.com" ||
          hostname === "www.baaraat.com" ||
          hostname.endsWith(".baaraat.com") || // subdomains
          hostname.endsWith(".webbuilder.local") || // local subdomains
          hostname.endsWith(".vercel.app") || // Vercel preview deployments
          hostname.endsWith(".doomshell.com") || // API/infra
          hostname.match(/^[a-zA-Z0-9-]+\.local(:\d+)?$/) // local virtual domains like jaipurfoodcaterers.local:3000
        ) {
          return callback(null, true);
        }

        // ✅ Allow verified custom domains (e.g. jaipurfoodcaterers.com)
        // In production, you could check from DB if this domain belongs to a registered company
        return callback(null, true);

      } catch (e) {
        console.log("❌ Invalid origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ needed for cookies/sessions
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
    cookie: { secure: false },
  })
);

// ---------------------- Logging ---------------------- //
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------- Routes ---------------------- //
app.use('/api', AdminRouter);

// ---------------------- Error handlers ---------------------- //
app.use(badJsonHandler); // JSON validation errors
app.use(errorHandler as any); // generic error handler

export default app;
