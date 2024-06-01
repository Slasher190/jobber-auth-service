import http from 'http';

import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@slasher190/jobber-app';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Application, NextFunction, Request, Response, urlencoded, json } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from '@auth/elasticsearch';

const SERVER_PORT: number = 4002;

const log: Logger = winstonLogger(`${config.ELASTIC_SERACH_URL}`, 'authenticationSearchServer', 'debug');

export function start(app: Application): void {
  securityMiddileware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

function securityMiddileware(app: Application): void {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  // ['Bearer', 'fhoh3o2hr']
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routesMiddleware(app: Application): void {
  console.log(app);
}

async function startQueues(): Promise<void> {}

function startElasticSearch(): void {
  checkConnection();
}

function authErrorHandler(app: Application): void {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction): void => {
    log.log('error', `AuthService ${error.comingForm}:`, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeError());
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Authentication server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Authentication server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'AuthService startServer() method error:', error);
  }
}
