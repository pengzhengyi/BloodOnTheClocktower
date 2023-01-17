import { Generator } from './collections';
import { GAME_UI } from './dependencies.config';
import { Edition } from './edition';
import { GameHasTooFewPlayers, GameHasTooManyPlayers } from './exception';
import { Grimoire } from './grimoire';
import type { Player } from './player';
import type { Players } from './players';
import type { NumberOfCharacters } from './script-tool';
import { Seating } from './seating';
import { TownSquare } from './town-square';
import { TroubleBrewing } from '~/content/editions/TroubleBrewing';

export abstract class SetupSheet {
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

    static setupSeating(numPlayers: number): Promise<Seating> {
        return Seating.init(numPlayers);
    }

    static setupSeatingFromPlayers(
        players: Array<Player> | Players
    ): Promise<Seating> {
        return Seating.from(players);
    }

    static setupGrimoire(players: Players): Grimoire {
        return new Grimoire(players);
    }

    static setupEdition(): Promise<typeof Edition> {
        return GAME_UI.storytellerChooseOne(this.SUPPORTED_EDITIONS);
    }

    static setupTownSquare(seating: Seating, players: Players): TownSquare {
        return new TownSquare(seating, players);
    }

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
}
