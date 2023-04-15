import { prismaMock } from '../../__mocks__/prismaClient';
import { deleteTempFile } from '../../util/file';

jest.mock('../../util/file');

describe('dequeueAllFiles', () => {
    it('does nothing if no files are found', () => {
        prismaMock.uploadFileQueue.findMany.mockResolvedValue([]);

        expect(deleteTempFile).not.toHaveBeenCalled();
    });
});
