import { faker } from '@faker-js/faker';
import { playerFromDescription } from './utils';
import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { createBasicPlayer } from '~/__mocks__/player';
import { mockInfoProvideContext } from '~/__mocks__/information';
import { Minion, Outsider, Townsfolk } from '~/game/character-type';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Chef } from '~/content/characters/output/chef';
import { Players } from '~/game/players';
import type { AsyncPredicate } from '~/game/types';
import { DeadReason } from '~/game/dead-reason';
import type { IPlayer } from '~/game/player';
import { Seating } from '~/game/seating';
import { Virgin } from '~/content/characters/output/virgin';
import { Librarian } from '~/content/characters/output/librarian';
import { Saint } from '~/content/characters/output/saint';
import { Drunk } from '~/content/characters/output/drunk';
import { Investigator } from '~/content/characters/output/investigator';
import { Baron } from '~/content/characters/output/baron';
import { Empath } from '~/content/characters/output/empath';
import { Imp } from '~/content/characters/output/imp';
import { Monk } from '~/content/characters/output/monk';
import { Soldier } from '~/content/characters/output/soldier';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Mayor } from '~/content/characters/output/mayor';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Poisoner } from '~/content/characters/output/poisoner';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import type {
    TrueInformation,
    OneOfTwoPlayersIsOutsider,
} from '~/game/info/information';
import { ChefInformationProvider } from '~/game/info/provider/chef';
import {
    DemonInformationProvider,
    DemonInformation,
} from '~/game/info/provider/demon';
import { EmpathInformationProvider } from '~/game/info/provider/empath';
import {
    FortuneTellerInformationProviderContext,
    FortuneTellerInformationProvider,
} from '~/game/info/provider/fortuneteller';
import { InvestigatorInformationProvider } from '~/game/info/provider/investigator';
import {
    LibrarianInformationProvider,
    LibrarianNoOutsiderInformation,
} from '~/game/info/provider/librarian';
import { MinionInformationProvider } from '~/game/info/provider/minion';
import {
    RavenkeeperInformationProviderContext,
    RavenkeeperInformationProvider,
} from '~/game/info/provider/ravenkeeper';
import { TravellerInformationProvider } from '~/game/info/provider/traveller';
import {
    UndertakerInformationProviderContext,
    UndertakerInformationProvider,
} from '~/game/info/provider/undertaker';
import { WasherwomanInformationProvider } from '~/game/info/provider/washerwoman';

async function createSeatingAndPlayersFromDescriptions(
    ...playerDescriptions: Array<string>
): Promise<[Seating, Array<IPlayer>]> {
    const players = await Promise.all(
        playerDescriptions.map((description) =>
            playerFromDescription(description)
        )
    );
    const seating = await Seating.from(players);
    expect(seating.allSat).toBeTrue();
    return [seating, players];
}

export function createInfoProvideContext(
    player: IPlayer,
    otherPlayers: IPlayer[]
) {
    const context = mockInfoProvideContext();
    context.requestedPlayer = player;
    context.players = Players.of(player, ...otherPlayers);
    return context;
}

export async function createInfoProvideContextFromPlayerDescriptions(
    isRequestedPlayer: AsyncPredicate<IPlayer>,
    ...playerDescriptions: Array<string>
) {
    const [seating, players] = await createSeatingAndPlayersFromDescriptions(
        ...playerDescriptions
    );

    let requestedPlayer: IPlayer;
    const otherPlayers: Array<IPlayer> = [];

    for (const player of players) {
        if (await isRequestedPlayer(player)) {
            requestedPlayer = player;
        } else {
            otherPlayers.push(player);
        }
    }

    const context = createInfoProvideContext(requestedPlayer!, otherPlayers);
    context.seating = seating;
    return context;
}

function createFortuneTellerInfoProviderContext(
    fortuneTellerPlayer: IPlayer,
    chosenPlayers: [IPlayer, IPlayer],
    otherPlayers: Array<IPlayer>
): FortuneTellerInformationProviderContext {
    const context = createInfoProvideContext(fortuneTellerPlayer, [
        ...chosenPlayers,
        ...otherPlayers,
    ]);
    (context as FortuneTellerInformationProviderContext).chosenPlayers =
        chosenPlayers;
    return context as FortuneTellerInformationProviderContext;
}

export function createUndertakerInfoProviderContext(
    undertakerPlayer: IPlayer,
    executedPlayer: IPlayer,
    otherPlayers: Array<IPlayer>
): UndertakerInformationProviderContext {
    const context = createInfoProvideContext(undertakerPlayer, [
        executedPlayer,
        ...otherPlayers,
    ]);
    (context as UndertakerInformationProviderContext).executedPlayer =
        executedPlayer;
    return context as UndertakerInformationProviderContext;
}

function createRavenkeeperInfoProviderContext(
    ravenkeeperPlayer: IPlayer,
    chosenPlayer: IPlayer,
    otherPlayers: Array<IPlayer>
): RavenkeeperInformationProviderContext {
    const context = createInfoProvideContext(ravenkeeperPlayer, [
        chosenPlayer,
        ...otherPlayers,
    ]);
    (context as RavenkeeperInformationProviderContext).chosenPlayer =
        chosenPlayer;
    return context as RavenkeeperInformationProviderContext;
}

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(() => Promise.resolve(true));
});

afterAll(() => {
    storytellerConfirmMock.mockReset();
});

describe('test DemonInformationProvider and MinionInformationProvider', () => {
    const demonInformationProvider = new DemonInformationProvider();
    const minionInformationProvider = new MinionInformationProvider();

    test('get correct minion and demon information', async () => {
        const playerDescriptions = [
            `${faker.name.firstName()} is the Ravenkeeper`,
            `${faker.name.firstName()} is the Imp`,
            `${faker.name.firstName()} is the Poisoner`,
            `${faker.name.firstName()} is the Butler`,
            `${faker.name.firstName()} is the Librarian`,
            `${faker.name.firstName()} is the Monk`,
            `${faker.name.firstName()} is the Empath`,
            `${faker.name.firstName()} is the Recluse`,
            `${faker.name.firstName()} is the Investigator`,
        ];
        const demonContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Imp,
                ...playerDescriptions
            );
        demonContext.characterSheet = TroubleBrewing.characterSheet;

        const minionContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === Poisoner,
                ...playerDescriptions
            );
        minionContext.characterSheet = TroubleBrewing.characterSheet;

        const demonTrueInfoOptions = (
            await demonInformationProvider.getTrueInformationOptions(
                demonContext
            )
        ).take(3) as TrueInformation<DemonInformation>[];
        expect(demonTrueInfoOptions).toHaveLength(3);

        for (const option of demonTrueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(
                option.info.minions.map((player) =>
                    player.storytellerGet('_character')
                )
            ).toIncludeSameMembers([Poisoner]);
            expect(option.info.notInPlayGoodCharacters).toHaveLength(3);
            expect(option.info.notInPlayGoodCharacters).not.toIncludeAnyMembers(
                [Librarian, Monk, Empath, Investigator, Ravenkeeper]
            );
            expect(
                await demonInformationProvider.evaluateGoodness(
                    option.info,
                    demonContext
                )
            ).toEqual(5 + 3 * 3);
        }

        const minionTrueInfoOptions = Array.from(
            await minionInformationProvider.getTrueInformationOptions(
                minionContext
            )
        );
        expect(minionTrueInfoOptions).toHaveLength(1);

        for (const option of minionTrueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.otherMinions).toHaveLength(0);
            expect(await option.info.demon.character).toBe(Imp);
            expect(
                await minionInformationProvider.evaluateGoodness(
                    option.info,
                    minionContext
                )
            ).toEqual(0 + 5);
        }
    });
});

describe('test WasherwomanInformationProvider', () => {
    const provider = new WasherwomanInformationProvider();
    let washerwomanPlayer: IPlayer;

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
    let librarianPlayer: IPlayer;

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

describe('test InvestigatorInformationProvider', () => {
    const provider = new InvestigatorInformationProvider();
    let investigatorPlayer: IPlayer;

    beforeAll(async () => {
        investigatorPlayer = await createBasicPlayer(undefined, Investigator);
    });

    /**
     * {@link `investigator["gameplay"][0]`}
     */
    test('Amy is the Baron, and Julian is the Mayor. The Investigator learns that either Amy or Julian is the Baron.', async () => {
        const Julian = await playerFromDescription('Julian is the Mayor');
        const Amy = await playerFromDescription('Amy is the Baron');

        const context = createInfoProvideContext(investigatorPlayer, [
            Julian,
            Amy,
        ]);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.characterType).toBe(Minion);
            expect(option.info.players).toIncludeSameMembers([Julian, Amy]);
            expect(option.info.character).toBe(Baron);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `investigator["gameplay"][1]`}
     */
    test('Angelus is the Spy, and Lewis is the Poisoner. The Investigator learns that either Angelus or Lewis is the Spy.', async () => {
        // TODO
    });

    /**
     * {@link `investigator["gameplay"][2]`}
     */
    test('Brianna is the Recluse, and Marianna is the Imp. The Investigator learns that either Brianna or Marianna is the Poisoner. (This happens because the Recluse is registering as a Minion—in this case, the Poisoner.)', async () => {
        // TODO
    });
});

describe('test ChefInformationProvider', () => {
    const provider = new ChefInformationProvider();

    /**
     * {@link `chef["gameplay"][0]`}
     */
    test("No evil players are sitting next to each other. The Chef learns a '0'.", async () => {
        const context = await createInfoProvideContextFromPlayerDescriptions(
            async (player) => (await player.character) === Chef,
            `${faker.name.firstName()} is the Chef`,
            `${faker.name.firstName()} is the Imp`,
            `${faker.name.firstName()} is the Empath`,
            `${faker.name.firstName()} is the Undertaker`
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.numPairEvilPlayers).toBe(0);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `chef["gameplay"][1]`}
     */
    test("The Imp is sitting next to the Baron. Across the circle, the Poisoner is sitting next to the Scarlet Woman. The Chef learns a '2'.", async () => {
        const context = await createInfoProvideContextFromPlayerDescriptions(
            async (player) => (await player.character) === Chef,
            `${faker.name.firstName()} is the Chef`,
            `${faker.name.firstName()} is the Imp`,
            `${faker.name.firstName()} is the Baron`,
            `${faker.name.firstName()} is the Empath`,
            `${faker.name.firstName()} is the Poisoner`,
            `${faker.name.firstName()} is the Scarlet Woman`
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.numPairEvilPlayers).toBe(2);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `chef["gameplay"][2]`}
     */
    test("An evil Scapegoat is sitting between the Imp and a Minion. Across the circle, two other Minions are sitting next to each other. The Chef learns a '3'.", async () => {
        const context = await createInfoProvideContextFromPlayerDescriptions(
            async (player) => (await player.character) === Chef,
            `${faker.name.firstName()} is the Chef`,
            `${faker.name.firstName()} is the Imp`,
            `${faker.name.firstName()} is the evil Scapegoat`,
            `${faker.name.firstName()} is the Baron`,
            `${faker.name.firstName()} is the Undertaker`,
            `${faker.name.firstName()} is the Poisoner`,
            `${faker.name.firstName()} is the Scarlet Woman`
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.numPairEvilPlayers).toBe(3);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });
});

describe('test EmpathInformationProvider', () => {
    const provider = new EmpathInformationProvider();

    /**
     * {@link `empath["gameplay"][0]`}
     */
    test("The Empath neighbours two good players—a Soldier and a Monk . The Empath learns a '0'.", async () => {
        const context = await createInfoProvideContextFromPlayerDescriptions(
            async (player) => (await player.character) === Empath,
            `${faker.name.firstName()} is the Librarian`,
            `${faker.name.firstName()} is the Soldier`,
            `${faker.name.firstName()} is the Empath`,
            `${faker.name.firstName()} is the Monk`
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.numEvilAliveNeighbors).toBe(0);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `empath["gameplay"][1]`}
     */
    test("The next day, the Soldier is executed. That night, the Monk is killed by the Imp. The Empath now detects the players sitting next to the Soldier and the Monk, which are a Librarian and an evil Gunslinger. The Empath now learns a '1'.", async () => {
        const context = await createInfoProvideContextFromPlayerDescriptions(
            async (player) => (await player.character) === Empath,
            `${faker.name.firstName()} is the Librarian`,
            `${faker.name.firstName()} is the Soldier`,
            `${faker.name.firstName()} is the Empath`,
            `${faker.name.firstName()} is the Monk`,
            `${faker.name.firstName()} is the evil Gunslinger`,
            `${faker.name.firstName()} is the Imp`
        );

        const characterToDeadReason = new Map([
            [Soldier, DeadReason.Executed],
            [Monk, DeadReason.DemonAttack],
        ]);
        for (const playerShouldBeDead of await context.players
            .clone()
            .filterAllAsync(async (player) =>
                characterToDeadReason.has(await player.character)
            )) {
            await playerShouldBeDead.setDead(
                characterToDeadReason.get(await playerShouldBeDead.character)
            );
        }

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.numEvilAliveNeighbors).toBe(1);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `empath["gameplay"][2]`}
     */
    test("There are only three players left alive: the Empath, the Imp, and the Baron. No matter who is seated where, the Empath learns a '2'.", async () => {
        const context = await createInfoProvideContextFromPlayerDescriptions(
            async (player) => (await player.character) === Empath,
            `${faker.name.firstName()} is the evil Gunslinger`,
            `${faker.name.firstName()} is the Imp`,
            `${faker.name.firstName()} is the Monk`,
            `${faker.name.firstName()} is the Baron`,
            `${faker.name.firstName()} is the Librarian`,
            `${faker.name.firstName()} is the Poisoner`,
            `${faker.name.firstName()} is the Empath`
        );

        const aliveCharacters = new Set([Empath, Imp, Baron]);
        for (const playerShouldBeDead of await context.players
            .clone()
            .filterAllAsync(
                async (player) => !aliveCharacters.has(await player.character)
            )) {
            await playerShouldBeDead.setDead();
        }

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.numEvilAliveNeighbors).toBe(2);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });
});

describe('test FortuneTellerInformationProvider', () => {
    const provider = new FortuneTellerInformationProvider();
    let fortuneTellerPlayer: IPlayer;

    beforeAll(async () => {
        fortuneTellerPlayer = await createBasicPlayer(undefined, FortuneTeller);
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

        const context = createFortuneTellerInfoProviderContext(
            fortuneTellerPlayer,
            [monk, undertaker],
            []
        );
        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.hasDemon).toBeFalse();
            expect(option.info.chosenPlayers).toIncludeSameMembers([
                monk,
                undertaker,
            ]);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
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

        const context = createFortuneTellerInfoProviderContext(
            fortuneTellerPlayer,
            [imp, empath],
            []
        );
        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.hasDemon).toBeTrue();
            expect(option.info.chosenPlayers).toIncludeSameMembers([
                imp,
                empath,
            ]);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `fortuneteller["gameplay"][2]`}
     */
    test("The Fortune Teller chooses an alive Butler and a dead Imp, and learns a 'yes'.", async () => {
        const butler = await playerFromDescription(
            `${faker.name.firstName()} is the Butler`
        );
        const imp = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        await imp.setDead();

        const context = createFortuneTellerInfoProviderContext(
            fortuneTellerPlayer,
            [butler, imp],
            []
        );
        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.hasDemon).toBeTrue();
            expect(option.info.chosenPlayers).toIncludeSameMembers([
                imp,
                butler,
            ]);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });
});

describe('test UndertakerInformationProvider', () => {
    const provider = new UndertakerInformationProvider();
    let undertakerPlayer: IPlayer;

    beforeAll(async () => {
        undertakerPlayer = await createBasicPlayer(undefined, Undertaker);
    });

    /**
     * {@link `undertaker["gameplay"][0]`}
     */
    test('The Mayor is executed today. That night, the Undertaker is shown the Mayor token.', async () => {
        const mayorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Mayor`
        );

        const context = createUndertakerInfoProviderContext(
            undertakerPlayer,
            mayorPlayer,
            []
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.character).toBe(Mayor);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `undertaker["gameplay"][1]`}
     */
    test("The Drunk, who thinks they are the Virgin, is executed today. At night, the Undertaker is shown the Drunk token, because the Undertaker learns a player's true character, as opposed to the one they believe they are.", async () => {
        const drunkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Drunk`
        );

        const context = createUndertakerInfoProviderContext(
            undertakerPlayer,
            drunkPlayer,
            []
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.character).toBe(Drunk);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });

    /**
     * {@link `undertaker["gameplay"][2]`}
     */
    test('The Spy is executed. Two Travellers are exiled. That night, the Undertaker is shown the Butler token, because the Spy is registering as the Butler, and because the exiles are not executions.', async () => {
        // TODO
    });
});

describe('test RavenkeeperInformationProvider', () => {
    const provider = new RavenkeeperInformationProvider();
    let ravenkeeperPlayer: IPlayer;

    beforeAll(async () => {
        ravenkeeperPlayer = await createBasicPlayer(undefined, Ravenkeeper);
    });

    /**
     * {@link `ravenkeeper["gameplay"][0]`}
     */
    test('The Ravenkeeper is killed by the Imp, and then wakes to choose a player. After some deliberation, they choose Benjamin. Benjamin is the Empath, and the Ravenkeeper learns this.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const Benjamin = await playerFromDescription('Benjamin is the Empath');

        const context = createRavenkeeperInfoProviderContext(
            ravenkeeperPlayer,
            Benjamin,
            [impPlayer]
        );

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(option.info.character).toBe(Empath);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });
});

describe('True TravellerInformationProvider info', () => {
    const provider = new TravellerInformationProvider();
    let travellerPlayer: IPlayer;

    beforeAll(async () => {
        travellerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the evil Gunslinger`
        );
    });

    /**
     * {@link `traveller["gameplay"][0]`}
     */
    test('If travellers are evil, they learn who the Demon is; they do not learn any additional evil characters or receive any bluffs.', async () => {
        const impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        const Benjamin = await playerFromDescription('Benjamin is the Empath');

        const context = createInfoProvideContext(travellerPlayer, [
            impPlayer,
            Benjamin,
        ]);

        const trueInfoOptions = Array.from(
            await provider.getTrueInformationOptions(context)
        );
        expect(trueInfoOptions).toHaveLength(1);

        for (const option of trueInfoOptions) {
            expect(option.isTrueInfo).toBeTrue();
            expect(await option.info.demon).toBe(impPlayer);
            expect(
                await provider.evaluateGoodness(option.info, context)
            ).toEqual(1);
        }
    });
});
