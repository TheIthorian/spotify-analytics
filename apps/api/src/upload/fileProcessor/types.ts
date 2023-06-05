import { UploadFileQueue } from '@prisma/client';

export type JsonStreamHistoryRecord = {
    ts: string;
    username: string;
    platform: string;
    ms_played: number;
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

export enum FileType {
    SimpleStreamingHistory = 'SimpleStreamingHistory',
    Playlist = 'Playlist',
    StreamingHistory = 'StreamingHistory',
    Unknown = 'Unknown',
}

export interface FileProcessor {
    type: FileType;
    setSource: (source: UploadFileQueue) => void;
    process: (validateFields?: boolean) => Promise<void>;
    processAsync: (validateFields?: boolean) => Promise<void>;
}

export enum ReadStrategy {
    ReadFileAsync = 'ReadFileAsync',
    StreamFile = 'StreamFile',
}

export enum ValidationStrategy {
    ValidateFields = 'ValidateFields',
    NoValidation = 'NoValidation',
}
