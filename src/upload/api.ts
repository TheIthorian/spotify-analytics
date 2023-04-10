import { readFile, unlink } from 'fs/promises';
import { UploadedFile } from 'express-fileupload';
import { StreamHistory, UploadFileQueue } from '@prisma/client';

import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS } from './constants';

const log = makeLogger(module);

export async function saveFiles(
    files: UploadedFile | UploadedFile[] | (UploadedFile | UploadedFile[])[]
) {
    const filesArray = [files].flat(3);
    filesArray.forEach(file => console.log(file.name));
    await Promise.all(filesArray.map(file => saveFile(file)));
}

async function saveFile(file: UploadedFile) {
    const { name: filename, tempFilePath, mimetype, size, md5 } = file;
    log.info({ filename, mimetype, size, md5, tempFilePath }, `(${saveFile.name}) - Saving file`);

    const existingFileUpload = await prisma.uploadFileQueue.findFirst({
        where: { md5, status: { in: [JOB_STATUS.COMPLETE, JOB_STATUS.WAITING] } },
    });
    if (existingFileUpload) {
        log.info(existingFileUpload, 'File already exists. Skipping upload.');
        void deleteTempFile(tempFilePath);
        return;
    }

    await prisma.uploadFileQueue
        .create({
            data: {
                filePath: tempFilePath,
                status: existingFileUpload ? JOB_STATUS.DUPLICATE : JOB_STATUS.WAITING,
                filename,
                mimetype,
                size,
                md5,
            },
        })
        .catch(err => log.error(err, 'Unable to push file to queue'));
}

function deleteTempFile(filePath: string) {
    unlink(filePath).catch(err => log.error({ err, filePath }, 'Error removing temp file'));
}

export async function getUploads() {
    return await prisma.uploadFileQueue.findMany({
        select: {
            id: true,
            status: true,
            filename: true,
            mimetype: true,
            size: true,
            md5: true,
        },
        orderBy: { id: 'desc' },
    });
}

export async function dequeueAllFiles(batchSize = 10) {
    log.info(`(${dequeueAllFiles.name})`);

    let numberOfFilesProcessed = 0;
    let loopIndex = 0;
    const dequeueLimit = 100;
    do {
        const uploads = await prisma.uploadFileQueue.findMany({
            take: batchSize,
            where: { status: JOB_STATUS.WAITING },
            orderBy: { id: 'asc' },
        });
        log.info({ dequeueSize: uploads.length }, `(${dequeueAllFiles.name}) - Dequeuing uploads`);

        if (!uploads.length) {
            return;
        }

        for (const uploadFile of uploads) {
            await processFile(uploadFile);
        }

        numberOfFilesProcessed = uploads.length;
        loopIndex++;
    } while (numberOfFilesProcessed >= batchSize && loopIndex < dequeueLimit);
}

async function processFile(file: UploadFileQueue) {
    log.info({ id: file.id }, `${processFile.name}`);

    if (/^StreamingHistory*/.test(file.filename)) {
        await insertStreamingHistory(file);
    } else if (/^Playlist*/) {
        // await insertPlaylist(file);
        await markAsIgnored(file); // Mark as ignored for now
    } else {
        log.info('This is an unknown file');
        await markAsIgnored(file);
    }

    void deleteTempFile(file.filePath);
}

async function insertStreamingHistory(file: UploadFileQueue) {
    log.info({ file }, `(${insertStreamingHistory.name})`);

    const fileData = await readFile(file.filePath);
    const tracks = JSON.parse(fileData.toString());

    if (!isValidStreamHistory(tracks)) {
        throw TypeError('Invalid file format: tracks are not valid');
    }

    try {
        await prisma.$transaction(
            tracks.map(track =>
                prisma.streamHistory.create({
                    data: {
                        trackName: track.trackName,
                        artistName: track.artistName,
                        msPlayed: track.msPlayed,
                        endTime: new Date(track.endTime),
                    },
                })
            )
        );

        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.COMPLETE },
        });
    } catch (err) {
        log.error(err, 'Error creating streaming history');

        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.FAILED },
        });
    }
}

function isValidStreamHistory(tracks: any[]): tracks is StreamHistory[] {
    if (!Array.isArray(tracks)) return false;

    for (const track of tracks) {
        if (
            track.trackName == undefined ||
            track.artistName == undefined ||
            track.endTime == undefined ||
            track.msPlayed == undefined
        ) {
            log.info(track, 'Track failed validation');
            return false;
        }
    }

    return true;
}

async function insertPlaylist(file: UploadFileQueue) {
    log.info({ file }, 'Inserting playlist');
}

async function markAsIgnored(file: UploadFileQueue) {
    try {
        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.IGNORED },
        });
    } catch (err) {
        log.error({ err, file }, 'Error marking file as ignored');
    }
}
