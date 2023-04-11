import { z } from 'zod';

export const GetStreamHistoryOptionsSchema = z.object({
    dateFrom: z.date(),
    dateTo: z.date(),
    pageSize: z.number().positive().optional(),
    offset: z.number().nonnegative().optional(),
});

export type GetStreamHistoryOptions = z.infer<typeof GetStreamHistoryOptionsSchema>;

export async function getStreamHistory() {
    return;
}
