import { makeLogger } from '../logger';
import { dequeueAllFiles } from '../upload/api';

const log = makeLogger(module);

const JOB_INTERVAL_SECONDS = 1 * 60;

log.info({ interval: JOB_INTERVAL_SECONDS, start: new Date() }, 'Running file processor');

function dequeue() {
    log.info({ start: new Date() }, 'Processing batch');

    const batchSize = 10;
    dequeueAllFiles(batchSize)
        .then(() => log.info('Batch complete'))
        .catch(err => log.error(err));
}

dequeue();

setInterval(() => {
    dequeue();
}, JOB_INTERVAL_SECONDS * 1000);
