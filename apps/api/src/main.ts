import * as express from 'express';
import { createServer, Server } from 'http';
import * as fileUpload from 'express-fileupload';
import * as expressStatusMonitor from 'express-status-monitor';

import initialiseRoutes from './routes';
import { makeLogger, requestLogger } from './logger';
import prisma from './prismaClient';
import { allowCrossDomain } from './middleware/cors';

const LOCALHOST = '127.0.0.1';
const DEFAULT_PORT = process.env.INTEGRATION_TEST?.toUpperCase() === 'TRUE' ? 4001 : 3001;
const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const log = makeLogger(module);

export function expressApp(port: number) {
    const app = express();

    app.use(requestLogger);

    app.use(expressStatusMonitor()); // `/status` to see stats

    app.use(allowCrossDomain);

    app.use(
        fileUpload({
            limits: { fileSize: MAX_UPLOAD_FILE_SIZE },
            safeFileNames: true,
            abortOnLimit: true,
            useTempFiles: true,
            preserveExtension: 10,
        })
    );

    app.use(initialiseRoutes());

    app.get('/', (req, res) => res.send('Hello'));

    app.set('port', port);

    return app;
}

export function start(port = DEFAULT_PORT) {
    const app = expressApp(port);
    const server = createServer(app);
    server.listen(port);

    log.info(`App listening on http://${LOCALHOST}:${port}`);
    return { app, server };
}

export async function stop(server: Server) {
    server.close();
    await prisma.$disconnect();
}

if (require.main === module) {
    start();
}
