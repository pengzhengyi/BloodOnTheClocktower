import type { EditionName } from './edition';
import { type Edition } from './edition';
import { Grimoire } from './grimoire';
import { type IPlayers, Players } from './players';
import type { NumberOfCharacters } from './script-tool';
import { Seating } from './seating/seating';
import { TownSquare, type ITownSquare } from './town-square';
import { Clocktower } from './clocktower';
import type { IPlayer } from './player';
import {
    type ISeatAssignment,
    SeatAssignment,
} from './seating/seat-assignment';
import { SeatAssignmentFromMode } from './seating/seat-assignment-factory';
import {
    isSeatAssignmentMode,
    SeatAssignmentMode,
} from './seating/seat-assignment-mode';
import { GameEnvironment } from './environment';
import { Singleton } from './common';
import type { IStoryTeller } from './storyteller';
import { StoryTeller } from './storyteller';
import { InteractionEnvironment } from '~/interaction/environment';

export interface ISetupContext {
    initialPlayers?: Array<IPlayer>;
    seatAssignment?: ISeatAssignment | SeatAssignmentMode;
}

export interface ISetupResult {
    players: IPlayers;
    townSquare: ITownSquare;
    storyTeller: IStoryTeller;
    edition: typeof Edition;
    characterTypeComposition: NumberOfCharacters;
}

/**
 * {@link `glossary["Setup sheet"]`}
 * The sheet that details what the Storyteller needs to do before beginning a game.
 */
export interface ISetupSheet {
    setupPlayers(initialPlayers?: Array<IPlayer>): Promise<IPlayers>;

    setupTownSquare(
        initialPlayers?: Array<IPlayer>,
        seatAssignment?: ISeatAssignment | SeatAssignmentMode
    ): Promise<ITownSquare>;

    setupStoryTeller(players: IPlayers): Promise<IStoryTeller>;

    setupEdition(): Promise<typeof Edition>;

    recommendCharacterTypeComposition(
        numPlayers: number,
        editionName: EditionName
    ): Promise<NumberOfCharacters>;

    setup(context: ISetupContext): Promise<ISetupResult>;
}

// eslint-disable-next-line unused-imports/no-unused-vars
interface AbstractSetupSheet extends ISetupSheet {}
/**
 * `AbstractSetupSheet` provides a default template for `setup` using other `setup*` methods implemented by subclasses.
 */
abstract class AbstractSetupSheet implements ISetupSheet {
    async setup(context: ISetupContext): Promise<ISetupResult> {
        const [players, townSquare, edition] = await Promise.all([
            this.setupPlayers(context.initialPlayers),
            this.setupTownSquare(
                context.initialPlayers,
                context.seatAssignment
            ),
            this.setupEdition(),
        ]);

        const [storyTeller, characterTypeComposition] = await Promise.all([
            this.setupStoryTeller(players),
            this.recommendCharacterTypeComposition(
                players.length,
                edition.name as EditionName
            ),
        ]);

        const setupResult: ISetupResult = {
            players,
            townSquare,
            edition,
            storyTeller,
            characterTypeComposition,
        };

        return setupResult;
    }
}

class BaseSetupSheet extends AbstractSetupSheet implements ISetupSheet {
    static readonly MAXIMUM_NUMBER_OF_PLAYERS_BEFORE_NECESSARY_TRAVELLER = 15;

    static readonly RECOMMENDED_ASSIGNMENTS = new Map<
        number,
        NumberOfCharacters
    >([
        [
            5,
            {
                townsfolk: 3,
                outsider: 0,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            6,
            {
                townsfolk: 3,
                outsider: 1,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            7,
            {
                townsfolk: 5,
                outsider: 0,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            8,
            {
                townsfolk: 5,
                outsider: 1,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            9,
            {
                townsfolk: 5,
                outsider: 2,
                minion: 1,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            10,
            {
                townsfolk: 7,
                outsider: 0,
                minion: 2,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            11,
            {
                townsfolk: 7,
                outsider: 1,
                minion: 2,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            12,
            {
                townsfolk: 7,
                outsider: 2,
                minion: 2,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            13,
            {
                townsfolk: 9,
                outsider: 0,
                minion: 3,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            14,
            {
                townsfolk: 9,
                outsider: 1,
                minion: 3,
                demon: 1,
                traveller: 0,
            },
        ],
        [
            this.MAXIMUM_NUMBER_OF_PLAYERS_BEFORE_NECESSARY_TRAVELLER,
            {
                townsfolk: 9,
                outsider: 2,
                minion: 3,
                demon: 1,
                traveller: 0,
            },
        ],
    ]);

    setupPlayers(initialPlayers?: IPlayer[]): Promise<IPlayers> {
        return Promise.resolve(new Players(initialPlayers ?? []));
    }

    async setupEdition(): Promise<typeof Edition> {
        const supportedEditions: Array<typeof Edition> =
            await GameEnvironment.current.getSupportedEditions();
        const chosenEdition =
            await InteractionEnvironment.current.gameUI.storytellerChooseOne(
                supportedEditions
            );

        return chosenEdition;
    }

    async setupTownSquare(
        initialPlayers?: IPlayer[],
        _seatAssignment:
            | ISeatAssignment
            | SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
    ): Promise<ITownSquare> {
        const clocktower = await this.setupClocktower();
        const numPlayers = initialPlayers?.length;
        const seating = await this.setupSeating(numPlayers);
        const townsquare = new TownSquare(seating, clocktower);

        const seatAssignment = this.getSeatAssignment(_seatAssignment);

        if (initialPlayers !== undefined) {
            await SeatAssignment.assignAll(
                seatAssignment,
                seating,
                initialPlayers
            );
        }

        return townsquare;
    }

    async setupStoryTeller(players: IPlayers) {
        const grimoire = await this.setupGrimoire(players);
        return new StoryTeller(grimoire);
    }

    async recommendCharacterTypeComposition(
        numPlayers: number,
        editionName: EditionName
    ): Promise<NumberOfCharacters> {
        const assignment =
            await GameEnvironment.current.recommendCharacterTypeComposition(
                numPlayers,
                editionName
            );
        return assignment;
    }

    protected getSeatAssignment(
        seatAssignment: ISeatAssignment | SeatAssignmentMode
    ): ISeatAssignment {
        if (isSeatAssignmentMode(seatAssignment)) {
            return SeatAssignmentFromMode.getInstance().getSeatAssignment(
                seatAssignment
            );
        } else {
            return seatAssignment;
        }
    }

    protected setupGrimoire(players: IPlayers) {
        return Promise.resolve(new Grimoire(players));
    }

    protected setupClocktower(): Promise<Clocktower> {
        return Promise.resolve(new Clocktower());
    }

    protected setupSeating(
        initialNumPlayers?: number | undefined
    ): Promise<Seating> {
        return Promise.resolve(new Seating(initialNumPlayers));
    }
}

export const SetupSheet = Singleton<BaseSetupSheet, typeof BaseSetupSheet>(
    BaseSetupSheet
);
