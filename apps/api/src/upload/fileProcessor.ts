import { FileProcessor } from './fileProcessor/index';
import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS } from './constants';
import { deleteTempFile } from '../util/file';

const log = makeLogger(module);

export async function dequeueAllFiles(batchSize = 10) {
    log.info(`(${dequeueAllFiles.name})`);

    const fileProcessor = new FileProcessor();

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

        await Promise.all(
            uploads.map(async uploadFile => {
                const fileType = fileProcessor.getFileType(uploadFile.filename);
                console.log('fileType', fileType.type);
                fileType.setSource(uploadFile);
                await fileType.process();
            })
        );

        await Promise.all(uploads.map(async uploadFile => await deleteTempFile(uploadFile.filePath)));

        numberOfFilesProcessed = uploads.length;
        loopIndex++;
    } while (numberOfFilesProcessed >= batchSize && loopIndex < dequeueLimit);
}
