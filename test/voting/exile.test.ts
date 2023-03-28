import { collectVotesForNomination as collectVotesForExile } from './execution.test';
import { Exile } from '~/game/voting/exile';
import { ExileNonTraveller } from '~/game/exception/exile-non-traveller';
import type { IPlayer } from '~/game/player';
import { createBasicPlayer, setPlayerDead } from '~/__mocks__/player';
import { Scapegoat, Washerwoman } from '~/__mocks__/character';

async function createExileAndCollectVotes(
    nominated: IPlayer,
    nominator: IPlayer,
    playersToVote: Array<IPlayer>,
    willPlayerRaiseHand: Array<boolean>
): Promise<Array<IPlayer>> {
    const exile = new Exile(nominator, nominated);

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

        const exile = new Exile(traveller, townsfolk);

        await expect(async () => await exile.validate()).rejects.toThrowError(
            ExileNonTraveller
        );

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
