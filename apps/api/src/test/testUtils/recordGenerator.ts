import { StreamHistory } from '@prisma/client';
import { faker } from '@faker-js/faker';

export function generateStreamHistory(properties: Partial<StreamHistory> = {}): Omit<StreamHistory, 'id'> {
    const isSong = faker.datatype.boolean();
    if (isSong) {
        return {
            trackName: properties?.trackName ?? faker.music.songName(),
            albumName: properties?.albumName ?? faker.music.songName(),
            artistName: properties?.artistName ?? faker.person.fullName(),
            msPlayed: properties?.msPlayed ?? faker.number.int({ min: 0, max: 1000000 }),
            datePlayed: properties?.datePlayed ?? faker.date.past(),
            platform: properties?.platform ?? 'platform',
            spotifyTrackUri: properties?.spotifyTrackUri ?? 'spotifyTrackUri',
            isSong: properties?.isSong ?? true,
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
        isSong: properties?.isSong ?? false,
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
