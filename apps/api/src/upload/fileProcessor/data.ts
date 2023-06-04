import { SimpleStreamHistory, StreamHistory } from '@prisma/client';
import prisma from '../../prismaClient';
import { JOB_STATUS } from '../../upload/constants';
import { JsonStreamHistoryRecord } from './types';
import { makeLogger } from '../../logger';

const log = makeLogger(module);

export async function setComplete(id: number) {
    await prisma.uploadFileQueue
        .update({
            where: { id },
            data: { status: JOB_STATUS.COMPLETE },
        })
        .catch(err => log.error({ err, id }, 'Error marking file as complete'));
}

export async function setFailed(id: number) {
    await prisma.uploadFileQueue
        .update({
            where: { id },
            data: { status: JOB_STATUS.FAILED },
        })
        .catch(err => log.error({ err, id }, 'Error marking file as failed'));
}

export async function setIgnored(id: number) {
    await prisma.uploadFileQueue
        .update({
            where: { id },
            data: { status: JOB_STATUS.IGNORED },
        })
        .catch(err => log.error({ err, id }, 'Error marking file as ignored'));
}

export async function insertSimpleHistory(history: SimpleStreamHistory[]) {
    await prisma
        .$transaction(
            history.map(track =>
                prisma.simpleStreamHistory.create({
                    data: {
                        trackName: track.trackName,
                        artistName: track.artistName,
                        msPlayed: track.msPlayed,
                        endTime: new Date(track.endTime),
                    },
                })
            )
        )
        .catch(err => log.error({ err }, 'Error inserting simple streaming history'));
}

export async function insertStreamHistory(history: JsonStreamHistoryRecord[]) {
    await prisma
        .$transaction(
            history.map(track => {
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
                        reasonStart: track.reason_start,
                        reasonEnd: track.reason_end,
                        incognitoMode: track.incognito_mode,
                    },
                });
            })
        )
        .catch(err => log.error({ err }, 'Error inserting streaming history'));
}
