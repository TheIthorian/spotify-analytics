import { NextFunction, Request, Response } from 'express';

export function allowCrossDomain(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,append,delete,entries,foreach,get,has,keys,set,values,Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200);
        res.send();
    }

    next();
}
