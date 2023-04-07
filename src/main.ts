import * as express from 'express';
import initialiseRoutes from './routes';
import { requestLogger } from './requestLogger';
import { createServer } from 'http';

const LOCALHOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

export function expressApp(port) {
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

    console.log(`App listening on http://${LOCALHOST}:${port}`);
    return { app, server };
}

if (require.main === module) {
    start();
}
