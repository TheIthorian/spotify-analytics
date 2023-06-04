import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS } from './constants';
import { deleteTempFile } from '../util/file';

import { getFileProcessorType } from './fileProcessor/index';
import { ReadStrategy } from './fileProcessor/types';
import * as memLog from '../logger/memoryLogger';

const log = makeLogger(module);

/**
 * Dequeues all files in the UploadFileQueue and processes them.
 * @param batchSize - How many concurrent files to process (read and insert from)
 */
export async function dequeueAllFiles(
    batchSize = 10,
    { validateFields, readStrategy }: { validateFields: boolean; readStrategy: ReadStrategy } = {
        validateFields: false,
        readStrategy: ReadStrategy.ReadFileAsync,
    }
) {
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

        await Promise.all(
            uploads.map(async uploadFile => {
                const fileProcessor = getFileProcessorType(uploadFile.filename);
                fileProcessor.setSource(uploadFile);

                memLog.log('dequeueAllFiles', { fileId: uploadFile.id, filename: uploadFile.filename });
                if (readStrategy === ReadStrategy.ReadFileAsync) await fileProcessor.processAsync(validateFields);
                else await fileProcessor.process(validateFields);
            })
        );

        await Promise.all(uploads.map(async uploadFile => await deleteTempFile(uploadFile.filePath)));
        memLog.log('dequeueAllFiles.deleteFiles');

        numberOfFilesProcessed = uploads.length;
        loopIndex++;
    } while (numberOfFilesProcessed >= batchSize && loopIndex < dequeueLimit);

    log.info({ numberOfFilesProcessed }, `(${dequeueAllFiles.name}) - Finished dequeuing uploads`);
}
