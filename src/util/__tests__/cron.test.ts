import { cronString } from '../cron';

describe('cronString', () => {
    it('throws error for null input', () => {
        expect(() => cronString({})).toThrowError();
    });

    it('sets the correct values when all are set', () => {
        expect(
            cronString(
                { seconds: 1, minutes: 2, hours: 3, dayOfMonth: 4, month: 5, week: 6 },
                false
            )
        ).toBe('1 2 3 4 5 6');
    });

    it('sets the correct values when some are set', () => {
        expect(cronString({ seconds: 1, hours: 3, month: 5 }, false)).toBe('1 * 3 * 5 *');
    });

    it('sets the correct values for when interval is true', () => {
        expect(cronString({ seconds: 1, hours: 3, month: 5 }, true)).toBe('*/1 * */3 * */5 *');
    });
});
