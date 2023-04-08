import { UploadedFile } from 'express-fileupload';
import * as path from 'path';

import { makeLogger } from '../logger';

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
    const { name: fileName, mimetype, size, md5 } = file;

    log.info({ fileName, mimetype, size, md5 }, `(${saveFile.name}) - saving file: ${fileName}`);

    const uploadPath = path.join(__dirname, '../../files/', fileName);

    console.log(uploadPath);
    file.mv(uploadPath, err => {
        if (err) log.error(err, `(saveFile) - error moving file`);
    });
}
