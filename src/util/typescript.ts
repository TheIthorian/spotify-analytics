import { Response } from 'express';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ParsedQueryResponse<T> extends Response {
    locals: Record<string, any> & { parsedQuery?: T };
}

export interface ParsedBodyResponse<T> extends Response {
    locals: Record<string, any> & { parsedBody?: T };
}
