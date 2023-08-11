import * as express from 'express';
import { createServer, Server } from 'http';
import * as fileUpload from 'express-fileupload';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import * as expressStatusMonitor from 'express-status-monitor';

import initialiseRoutes from './routes';
import { makeLogger, requestLogger } from './logger';
import prisma from './prismaClient';
import { allowCrossDomain } from './middleware/cors';
import config from './config';
import { errorHandler } from './middleware/errorHandlers';

console.log({ config });

const log = makeLogger(module);

export function expressApp(port: number) {
    const app = express();

    app.use(requestLogger);

    app.use(expressStatusMonitor()); // `/status` to see stats

    app.use(allowCrossDomain);

    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );

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
    const server = createServer(app);
    server.listen(port);

    log.info(`App listening on http://${config.host}:${port}`);
    process.stdout.write(`App listening on http://${config.host}:${port}\n`);
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
