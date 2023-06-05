import { unlink } from 'fs/promises';
import { makeLogger } from '../logger';

const log = makeLogger(module);

export async function deleteTempFile(filePath: string) {
    await unlink(filePath).catch(err => log.error({ err, filePath }, 'Error removing temp file'));
}
