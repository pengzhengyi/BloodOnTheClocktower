import { mock } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import { WasherwomanInfo, WasherwomanInfoHelper } from '~/game/info';
import { Player } from '~/game/player';
import { GameInfo } from '~/game/gameinfo';
import { CharacterSheet } from '~/game/charactersheet';
import { SpyInfluence } from '~/game/influence';
import { GameUI } from '~/interaction/gameui';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';

describe('True Washerwoman info', () => {
    let washerwomanPlayer: Player;
    let infoHelper: WasherwomanInfoHelper;

    beforeAll(() => {
        washerwomanPlayer = playerFromDescription(
            `${faker.name.firstName()} is the Washerwoman`
        );
        infoHelper = new WasherwomanInfoHelper(washerwomanPlayer, true);
    });

    /**
     * {@link `washerwoman["gameplay"][0]`}
     */
    test('Evin is the Chef, and Amy is the Ravenkeeper. The Washerwoman learns that either Evin or Amy is the Chef.', () => {
        const Evin = playerFromDescription('Evin is the Chef');
        const Amy = playerFromDescription('Amy is the Ravenkeeper');

        const gameInfo = new GameInfo(
            [Evin, Amy, washerwomanPlayer],
            mock<CharacterSheet>()
        );

        const candidates = infoHelper.candidates(gameInfo).take();

        expect(candidates).toHaveLength(2);
        for (const candidate of candidates as Array<WasherwomanInfo>) {
            expect(candidate.players).toIncludeAllMembers([Evin, Amy]);
            expect(candidate.character).toBeOneOf([
                Evin.character,
                Amy.character,
            ]);
        }
    });

    /**
     * {@link `washerwoman["gameplay"][1]`}
     */
    test('Julian is the Imp, and Alex is the Virgin. The Washerwoman learns that either Julian or Alex is the Virgin.', () => {
        const Julian = playerFromDescription('Julian is the Imp');
        const Alex = playerFromDescription('Alex is the Virgin');

        const gameInfo = new GameInfo(
            [Julian, Alex, washerwomanPlayer],
            mock<CharacterSheet>()
        );

        const candidates = infoHelper.candidates(gameInfo).take();

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<WasherwomanInfo>) {
            expect(candidate.players).toIncludeAllMembers([Julian, Alex]);
            expect(candidate.character).toBe(Alex.character);
        }
    });

    /**
     * {@link `washerwoman["gameplay"][2]`}
     */
    test('Marianna is the Spy, and Sarah is the Scarlet Woman. The Washerwoman learns that one of them is the Ravenkeeper. (This happens because the Spy is registering as a Townsfolk—in this case, the Ravenkeeper)', () => {
        const Marianna = playerFromDescription('Marianna is the Spy');
        const Sarah = playerFromDescription('Sarah is the Scarlet Woman');

        const gameInfo = new GameInfo(
            [Marianna, Sarah, washerwomanPlayer],
            mock<CharacterSheet>()
        );

        const influence = new SpyInfluence(Marianna);
        const gameUIStorytellerChooseMock = jest
            .spyOn(GameUI, 'storytellerChoose')
            .mockImplementation(() => Ravenkeeper);

        const influencedGameInfo = influence.apply(gameInfo, {
            unbiasedGameInfo: gameInfo,
        });
        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();

        const candidates = infoHelper.candidates(influencedGameInfo).take();

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<WasherwomanInfo>) {
            expect(candidate.players).toHaveLength(2);
            expect(candidate.character).toBe(Ravenkeeper);
        }
    });
});
