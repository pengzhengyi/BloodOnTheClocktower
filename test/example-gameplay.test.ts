/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { playerFromDescription } from './utils';
import {
    ChefInfo,
    ChefInfoProvider,
    EmpathInfo,
    EmpathInfoProvider,
    FortuneTellerInfo,
    FortuneTellerInfoProvider,
    InfoProvider,
    InvestigatorInfo,
    InvestigatorInfoProvider,
    LibrarianInfo,
    LibrarianInfoProvider,
    RavenkeeperInfo,
    RavenkeeperInfoProvider,
    UndertakerInfo,
    UndertakerInfoProvider,
    WasherwomanInfo,
    WasherwomanInfoProvider,
} from '~/game/info';
import { Player } from '~/game/player';
import { GameInfo } from '~/game/gameinfo';
import { CharacterSheet } from '~/game/charactersheet';
import type { Context } from '~/game/infoprocessor';
import {
    FortuneTellerRedHerringInfluence,
    RecluseInfluence,
    SoldierInfluence,
    SpyInfluence,
} from '~/game/influence';
import { GAME_UI } from '~/interaction/gameui';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Saint } from '~/content/characters/output/saint';
import { Drunk } from '~/content/characters/output/drunk';
import { Baron } from '~/content/characters/output/baron';
import { Spy } from '~/content/characters/output/spy';
import { Poisoner } from '~/content/characters/output/poisoner';
import { Execution } from '~/game/execution';
import { Mayor } from '~/content/characters/output/mayor';
import { Butler } from '~/content/characters/output/butler';
import { GamePhase } from '~/game/gamephase';
import { Empath } from '~/content/characters/output/empath';
import { Imp } from '~/content/characters/output/imp';
import { Generator } from '~/game/collections';
import { CharacterAct, SlayerAct } from '~/game/characteract';
import { Game } from '~/game/game';
import { setPlayerDead } from '~/__mocks__/player';

function mockStorytellerChoose<T>(chosen: T) {
    return jest
        .spyOn(GAME_UI, 'storytellerChoose')
        .mockImplementation(async () => await chosen);
}

function mockChoosePlayer(chosen: Player) {
    return jest.spyOn(GAME_UI, 'choose').mockImplementation(
        async (_player, players) =>
            await Generator.take(
                1,
                Generator.filter(
                    (player) => player.equals(chosen),
                    players as Iterable<Player>
                )
            )
    );
}

function createMockGameInfo(
    players: Array<Player>,
    characterSheet?: CharacterSheet,
    gamePhase?: GamePhase,
    game?: Game
) {
    return new GameInfo(
        players,
        characterSheet ?? mock<CharacterSheet>(),
        gamePhase ?? mock<GamePhase>(),
        game ?? mock<Game>()
    );
}

function createNonfirstNightGamePhase() {
    const gamePhase = GamePhase.of(5);
    return gamePhase;
}

function createDayGamePhase() {
    const gamePhase = GamePhase.of(3);
    return gamePhase;
}

async function generateInfoCandidates<T>(
    playerDescriptions: Array<string>,
    players: Array<Player>,
    infoProvider: InfoProvider<T>,
    gameInfoTransform?: (
        gameInfo: GameInfo,
        allPlayers: Player[]
    ) => Promise<GameInfo>,
    characterSheet?: CharacterSheet,
    gamePhase?: GamePhase
): Promise<[T | T[] | undefined, Array<Player>]> {
    const playerFromDescriptions = await Promise.all(
        playerDescriptions.map(playerFromDescription)
    );
    const allPlayers = playerFromDescriptions.concat(players);
    allPlayers.forEach((player, index) => (player.seatNumber = index));

    let gameInfo = createMockGameInfo(allPlayers, characterSheet, gamePhase);

    if (gameInfoTransform !== undefined) {
        gameInfo = await gameInfoTransform(gameInfo, allPlayers);
    }

    const candidates = await infoProvider.candidates(gameInfo);
    return [candidates.take(), allPlayers];
}

beforeAll(() => {
    jest.spyOn(GAME_UI, 'storytellerConfirm').mockImplementation(
        async () => await true
    );
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('True Washerwoman info', () => {
    let washerwomanPlayer: Player;
    let infoProvider: WasherwomanInfoProvider;

    beforeEach(async () => {
        washerwomanPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Washerwoman`
        );
        infoProvider = new WasherwomanInfoProvider(washerwomanPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
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
        const gameUIStorytellerChooseMock = mockStorytellerChoose(Ravenkeeper);

        const [candidates, [_Marianna, _Sarah, _]] =
            await generateInfoCandidates(
                ['Marianna is the Spy', 'Sarah is the Scarlet Woman'],
                [washerwomanPlayer],
                infoProvider,
                async (gameInfo, [Marianna, _Sarah, _]) => {
                    const influence = new SpyInfluence(Marianna);

                    return await influence.apply(gameInfo, mock<Context>());
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

    beforeEach(async () => {
        librarianPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Librarian`
        );
        infoProvider = new LibrarianInfoProvider(librarianPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
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

    beforeEach(async () => {
        investigatorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Investigator`
        );
        infoProvider = new InvestigatorInfoProvider(investigatorPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
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
        const gameUIStorytellerChooseMock = mockStorytellerChoose(Spy);

        const [candidates, [Angelus, Lewis, _]] = await generateInfoCandidates(
            ['Angelus is the Spy', 'Lewis is the Poisoner'],
            [investigatorPlayer],
            infoProvider,
            async (gameInfo, [Angelus, _Lewis, _]) => {
                const influence = new SpyInfluence(Angelus);

                return await influence.apply(gameInfo, mock<Context>());
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
        const gameUIStorytellerChooseMock = mockStorytellerChoose(Poisoner);

        const [candidates, [Brianna, Marianna, _]] =
            await generateInfoCandidates(
                ['Brianna is the Recluse', 'Marianna is the Imp'],
                [investigatorPlayer],
                infoProvider,
                async (gameInfo, [Brianna, _Marianna, _]) => {
                    const influence = new RecluseInfluence(Brianna);

                    return await influence.apply(gameInfo, mock<Context>());
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

    beforeEach(async () => {
        chefPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Chef`
        );
        infoProvider = new ChefInfoProvider(chefPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
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

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<ChefInfo>) {
            expect(candidate.numPairEvilPlayers).toBe(3);
        }
    });
});

describe('True Empath info', () => {
    let empathPlayer: Player;
    let infoProvider: EmpathInfoProvider;

    beforeEach(async () => {
        empathPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Empath`
        );
        infoProvider = new EmpathInfoProvider(empathPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `empath["gameplay"][0]`}
     */
    test("The Empath neighbours two good players—a Soldier and a Monk . The Empath learns a '0'.", async () => {
        const monk = await playerFromDescription(
            `${faker.name.firstName()} is the Monk`
        );

        const [candidates, _] = await generateInfoCandidates(
            [`${faker.name.firstName()} is the Soldier`],
            [empathPlayer, monk],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<EmpathInfo>) {
            expect(candidate.numEvilAliveNeighbors).toEqual(0);
        }
    });

    /**
     * {@link `empath["gameplay"][1]`}
     */
    test("The next day, the Soldier is executed. That night, the Monk is killed by the Imp. The Empath now detects the players sitting next to the Soldier and the Monk, which are a Librarian and an evil Gunslinger. The Empath now learns a '1'.", async () => {
        const gunslinger = await playerFromDescription(
            `${faker.name.firstName()} is the evil Gunslinger`
        );
        const soldier = await playerFromDescription(
            `${faker.name.firstName()} is the Soldier`
        );
        await setPlayerDead(soldier);
        const monk = await playerFromDescription(
            `${faker.name.firstName()} is the Monk`
        );
        await setPlayerDead(monk);

        const [candidates, _] = await generateInfoCandidates(
            [`${faker.name.firstName()} is the Librarian`],
            [soldier, empathPlayer, monk, gunslinger],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<EmpathInfo>) {
            expect(candidate.numEvilAliveNeighbors).toEqual(1);
        }
    });

    /**
     * {@link `empath["gameplay"][2]`}
     */
    test("There are only three players left alive: the Empath, the Imp, and the Baron. No matter who is seated where, the Empath learns a '2'.", async () => {
        const gunslinger = await playerFromDescription(
            `${faker.name.firstName()} is the evil Gunslinger`
        );
        await setPlayerDead(gunslinger);
        const soldier = await playerFromDescription(
            `${faker.name.firstName()} is the Soldier`
        );
        await setPlayerDead(soldier);
        const monk = await playerFromDescription(
            `${faker.name.firstName()} is the Monk`
        );
        await setPlayerDead(monk);
        const librarian = await playerFromDescription(
            `${faker.name.firstName()} is the Librarian`
        );
        await setPlayerDead(librarian);
        const baron = await playerFromDescription(
            `${faker.name.firstName()} is the Baron`
        );

        const [candidates, _] = await generateInfoCandidates(
            [`${faker.name.firstName()} is the Imp`],
            [librarian, soldier, empathPlayer, monk, gunslinger, baron],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<EmpathInfo>) {
            expect(candidate.numEvilAliveNeighbors).toEqual(2);
        }
    });
});

describe('True FortuneTeller info', () => {
    let FortuneTellerPlayer: Player;
    let infoProvider: FortuneTellerInfoProvider;

    beforeEach(async () => {
        FortuneTellerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the FortuneTeller`
        );
    });

    beforeEach(() => {
        infoProvider = new FortuneTellerInfoProvider(FortuneTellerPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `fortuneteller["gameplay"][0]`}
     */
    test("The Fortune Teller chooses the Monk and the Undertaker, and learns a 'no'.", async () => {
        const monk = await playerFromDescription(
            `${faker.name.firstName()} is the Monk`
        );
        const undertaker = await playerFromDescription(
            `${faker.name.firstName()} is the Undertaker`
        );

        infoProvider.chosen = [monk, undertaker];

        const [candidates, _] = await generateInfoCandidates(
            [],
            [monk, undertaker, FortuneTellerPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<FortuneTellerInfo>) {
            expect(candidate.hasDemon).toBeFalse();
        }
    });

    /**
     * {@link `fortuneteller["gameplay"][1]`}
     */
    test("The Fortune Teller chooses the Imp and the Empath, and learns a 'yes'.", async () => {
        const imp = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const empath = await playerFromDescription(
            `${faker.name.firstName()} is the Empath`
        );

        infoProvider.chosen = [imp, empath];

        const [candidates, _] = await generateInfoCandidates(
            [],
            [imp, empath, FortuneTellerPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<FortuneTellerInfo>) {
            expect(candidate.hasDemon).toBeTrue();
        }
    });

    /**
     * {@link `fortuneteller["gameplay"][2]`}
     */
    test("The Fortune Teller chooses an alive Butler and a dead Imp, and learns a 'yes'.", async () => {
        const imp = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        await setPlayerDead(imp);

        const butler = await playerFromDescription(
            `${faker.name.firstName()} is the Butler`
        );

        infoProvider.chosen = [imp, butler];

        const [candidates, _] = await generateInfoCandidates(
            [],
            [butler, imp, FortuneTellerPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<FortuneTellerInfo>) {
            expect(candidate.hasDemon).toBeTrue();
        }
    });

    /**
     * {@link `fortuneteller["gameplay"][3]`}
     */
    test("The Fortune Teller chooses themselves and a Saint. The Saint is the Red Herring. The Fortune Teller learns a 'yes'.", async () => {
        const saint = await playerFromDescription(
            `${faker.name.firstName()} is the Saint`
        );
        await setPlayerDead(saint);

        infoProvider.chosen = [saint, FortuneTellerPlayer];

        const [candidates, _] = await generateInfoCandidates(
            [],
            [saint, FortuneTellerPlayer],
            infoProvider,
            async (gameInfo, _) => {
                const influence = new FortuneTellerRedHerringInfluence(
                    FortuneTellerPlayer,
                    saint
                );

                return await influence.apply(gameInfo, mock<Context>());
            }
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<FortuneTellerInfo>) {
            expect(candidate.hasDemon).toBeTrue();
        }
    });
});

describe('True Undertaker info', () => {
    let UndertakerPlayer: Player;
    let infoProvider: UndertakerInfoProvider;

    beforeEach(async () => {
        UndertakerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Undertaker`
        );
    });

    beforeEach(() => {
        infoProvider = new UndertakerInfoProvider(UndertakerPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `undertaker["gameplay"][0]`}
     */
    test('The Mayor is executed today. That night, the Undertaker is shown the Mayor token.', async () => {
        const mayorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Mayor`
        );

        const mockExecution = mock<Execution>();
        (mockExecution as any).toExecute = mayorPlayer;

        const [candidates, _] = await generateInfoCandidates(
            [],
            [mayorPlayer, UndertakerPlayer],
            infoProvider,
            async (gameInfo, _) => {
                gameInfo.execution = mockExecution;
                return await gameInfo;
            }
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<UndertakerInfo>) {
            expect(candidate.character).toEqual(Mayor);
        }
    });

    /**
     * {@link `undertaker["gameplay"][1]`}
     */
    test("The Drunk, who thinks they are the Virgin, is executed today. At night, the Undertaker is shown the Drunk token, because the Undertaker learns a player's true character, as opposed to the one they believe they are.", async () => {
        const drunkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Drunk`
        );

        const mockExecution = mock<Execution>();
        (mockExecution as any).toExecute = drunkPlayer;

        const [candidates, _] = await generateInfoCandidates(
            [],
            [drunkPlayer, UndertakerPlayer],
            infoProvider,
            async (gameInfo, _) => {
                gameInfo.execution = mockExecution;
                return await gameInfo;
            }
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<UndertakerInfo>) {
            expect(candidate.character).toEqual(Drunk);
        }
    });

    /**
     * {@link `undertaker["gameplay"][2]`}
     */
    test('The Spy is executed. Two Travellers are exiled. That night, the Undertaker is shown the Butler token, because the Spy is registering as the Butler, and because the exiles are not executions.', async () => {
        const gameUIStorytellerChooseMock = mockStorytellerChoose(Butler);

        const spyPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Spy`
        );

        const mockExecution = mock<Execution>();
        (mockExecution as any).toExecute = spyPlayer;

        const [candidates, _] = await generateInfoCandidates(
            [],
            [spyPlayer, UndertakerPlayer],
            infoProvider,
            async (gameInfo, _) => {
                gameInfo.execution = mockExecution;

                const influence = new SpyInfluence(spyPlayer);

                return await influence.apply(gameInfo, mock<Context>());
            }
        );

        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<UndertakerInfo>) {
            expect(candidate.character).toEqual(Butler);
        }
    });

    /**
     * {@link `undertaker["gameplay"][3]`}
     */
    test('Nobody was executed today. That night, the Undertaker does not wake.', async () => {
        const [candidates, _] = await generateInfoCandidates(
            [],
            [UndertakerPlayer],
            infoProvider
        );

        expect(candidates).toHaveLength(0);
    });
});

describe('True Monk info', () => {
    let monkPlayer: Player;

    beforeEach(async () => {
        monkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Monk`
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `monk["gameplay"][0]`}
     */
    test('The Monk protects the Fortune Teller. The Imp attacks the Fortune Teller. No deaths occur tonight.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const fortuneTellerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Fortune Teller`
        );

        let gameInfo = createMockGameInfo(
            [monkPlayer, impPlayer, fortuneTellerPlayer],
            undefined,
            createNonfirstNightGamePhase()
        );

        const gameUIChooseMock = mockChoosePlayer(fortuneTellerPlayer);

        gameInfo = await monkPlayer.characterActs!.apply(
            gameInfo,
            mock<Context>()
        )!;

        await impPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(gameUIChooseMock).toHaveBeenCalled();

        expect(fortuneTellerPlayer.alive).toBeTrue();
    });

    /**
     * {@link `monk["gameplay"][1]`}
     */
    test(`The Monk protects the Mayor, and the Imp attacks the Mayor. The Mayor's "another player dies" ability does not trigger, because the Mayor is safe from the Imp. Nobody dies tonight.`, async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const mayorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Mayor`
        );

        let gameInfo = createMockGameInfo(
            [monkPlayer, impPlayer, mayorPlayer],
            undefined,
            createNonfirstNightGamePhase()
        );

        const gameUIChooseMock = mockChoosePlayer(mayorPlayer);

        gameInfo = await monkPlayer.characterActs!.apply(
            gameInfo,
            mock<Context>()
        )!;

        // TODO apply mayor's ability
        // gameInfo = await mayorPlayer.characterAbility!.apply(
        //     gameInfo,
        //     mock<Context>()
        // )!;

        await impPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(gameUIChooseMock).toHaveBeenCalled();

        expect(mayorPlayer.alive).toBeTrue();
        expect(impPlayer.alive).toBeTrue();
        expect(monkPlayer.alive).toBeTrue();
    });

    /**
     * {@link `monk["gameplay"][2]`}
     */
    test('The Monk protects the Imp . The Imp chooses to kill themself tonight, but nothing happens. The Imp stays alive and a new Imp is not created.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        let gameInfo = createMockGameInfo(
            [monkPlayer, impPlayer],
            undefined,
            createNonfirstNightGamePhase()
        );

        const gameUIChooseMock = mockChoosePlayer(impPlayer);

        gameInfo = await monkPlayer.characterActs!.apply(
            gameInfo,
            mock<Context>()
        )!;

        await impPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(gameUIChooseMock).toHaveBeenCalled();
        expect(impPlayer.alive).toBeTrue();
    });
});

describe('True Ravenkeeper info', () => {
    let RavenkeeperPlayer: Player;
    let infoProvider: RavenkeeperInfoProvider;

    beforeEach(async () => {
        RavenkeeperPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Ravenkeeper`
        );
    });

    beforeEach(() => {
        infoProvider = new RavenkeeperInfoProvider(RavenkeeperPlayer, true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `ravenkeeper["gameplay"][0]`}
     */
    test('The Ravenkeeper is killed by the Imp, and then wakes to choose a player. After some deliberation, they choose Benjamin. Benjamin is the Empath, and the Ravenkeeper learns this.', async () => {
        const benjamin = await playerFromDescription(
            `${faker.name.firstName()} is the Empath`
        );
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        const [candidates, _] = await generateInfoCandidates(
            [],
            [benjamin, impPlayer, RavenkeeperPlayer],
            infoProvider,
            async (gameInfo, _) => {
                const gameUIChooseMock = mockChoosePlayer(RavenkeeperPlayer);

                await impPlayer.characterActs!.apply(
                    gameInfo,
                    mock<Context>()
                )!;

                expect(gameUIChooseMock).toHaveBeenCalled();

                infoProvider.choosePlayer(benjamin);

                return gameInfo;
            }
        );

        expect(candidates).toHaveLength(1);
        for (const candidate of candidates as Array<RavenkeeperInfo>) {
            expect(candidate.player.equals(benjamin)).toBeTrue();
            expect(candidate.character).toEqual(Empath);
        }
    });

    /**
     * {@link `ravenkeeper["gameplay"][1]`}
     */
    test("The Imp attacks the Mayor. The Mayor doesn't die, but the Ravenkeeper dies instead, due to the Mayor's ability. The Ravenkeeper is woken and chooses Douglas, who is a dead Recluse. The Ravenkeeper learns that Douglas is the Scarlet Woman, since the Recluse registered as a Minion.", async () => {
        // TODO
    });
});

describe('True Slayer info', () => {
    let SlayerPlayer: Player;

    beforeEach(async () => {
        SlayerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Slayer`
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `slayer["gameplay"][0]`}
     */
    test('The Slayer chooses the Imp. The Imp dies, and good wins!', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        const gameInfo = createMockGameInfo(
            [impPlayer, SlayerPlayer],
            undefined,
            createDayGamePhase()
        );

        const gameUIChooseMock = mockChoosePlayer(impPlayer);

        await SlayerPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(gameUIChooseMock).toHaveBeenCalled();

        expect(impPlayer.dead).toBeTrue();
    });

    /**
     * {@link `slayer["gameplay"][1]`}
     */
    test('The Slayer chooses the Recluse. The Storyteller decides that the Recluse registers as the Imp, so the Recluse dies, but the game continues.', async () => {
        const reclusePlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Recluse`
        );

        const gameUIStorytellerChooseMock = mockStorytellerChoose(Imp);
        const gameUIChooseMock = mockChoosePlayer(reclusePlayer);

        let gameInfo = createMockGameInfo(
            [reclusePlayer, SlayerPlayer],
            undefined,
            createDayGamePhase()
        );

        const influence = new RecluseInfluence(reclusePlayer);

        gameInfo = await influence.apply(gameInfo, mock<Context>());

        await SlayerPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(reclusePlayer.dead).toBeTrue();

        expect(gameUIStorytellerChooseMock).toHaveBeenCalled();
        expect(gameUIChooseMock).toHaveBeenCalled();
    });

    /**
     * {@link `slayer["gameplay"][2]`}
     */
    test('The Imp is bluffing as the Slayer. They declare that they use their Slayer ability on the Scarlet Woman. Nothing happens.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const scarletWomanPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Scarlet Woman`
        );

        const gameInfo = createMockGameInfo(
            [impPlayer, scarletWomanPlayer],
            undefined,
            createDayGamePhase()
        );

        if (SlayerAct === CharacterAct.from(impPlayer.character)[0]) {
            const gameUIChooseMock = mockChoosePlayer(scarletWomanPlayer);

            await impPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

            expect(gameUIChooseMock).toHaveBeenCalledTimes(0);
        }

        expect(scarletWomanPlayer.alive).toBeTrue();
    });
});

describe('True Soldier info', () => {
    let SoldierPlayer: Player;

    beforeEach(async () => {
        SoldierPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Soldier`
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * {@link `soldier["gameplay"][0]`}
     */
    test('The Imp attacks the Soldier. The Soldier does not die, so nobody dies that night.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        let gameInfo = createMockGameInfo(
            [impPlayer, SoldierPlayer],
            undefined,
            createNonfirstNightGamePhase()
        );

        const gameUIChooseMock = mockChoosePlayer(SoldierPlayer);

        const influence = new SoldierInfluence(SoldierPlayer);

        gameInfo = await influence.apply(gameInfo, mock<Context>());

        await impPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(gameUIChooseMock).toHaveBeenCalled();

        expect(SoldierPlayer.alive).toBeTrue();
    });

    /**
     * {@link `soldier["gameplay"][1]`}
     */
    test('The Poisoner poisons the Soldier, then the Imp attacks the Soldier. The Soldier dies, since they have no ability.', async () => {
        // TODO
    });

    /**
     * {@link `soldier["gameplay"][2]`}
     */
    test('The Imp attacks the Soldier. The Soldier dies, because they are actually the Drunk.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );

        const drunkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Drunk`
        );

        const gameInfo = createMockGameInfo(
            [impPlayer, drunkPlayer],
            undefined,
            createNonfirstNightGamePhase()
        );

        const gameUIChooseMock = mockChoosePlayer(drunkPlayer);

        await impPlayer.characterActs!.apply(gameInfo, mock<Context>())!;

        expect(gameUIChooseMock).toHaveBeenCalled();

        expect(drunkPlayer.alive).toBeFalse();
    });
});
