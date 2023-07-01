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

export type UploadStatus = (typeof STATUS_BY_ID)[keyof typeof STATUS_BY_ID];

export type GetUploadResponseData = UploadRecord[];

export type UploadRecord = Omit<Upload, 'status'> & { status: UploadStatus };
export type UploadStatusValue = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

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
