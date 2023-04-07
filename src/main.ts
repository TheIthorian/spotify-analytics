import * as express from 'express';
import initialiseRoutes from './routes';
import { requestLogger } from './requestLogger';

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.use(requestLogger);

app.use(initialiseRoutes());

app.get('/', (req, res) => res.send('Hello'));

app.listen(port, () => {
    console.log(`App listening on http://${hostname}:${port}`);
});
