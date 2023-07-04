import { z } from 'zod';

export type Upload = {
    id: number;
    status: number;
    filePath: string;
    filename: string;
    mimetype: string;
    size: number;
    md5: string;
    uploadDate: Date;
};

export type GetUploadResponseData = Array<Omit<Upload, 'filePath'>>;

export const GetUploadHistoryOptionsSchema = z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    limit: z.coerce.number().positive().optional(),
    offset: z.coerce.number().nonnegative().optional(),
});

export type GetUploadHistoryOptions = z.infer<typeof GetUploadHistoryOptionsSchema>;

export type PostUploadResponseData = { uploads: GetUploadResponseData; duplicates: string[] };

export const STATUS_BY_ID = {
    0: 'waiting',
    1: 'processing',
    2: 'complete',
    3: 'failed',
    4: 'ignored',
    5: 'duplicate',
} as const;

export const JOB_STATUS = {
    WAITING: 0,
    PROCESSING: 1,
    COMPLETE: 2,
    FAILED: 3,
    IGNORED: 4,
    DUPLICATE: 5,
} as const;
