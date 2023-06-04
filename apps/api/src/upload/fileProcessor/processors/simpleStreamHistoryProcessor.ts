import { SimpleStreamHistory, UploadFileQueue } from '@prisma/client';
import { FileProcessor, FileType } from '../types';
import { Logger } from '../../../logger';
import { insertSimpleHistory, setComplete, setFailed } from '../data';
import { readJsonAsync, readJsonWithStream } from '../file';

export class SimpleStreamHistoryProcessor implements FileProcessor {
    static validationFields = ['trackName', 'artistName', 'endTime', 'msPlayed'];

    private log: Logger;

    type = FileType.SimpleStreamingHistory;
    source: UploadFileQueue;

    constructor(log: Logger) {
        this.log = log;
    }

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process(validateFields = true) {
        this.log.info({ file: this.source }, `(${SimpleStreamHistoryProcessor.name}.${this.process.name}) - Processing upload file`);
        const filepath = this.source.filePath;

        try {
            await readJsonWithStream<SimpleStreamHistory>(filepath, {
                validationFields: SimpleStreamHistoryProcessor.validationFields,
                validateFields,
                onData: data => insertSimpleHistory([data]),
            });
            await setComplete(this.source.id);
        } catch (err) {
            this.log.error(err, 'Error creating simple streaming history');
            await setFailed(this.source.id);
        }
    }

    async processAsync(validateFields = true) {
        this.log.info({ file: this.source }, `(${SimpleStreamHistoryProcessor.name}.${this.process.name}) - Processing upload file`);
        const filepath = this.source.filePath;

        try {
            const data = await readJsonAsync<SimpleStreamHistory>(filepath, {
                validationFields: SimpleStreamHistoryProcessor.validationFields,
                validateFields,
            });
            await insertSimpleHistory(data);
            await setComplete(this.source.id);
        } catch (err) {
            this.log.error(err, 'Error creating simple streaming history');
            await setFailed(this.source.id);
        }
    }
}
