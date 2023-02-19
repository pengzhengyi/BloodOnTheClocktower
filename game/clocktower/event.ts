import type { Death } from '../death';
import type { Execution } from '../execution';
import type { Exile } from '../exile';
import type { Phase } from '../phase';

export type Event = Execution | Exile | Phase | Death;
