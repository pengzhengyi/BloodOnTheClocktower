/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from '@faker-js/faker';
import { mock } from 'jest-mock-extended';
import { playerFromDescription } from './utils';
import { Player } from '~/game/player';
import { GameInfo } from '~/game/gameinfo';
import { CharacterSheet } from '~/game/charactersheet';
import type { Context } from '~/game/infoprocessor';
import { RecluseInfluence, SoldierInfluence } from '~/game/influence';
import { GAME_UI } from '~/interaction/gameui';
import { GamePhase } from '~/game/gamephase';
import { Imp } from '~/content/characters/output/imp';
import { Generator } from '~/game/collections';
import { CharacterAct, SlayerAct } from '~/game/characteract';
import { Game } from '~/game/game';

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

beforeAll(() => {
    jest.spyOn(GAME_UI, 'storytellerConfirm').mockImplementation(
        async () => await true
    );
});

afterAll(() => {
    jest.restoreAllMocks();
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
