import type { Death } from '../death';
import type { IExecution } from '../voting/execution';
import type { IExile } from '../voting/exile';
import type { Phase } from '../phase';

export type Event = IExecution | IExile | Phase | Death;
