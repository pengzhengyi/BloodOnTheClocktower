import type { IEdition } from '../edition/edition';
import { Grimoire } from '../grimoire';
import { type IPlayers, Players } from '../players';
import type { NumberOfCharacters } from '../script-tool';
import { Seating } from '../seating/seating';
import { TownSquare, type ITownSquare } from '../town-square';
import { Clocktower } from '../clocktower';
import type { IPlayer } from '../player';
import {
    type ISeatAssignment,
    SeatAssignment,
} from '../seating/seat-assignment';
import { SeatAssignmentFromMode } from '../seating/seat-assignment-factory';
import {
    isSeatAssignmentMode,
    SeatAssignmentMode,
} from '../seating/seat-assignment-mode';
import { GameEnvironment } from '../environment';
import { Singleton } from '../common';
import type { IStoryTeller } from '../storyteller';
import { StoryTeller } from '../storyteller';
import type { TravellerCharacterToken } from '../character/character';
import type {
    ICharacterTypeToCharacter,
    IDecideInPlayCharactersContext,
    TravellerPlayer,
} from '../types';
import type { ICharacterSheet } from '../character/character-sheet';
import { CharacterSheetFactory } from '../character/character-sheet-factory';
import type { EditionId } from '../edition/edition-id';
import type { IModifyInPlayCharacters } from './in-play-characters/modify-in-play-characters';
import { ModifyInPlayCharacters } from './in-play-characters/modify-in-play-characters';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface ISetupContext {
    initialPlayers?: Array<IPlayer>;
    seatAssignment?: ISeatAssignment | SeatAssignmentMode;
}

export interface ISetupResult {
    players: IPlayers;
    townSquare: ITownSquare;
    storyTeller: IStoryTeller;
    edition: IEdition;
    editionCharacterSheet: ICharacterSheet;
    characterTypeComposition: NumberOfCharacters;
    initialInPlayCharacters: ICharacterTypeToCharacter;
    inPlayCharacters: ICharacterTypeToCharacter;
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

    setupEdition(): Promise<IEdition>;

    setupEditionCharacterSheet(edition: IEdition): Promise<ICharacterSheet>;

    recommendCharacterTypeComposition(
        numPlayers: number,
        editionId: EditionId
    ): Promise<NumberOfCharacters>;

    setupTraveller(
        volunteers: Iterable<IPlayer>,
        travellerCharacters: Array<TravellerCharacterToken>
    ): Promise<Array<TravellerPlayer>>;

    setupInitialInPlayCharacters(
        editionCharacterSheet: ICharacterSheet,
        characterTypeComposition: NumberOfCharacters
    ): Promise<ICharacterTypeToCharacter>;

    modifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter
    ): Promise<ICharacterTypeToCharacter>;

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

        const [storyTeller, characterTypeComposition, editionCharacterSheet] =
            await Promise.all([
                this.setupStoryTeller(players),
                this.recommendCharacterTypeComposition(
                    players.length,
                    edition.id
                ),
                this.setupEditionCharacterSheet(edition),
            ]);

        const initialInPlayCharacters = await this.setupInitialInPlayCharacters(
            editionCharacterSheet,
            characterTypeComposition
        );

        const inPlayCharacters = await this.modifyInitialInPlayCharacters(
            editionCharacterSheet,
            initialInPlayCharacters
        );

        const setupResult: ISetupResult = {
            players,
            townSquare,
            edition,
            storyTeller,
            editionCharacterSheet,
            characterTypeComposition,
            initialInPlayCharacters,
            inPlayCharacters,
        };

        return setupResult;
    }
}

class BaseSetupSheet extends AbstractSetupSheet implements ISetupSheet {
    protected modifyInPlayCharacters: IModifyInPlayCharacters;

    constructor(modifyInPlayCharacters?: IModifyInPlayCharacters) {
        super();
        this.modifyInPlayCharacters =
            modifyInPlayCharacters ?? new ModifyInPlayCharacters();
    }

    setupPlayers(initialPlayers?: IPlayer[]): Promise<IPlayers> {
        return Promise.resolve(new Players(initialPlayers ?? []));
    }

    async setupEdition(): Promise<IEdition> {
        const supportedEditions: Array<IEdition> =
            await GameEnvironment.current.getSupportedEditions();
        const chosenEdition =
            await InteractionEnvironment.current.gameUI.storytellerChooseOne({
                options: supportedEditions,
            });

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
        editionId: EditionId
    ): Promise<NumberOfCharacters> {
        const assignment =
            await GameEnvironment.current.recommendCharacterTypeComposition(
                numPlayers,
                editionId
            );
        return assignment;
    }

    setupEditionCharacterSheet(edition: IEdition): Promise<ICharacterSheet> {
        const characterSheet =
            CharacterSheetFactory.getInstance().getFromEdition(edition);
        return Promise.resolve(characterSheet);
    }

    setupTraveller(
        _volunteers: Iterable<IPlayer>,
        _travellerCharacters: Array<TravellerCharacterToken>
    ): Promise<Array<TravellerPlayer>> {
        // TODO implement traveller selection
        throw new Error('method not implemented');
    }

    async setupInitialInPlayCharacters(
        editionCharacterSheet: ICharacterSheet,
        characterTypeComposition: NumberOfCharacters
    ): Promise<ICharacterTypeToCharacter> {
        const reason = this.formatPromptForSetupInPlayCharacters(
            characterTypeComposition
        );
        // TODO properly implement in-play character selection with serialization
        const context: IDecideInPlayCharactersContext = {
            characterSheet: editionCharacterSheet,
            numToChooseForEachCharacterType: characterTypeComposition,
        };
        const decision =
            await InteractionEnvironment.current.gameUI.storytellerDecide<ICharacterTypeToCharacter>(
                {
                    context,
                },
                { reason }
            );
        return decision.decided;
    }

    async modifyInitialInPlayCharacters(
        characterSheet: ICharacterSheet,
        initialInPlayCharacters: ICharacterTypeToCharacter
    ): Promise<ICharacterTypeToCharacter> {
        const modifiedInPlayCharacters =
            await this.modifyInPlayCharacters.modifyInitialInPlayCharacters(
                characterSheet,
                initialInPlayCharacters
            );
        return modifiedInPlayCharacters;
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

    protected formatPromptForSetupInPlayCharacters(
        numberOfCharacters: NumberOfCharacters
    ): string {
        let reason = 'Choose';

        for (const [characterType, numToChoose] of Object.entries(
            numberOfCharacters
        )) {
            reason += ` ${numToChoose} ${characterType}s`;
        }

        return reason + ' from character sheet';
    }
}

export const SetupSheet = Singleton<BaseSetupSheet, typeof BaseSetupSheet>(
    BaseSetupSheet
);
