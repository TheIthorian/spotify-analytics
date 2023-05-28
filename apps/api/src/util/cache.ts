import { makeLogger } from '../logger';
import * as NodeCache from 'node-cache';

const requestCache = new NodeCache();

const log = makeLogger(module);

export function cache(fn: CallableFunction) {
    log.info('Setting cache for function', fn.name);

    return async function (...args: any[]) {
        log.info(`Caching function ${fn.name}`);

        const key = JSON.stringify({ name: fn.name, args });
        const cached = requestCache.get(key);
        if (cached) {
            log.info(key, `Using cached results with key ${key} `);
            return cached;
        }

        log.info('Cache miss. Invoking actual function');
        const result = await fn(...args);
        requestCache.set(key, result);
        return result;
    };
}
