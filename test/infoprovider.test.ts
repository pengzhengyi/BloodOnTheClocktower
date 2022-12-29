import { playerFromDescription } from './utils';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import {
    LibrarianInformationProvider,
    WasherwomanInformationProvider,
} from '~/game/infoprovider';
import { createBasicPlayer } from '~/__mocks__/player';
import { mockInfoProvideContext } from '~/__mocks__/information';
import { Outsider, Townsfolk } from '~/game/charactertype';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Chef } from '~/content/characters/output/chef';
import { Players } from '~/game/players';
import { Player } from '~/game/player';
import { Virgin } from '~/content/characters/output/virgin';
import { Librarian } from '~/content/characters/output/librarian';
import type {
    LibrarianNoOutsiderInformation,
    OneOfTwoPlayersIsOutsider,
} from '~/game/information';
import { Saint } from '~/content/characters/output/saint';
import { Drunk } from '~/content/characters/output/drunk';

function createInfoProvideContext(player: Player, otherPlayers: Player[]) {
    const context = mockInfoProvideContext();
    context.requestedPlayer = player;
    context.players = Players.of(player, ...otherPlayers);
    return context;
}

describe('test WasherwomanInformationProvider', () => {
    const provider = new WasherwomanInformationProvider();
    let washerwomanPlayer: Player;

    beforeAll(async () => {
        washerwomanPlayer = await createBasicPlayer(undefined, Washerwoman);
    });

    /**
     * {@link `washerwoman["gameplay"][0]`}
     */
    test('Evin is the Chef, and Amy is the Ravenkeeper. The Washerwoman learns that either Evin or Amy is the Chef.', async () => {
        const Evin = await playerFromDescription('Evin is the Chef');
        const Amy = await playerFromDescription('Amy is the Ravenkeeper');

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

describe('test LibrarianInformationProvider', () => {
    const provider = new LibrarianInformationProvider();
    let librarianPlayer: Player;

    beforeAll(async () => {
        librarianPlayer = await createBasicPlayer(undefined, Librarian);
    });

    /**
     * {@link `librarian["gameplay"][0]`}
     */
    test('Benjamin is the Saint, and Filip is the Baron. The Librarian learns that either Benjamin or Filip is the Saint.', async () => {
        const Benjamin = await playerFromDescription('Benjamin is the Saint');
        const Filip = await playerFromDescription('Filip is the Baron');

        const context = createInfoProvideContext(librarianPlayer, [
            Benjamin,
            Filip,
        ]);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            const info = option.info as OneOfTwoPlayersIsOutsider;
            expect(info.characterType).toBe(Outsider);
            expect(info.players).toIncludeSameMembers([Benjamin, Filip]);
            expect(info.character).toBe(Saint);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `librarian["gameplay"][1]`}
     */
    test("There are no Outsiders in this game. The Librarian learns a '0'.", async () => {
        const context = createInfoProvideContext(librarianPlayer, []);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            const info = option.info as LibrarianNoOutsiderInformation;
            expect(info.noOutsiders).toBeTrue();
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `librarian["gameplay"][2]`}
     */
    test('Abdallah is the Drunk, who thinks they are the Monk, and Douglas is the Undertaker. The Librarian learns that either Abdallah or Douglas is the Drunk. (This happens because the Librarian learns the true character. The Drunk is Abdallah’s true character, not the Monk.)', async () => {
        const Abdallah = await playerFromDescription('Abdallah is the Drunk');
        const Douglas = await playerFromDescription(
            'Douglas is the Undertaker'
        );

        const context = createInfoProvideContext(librarianPlayer, [
            Abdallah,
            Douglas,
        ]);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            const info = option.info as OneOfTwoPlayersIsOutsider;
            expect(info.players).toIncludeSameMembers([Abdallah, Douglas]);
            expect(info.character).toBe(Drunk);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });
});
