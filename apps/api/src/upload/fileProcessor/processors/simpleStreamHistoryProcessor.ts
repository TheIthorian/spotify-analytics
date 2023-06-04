import { SimpleStreamHistory, UploadFileQueue } from '@prisma/client';
import { FileProcessor, FileType } from '../types';
import { Logger } from '../../../logger';
import { insertSimpleHistory, setComplete, setFailed } from '../data';
import { readJson } from '../file';

export class SimpleStreamHistoryProcessor implements FileProcessor {
    private log: Logger;

    type = FileType.SimpleStreamingHistory;
    source: UploadFileQueue;

    constructor(log: Logger) {
        this.log = log;
    }

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        this.log.info({ file: this.source }, `(${SimpleStreamHistoryProcessor.name}.${this.process.name}) - Processing upload file`);
        const filepath = this.source.filePath;

        const dataArray = await readJson<SimpleStreamHistory>(filepath, {
            validationFields: ['trackName', 'artistName', 'endTime', 'msPlayed'],
        });

        try {
            await insertSimpleHistory(dataArray);
            await setComplete(this.source.id);
        } catch (err) {
            this.log.error(err, 'Error creating simple streaming history');
            await setFailed(this.source.id);
        }
    }
}
