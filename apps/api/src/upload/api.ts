import { UploadedFile } from 'express-fileupload';

import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS, STATUS_BY_ID } from './constants';
import { deleteTempFile } from '../util/file';
import { UploadFileQueue } from '@prisma/client';

const log = makeLogger(module);

export async function saveFiles(files: UploadedFile | UploadedFile[] | (UploadedFile | UploadedFile[])[]) {
    const filesArray = [files].flat(3);
    const uploads = await Promise.all(filesArray.map(file => saveFile(file)));
    log.info(uploads, 'Finished uploading files');
    return await getUploads(getUploadIds(uploads));
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

    const upload = await prisma.uploadFileQueue
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

    return upload;
}

export async function getUploads(ids: number[] = null) {
    const uploads = await prisma.uploadFileQueue.findMany({
        select: {
            id: true,
            status: true,
            filename: true,
            mimetype: true,
            size: true,
            md5: true,
        },
        ...(ids ? { where: { id: { in: ids } } } : {}),
        orderBy: { id: 'desc' },
    });

    for (const upload of uploads) {
        upload.status = STATUS_BY_ID[upload.status];
    }

    return uploads;
}

function getUploadIds(uploads: Array<void | UploadFileQueue>) {
    if (!uploads) return [];

    const ids = [];
    for (const upload of uploads) {
        if (upload && upload.id) {
            ids.push(upload.id);
        }
    }
    return ids;
}
