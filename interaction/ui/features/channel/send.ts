import type { ISendOptions } from '../options/interaction-options';
import type { IInteractionChannel } from './interaction-channel';
import type { IPlayer } from '~/game/player';

export type ISendChannel<TOptions = RequestInit> = Required<
    Pick<IInteractionChannel<IPlayer, boolean, ISendOptions, TOptions>, 'send'>
>;
