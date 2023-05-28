import { makeLogger } from '../logger';
import * as NodeCache from 'node-cache';

const requestCache = new NodeCache();

const log = makeLogger(module);

type CachedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => ReturnType<T>;

export function cache<T extends (...args: any[]) => any>(fn: T): CachedFunction<T> {
    const cachedFunction: CachedFunction<T> = (...args: Parameters<T>): ReturnType<T> => {
        log.info(`Caching function ${fn.name}`);

        const key = JSON.stringify({ name: fn.name, args });
        const cached: ReturnType<T> | undefined = requestCache.get(key);
        if (cached) {
            log.info(key, `Using cached results with key ${key} `);
            return cached;
        }

        log.info('Cache miss. Invoking actual function');
        const result = fn(...args);
        if (result instanceof Promise) {
            result.then(result => requestCache.set(key, result));
        }

        return result;
    };

    return cachedFunction;
}
