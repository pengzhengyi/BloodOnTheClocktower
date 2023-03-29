import type { IEdition } from '../edition/edition';
import { Grimoire } from '../grimoire';
import { type IPlayers, Players } from '../player/players';
import type { NumberOfCharacters } from '../script-tool';
import { Seating } from '../seating/seating';
import { TownSquare, type ITownSquare } from '../town-square';
import { Clocktower } from '../clocktower/clocktower';
import type { IPlayer } from '../player/player';
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
import {
    chainCharacters,
    characterTypeToCharacterToString,
    Singleton,
} from '../common';
import type { IStoryTeller } from '../storyteller';
import { StoryTeller } from '../storyteller';
import type {
    CharacterToken,
    ICharacter,
    TravellerCharacterToken,
} from '../character/character';
import type {
    AbilityAssignment,
    CharacterAssignment,
    CharacterAssignmentResult,
    ICharacterTypeToCharacter,
    IDecideCharacterAssignmentsContext,
    IDecideInPlayCharactersContext,
    TravellerPlayer,
} from '../types';
import type { ICharacterSheet } from '../character/character-sheet';
import { CharacterSheetFactory } from '../character/character-sheet-factory';
import type { EditionId } from '../edition/edition-id';
import { Generator } from '../collections';
import type { INightSheet } from '../night-sheet';
import { NightSheet } from '../night-sheet';
import type { IAbilityLoader } from '../ability/ability-loader';
import type { IGame } from '../game';
import type { IModifyInPlayCharacters } from './in-play-characters/modify-in-play-characters';
import { ModifyInPlayCharacters } from './in-play-characters/modify-in-play-characters';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface ISetupContext {
    game: IGame;
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
    characterAssignments: Array<CharacterAssignmentResult>;
    abilityAssignments: Array<AbilityAssignment>;
    nightSheet: INightSheet;
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

    setupCharacterAssignments(
        players: IPlayers,
        inPlayCharacters: ICharacterTypeToCharacter
    ): Promise<Array<CharacterAssignmentResult>>;

    setupNightSheet(characters: Array<CharacterToken>): Promise<INightSheet>;

    assignAbilities(
        characterAssignments: Iterable<CharacterAssignment>,
        abilityLoader: IAbilityLoader
    ): Promise<Array<AbilityAssignment>>;

    setupAbilities(
        game: IGame,
        abilityAssignments: Array<AbilityAssignment>
    ): Promise<void>;

    /**
     * Responsible for setting up the game. Should be preferred than the individual `setup*` methods.
     *
     * @param context The context for setting up the game.
     * @returns The result of the setup process.
     */
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

        const [initialInPlayCharacters, nightSheet] = await Promise.all([
            this.setupInitialInPlayCharacters(
                editionCharacterSheet,
                characterTypeComposition
            ),
            this.setupNightSheet(editionCharacterSheet.characters),
        ]);

        const inPlayCharacters = await this.modifyInitialInPlayCharacters(
            editionCharacterSheet,
            initialInPlayCharacters
        );

        const characterAssignments = await this.setupCharacterAssignments(
            players,
            inPlayCharacters
        );

        const abilityAssignments = await this.assignAbilities(
            characterAssignments,
            GameEnvironment.current.abilityLoader
        );

        const _abilitySetupResults = await this.setupAbilities(
            context.game,
            abilityAssignments
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
            characterAssignments,
            abilityAssignments,
            nightSheet,
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

    async setupNightSheet(characters: ICharacter[]): Promise<INightSheet> {
        const nightSheet = new NightSheet();
        await nightSheet.init(characters);
        return nightSheet;
    }

    async assignAbilities(
        characterAssignments: Iterable<CharacterAssignment>,
        abilityLoader: IAbilityLoader
    ): Promise<Array<AbilityAssignment>> {
        const promises = Generator.toPromise(async ({ character, player }) => {
            const abilityGroup = abilityLoader.load(character.id);
            const abilities = player.abilities;
            await abilities.assign(abilityGroup);
            return { abilities, player };
        }, characterAssignments);

        const result = await Promise.all(promises);
        return result;
    }

    async setupAbilities(
        game: IGame,
        abilityAssignments: AbilityAssignment[]
    ): Promise<void> {
        const promises = Generator.toPromise(async ({ abilities, player }) => {
            await abilities.setup(player, game, GameEnvironment.current);
        }, abilityAssignments);
        await Promise.all(promises);
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

    async setupCharacterAssignments(
        players: IPlayers,
        inPlayCharacters: ICharacterTypeToCharacter
    ): Promise<Array<CharacterAssignmentResult>> {
        const characters = await this.storytellerDecideCharacterAssignments(
            players,
            inPlayCharacters
        );
        const assignmentResults = await this.assignCharactersToPlayers(
            players,
            characters
        );
        return assignmentResults;
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

    protected recommendCharacterAssignments(
        inPlayCharacters: ICharacterTypeToCharacter
    ): Array<CharacterToken> {
        const shuffledCharacters = Array.from(
            Generator.shuffle(chainCharacters(inPlayCharacters))
        );
        return shuffledCharacters;
    }

    protected async assignCharactersToPlayers(
        players: IPlayers,
        characters: Array<CharacterToken>
    ): Promise<Array<CharacterAssignmentResult>> {
        // TODO determine travellerToAlignment when there are travellers
        const result = await players.assignCharacters(characters);
        return result;
    }

    protected async storytellerDecideCharacterAssignments(
        players: IPlayers,
        inPlayCharacters: ICharacterTypeToCharacter
    ): Promise<Array<CharacterToken>> {
        const recommendation =
            this.recommendCharacterAssignments(inPlayCharacters);
        const reason = this.formatPromptForSetupCharacterAssignments(
            players,
            inPlayCharacters
        );
        const context: IDecideCharacterAssignmentsContext = {
            players,
            inPlayCharacters,
        };

        const decision =
            await InteractionEnvironment.current.gameUI.storytellerDecide<
                Array<CharacterToken>
            >(
                {
                    context,
                    recommendation,
                },
                { reason }
            );
        return decision.decided;
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

    protected formatPromptForSetupCharacterAssignments(
        players: IPlayers,
        inPlayCharacters: ICharacterTypeToCharacter
    ): string {
        const playersDescription = players.toString();

        const charactersDescription = characterTypeToCharacterToString(
            inPlayCharacters,
            'In-play characters'
        );

        const prompt = `Assign characters to players:\n${charactersDescription}\n${playersDescription}`;
        return prompt;
    }
}

export const SetupSheet = Singleton<BaseSetupSheet, typeof BaseSetupSheet>(
    BaseSetupSheet
);
