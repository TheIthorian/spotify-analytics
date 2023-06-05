import 'dotenv/config';

export default {
    databaseUrl: process.env.DATABASE_URL,
    e2eDatabaseUrl: process.env.E2E_DATABASE_URL,
    port: 4001,

    includeMemLog: false,
    maxUploadFileSize: 50 * 1024 * 1024, // 50 MB

    skipDuplicateUploads: true,
    databaseType: process.env.DATABASE_URL?.split(':')?.[0],
};
