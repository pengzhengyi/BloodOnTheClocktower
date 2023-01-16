import { Info } from './info';
import type { Generator } from '~/game/collections';

export class StoryTellerInformation<T> extends Info<T> {}

export type StoryTellerInformationOptions<T> =
    | Generator<StoryTellerInformation<T>>
    | Generator<never>;
