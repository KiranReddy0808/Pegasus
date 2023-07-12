/** source/server.ts */
import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import fs from 'fs';
import routes from './routes/routes';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUI from 'swagger-ui-express';
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { exchangeCodeForAccessToken, exchangeNpssoForCode} from "psn-api";
import { Request, Response, NextFunction } from 'express';

const standardRateLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: 'You have exceeded number of requests, Try again later!', 
    standardHeaders: true,
    legacyHeaders: false,
  });


const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'You have exceeded number of requests, Try again later!', 
  standardHeaders: true,
  legacyHeaders: false,
});


const router: Express = express();

const apiSpecPath: string = path.join(__dirname, 'api', 'api.yaml')

/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

router.use('/steam/:id/summary', rateLimiter);
router.use('/steam/:id/recently-played', rateLimiter);
router.use('/catto', rateLimiter);
router.use('/steam/:id/summary/svg', rateLimiter);
router.use('/doggo', rateLimiter);
router.use('/psn/:id/summary', rateLimiter)
router.use('/psn/:id/summary/svg', rateLimiter)
router.use('/moon-phase/svg', rateLimiter)


router.use('/version', standardRateLimiter);
router.use('/health', standardRateLimiter);

/** RULES OF OUR API */
router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});


/** Routes */
router.use('/', routes);

const apiSpecDoc: any = yaml.load(fs.readFileSync(apiSpecPath, 'utf8'));
router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(apiSpecDoc))


/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Bad Request');
    return res.status(400).json({
        message: error.message
    });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));


