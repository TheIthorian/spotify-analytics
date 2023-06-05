import dev from './dev';
import prod from './prod';
import local from './local';
import base from './base';

let config = base;
switch (process.env.NODE_ENV?.toLowerCase() ?? 'local') {
    case 'prod':
        config = { ...base, ...prod };
        break;
    case 'dev':
        config = { ...base, ...dev };
        break;
    default:
        config = { ...base, ...local };
}

console.log(config);

export default config;
