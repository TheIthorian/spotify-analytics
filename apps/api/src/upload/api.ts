import { UploadedFile } from 'express-fileupload';
import { Prisma, UploadFileQueue } from '@prisma/client';

import { GetUploadResponseData, Upload, JOB_STATUS, STATUS_BY_ID } from 'spotify-analytics-types';

import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { deleteTempFile } from '../util/file';
import config from '../config';

const log = makeLogger(module);

/**
 * Stores the upload files and adds a upload job to the queue.
 * @param files - files to be saved
 * @returns the uploads that may be processed
 */
export async function saveFiles(files: UploadedFile | UploadedFile[] | (UploadedFile | UploadedFile[])[]): Promise<GetUploadResponseData> {
    const filesArray = [files].flat(3);
    const uploads = await Promise.all(filesArray.map(async file => await saveFile(file)));
    log.info(uploads, 'Finished uploading files');
    return await getUploads(getUploadIds(uploads));
}

async function saveFile(file: UploadedFile): Promise<Upload | void> {
    const { name: filename, tempFilePath, mimetype, size, md5 } = file;
    log.info({ filename, mimetype, size, md5, tempFilePath }, `(${saveFile.name}) - Saving file`);

    let isDuplicate = false;

    // TODO - make a feature flag
    if (config.skipDuplicateUploads) {
        const existingFileUpload = await prisma.uploadFileQueue.findFirst({
            where: { md5, status: { in: [JOB_STATUS.COMPLETE, JOB_STATUS.WAITING] } },
        });

        if (existingFileUpload) {
            isDuplicate = true;
            log.info(existingFileUpload, 'File already exists. Skipping upload.');
            void deleteTempFile(tempFilePath);
            return;
        }
    }

    const upload = await prisma.uploadFileQueue
        .create({
            data: {
                filePath: tempFilePath,
                status: isDuplicate ? JOB_STATUS.DUPLICATE : JOB_STATUS.WAITING,
                filename,
                mimetype,
                size,
                md5,
                uploadDate: new Date(),
            },
        })
        .catch(err => log.error(err, 'Unable to push file to queue'));

    return upload;
}

/**
 * Gets all uploads with the given ids. If no ids are given, the last 100 uploads are returned.
 */
export async function getUploads(ids: number[] = null): Promise<GetUploadResponseData> {
    const selector: Prisma.UploadFileQueueFindManyArgs = {
        select: {
            id: true,
            status: true,
            filename: true,
            mimetype: true,
            size: true,
            md5: true,
            uploadDate: true,
        },
        take: 100,
        orderBy: { id: 'desc' },
    };

    if (ids) selector.where = { id: { in: ids } };

    const uploads = await prisma.uploadFileQueue.findMany(selector);

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
