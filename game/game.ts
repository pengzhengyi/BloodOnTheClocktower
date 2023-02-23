/* eslint-disable no-use-before-define */
import { Alignment } from './alignment';
import { type IPlayer } from './player';
import type { IPlayers } from './players';
import type { IEdition } from './edition/edition';
import { EffectTarget, type IEffectTarget } from './effect/effect-target';
import type { IStoryTeller } from './storyteller';
import type { ITownSquare } from './town-square';
import type { IDiary } from './clocktower/diary';
import type {
    ISetupContext,
    ISetupResult,
    ISetupSheet,
} from './setup/setup-sheet';
import type { ICharacterSheet } from './character/character-sheet';
import type { NumberOfCharacters } from './script-tool';
import type {
    AbilityAssignment,
    CharacterAssignmentResult,
    ICharacterTypeToCharacter,
} from './types';
import type { INightSheet } from './night-sheet';
import type { IClocktower } from './clocktower/clocktower';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface IGame extends IEffectTarget<IGame>, Readonly<ISetupResult> {
    // fundamental properties of IGame @see ISetupResult

    // utility properties of IGame
    readonly characterSheet: ICharacterSheet;
    readonly clocktower: IClocktower;
    readonly today: IDiary;

    // capabilities of IGame
    setWinningTeam(winningTeam: Alignment, reason?: string): void;
    getWinningTeam(players?: Iterable<IPlayer>): Promise<Alignment | undefined>;
}

export class Game extends EffectTarget<Game> implements IGame {
    protected static defaultEnabledProxyHandlerPropertyNames: Array<
        keyof ProxyHandler<Game>
    > = ['get'];

    static async init(
        setupSheet: ISetupSheet,
        setupContext: Omit<ISetupContext, 'game'>,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Game>>
    ) {
        if (enabledProxyHandlerPropertyNames === undefined) {
            enabledProxyHandlerPropertyNames =
                this.defaultEnabledProxyHandlerPropertyNames;
        }

        const game = new this(setupSheet, enabledProxyHandlerPropertyNames);

        const context = { ...setupContext, game };
        await game.setup(context);

        return game.getProxy();
    }

    readonly setupSheet: ISetupSheet;

    declare townSquare: ITownSquare;

    declare edition: IEdition;

    declare storyTeller: IStoryTeller;

    declare nightSheet: INightSheet;

    declare editionCharacterSheet: ICharacterSheet;

    declare characterTypeComposition: NumberOfCharacters;

    declare initialInPlayCharacters: ICharacterTypeToCharacter;

    declare inPlayCharacters: ICharacterTypeToCharacter;

    declare characterAssignments: Array<CharacterAssignmentResult>;

    declare abilityAssignments: Array<AbilityAssignment>;

    get players(): IPlayers {
        return this._players.clone();
    }

    protected declare _players: IPlayers;

    get today(): IDiary {
        return this.clocktower.today;
    }

    get clocktower(): IClocktower {
        return this.townSquare.clockTower;
    }

    get characterSheet(): ICharacterSheet {
        return this.editionCharacterSheet;
    }

    protected winningTeam?: Alignment;

    protected constructor(
        setupSheet: ISetupSheet,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Game>>
    ) {
        super(enabledProxyHandlerPropertyNames);
        this.setupSheet = setupSheet;
    }

    async setup(setupContext: ISetupContext): Promise<void> {
        const setupResult = await this.setupSheet.setup(setupContext);

        ({
            edition: this.edition,
            townSquare: this.townSquare,
            players: this._players,
            storyTeller: this.storyTeller,
            editionCharacterSheet: this.editionCharacterSheet,
            characterTypeComposition: this.characterTypeComposition,
            initialInPlayCharacters: this.initialInPlayCharacters,
            inPlayCharacters: this.inPlayCharacters,
            characterAssignments: this.characterAssignments,
            nightSheet: this.nightSheet,
            abilityAssignments: this.abilityAssignments,
        } = setupResult);
    }

    async setWinningTeam(winningTeam: Alignment, reason?: string) {
        const reasonPrompt = reason === undefined ? '' : ` because ${reason}`;

        if (
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                `${winningTeam} will be the winning team${reasonPrompt}?`
            )
        ) {
            this.winningTeam = winningTeam;
        }
    }

    async getWinningTeam(
        players?: Iterable<IPlayer>
    ): Promise<Alignment | undefined> {
        players ??= this.players;

        let evilWinConditionReached = true;
        let goodWinConditionReached = true;

        let aliveNontravellerPlayerCount = 0;
        for (const player of players) {
            if (goodWinConditionReached && (await player.isTheDemon)) {
                goodWinConditionReached = false;
            }

            if (evilWinConditionReached && (await player.isAliveNontraveller)) {
                aliveNontravellerPlayerCount++;

                if (aliveNontravellerPlayerCount > 2) {
                    evilWinConditionReached = false;
                }
            }

            if (!goodWinConditionReached && !evilWinConditionReached) {
                return undefined;
            }
        }

        if (goodWinConditionReached) {
            return Alignment.Good;
        }

        if (evilWinConditionReached) {
            return Alignment.Evil;
        }
    }
}
