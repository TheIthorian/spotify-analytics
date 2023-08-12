import { Request, Response } from 'express';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ParsedQueryResponse<T> extends Response {
    locals: Record<string, any> & { parsedQuery?: T };
}

export interface ParsedBodyResponse<T> extends Response {
    locals: Record<string, any> & { parsedBody?: T };
}

export interface UserAwareRequest extends Request {
    user: number;
}

export function isType<T extends object>(item: object, fields: string[]): item is T {
    if (Array.isArray(item)) return false;

    for (const field of fields) {
        if (!Object.hasOwn(item as object, field)) {
            return false;
        }
    }

    return true;
}

export function isArrayType<T extends object>(items: object, fields: string[]): items is T[] {
    if (!Array.isArray(items)) return false;

    for (const item of items) {
        for (const field of fields) {
            if (!Object.hasOwn(item as object, field)) {
                return false;
            }
        }
    }

    return true;
}
