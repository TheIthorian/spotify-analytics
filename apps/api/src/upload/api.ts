import { UploadedFile } from 'express-fileupload';

import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS } from './constants';
import { deleteTempFile } from '../util/file';

const log = makeLogger(module);

export async function saveFiles(files: UploadedFile | UploadedFile[] | (UploadedFile | UploadedFile[])[]) {
    const filesArray = [files].flat(3);
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
