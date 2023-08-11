import config from '../config';

let memory: Record<string, any> = [];

export function log(name: string, other: Record<string, any> = {}) {
    if (!config.includeMemLog) return;
    const mem = process.memoryUsage();
    memory.push({ memory: mem, time: Date.now(), name, ...other });
}

export function get() {
    return memory;
}

export function reset() {
    memory = [];
}
