import Module from 'module';
import { pino } from 'pino';

import { NextFunction, Request } from 'express';

const DEFAULT_LEVEL = 'debug';

interface LogFunction {
    <T extends object>(obj: T, msg?: string, ...args: any[]): void;
    (obj: unknown, msg?: string, ...args: any[]): void;
    (msg: string, ...args: any[]): void;
}

interface Logger {
    fatal: LogFunction;
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    debug: LogFunction;
    trace: LogFunction;
    silent: LogFunction;
}

export function makeLogger(module: Module | undefined, level = DEFAULT_LEVEL): Logger {
    const fileTransport = pino.transport({
        target: 'pino/file',
        options: { destination: 'app.log' },
    });
    return pino({ level, fileTransport });
}

const logger = makeLogger(module);

export function requestLogger(req: Request, res, next: NextFunction) {
    const { method, url, ip } = req;
    logger.info({ method, url, ip }, `[${method}] - ${url}`);
    next();
}
