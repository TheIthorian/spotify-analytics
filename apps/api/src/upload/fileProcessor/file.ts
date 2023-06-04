import * as fs from 'fs';

import { chain } from 'stream-chain';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import * as Verifier from 'stream-json/utils/Verifier';

import { makeLogger } from '../../logger';
import { isType } from '../../util/typescript';

const log = makeLogger(module);

type Options<T> = {
    onData?: (record: T) => Promise<void>;
    onInvalidData?: (record: T) => Promise<void>;
    validationFields?: string[];
};

export async function readJson<T extends object>(
    filepath: string,
    { onData, onInvalidData, validationFields = [] }: Options<T> = {}
): Promise<T[]> {
    log.info('Validating json file');
    const { isValid, errorMessage } = await validateJson(filepath);
    if (!isValid) {
        log.error('Json file is invalid: ' + errorMessage);
        console.log(errorMessage);
    }

    const pipeline = fs.createReadStream(filepath).pipe(StreamArray.withParser());

    let counter = 0;
    const dataArray = [];
    pipeline.on('data', ({ value }) => {
        // TODO - Check this returns correct value
        if (isType<T>(value, validationFields)) {
            dataArray.push(value);
            onData?.(value);
            counter++;
        } else {
            onInvalidData?.(value);
        }
    });
    pipeline.on('end', () => log.info(`The jsonfile read ${counter} records.`));

    return new Promise((resolve, reject) => {
        pipeline.on('end', () => resolve(dataArray));
        pipeline.on('finish', () => resolve(dataArray));
    });
}

type ValidateJsonResult = { isValid: boolean; errorMessage?: string };

async function validateJson(filepath: string): Promise<ValidateJsonResult> {
    const promise: Promise<ValidateJsonResult> = new Promise((resolve, reject) => {
        const pipeline = chain([fs.createReadStream(filepath), Verifier.verifier()]);
        pipeline.on('error', err => resolve({ isValid: false, errorMessage: err.message }));
        pipeline.on('end', () => resolve({ isValid: true, errorMessage: undefined }));
    });

    return promise;
}

if (require.main === module) {
    // readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/extended-stream-history/example.json');
    readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/extended-stream-history/endsong_0.json');
    // readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/extended-stream-history/example_simple.json');
    // readJson('C:/Programming/Misc_Sites/spotify-analytics/.project/spotify-data/spotify-data/StreamingHistory0.json');
}
