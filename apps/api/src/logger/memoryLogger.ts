let memory = [];

export function log(name: string, other: Record<string, any> = {}) {
    const mem = process.memoryUsage();
    memory.push({ memory: mem, time: Date.now(), name, ...other });
}

export function get() {
    return memory;
}

export function reset() {
    memory = [];
}
