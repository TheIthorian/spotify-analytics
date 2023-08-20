import * as express from 'express';
import * as cors from 'cors';
import { createServer, Server } from 'https';
import { createServer as createHttpServer } from 'http';
import * as fileUpload from 'express-fileupload';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as expressStatusMonitor from 'express-status-monitor';

import initialiseRoutes from './routes';
import { makeLogger, requestLogger } from './logger';
import prisma from './prismaClient';
import config from './config';
import { errorHandler } from './middleware/errorHandlers';

const log = makeLogger(module);

log.info({ config });

const httpsOptions = config.isTest
    ? {}
    : {
          key: fs.readFileSync('../../.project/localhost.key'),
          cert: fs.readFileSync('../../.project/localhost.crt'),
      };

export function expressApp(port: number) {
    const app = express();

    app.use(requestLogger);

    app.use(expressStatusMonitor()); // `/status` to see stats

    app.use(
        cors({
            origin: config.uiUrl,
            credentials: true,
            exposedHeaders: ['Total', 'Count'],
        })
    );

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(bodyParser.json());

    app.use(cookieParser());

    app.use(
        fileUpload({
            limits: { fileSize: config.maxUploadFileSize },
            safeFileNames: true,
            abortOnLimit: true,
            useTempFiles: true,
            preserveExtension: 10,
        })
    );

    app.use(initialiseRoutes());

    app.use(errorHandler());

    app.get('/', (req, res) => res.send('Hello'));

    app.set('port', port);

    return app;
}

export function start(port: number) {
    const app = expressApp(port);

    const server = config.isTest ? createHttpServer(app) : createServer(httpsOptions, app);
    server.listen(port);

    log.info(`App listening on https://${config.host}:${port}`);
    process.stdout.write(`App listening on https://${config.host}:${port}\n`);
    return { app, server };
}

export async function stop(server: Server) {
    process.stdout.write('Stopping server\n');
    const promise = new Promise<void>((resolve, reject) => {
        server.close(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    await prisma.$disconnect();
    return await promise;
}

if (require.main === module) {
    start(config.port);
}
