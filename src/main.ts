import * as express from 'express';
import initialiseRoutes from './routes';
import { makeLogger, requestLogger } from './logger';
import { createServer } from 'http';

const LOCALHOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

const log = makeLogger(module);

export function expressApp(port: number) {
    const app = express();

    app.use(requestLogger);

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

if (require.main === module) {
    start();
}
