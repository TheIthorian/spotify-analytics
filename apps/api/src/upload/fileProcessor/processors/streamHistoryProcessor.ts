import { UploadFileQueue } from '@prisma/client';
import { FileProcessor, FileType, JsonStreamHistoryRecord } from '../types';
import { Logger } from '../../../logger';
import { readJsonAsync, readJsonWithStream } from '../file';
import { insertStreamHistory, setComplete, setFailed } from '../data';

export class StreamHistoryProcessor implements FileProcessor {
    static validationFields = [
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
    ];

    private log: Logger;

    type = FileType.StreamingHistory;
    source: UploadFileQueue;

    constructor(log: Logger) {
        this.log = log;
    }

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process(validateFields = true) {
        this.log.info(
            { file: this.source, validateFields },
            `(${StreamHistoryProcessor.name}.${this.process.name}) - Processing upload file`
        );
        const filepath = this.source.filePath;

        try {
            await readJsonWithStream<JsonStreamHistoryRecord>(filepath, {
                validationFields: StreamHistoryProcessor.validationFields,
                validateFields,
                onData: async data => await insertStreamHistory([data]),
            });
            await setComplete(this.source.id);
        } catch (err) {
            this.log.error(err, 'Error creating streaming history');
            await setFailed(this.source.id);
        }
    }

    async processAsync(validateFields = true) {
        this.log.info(
            { file: this.source, validateFields },
            `(${StreamHistoryProcessor.name}.${this.process.name}) - Processing upload file`
        );
        const filepath = this.source.filePath;

        try {
            const data = await readJsonAsync<JsonStreamHistoryRecord>(filepath, {
                validationFields: StreamHistoryProcessor.validationFields,
                validateFields,
            });

            await insertStreamHistory(data);

            await setComplete(this.source.id);
        } catch (err) {
            this.log.error(err, 'Error creating streaming history');
            await setFailed(this.source.id);
        }
    }
}
