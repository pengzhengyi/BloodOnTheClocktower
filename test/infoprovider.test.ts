import { playerFromDescription } from './utils';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { WasherwomanInformationProvider } from '~/game/infoprovider';
import { createBasicPlayer } from '~/__mocks__/player';
import { mockInfoProvideContext } from '~/__mocks__/information';
import { Townsfolk } from '~/game/charactertype';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Chef } from '~/content/characters/output/chef';
import { Players } from '~/game/players';
import { Player } from '~/game/player';
import { Virgin } from '~/content/characters/output/virgin';

function createInfoProvideContext(player: Player, otherPlayers: Player[]) {
    const context = mockInfoProvideContext();
    context.requestedPlayer = player;
    context.players = Players.of(player, ...otherPlayers);
    return context;
}

describe('test WasherwomanInformationProvider', () => {
    const provider = new WasherwomanInformationProvider();

    /**
     * {@link `washerwoman["gameplay"][0]`}
     */
    test('Evin is the Chef, and Amy is the Ravenkeeper. The Washerwoman learns that either Evin or Amy is the Chef.', async () => {
        const Evin = await playerFromDescription('Evin is the Chef');
        const Amy = await playerFromDescription('Amy is the Ravenkeeper');
        const washerwomanPlayer = await createBasicPlayer(
            undefined,
            Washerwoman
        );

        const context = createInfoProvideContext(washerwomanPlayer, [
            Evin,
            Amy,
        ]);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(2);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.characterType).toBe(Townsfolk);
            expect(option.info.players).toIncludeSameMembers([Evin, Amy]);
            expect(option.info.character).toBeOneOf([Chef, Ravenkeeper]);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `washerwoman["gameplay"][1]`}
     */
    test('Julian is the Imp, and Alex is the Virgin. The Washerwoman learns that either Julian or Alex is the Virgin.', async () => {
        const Julian = await playerFromDescription('Julian is the Imp');
        const Alex = await playerFromDescription('Alex is the Virgin');
        const washerwomanPlayer = await createBasicPlayer(
            undefined,
            Washerwoman
        );

        const context = createInfoProvideContext(washerwomanPlayer, [
            Julian,
            Alex,
        ]);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.info.players).toIncludeSameMembers([Julian, Alex]);
            expect(option.info.character).toBe(Virgin);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `washerwoman["gameplay"][2]`}
     */
    test('Marianna is the Spy, and Sarah is the Scarlet Woman. The Washerwoman learns that one of them is the Ravenkeeper. (This happens because the Spy is registering as a Townsfolk—in this case, the Ravenkeeper)', async () => {
        // TODO
    });
});
