export function requestLogger(req, res, next) {
    console.log('req url: ' + req.url);
    next();
}
