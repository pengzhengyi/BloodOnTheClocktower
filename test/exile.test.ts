import { collectVotesForNomination as collectVotesForExile } from './execution.test';
import { storytellerHandleMock } from '~/__mocks__/game-ui';
import { Exile } from '~/game/exile';
import { ExileNonTraveller } from '~/game/exception/exile-non-traveller';
import type { IPlayer } from '~/game/player';
import { Scapegoat } from '~/content/characters/output/scapegoat';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { createBasicPlayer, setPlayerDead } from '~/__mocks__/player';

async function createExileAndCollectVotes(
    nominated: IPlayer,
    nominator: IPlayer,
    playersToVote: Array<IPlayer>,
    willPlayerRaiseHand: Array<boolean>
): Promise<Array<IPlayer>> {
    const exile = await Exile.init(nominator, nominated);

    const playerToWillRaiseHand = new Map<IPlayer, boolean>();

    for (let i = 0; i < playersToVote.length; i++) {
        playerToWillRaiseHand.set(playersToVote[i], willPlayerRaiseHand[i]);
    }

    return await collectVotesForExile(exile, playerToWillRaiseHand);
}

describe('Test Exile Edge Cases', () => {
    test('can only exile Traveller', async () => {
        const traveller = await createBasicPlayer(undefined, Scapegoat);
        const townsfolk = await createBasicPlayer(undefined, Washerwoman);

        storytellerHandleMock.mockClear();
        storytellerHandleMock.mockImplementation(() => Promise.resolve(false));

        await expect(
            async () => await Exile.init(traveller, townsfolk)
        ).rejects.toThrowError(ExileNonTraveller);
        expect(storytellerHandleMock).toHaveBeenCalledOnce();
        storytellerHandleMock.mockReset();

        const playersSupportExile = await createExileAndCollectVotes(
            traveller,
            townsfolk,
            [traveller, townsfolk],
            [false, true]
        );
        expect(playersSupportExile).toEqual([townsfolk]);
    });

    test('Any players may support an exile, even dead players without a vote token', async () => {
        const traveller = await createBasicPlayer(undefined, Scapegoat);
        const townsfolk = await createBasicPlayer(undefined, Washerwoman);

        await setPlayerDead(townsfolk);

        const playersSupportExile = await createExileAndCollectVotes(
            traveller,
            townsfolk,
            [traveller, townsfolk],
            [false, true]
        );
        expect(playersSupportExile).toEqual([townsfolk]);
    });
});
