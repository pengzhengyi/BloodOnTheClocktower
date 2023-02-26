import type { Death } from '../death';
import type { Execution } from '../voting/execution';
import type { Exile } from '../voting/exile';
import type { Phase } from '../phase';

export type Event = Execution | Exile | Phase | Death;
