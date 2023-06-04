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

export interface Logger {
    fatal: LogFunction;
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    debug: LogFunction;
    trace: LogFunction;
    silent: LogFunction;
}

export function makeLogger(module: Module | undefined, level = DEFAULT_LEVEL): Logger {
    const streams = [{ stream: process.stdout }, { stream: createWriteStream('app.log', { flags: 'a' }) }];

    let name = 'unknown';
    if (module?.filename) {
        const modulePath = module.filename.split('\\apps\\api\\src\\').pop().split('\\');
        name = `${modulePath.join(', ')}`;
    }

    return pino({ level, name }, multistream(streams));
}

const logger = makeLogger(module, DEFAULT_LEVEL);

export function requestLogger(req: Request, res, next: NextFunction) {
    const { method, url, ip, host } = req;
    logger.info({ method, url, ip, host }, `[${method}] - ${url}`);
    next();
}
