import { readFile } from 'fs/promises';

import prisma from '../prismaClient';
import { makeLogger } from '../logger';
import { JOB_STATUS } from './constants';
import { SimpleStreamHistory, UploadFileQueue } from '@prisma/client';
import { deleteTempFile } from '../util/file';
import { isArrayType } from '../util/typescript';

const log = makeLogger(module);

export async function dequeueAllFiles(batchSize = 10) {
    log.info(`(${dequeueAllFiles.name})`);

    let numberOfFilesProcessed = 0;
    let loopIndex = 0;
    const dequeueLimit = 100;
    do {
        const uploads = await prisma.uploadFileQueue.findMany({
            take: batchSize,
            where: { status: JOB_STATUS.WAITING },
            orderBy: { id: 'asc' },
        });
        log.info({ dequeueSize: uploads.length }, `(${dequeueAllFiles.name}) - Dequeuing uploads`);

        if (!uploads.length) {
            return;
        }

        for (const uploadFile of uploads) {
            await processFile(uploadFile);
        }

        numberOfFilesProcessed = uploads.length;
        loopIndex++;
    } while (numberOfFilesProcessed >= batchSize && loopIndex < dequeueLimit);
}

async function processFile(file: UploadFileQueue) {
    log.info({ id: file.id }, `${processFile.name}`);

    if (file.filename && /^StreamingHistory*/.test(file.filename)) {
        await insertSimpleStreamingHistory(file);
    } else if (file.filename && /^Playlist*/.test(file.filename)) {
        await markAsIgnored(file); // Mark as ignored for now. TODO - Process playlist
    } else if (file.filename && /^endsong*/.test(file.filename)) {
        await insertStreamingHistory(file);
    } else {
        log.info('This is an unknown file: ' + file.filename);
        await markAsIgnored(file);
    }

    void deleteTempFile(file.filePath);
}

async function insertSimpleStreamingHistory(file: UploadFileQueue) {
    log.info({ file }, `(${insertSimpleStreamingHistory.name})`);

    const fileData = await readFile(file.filePath);
    const tracks = JSON.parse(fileData.toString());

    if (!isArrayType<SimpleStreamHistory>(tracks, ['trackName', 'artistName', 'endTime', 'msPlayed'])) {
        throw TypeError('Invalid file format: tracks are not valid');
    }

    try {
        await prisma.$transaction(
            tracks.map(track =>
                prisma.simpleStreamHistory.create({
                    data: {
                        trackName: track.trackName,
                        artistName: track.artistName,
                        msPlayed: track.msPlayed,
                        endTime: new Date(track.endTime),
                    },
                })
            )
        );

        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.COMPLETE },
        });
    } catch (err) {
        log.error(err, 'Error creating simple streaming history');

        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.FAILED },
        });
    }
}

async function insertPlaylist(file: UploadFileQueue) {
    log.info({ file }, 'Inserting playlist');
}

async function markAsIgnored(file: UploadFileQueue) {
    try {
        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.IGNORED },
        });
    } catch (err) {
        log.error({ err, file }, 'Error marking file as ignored');
    }
}

async function insertStreamingHistory(file: UploadFileQueue) {
    log.info({ file }, `(${insertStreamingHistory.name})`);

    const fileData = await readFile(file.filePath);
    const tracks = JSON.parse(fileData.toString());

    type JsonStreamHistoryRecord = {
        ts: string;
        username: string;
        platform: string;
        ms_played: number;
        conn_country: string;
        ip_addr_decrypted: string;
        user_agent_decrypted: string;
        master_metadata_track_name: string;
        master_metadata_album_artist_name: string;
        master_metadata_album_album_name: string;
        spotify_track_uri: string;
        episode_name: string;
        episode_show_name: string;
        spotify_episode_uri: string;
        reason_start: string;
        reason_end: string;
        shuffle: boolean;
        skipped: boolean;
        offline: boolean;
        offline_timestamp: number;
        incognito_mode: boolean;
    };

    if (
        !isArrayType<JsonStreamHistoryRecord>(tracks, [
            'ts',
            'username',
            'platform',
            'ms_played',
            'conn_country',
            'ip_addr_decrypted',
            'user_agent_decrypted',
            'master_metadata_track_name',
            'master_metadata_album_artist_name',
            'master_metadata_album_album_name',
            'spotify_track_uri',
            'episode_name',
            'episode_show_name',
            'spotify_episode_uri',
            'reason_start',
            'reason_end',
            'shuffle',
            'skipped',
            'offline',
            'offline_timestamp',
            'incognito_mode',
        ])
    ) {
        throw TypeError('Invalid file format: tracks are not valid');
    }

    try {
        await prisma.$transaction(
            tracks.map(track => {
                return prisma.streamHistory.create({
                    data: {
                        trackName: track.master_metadata_track_name,
                        albumName: track.master_metadata_album_album_name,
                        artistName: track.master_metadata_album_artist_name,
                        msPlayed: track.ms_played,
                        datePlayed: new Date(track.ts),
                        platform: track.platform,
                        spotifyTrackUri: track.spotify_track_uri,
                        isSong: track.episode_name === null,
                        episodeName: track.episode_name,
                        episodeShowName: track.episode_show_name,
                        spotifyShowUri: track.spotify_episode_uri,
                        shuffle: track.shuffle,
                        skipped: track.skipped,
                        offline: track.offline,
                    },
                });
            })
        );

        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.COMPLETE },
        });
    } catch (err) {
        log.error(err, 'Error creating streaming history');

        await prisma.uploadFileQueue.update({
            where: { id: file.id },
            data: { status: JOB_STATUS.FAILED },
        });
    }
}
