import { mock } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import {
    ChefInfo,
    ChefInfoProvider,
    InfoProvider,
    InvestigatorInfo,
    InvestigatorInfoProvider,
    LibrarianInfo,
    LibrarianInfoProvider,
    WasherwomanInfo,
    WasherwomanInfoProvider,
} from '~/game/info';
import { Player } from '~/game/player';
import { GameInfo } from '~/game/gameinfo';
import { CharacterSheet } from '~/game/charactersheet';
import { RecluseInfluence, SpyInfluence } from '~/game/influence';
import { GameUI } from '~/interaction/gameui';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Saint } from '~/content/characters/output/saint';
import { Drunk } from '~/content/characters/output/drunk';
import { Baron } from '~/content/characters/output/baron';
import { Spy } from '~/content/characters/output/spy';
import { Poisoner } from '~/content/characters/output/poisoner';

async function generateInfoCandidates<T>(
    playerDescriptions: Array<string>,
    players: Array<Player>,
    infoProvider: InfoProvider<T>,
    gameInfoTransform?: (
        gameInfo: GameInfo,
        allPlayers: Player[]
    ) => Promise<GameInfo>
): Promise<[T | T[] | undefined, Array<Player>]> {
    const playerFromDescriptions = playerDescriptions.map(
        playerFromDescription
    );
    const allPlayers = playerFromDescriptions.concat(players);
    allPlayers.forEach((player, index) => (player.seatNumber = index));

    let gameInfo = new GameInfo(allPlayers, mock<CharacterSheet>());

    if (gameInfoTransform !== undefined) {
        gameInfo = await gameInfoTransform(gameInfo, allPlayers);
    }

    return [infoProvider.candidates(gameInfo).take(), allPlayers];
}

describe('True Washerwoman info', () => {
    let washerwomanPlayer: Player;
    let infoProvider: WasherwomanInfoProvider;

    beforeAll(() => {
        washerwomanPlayer = playerFromDescription(
            `${faker.name.firstName()} is the Washerwoman`
        );
        infoProvider = new WasherwomanInfoProvider(washerwomanPlayer, true);
    });

    /**
     * {@link `washerwoman["gameplay"][0]`}
     */
    test('Evin is the Chef, and Amy is the Ravenkeeper. The Washerwoman learns that either Evin or Amy is the Chef.', async () => {
        const [candidates, [Evin, Amy, _]] = await generateInfoCandidates(
            ['Evin is the Chef', 'Amy is the Ravenkeeper'],
            [washerwomanPlayer],
            infoProvider
        );

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
    test('Julian is the Imp, and Alex is the Virgin. The Washerwoman learns that either Julian or Alex is the Virgin.', async () => {
        const [candidates, [Julian, Alex, _]] = await generateInfoCandidates(
            ['Julian is the Imp', 'Alex is the Virgin'],
            [washerwomanPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<WasherwomanInfo>) {
            expect(candidate.players).toIncludeAllMembers([Julian, Alex]);
            expect(candidate.character).toBe(Alex.character);
        }
    });

    /**
     * {@link `washerwoman["gameplay"][2]`}
     */
    test('Marianna is the Spy, and Sarah is the Scarlet Woman. The Washerwoman learns that one of them is the Ravenkeeper. (This happens because the Spy is registering as a Townsfolk—in this case, the Ravenkeeper)', async () => {
        const gameUIStorytellerChooseMock = jest
            .spyOn(GameUI, 'storytellerChoose')
            .mockImplementation(async () => await Ravenkeeper);

        const [candidates, [_Marianna, _Sarah, _]] =
            await generateInfoCandidates(
                ['Marianna is the Spy', 'Sarah is the Scarlet Woman'],
                [washerwomanPlayer],
                infoProvider,
                async (gameInfo, [Marianna, _Sarah, _]) => {
                    const influence = new SpyInfluence(Marianna);

                    return await influence.apply(gameInfo, {
                        unbiasedGameInfo: gameInfo,
                    });
                }
            );

        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<WasherwomanInfo>) {
            expect(candidate.players).toHaveLength(2);
            expect(candidate.players).not.toContain(washerwomanPlayer);
            expect(candidate.character).toBe(Ravenkeeper);
        }
    });
});

describe('True Librarian info', () => {
    let librarianPlayer: Player;
    let infoProvider: LibrarianInfoProvider;

    beforeAll(() => {
        librarianPlayer = playerFromDescription(
            `${faker.name.firstName()} is the Librarian`
        );
        infoProvider = new LibrarianInfoProvider(librarianPlayer, true);
    });

    /**
     * {@link `librarian["gameplay"][0]`}
     */
    test('Benjamin is the Saint, and Filip is the Baron. The Librarian learns that either Benjamin or Filip is the Saint.', async () => {
        const [candidates, [Benjamin, Filip, _]] = await generateInfoCandidates(
            ['Benjamin is the Saint', 'Filip is the Baron'],
            [librarianPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<LibrarianInfo>) {
            expect(candidate.players).toIncludeAllMembers([Benjamin, Filip]);
            expect(candidate.character).toBe(Saint);
        }
    });

    /**
     * {@link `librarian["gameplay"][1]`}
     */
    test("There are no Outsiders in this game. The Librarian learns a '0'.", async () => {
        const [candidates, _] = await generateInfoCandidates(
            [],
            [librarianPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<LibrarianInfo>) {
            expect(candidate.hasOutsider).toBeFalse();
        }
    });

    /**
     * {@link `librarian["gameplay"][2]`}
     */
    test('Abdallah is the Drunk, who thinks they are the Monk, and Douglas is the Undertaker. The Librarian learns that either Abdallah or Douglas is the Drunk. (This happens because the Librarian learns the true character. The Drunk is Abdallah’s true character, not the Monk.)', async () => {
        const [candidates, [Abdallah, Douglas, _]] =
            await generateInfoCandidates(
                ['Abdallah is the Drunk', 'Douglas is the Undertaker'],
                [librarianPlayer],
                infoProvider
            );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<LibrarianInfo>) {
            expect(candidate.players).toIncludeAllMembers([Abdallah, Douglas]);
            expect(candidate.character).toBe(Drunk);
        }
    });
});

describe('True Investigator info', () => {
    let investigatorPlayer: Player;
    let infoProvider: InvestigatorInfoProvider;

    beforeAll(() => {
        investigatorPlayer = playerFromDescription(
            `${faker.name.firstName()} is the Investigator`
        );
        infoProvider = new InvestigatorInfoProvider(investigatorPlayer, true);
    });

    /**
     * {@link `investigator["gameplay"][0]`}
     */
    test('Amy is the Baron, and Julian is the Mayor. The Investigator learns that either Amy or Julian is the Baron.', async () => {
        const [candidates, [Amy, Julian, _]] = await generateInfoCandidates(
            ['Amy is the Baron', 'Julian is the Mayor'],
            [investigatorPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<InvestigatorInfo>) {
            expect(candidate.players).toIncludeAllMembers([Amy, Julian]);
            expect(candidate.character).toBe(Baron);
        }
    });

    /**
     * {@link `investigator["gameplay"][1]`}
     */
    test('Angelus is the Spy, and Lewis is the Poisoner. The Investigator learns that either Angelus or Lewis is the Spy.', async () => {
        const gameUIStorytellerChooseMock = jest
            .spyOn(GameUI, 'storytellerChoose')
            .mockImplementation(async () => await Spy);

        const [candidates, [Angelus, Lewis, _]] = await generateInfoCandidates(
            ['Angelus is the Spy', 'Lewis is the Poisoner'],
            [investigatorPlayer],
            infoProvider,
            async (gameInfo, [Angelus, _Lewis, _]) => {
                const influence = new SpyInfluence(Angelus);

                return await influence.apply(gameInfo, {
                    unbiasedGameInfo: gameInfo,
                });
            }
        );

        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();

        expect(candidates).toHaveLength(2);
        for (const candidate of candidates as Array<InvestigatorInfo>) {
            expect(candidate.players).toIncludeAllMembers([Angelus, Lewis]);
            expect(candidate.character).toBeOneOf([Spy, Poisoner]);
        }
    });

    /**
     * {@link `investigator["gameplay"][2]`}
     */
    test('Brianna is the Recluse, and Marianna is the Imp. The Investigator learns that either Brianna or Marianna is the Poisoner. (This happens because the Recluse is registering as a Minion—in this case, the Poisoner.)', async () => {
        const gameUIStorytellerChooseMock = jest
            .spyOn(GameUI, 'storytellerChoose')
            .mockImplementation(async () => await Poisoner);

        const [candidates, [Brianna, Marianna, _]] =
            await generateInfoCandidates(
                ['Brianna is the Recluse', 'Marianna is the Imp'],
                [investigatorPlayer],
                infoProvider,
                async (gameInfo, [Brianna, _Marianna, _]) => {
                    const influence = new RecluseInfluence(Brianna);

                    return await influence.apply(gameInfo, {
                        unbiasedGameInfo: gameInfo,
                    });
                }
            );

        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();

        expect(candidates).toBeArrayOfSize(1);
        for (const candidate of candidates as Array<InvestigatorInfo>) {
            expect(
                candidate.players.map((player) => player.username)
            ).toIncludeSameMembers([Brianna.username, Marianna.username]);
            expect(candidate.character).toBe(Poisoner);
        }
    });
});

describe('True Chef info', () => {
    let chefPlayer: Player;
    let infoProvider: ChefInfoProvider;

    beforeAll(() => {
        chefPlayer = playerFromDescription(
            `${faker.name.firstName()} is the Chef`
        );
        infoProvider = new ChefInfoProvider(chefPlayer, true);
    });

    /**
     * {@link `chef["gameplay"][0]`}
     */
    test("No evil players are sitting next to each other. The Chef learns a '0'.", async () => {
        const [candidates, _] = await generateInfoCandidates(
            ['Julian is the Mayor'],
            [chefPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<ChefInfo>) {
            expect(candidate.numPairEvilPlayers).toBe(0);
        }
    });

    /**
     * {@link `chef["gameplay"][1]`}
     */
    test("The Imp is sitting next to the Baron. Across the circle, the Poisoner is sitting next to the Scarlet Woman. The Chef learns a '2'.", async () => {
        const [candidates, _] = await generateInfoCandidates(
            [
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Baron`,
                `${faker.name.firstName()} is the Empath`,
                `${faker.name.firstName()} is the Poisoner`,
                `${faker.name.firstName()} is the Scarlet Woman`,
            ],
            [chefPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<ChefInfo>) {
            expect(candidate.numPairEvilPlayers).toBe(2);
        }
    });

    /**
     * {@link `chef["gameplay"][2]`}
     */
    test("An evil Scapegoat is sitting between the Imp and a Minion. Across the circle, two other Minions are sitting next to each other. The Chef learns a '3'.", async () => {
        const gameUIStorytellerChooseMock = jest
            .spyOn(GameUI, 'storytellerChoose')
            .mockImplementation(async () => await Poisoner);

        const [candidates, _] = await generateInfoCandidates(
            [
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the evil Scapegoat`,
                `${faker.name.firstName()} is the Baron`,
                `${faker.name.firstName()} is the Undertaker`,
                `${faker.name.firstName()} is the Poisoner`,
                `${faker.name.firstName()} is the Scarlet Woman`,
            ],
            [chefPlayer],
            infoProvider
        );

        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<ChefInfo>) {
            expect(candidate.numPairEvilPlayers).toBe(3);
        }
    });
});
