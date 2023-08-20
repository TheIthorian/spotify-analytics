import 'dotenv/config'; // Load .env file

export default {
    databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
    databaseType: (process.env.DATABASE_URL?.split(':')?.[0] as 'file' | 'postgres') ?? 'file',

    host: process.env.HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 3001),

    uiUrl: process.env.UI_URL ?? 'http://localhost:3000',

    includeMemLog: process.env.INCLUDE_MEMLOG ?? false,
    maxUploadFileSize: 50 * 1024 * 1024, // 50 MB

    skipDuplicateUploads: true,

    oAuthProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID ?? '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
        },
    },

    isTest: process.env.NODE_ENV === 'test',
};
