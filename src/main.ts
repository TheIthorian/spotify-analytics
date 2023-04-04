import * as express from 'express';
const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get('/health', (req, res) => {
    res.status(200);
});

app.listen(port, () => {
    console.log(`App listening on ${hostname}:${port}`);
});
