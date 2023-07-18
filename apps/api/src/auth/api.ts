import { NotImplementedError } from 'spotify-analytics-errors';
import { makeLogger } from '../logger';
const log = makeLogger(module);

export async function webFlowLogin(provider: string) {
    log.info({ provider }, `(${webFlowLogin.name})`);
    throw new NotImplementedError(webFlowLogin.name + ' not implemented');
    return;
}

export async function logout(session: string) {
    log.info({ session }, `(${logout.name})`);
    throw new NotImplementedError(logout.name + ' not implemented');
}
