import { QuerySchemaValidator } from '../../util/schema';
import { ZodError, z } from 'zod';

const date = new Date(2021, 0, 20);

describe('QuerySchemaValidator', () => {
    const schema = z.object({
        date: z.coerce.date().optional(),
        text: z.coerce.string().optional(),
        requiredNumber: z.coerce.number(),
    });

    let res, next;
    beforeEach(() => {
        res = {
            status: jest.fn(),
            json: jest.fn(),
            locals: {},
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    it('parses the query object', () => {
        // Given
        const req = { query: { date: '2021-01-20', text: 'Hello there', requiredNumber: '123' } };
        const validator = QuerySchemaValidator(schema);

        // When
        validator(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);

        expect(res.locals.parsedQuery).toStrictEqual({
            date,
            text: 'Hello there',
            requiredNumber: 123,
        });
    });

    it('responds with error when the validation fails', () => {
        // Given
        const req = { query: { date: '2021-01-20', text: 'Hello there' } };
        const validator = QuerySchemaValidator(schema);

        // When
        validator(req, res, next);

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(
            new ZodError([
                {
                    code: 'invalid_type',
                    expected: 'number',
                    received: 'nan',
                    path: ['requiredNumber'],
                    message: 'Expected number, received nan',
                },
            ])
        );

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.locals.parsedQuery).toBe(undefined);
    });
});
