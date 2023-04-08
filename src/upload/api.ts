import { UploadedFile } from 'express-fileupload';

import { makeLogger } from '../logger';
import prisma from '../prismaClient';

const log = makeLogger(module);

export function saveFiles(
    files: UploadedFile | UploadedFile[] | (UploadedFile | UploadedFile[])[]
) {
    if (Array.isArray(files)) {
        for (const file of files) {
            saveFiles(file);
        }
        return;
    }

    saveFile(files);
}

function saveFile(file: UploadedFile) {
    const { name: filename, tempFilePath, mimetype, size, md5 } = file;

    log.info(
        { name: filename, mimetype, size, md5, tempFilePath },
        `(${saveFile.name}) - saving file: ${filename}`
    );

    prisma.uploadFileQueue
        .create({
            data: { filePath: tempFilePath, status: 0, filename, mimetype, size, md5 },
        })
        .catch(err => log.error(err, 'Unable to push file to queue'));
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

export const STATUS_BY_ID = {
    0: 'waiting',
    1: 'processing',
    2: 'failed',
} as const;
