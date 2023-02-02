// eslint-disable-next-line import/first, import/order
import { Crypto } from '@peculiar/webcrypto';
import { setupEffects } from './effects';

setupEffects();

global.crypto = new Crypto();
