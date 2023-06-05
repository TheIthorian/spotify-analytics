import 'dotenv/config';

const IS_TEST = process.env.IS_TEST?.toUpperCase() === 'TRUE';

export default {
    databaseUrl: process.env.DATABASE_URL,
    e2eDatabaseUrl: process.env.E2E_DATABASE_URL,
    port: IS_TEST ? 4001 : 3001,
    isTest: IS_TEST,

    includeMemLog: false,
    maxUploadFileSize: 50 * 1024 * 1024, // 50 MB
};
