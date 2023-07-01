import * as http from 'http';
import * as SocketIo from 'socket.io';

import { makeLogger } from './logger';

let io: SocketIo.Server;

const log = makeLogger(module);

export function init(app: Express.Application) {
    const server = http.createServer(app);

    io = new SocketIo.Server(server, {
        cors: {
            origin: 'http://localhost:3000',
        },
    });
    io.on('connection', socket => {
        log.info('Socket connected with id', socket.id);
    });

    server.listen(2999);
    log.info('Socket listening on port 2999');
}

export function Socket() {
    return io;
}
