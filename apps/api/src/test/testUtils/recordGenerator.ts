import { StreamHistory } from '@prisma/client';
import { faker } from '@faker-js/faker';

export function generateStreamHistory(properties: Partial<StreamHistory> = {}): Omit<StreamHistory, 'id'> {
    const isSong = properties?.isSong ?? faker.datatype.boolean();
    if (isSong) {
        return {
            trackName: properties?.trackName ?? faker.music.songName(),
            albumName: properties?.albumName ?? faker.music.songName(),
            artistName: properties?.artistName ?? faker.person.fullName(),
            msPlayed: properties?.msPlayed ?? faker.number.int({ min: 0, max: 1000000 }),
            datePlayed: properties?.datePlayed ?? faker.date.past(),
            platform: properties?.platform ?? 'platform',
            spotifyTrackUri: properties?.spotifyTrackUri ?? 'spotifyTrackUri',
            isSong,
            episodeName: properties?.episodeName ?? null,
            episodeShowName: properties?.episodeShowName ?? null,
            spotifyShowUri: properties?.spotifyShowUri ?? null,
            shuffle: properties?.shuffle ?? faker.datatype.boolean(),
            skipped: properties?.skipped ?? faker.datatype.boolean(),
            offline: properties?.offline ?? false,
            reasonStart: properties?.reasonStart ?? 'unknown',
            reasonEnd: properties?.reasonEnd ?? 'unknown',
            incognitoMode: properties?.incognitoMode ?? faker.datatype.boolean(),
        };
    }

    return {
        trackName: properties?.trackName ?? null,
        albumName: properties?.albumName ?? null,
        artistName: properties?.artistName ?? null,
        msPlayed: properties?.msPlayed ?? faker.number.int({ min: 0, max: 1000000 }),
        datePlayed: properties?.datePlayed ?? faker.date.past(),
        platform: properties?.platform ?? 'platform',
        spotifyTrackUri: properties?.spotifyTrackUri ?? null,
        isSong,
        episodeName: properties?.episodeName ?? faker.music.songName(),
        episodeShowName: properties?.episodeShowName ?? faker.music.songName(),
        spotifyShowUri: properties?.spotifyShowUri ?? 'spotifyTrackUri',
        shuffle: properties?.shuffle ?? faker.datatype.boolean(),
        skipped: properties?.skipped ?? faker.datatype.boolean(),
        offline: properties?.offline ?? false,
        reasonStart: properties?.reasonStart ?? 'unknown',
        reasonEnd: properties?.reasonEnd ?? 'unknown',
        incognitoMode: properties?.incognitoMode ?? faker.datatype.boolean(),
    };
}

export function generateStreamHistories(properties: Partial<StreamHistory> = {}, count = 1): Omit<StreamHistory, 'id'>[] {
    return Array.from({ length: count }, () => generateStreamHistory(properties));
}

export function generateRawStreamHistory({ isSong = faker.datatype.boolean(), username = 'fake-username' } = {}) {
    if (isSong) {
        return {
            ts: faker.date.between({ from: '2016-01-01', to: '2023-01-01' }).toISOString(),
            username,
            platform: 'desktop',
            ms_played: faker.number.int({ min: 0, max: 1000000 }),
            conn_country: 'GB',
            ip_addr_decrypted: '123.456.789',
            user_agent_decrypted: 'unknown',
            master_metadata_track_name: faker.music.songName(),
            master_metadata_album_artist_name: faker.person.fullName(),
            master_metadata_album_album_name: faker.music.songName(),
            spotify_track_uri: faker.string.uuid(),
            episode_name: null,
            episode_show_name: null,
            spotify_episode_uri: null,
            reason_start: 'trackdone',
            reason_end: 'trackdone',
            shuffle: faker.datatype.boolean(),
            skipped: faker.datatype.boolean(),
            offline: false,
            offline_timestamp: 0,
            incognito_mode: false,
        };
    }

    return {
        ts: faker.date.between({ from: '2016-01-01', to: '2023-01-01' }).toISOString(),
        username,
        platform: 'desktop',
        ms_played: faker.number.int({ min: 0, max: 1000000 }),
        conn_country: 'GB',
        ip_addr_decrypted: '123.456.789',
        user_agent_decrypted: 'unknown',
        master_metadata_track_name: null,
        master_metadata_album_artist_name: null,
        master_metadata_album_album_name: null,
        spotify_track_uri: null,
        episode_name: faker.music.songName(),
        episode_show_name: faker.person.fullName(),
        spotify_episode_uri: faker.string.uuid(),
        reason_start: 'trackdone',
        reason_end: 'trackdone',
        shuffle: faker.datatype.boolean(),
        skipped: faker.datatype.boolean(),
        offline: false,
        offline_timestamp: 0,
        incognito_mode: false,
    };
}
