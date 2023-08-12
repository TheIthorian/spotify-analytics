import { prismaMock } from '../../__mocks__/prismaClient';
import { getStreamHistory, getTopArtist } from '../api';
import { generateStreamHistories } from '../../test/testUtils/recordGenerator';

describe('stream history api', () => {
    const userId = 1;

    describe('getStreamHistory', () => {
        const totalRecords = 109;
        const queryResult = generateStreamHistories({ isSong: true }, 1);

        beforeEach(() => {
            jest.resetAllMocks();
            prismaMock.streamHistory.findMany.mockResolvedValue(queryResult);
            prismaMock.streamHistory.count.mockResolvedValue(totalRecords);
        });

        it('Finds the latest stream history items using query defaults', async () => {
            const result = await getStreamHistory(userId, {});

            expect(prismaMock.streamHistory.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.streamHistory.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                orderBy: { datePlayed: 'desc' },
                where: { userId },
            });

            expect(result).toStrictEqual({ streamHistory: queryResult, recordCount: totalRecords });
        });

        it('Finds the latest stream history items using api options', async () => {
            // Given
            const dateFrom = new Date(2022, 0, 1);
            const dateTo = new Date(2023, 0, 1);

            // When
            await getStreamHistory(userId, {
                dateFrom,
                dateTo,
                limit: 10,
                offset: 2,
            });

            // Then
            expect(prismaMock.streamHistory.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.streamHistory.findMany).toHaveBeenCalledWith({
                where: { datePlayed: { gte: dateFrom, lte: dateTo }, userId },
                skip: 10 * 2,
                take: 10,
                orderBy: { datePlayed: 'desc' },
            });
        });

        it('Has the max limit as 100', async () => {
            await getStreamHistory(userId, {
                limit: 1000,
            });

            expect(prismaMock.streamHistory.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.streamHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
        });
    });

    describe('getTopArtists', () => {
        const queryResult = [
            { _count: { id: 1000 }, artistName: 'ABC' },
            { _count: { id: 2000 }, artistName: 'XYZ' },
        ];

        beforeEach(() => {
            jest.resetAllMocks();
            prismaMock.streamHistory.groupBy.mockResolvedValue(queryResult);
        });

        it('finds all uploads by time played', async () => {
            const result = await getTopArtist(userId, {});

            expect(result).toStrictEqual([
                { count: 1000, name: 'ABC' },
                { count: 2000, name: 'XYZ' },
            ]);
        });

        it('filters records by options', async () => {
            // Given
            const dateFrom = new Date(2022, 0, 1);
            const dateTo = new Date(2023, 0, 1);

            // When
            await getTopArtist(userId, {
                dateFrom,
                dateTo,
            });

            // Then
            expect(prismaMock.streamHistory.groupBy).toHaveBeenCalledTimes(1);
            expect(prismaMock.streamHistory.groupBy).toHaveBeenCalledWith({
                by: ['artistName'],
                _count: { id: true }, // defaults to count
                where: { datePlayed: { gte: dateFrom, lte: dateTo }, isSong: true, userId },
                orderBy: {
                    _count: { id: 'desc' },
                },
                take: 10, // default limit
            });
        });

        it('groups by count and uses limit', async () => {
            const queryResult = [
                { _sum: { msPlayed: 1000 }, artistName: 'ABC' },
                { _sum: { msPlayed: 2000 }, artistName: 'XYZ' },
            ];

            prismaMock.streamHistory.groupBy.mockResolvedValue(queryResult);

            await getTopArtist(userId, {
                groupBy: 'timePlayed',
                limit: 20,
            });

            expect(prismaMock.streamHistory.groupBy).toHaveBeenCalledTimes(1);
            expect(prismaMock.streamHistory.groupBy).toHaveBeenCalledWith({
                by: ['artistName'],
                _sum: { msPlayed: true },
                where: { isSong: true, userId },
                orderBy: {
                    _sum: { msPlayed: 'desc' },
                },
                take: 20,
            });
        });

        it('Has the max limit as 100', async () => {
            await getTopArtist(userId, {
                limit: 1000,
            });

            expect(prismaMock.streamHistory.groupBy).toHaveBeenCalledTimes(1);
            expect(prismaMock.streamHistory.groupBy).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
        });
    });
});
