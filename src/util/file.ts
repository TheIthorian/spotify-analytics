import { unlink } from 'fs/promises';
import { makeLogger } from '../logger';

const log = makeLogger(module);

export function deleteTempFile(filePath: string) {
    unlink(filePath).catch(err => log.error({ err, filePath }, 'Error removing temp file'));
}
