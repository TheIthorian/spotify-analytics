import { RequestHandler } from 'express';
import { UploadedFile } from 'express-fileupload';
import { makeLogger } from '../logger';
import { join } from 'path';

const log = makeLogger(module);

export const getUploadHandler: RequestHandler[] = [
    (req, res, next) => {
        res.send('upload');
        next();
    },
];

export const postUploadHandler: RequestHandler[] = [
    async (req, res, next) => {
        log.info(`(postUploadHandler)`);
        log.info({ files: req.files }, 'allFiles');
        log.info({ fileNames: Object.keys(req.files) }, 'allFiles');

        if (!req.files || !Object.keys(req.files).length) {
            res.status(400);
            res.send('No files uploaded');
        }

        const allFiles = Object.values(req.files);

        saveFiles(allFiles);
        next();
    },
];

function saveFiles(files: UploadedFile | UploadedFile[] | (UploadedFile | UploadedFile[])[]) {
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

    const uploadPath = join(__dirname, '../../files/', fileName);

    console.log(uploadPath);
    file.mv(uploadPath, err => {
        if (err) log.error(err, `(saveFile) - error moving file`);
    });
}
