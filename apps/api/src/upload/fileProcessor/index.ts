import * as fs from 'fs';

import { chain } from 'stream-chain';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import * as Verifier from 'stream-json/utils/Verifier';

import { UploadFileQueue, SimpleStreamHistory } from '@prisma/client';

import { makeLogger } from '../../logger';
import { isType } from '../../util/typescript';
import { insertSimpleHistory, insertStreamingHistory, setComplete, setFailed, setIgnored } from './data';
import { JsonStreamHistoryRecord } from './types';

const log = makeLogger(module);

enum FileType {
    SimpleStreamingHistory = 'SimpleStreamingHistory',
    Playlist = 'Playlist',
    StreamingHistory = 'StreamingHistory',
    Unknown = 'Unknown',
}

export class FileProcessor {
    concurrency: number;

    constructor({ concurrency = 1 } = {}) {
        this.concurrency = concurrency;
    }

    getFileType(filename: string): File {
        if (/^StreamingHistory*/.test(filename)) {
            return new SimpleStreamingHistoryFile();
        } else if (/^Playlist*/.test(filename)) {
            return new Playlist();
        } else if (/^endsong*/.test(filename)) {
            return new StreamingHistoryFile();
        } else {
            return new UnknownFile();
        }
    }
}

interface File {
    type: FileType;
    setSource: (source: UploadFileQueue) => void;
    process: () => Promise<void>;
}

class Playlist implements File {
    type = FileType.Playlist;
    source: UploadFileQueue;

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        log.info({ file: this.source }, `(${this.process.name}) - Processing upload file`);
    }
}

class SimpleStreamingHistoryFile implements File {
    type = FileType.SimpleStreamingHistory;
    source: UploadFileQueue;

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        log.info({ file: this.source }, `(${this.process.name}) - Processing upload file`);
        const filepath = this.source.filePath;

        const dataArray = await readJson<SimpleStreamHistory>(filepath, {
            validationFields: ['trackName', 'artistName', 'endTime', 'msPlayed'],
        });

        try {
            await insertSimpleHistory(dataArray);
            await setComplete(this.source.id);
        } catch (err) {
            log.error(err, 'Error creating simple streaming history');
            await setFailed(this.source.id);
        }
    }
}

class StreamingHistoryFile implements File {
    type = FileType.StreamingHistory;
    source: UploadFileQueue;

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        log.info({ file: this.source }, `(${this.process.name}) - Processing upload file`);
        const filepath = this.source.filePath;

        const dataArray = await readJson<JsonStreamHistoryRecord>(filepath, {
            validationFields: [
                'ts',
                'username',
                'platform',
                'ms_played',
                'master_metadata_track_name',
                'master_metadata_album_artist_name',
                'master_metadata_album_album_name',
                'spotify_track_uri',
                'episode_name',
                'episode_show_name',
                'spotify_episode_uri',
                'reason_start',
                'reason_end',
                'shuffle',
                'skipped',
                'offline',
                'offline_timestamp',
                'incognito_mode',
            ],
        });

        try {
            await insertStreamingHistory(dataArray);
            await setComplete(this.source.id);
        } catch (err) {
            log.error(err, 'Error creating simple streaming history');
            await setFailed(this.source.id);
        }
    }
}

class UnknownFile implements File {
    type = FileType.Unknown;
    source: UploadFileQueue;

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        log.info({ file: this.source }, `(${this.process.name}) - Processing upload file`);
        await setIgnored(this.source.id);
    }
}

type Options<T> = {
    onData?: (record: T) => Promise<void>;
    onInvalidData?: (record: T) => Promise<void>;
    validationFields?: string[];
};

async function readJson<T extends object>(
    filepath: string,
    { onData, onInvalidData, validationFields = [] }: Options<T> = {}
): Promise<T[]> {
    log.info('Validating json file');
    const { isValid, errorMessage } = await validateJson(filepath);
    if (!isValid) {
        log.error('Json file is invalid: ' + errorMessage);
        console.log(errorMessage);
    }

    const pipeline = fs.createReadStream(filepath).pipe(StreamArray.withParser());

    let counter = 0;
    const dataArray = [];
    pipeline.on('data', ({ value }) => {
        // TODO - Check this returns correct value
        if (isType<T>(value, validationFields)) {
            dataArray.push(value);
            onData?.(value);
            counter++;
        } else {
            onInvalidData?.(value);
        }
    });
    pipeline.on('end', () => log.info(`The jsonfile read ${counter} records.`));

    return new Promise((resolve, reject) => {
        pipeline.on('end', () => resolve(dataArray));
        pipeline.on('finish', () => resolve(dataArray));
    });
}

type ValidateJsonResult = { isValid: boolean; errorMessage?: string };

async function validateJson(filepath: string): Promise<ValidateJsonResult> {
    const promise: Promise<ValidateJsonResult> = new Promise((resolve, reject) => {
        const pipeline = chain([fs.createReadStream(filepath), Verifier.verifier()]);
        pipeline.on('error', err => resolve({ isValid: false, errorMessage: err.message }));
        pipeline.on('end', () => resolve({ isValid: true, errorMessage: undefined }));
    });

    return promise;
}

if (require.main === module) {
    // readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/extended-stream-history/example.json');
    readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/extended-stream-history/endsong_0.json');
    // readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/extended-stream-history/example_simple.json');
    // readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/spotify-data/StreamingHistory0.json');
}
