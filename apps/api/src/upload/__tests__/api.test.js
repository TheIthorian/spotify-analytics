import { existsSync, writeFileSync } from 'fs';
import * as hashMd5 from 'md5';

import { prismaMock } from '../../__mocks__/prismaClient';

import { getUploads, saveFiles } from '../api';
import { JOB_STATUS } from 'spotify-analytics-types';

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

const STREAM_HISTORY_PATH = __dirname + '/assets/StreamingHistory.json';

describe('upload api', () => {
    beforeAll(() => {
        writeFileSync(STREAM_HISTORY_PATH, JSON.stringify(streamHistoryFileData), { flag: 'w' });
    });

    describe('saveFiles', () => {
        let fileToUpload;

        beforeEach(() => {
            fileToUpload = {
                name: 'filename',
                tempFilePath: STREAM_HISTORY_PATH,
                mimetype: 'application/json',
                size: 100,
                md5: hashMd5('filename'),
            };
        });

        it('saves the uploaded file to database', async () => {
            // Given
            prismaMock.uploadFileQueue.findFirst.mockResolvedValue(undefined);
            prismaMock.uploadFileQueue.create.mockResolvedValue({ id: 1 });
            prismaMock.uploadFileQueue.findMany.mockResolvedValue([{ id: 1, status: 0 }]);

            // When
            await saveFiles(fileToUpload);

            // Then
            expect(prismaMock.uploadFileQueue.create).toHaveBeenCalledWith({
                data: {
                    filePath: fileToUpload.tempFilePath,
                    status: JOB_STATUS.WAITING,
                    filename: fileToUpload.name,
                    mimetype: fileToUpload.mimetype,
                    size: fileToUpload.size,
                    md5: fileToUpload.md5,
                    uploadDate: expect.any(Date),
                    userId: 1,
                },
            });
        });

        it('does not save the file if it has already been uploaded', async () => {
            // Given
            prismaMock.uploadFileQueue.findFirst.mockResolvedValue([{ id: 1 }]);
            prismaMock.uploadFileQueue.findMany.mockResolvedValue([{ id: 1, status: 0 }]);

            // When
            await saveFiles(fileToUpload);

            // Then
            expect(prismaMock.uploadFileQueue.create).not.toHaveBeenCalled();
            expect(existsSync(fileToUpload.tempFilePath)).toBe(false); // File deleted
        });
    });

    describe('getUploads', () => {
        beforeEach(() => {
            prismaMock.uploadFileQueue.findFirst.mockResolvedValue([{ id: 1 }]);
            prismaMock.uploadFileQueue.findMany.mockResolvedValue([{ id: 1, status: 0 }]);
            prismaMock.uploadFileQueue.count.mockResolvedValue(1);
        });

        it('finds all uploads', async () => {
            const { uploads, recordCount } = await getUploads({});

            expect(uploads).toStrictEqual([{ id: 1, status: 'waiting' }]);
            expect(recordCount).toBe(1);

            expect(prismaMock.uploadFileQueue.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.uploadFileQueue.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 10, // default
                    skip: 0,
                    orderBy: { uploadDate: 'desc' },
                })
            );
        });

        it('finds all uploads with search options', async () => {
            const options = {
                dateFrom: new Date(),
                dateTo: new Date(),
                limit: 10,
                offset: 1,
            };
            const { uploads, recordCount } = await getUploads(options);

            expect(uploads).toStrictEqual([{ id: 1, status: 'waiting' }]);
            expect(recordCount).toBe(1);

            expect(prismaMock.uploadFileQueue.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.uploadFileQueue.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        uploadDate: {
                            gte: options.dateFrom,
                            lte: options.dateTo,
                        },
                    },
                    take: 10,
                    skip: 10,
                    orderBy: { uploadDate: 'desc' },
                })
            );
        });
    });
});
