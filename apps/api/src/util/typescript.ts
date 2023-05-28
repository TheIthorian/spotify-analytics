import { Response } from 'express';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ParsedQueryResponse<T> extends Response {
    locals: Record<string, any> & { parsedQuery?: T };
}

export interface ParsedBodyResponse<T> extends Response {
    locals: Record<string, any> & { parsedBody?: T };
}

export function isType<T>(item: unknown, fields: string[]): item is T {
    if (Array.isArray(item)) return false;

    for (const field of fields) {
        if (!item[field]) {
            return false;
        }
    }

    return true;
}

export function isArrayType<T>(items: unknown, fields: string[]): items is T[] {
    if (!Array.isArray(items)) return false;

    for (const track of items) {
        for (const field of fields) {
            if (!track[field]) {
                return false;
            }
        }
    }

    return true;
}
