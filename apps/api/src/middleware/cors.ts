import { NextFunction, Request, Response } from 'express';

export function allowCrossDomain(req: Request, res: Response, next: NextFunction) {
    // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
    res.header('Access-Control-Allow-Origin', 'https://localhost:2999');
    // res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,append,delete,entries,foreach,get,has,keys,set,values,Authorization');

    res.header('Access-Control-Expose-Headers', 'Total,Count');

    next();
}
