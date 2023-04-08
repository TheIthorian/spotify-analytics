import * as express from 'express';
import { createServer, Server } from 'http';
import * as fileUpload from 'express-fileupload';

import initialiseRoutes from './routes';
import { makeLogger, requestLogger } from './logger';
import prisma from './prismaClient';

const LOCALHOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const log = makeLogger(module);

export function expressApp(port: number) {
    const app = express();

    app.use(requestLogger);

    app.use(
        fileUpload({
            limits: { fileSize: MAX_UPLOAD_FILE_SIZE },
            safeFileNames: true,
            abortOnLimit: true,
            useTempFiles: true,
            preserveExtension: true,
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
