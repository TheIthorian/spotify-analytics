import { UploadFileQueue } from '@prisma/client';

import { makeLogger } from '../../logger';

import { setIgnored } from './data';
import { FileProcessor, FileType } from './types';
import { StreamHistoryProcessor, PlaylistProcessor, SimpleStreamHistoryProcessor } from './processors';

const log = makeLogger(module);

const processorConstructors = [SimpleStreamHistoryProcessor, PlaylistProcessor, StreamHistoryProcessor] as const;
const constructorByRegex: Array<[RegExp, (typeof processorConstructors)[number]]> = [
    [/^StreamingHistory*/, SimpleStreamHistoryProcessor],
    [/^Playlist*/, PlaylistProcessor],
    [/^endsong*/, StreamHistoryProcessor],
];

export function getFileProcessorType(filename: string): FileProcessor {
    for (const [regex, Constructor] of constructorByRegex) {
        if (regex.test(filename)) return new Constructor(log);
    }

    return new UnknownFile();
}

class UnknownFile implements FileProcessor {
    type = FileType.Unknown;
    source: UploadFileQueue;

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        log.info({ file: this.source }, `${UnknownFile.name}.(${this.process.name}) - Processing upload file`);
        await setIgnored(this.source.id);
    }
}
