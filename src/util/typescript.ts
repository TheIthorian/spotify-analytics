import { NextFunction, Request, RequestHandler, Response } from 'express';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// export type ParsedQueryResponse<T> = Omit<Response, 'locals'> & { locals: Record<string, any> & { parsedQuery: T } };

export interface ParsedQueryResponse<T> extends Response {
    locals: Record<string, any> & { parsedQuery?: T };
}

export interface ParsedBodyResponse<T> extends Response {
    locals: Record<string, any> & { parsedBody?: T };
}

export type UnionLocals<A extends Response, B extends Response> = A & { locals: Pick<A, 'locals'> & Pick<B, 'locals'> };

export interface ApiRequestHandler<T> extends RequestHandler {
    (req: Request, res: ParsedQueryResponse<T>, next: NextFunction): void;
}
