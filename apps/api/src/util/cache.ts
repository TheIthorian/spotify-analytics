import { makeLogger } from '../logger';
import * as NodeCache from 'node-cache';

const CACHE_DURATION_IN_SECONDS = 180 as const; // 3 minutes
const requestCache = new NodeCache({ stdTTL: CACHE_DURATION_IN_SECONDS });

const log = makeLogger(module);

type Func = (...args: any[]) => any;

type CachedFunction<T extends Func> = (...args: Parameters<T>) => ReturnType<T>;

/**
 * Returns an instance of the input function which will utilise caching. On the first invocation, the input function will be invoked and
 * the result cached. On subsequent invocations, the cached result will be returned.
 * @param fn - Function to cache the result of
 * @param cacheKey - A key to store the result with. If not provided, a JSON representation of the arguments will be used as the key.
 * It is preferable to provide a cacheKey to avoid serialising the arguments to a JSON string.
 * @returns Cached instance of the input function
 */
export function cache<T extends Func>(fn: T, cacheKey?: string): CachedFunction<T> {
    const cachedFunction: CachedFunction<T> = (...args: Parameters<T>): ReturnType<T> => {
        log.info(`Caching function ${fn.name}`);

        const key = cacheKey ? fn.name + ':' + cacheKey : JSON.stringify({ name: fn.name, args });
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
