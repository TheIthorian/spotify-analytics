import { existsSync, writeFileSync } from 'fs';
import * as hashMd5 from 'md5';
import { prismaMock } from '../../__mocks__/prismaClient';
import { getUploads, saveFiles } from '../api';
import { JOB_STATUS } from '../constants';

const streamHistoryFileData = [
    {
        endTime: '2020-12-03 10:40',
        artistName: 'Metallica',
        trackName: 'One',
        msPlayed: 447440,
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
            prismaMock.uploadFileQueue.create.mockResolvedValue({});

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
                },
            });
        });

        it('does not save the file if it has already been uploaded', async () => {
            // Given
            prismaMock.uploadFileQueue.findFirst.mockResolvedValue({});

            // When
            await saveFiles(fileToUpload);

            // Then
            expect(prismaMock.uploadFileQueue.create).not.toHaveBeenCalled();
            expect(existsSync(fileToUpload.tempFilePath)).toBe(false); // File deleted
        });
    });

    describe('getUploads', () => {
        it('finds all uploads', async () => {
            await getUploads();
            expect(prismaMock.uploadFileQueue.findMany).toHaveBeenCalledTimes(1);
        });
    });
});
