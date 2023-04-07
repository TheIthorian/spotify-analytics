import Module from 'module';
import { createWriteStream } from 'fs';
import { pino } from 'pino';
import { multistream } from 'pino-multi-stream';
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
    const streams = [
        { stream: process.stdout },
        { stream: createWriteStream('app.log', { flags: 'a' }) },
    ];

    return pino({ level }, multistream(streams));
}

const logger = makeLogger(module);

export function requestLogger(req: Request, res, next: NextFunction) {
    const { method, url, ip } = req;
    logger.info({ method, url, ip }, `[${method}] - ${url}`);
    next();
}
