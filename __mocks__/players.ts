import { createBasicPlayer, createBasicPlayers } from './player';
import type { CharacterToken } from '~/game/character';
import type { AsyncFactory } from '~/game/types';
import type { IPlayer } from '~/game/player';
import { Players, IPlayers } from '~/game/players';

export async function mockPlayers(
    characters: Array<CharacterToken>
): Promise<[IPlayers, Array<IPlayer>]> {
    const numPlayers = characters.length;
    let i = 0;
    const factory: AsyncFactory<IPlayer> = () =>
        createBasicPlayer(undefined, characters[i++]);

    const players = await createBasicPlayers(numPlayers, factory);

    return [new Players(players), players];
}
