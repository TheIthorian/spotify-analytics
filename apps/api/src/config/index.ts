import dev from './dev';
import prod from './prod';
import local from './local';
import base from './base';
import test from './test';

let config = base;
switch (process.env.NODE_ENV?.toLowerCase() ?? 'local') {
    case 'prod':
        config = { ...base, ...prod };
        break;
    case 'dev':
        config = { ...base, ...dev };
        break;
    case 'test':
        config = { ...base, ...test };
        break;
    default:
        config = { ...base, ...local };
}

process.stdout.write(JSON.stringify(config, null, 2) + '\n');

export default config;