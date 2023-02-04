import { Generator } from './collections';
import { type Edition } from './edition';
import { GameHasTooFewPlayers, GameHasTooManyPlayers } from './exception';
import { type IGrimoire, Grimoire } from './grimoire';
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
import { InteractionEnvironment } from '~/interaction/environment';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';

/**
 * {@link `glossary["Setup sheet"]`}
 * The sheet that details what the Storyteller needs to do before beginning a game.
 */
export interface ISetupSheet {
    setupPlayers(initialPlayers?: Array<IPlayer>): Promise<IPlayers>;

    setupTownSquare(
        initialPlayers: Array<IPlayer>,
        seatAssignment?: ISeatAssignment | SeatAssignmentMode
    ): Promise<ITownSquare>;

    setupGrimoire(players: IPlayers): Promise<IGrimoire>;

    setupEdition(): Promise<typeof Edition>;
}

class BaseSetupSheet implements ISetupSheet {
    static readonly RECOMMENDED_MAXIMUM_NUMBER_OF_PLAYERS = 20;

    static readonly SUPPORTED_EDITIONS: Array<typeof Edition> = [
        TroubleBrewing,
    ];

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

    static recommend(numPlayers: number): NumberOfCharacters {
        if (
            numPlayers >
            this.MAXIMUM_NUMBER_OF_PLAYERS_BEFORE_NECESSARY_TRAVELLER
        ) {
            const assignment = this.RECOMMENDED_ASSIGNMENTS.get(
                this.MAXIMUM_NUMBER_OF_PLAYERS_BEFORE_NECESSARY_TRAVELLER
            )!;
            assignment.traveller =
                numPlayers -
                this.MAXIMUM_NUMBER_OF_PLAYERS_BEFORE_NECESSARY_TRAVELLER;
            return assignment;
        } else {
            return this.RECOMMENDED_ASSIGNMENTS.get(numPlayers)!;
        }
    }

    static recommendWithOptionalTraveller(
        numPlayers: number,
        maximumNumTravellers = 0
    ): Iterable<NumberOfCharacters> {
        return Generator.map((numTravellersToAssign) => {
            const assignment = this.recommend(
                numPlayers - numTravellersToAssign
            );
            assignment.traveller = numTravellersToAssign;
            return assignment;
        }, Generator.range(0, maximumNumTravellers + 1));
    }

    static getRecommendedMinimumNumberOfPlayers(
        isTroubleBrewing: boolean
    ): number {
        if (isTroubleBrewing) {
            return 5;
        }

        return 7;
    }

    static validateNumberOfPlayers(
        numPlayers: number,
        isTroubleBrewing: boolean
    ): void {
        const recommendedMinimum =
            this.getRecommendedMinimumNumberOfPlayers(isTroubleBrewing);
        if (numPlayers < recommendedMinimum) {
            throw new GameHasTooFewPlayers(numPlayers, recommendedMinimum);
        } else if (numPlayers > this.RECOMMENDED_MAXIMUM_NUMBER_OF_PLAYERS) {
            throw new GameHasTooManyPlayers(
                numPlayers,
                this.RECOMMENDED_MAXIMUM_NUMBER_OF_PLAYERS
            );
        }
    }

    setupPlayers(initialPlayers?: IPlayer[]): Promise<IPlayers> {
        return Promise.resolve(new Players(initialPlayers ?? []));
    }

    async setupEdition(): Promise<typeof Edition> {
        const supportedEditions: Array<typeof Edition> =
            await GameEnvironment.current.getSupportedEditions();
        return InteractionEnvironment.current.gameUI.storytellerChooseOne(
            supportedEditions
        );
    }

    async setupTownSquare(
        initialPlayers: IPlayer[],
        _seatAssignment:
            | ISeatAssignment
            | SeatAssignmentMode = SeatAssignmentMode.NaturalInsert
    ): Promise<ITownSquare> {
        const numPlayers = initialPlayers.length;
        const clocktower = await this.setupClocktower();
        const seating = await this.setupSeating(numPlayers);
        const townsquare = new TownSquare(seating, clocktower);

        const seatAssignment = this.getSeatAssignment(_seatAssignment);
        await SeatAssignment.assignAll(seatAssignment, seating, initialPlayers);

        return townsquare;
    }

    setupGrimoire(players: IPlayers) {
        return Promise.resolve(new Grimoire(players));
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
