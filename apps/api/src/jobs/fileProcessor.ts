import config from 'config';
import { makeLogger } from '../logger';
import { dequeueAllFiles } from '../upload/fileProcessor';

const log = makeLogger(module);

const JOB_INTERVAL_SECONDS = 1 * 60;

log.info({ interval: JOB_INTERVAL_SECONDS, start: new Date() }, 'Running file processor');

function dequeue() {
    log.info({ start: new Date() }, 'Processing batch');

    const batchSize = 10;
    dequeueAllFiles(batchSize, {
        validateFields: false,
        readStrategy:
            config.databaseType === 'sqlite' ? dequeueAllFiles.ReadStrategy.ReadFileAsync : dequeueAllFiles.ReadStrategy.StreamFile,
    })
        .then(() => log.info('Batch complete'))
        .catch(err => log.error(err));
}

if (require.main == module) {
    dequeue();

    setInterval(() => {
        dequeue();
    }, JOB_INTERVAL_SECONDS * 1000);
}
