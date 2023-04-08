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
    const { name: fileName, tempFilePath, mimetype, size, md5 } = file;

    log.info(
        { fileName, mimetype, size, md5, tempFilePath },
        `(${saveFile.name}) - saving file: ${fileName}`
    );

    prisma.uploadFileQueue
        .create({
            data: { filePath: tempFilePath, status: 0 },
        })
        .catch(err => log.error(err, 'Unable to push to queue'));
}
