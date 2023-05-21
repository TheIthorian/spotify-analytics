import { writeFileSync } from 'fs';
import * as hashMd5 from 'md5';

import { prismaMock } from '../../__mocks__/prismaClient';

import { dequeueAllFiles } from '../fileProcessor';
import { deleteTempFile } from '../../util/file';

jest.mock('../../util/file');

const streamHistoryFileData = [
    {
        ts: '2014-12-29T23:35:17Z',
        username: 'username',
        platform: 'platform',
        ms_played: 5665,
        conn_country: 'GB',
        ip_addr_decrypted: 'ip_addr_decrypted',
        user_agent_decrypted: 'unknown',
        master_metadata_track_name: 'master_metadata_track_name',
        master_metadata_album_artist_name: 'master_metadata_album_artist_name',
        master_metadata_album_album_name: 'master_metadata_album_album_name',
        spotify_track_uri: 'spotify:spotify_track_uri',
        episode_name: null,
        episode_show_name: null,
        spotify_episode_uri: null,
        reason_start: 'appload',
        reason_end: 'appload',
        shuffle: false,
        skipped: true,
        offline: false,
        offline_timestamp: 0,
        incognito_mode: false,
    },
];

const brokenStreamHistoryFileData = [{ ts: '2014-12-29T23:35:17Z', username: 'username' }];

const STREAM_HISTORY_PATH = __dirname + '/assets/StreamingHistory_dequeueAllFiles_test.json';
const BROKEN_STREAM_HISTORY_PATH = __dirname + '/assets/BrokenStreamingHistory_dequeueAllFiles_test.json';

describe('dequeueAllFiles', () => {
    beforeAll(() => {
        writeFileSync(STREAM_HISTORY_PATH, JSON.stringify(streamHistoryFileData), { flag: 'w' });
        writeFileSync(BROKEN_STREAM_HISTORY_PATH, JSON.stringify(brokenStreamHistoryFileData), { flag: 'w' });
    });

    afterAll(async () => {
        await Promise.all([deleteTempFile(STREAM_HISTORY_PATH), deleteTempFile(BROKEN_STREAM_HISTORY_PATH)]);
    });

    beforeEach(() => {
        jest.resetAllMocks();
        const fileUploadQueue = [
            {
                id: 'id',
                status: 'status',
                filePath: STREAM_HISTORY_PATH,
                filename: 'endsong_0.json',
                mimetype: 'application/json',
                size: 100,
                md5: hashMd5(JSON.stringify(streamHistoryFileData)),
            },
        ];

        prismaMock.uploadFileQueue.findMany.mockResolvedValue(fileUploadQueue);
    });

    it('does nothing if no files are found', async () => {
        prismaMock.uploadFileQueue.findMany.mockResolvedValue([]);

        await dequeueAllFiles();

        expect(deleteTempFile).not.toHaveBeenCalled();
        expect(prismaMock.uploadFileQueue.create).not.toHaveBeenCalled();
    });

    it('inserts the file contents to StreamHistory', async () => {
        // When
        await dequeueAllFiles();

        // Then
        expect(prismaMock.streamHistory.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.streamHistory.create).toHaveBeenCalledWith({
            data: {
                trackName: streamHistoryFileData[0].master_metadata_track_name,
                albumName: streamHistoryFileData[0].master_metadata_album_album_name,
                artistName: streamHistoryFileData[0].master_metadata_album_artist_name,
                msPlayed: streamHistoryFileData[0].ms_played,
                datePlayed: new Date(streamHistoryFileData[0].ts),
                platform: streamHistoryFileData[0].platform,
                spotifyTrackUri: streamHistoryFileData[0].spotify_track_uri,
                isSong: true,
                episodeName: null,
                episodeShowName: null,
                spotifyShowUri: null,
                shuffle: false,
                skipped: true,
                offline: false,
            },
        });
    });

    it('does not insert the file contents when the contents is invalid', async () => {
        const fileUploadQueue = [
            {
                id: 'id',
                status: 'status',
                filePath: BROKEN_STREAM_HISTORY_PATH,
                filename: 'endsong_0.json',
                mimetype: 'application/json',
                size: 100,
                md5: hashMd5(JSON.stringify(brokenStreamHistoryFileData)),
            },
        ];
        prismaMock.uploadFileQueue.findMany.mockResolvedValue(fileUploadQueue);

        // When
        let error;
        await dequeueAllFiles().catch(e => (error = e));

        // Then
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toBe('Invalid file format: tracks are not valid');
        expect(prismaMock.streamHistory.create).not.toHaveBeenCalled();
    });
});
