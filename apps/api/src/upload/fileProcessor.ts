import { FileProcessor } from './fileProcessor/index';
import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS } from './constants';

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

        for (const uploadFile of uploads) {
            const fileType = fileProcessor.getFileType(uploadFile.filename);
            fileType.setSource(uploadFile);
            await fileType.process();
        }

        numberOfFilesProcessed = uploads.length;
        loopIndex++;
    } while (numberOfFilesProcessed >= batchSize && loopIndex < dequeueLimit);
}
