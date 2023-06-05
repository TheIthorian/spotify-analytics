import * as fs from 'fs';

import { chain } from 'stream-chain';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import * as Verifier from 'stream-json/utils/Verifier';

import { makeLogger } from '../../logger';
import { isType } from '../../util/typescript';
import * as memLog from '../../logger/memoryLogger';

const log = makeLogger(module);

type Options<T> = {
    onData?: (record: T) => Promise<void>;
    onInvalidData?: (record: T) => Promise<void>;
    validateFields?: boolean;
    validationFields?: string[];
};

/**
 * Reads a json file, processing each chunk with the provided `onData` callback. Throws error if the file contains invalid json.
 * @param filepath Path to the json file
 * options:
 * * `onData`: Callback for each valid record
 * * `onInvalidData`: Callback for each invalid record
 * * `validationFields`: Fields to validate for each record
 */
export async function readJsonWithStream<T extends object>(
    filepath: string,
    { onData, onInvalidData, validateFields, validationFields = [] }: Options<T> = {}
): Promise<void> {
    log.info('Validating json file');

    const filename = filepath.split('\\').pop() || filepath.split('/').pop();
    memLog.log('readJsonWithStream.validateJson', { filename });

    const { isValid, errorMessage } = await validateJson(filepath);
    if (!isValid) {
        log.error({ errorMessage }, 'Json file is invalid');
        throw new TypeError('Json file is invalid: ', { cause: errorMessage });
    }

    const pipeline = fs.createReadStream(filepath).pipe(StreamArray.withParser());

    let counter = 0;

    function handleData(value: any) {
        onData?.(value);
        counter++;
    }

    pipeline.on('data', ({ value }) => {
        memLog.log('readJsonWithStream.handleData', { filename });

        // TODO - Check this returns correct value
        if (!validateFields) {
            handleData(value);
            return;
        }

        if (isType<T>(value, validationFields)) {
            handleData(value);
        } else {
            onInvalidData?.(value);
        }
    });
    pipeline.on('end', () => log.info(`The jsonfile read ${counter} records.`));

    return new Promise((resolve, reject) => {
        pipeline.on('end', () => resolve());
        pipeline.on('finish', () => resolve());
        pipeline.on('error', err => reject(err));
    });
}

export async function readJsonAsync<T extends object>(
    filepath: string,
    { validateFields, validationFields = [] }: Pick<Options<T>, 'validateFields' | 'validationFields'>
) {
    log.info('Validating json file');
    const filename = filepath.split('\\').pop() || filepath.split('/').pop();
    memLog.log('readJsonWithStream.validateJson', { filename });

    const { isValid, errorMessage } = await validateJson(filepath);
    if (!isValid) {
        log.error({ errorMessage }, 'Json file is invalid');
        throw new TypeError('Json file is invalid: ', { cause: errorMessage });
    }

    const jsonString = await fs.promises.readFile(filepath, { encoding: 'utf-8' });
    const data = JSON.parse(jsonString);
    memLog.log('readJsonWithStream.readFile', { filename });

    if (!validateFields) {
        return data as T[];
    }

    const validatedData: T[] = [];
    for (const track of data) {
        if (isType<T>(track, validationFields)) {
            validatedData.push(track);
        }
    }
    memLog.log('readJsonWithStream.validateData', { filename });

    return validatedData;
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
