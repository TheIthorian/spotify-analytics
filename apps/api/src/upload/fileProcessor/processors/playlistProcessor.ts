import { UploadFileQueue } from '@prisma/client';
import { FileProcessor, FileType } from '../types';
import { Logger } from '../../../logger';

export class PlaylistProcessor implements FileProcessor {
    private log: Logger;

    type = FileType.Playlist;
    source: UploadFileQueue;

    constructor(log: Logger) {
        this.log = log;
    }

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        this.log.info({ file: this.source }, `${PlaylistProcessor.name}.(${this.process.name}) - Processing upload file`);
    }
}
