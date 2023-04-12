import QueryString from 'node:querystring';
import prisma from 'prismaClient';
import { makeLogger } from '../logger';
import { getSpotifyClient } from '../spotifyClient/spotifyClient';

const log = makeLogger(module);

const JOB_INTERVAL_SECONDS = 1 * 60;

log.info({ interval: JOB_INTERVAL_SECONDS, start: new Date() }, 'Running file processor');

async function enrichTracks() {
    log.info({ start: new Date() }, 'Starting enrichment');
    const batchSize = 50;

    const tracks = await prisma.streamHistory.findMany({
        take: batchSize,
        where: { spotifyTrackId: { not: null } },
    });

    const spotify = getSpotifyClient();
    const spotifyTracks = await Promise.all(
        tracks.map(track => spotify.searchTracks(QueryString.stringify({ track: track.spotifyTrackId, artist: track.artistName })))
    );

    for (let i = 0; i < tracks.length; i++) {
        tracks[i].spotifyTrackId = spotifyTracks[i].tracks.items[0].id;
    }
}

if (require.main == module) {
    enrichTracks();

    setInterval(() => {
        enrichTracks().catch(err => log.error(err, 'Failed to enrich files'));
    }, JOB_INTERVAL_SECONDS * 1000);
}
