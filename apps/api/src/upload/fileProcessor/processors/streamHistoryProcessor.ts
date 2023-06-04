import { UploadFileQueue } from '@prisma/client';
import { FileProcessor, FileType, JsonStreamHistoryRecord } from '../types';
import { Logger } from '../../../logger';
import { readJson } from '../file';
import { insertStreamingHistory, setComplete, setFailed } from '../data';

export class StreamHistoryProcessor implements FileProcessor {
    private log: Logger;

    type = FileType.StreamingHistory;
    source: UploadFileQueue;

    constructor(log: Logger) {
        this.log = log;
    }

    setSource(source: UploadFileQueue) {
        this.source = source;
    }

    async process() {
        this.log.info({ file: this.source }, `(${StreamHistoryProcessor.name}.${this.process.name}) - Processing upload file`);
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
            this.log.error(err, 'Error creating simple streaming history');
            await setFailed(this.source.id);
        }
    }
}
