import { PriorityQueue } from 'js-sdsl';
import type { CharacterToken } from './character';
import {
    CharacterNotInNightActOrdering,
    IncompleteCharacterRoleData,
} from './exception';
import { GAME_UI } from './dependencies.config';

export enum NightActOrderNotDefinedHandleStrategy {
    NotAct,
    StoryTellerDecide,
}

export interface NightActOrdering {
    isFirstNight: boolean;

    acting: Array<CharacterToken>;

    characterToActOrder: Map<CharacterToken, number>;

    notActing: Set<CharacterToken>;
}

/**
 * {@link `glossary["Night sheet"]`}
 * The sheet the Storyteller uses to know which characters act in which order at night. The night sheet has one side to use on the first night and one side to use on all other nights.
 */
export class NightSheet {
    static STRATEGY_WHEN_NIGHT_ACT_ORDER_NOT_DEFINED =
        NightActOrderNotDefinedHandleStrategy.StoryTellerDecide;

    static DEFAULT_ACTING_ADJUSTMENT = 1e10;

    static DEFAULT_NOT_ACTING_PRIORITY = Number.MIN_SAFE_INTEGER;

    static async init(
        characters: Array<CharacterToken>,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ) {
        const nightSheet = new NightSheet(characters, strategy);
        await nightSheet.init();
        return nightSheet;
    }

    /**
     * Return the priority of a character act order. The earlier the character acts, the larger the priority will be.
     *
     * More specifically:
     *
     * - if player does not act at night, it will have NOT_ACTING_PRIORITY
     * - if player act at night, it will have ACTING_ADJUSTMENT - act order of character
     * @param character The character to get priority of.
     * @param ordering The night act ordering to reference.
     * @param ACTING_ADJUSTMENT A constant used to adjust priority. Final priority will equal to this number minus the night act order such that earlier-acting character has larger priority.
     * @param NOT_ACTING_PRIORITY The default priority if a character is not acting at night.
     */
    static getNightPriority(
        character: CharacterToken,
        ordering: NightActOrdering,
        ACTING_ADJUSTMENT = this.DEFAULT_ACTING_ADJUSTMENT,
        NOT_ACTING_PRIORITY = this.DEFAULT_NOT_ACTING_PRIORITY
    ): number {
        const order = ordering.characterToActOrder.get(character);

        if (order === undefined) {
            throw new CharacterNotInNightActOrdering(character, ordering);
        }

        return order === 0 ? NOT_ACTING_PRIORITY : ACTING_ADJUSTMENT - order;
    }

    static async getNightActOrder(
        character: CharacterToken,
        isFirstNight: boolean,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ): Promise<number> {
        try {
            return isFirstNight
                ? character.firstNightOrder
                : character.otherNightOrder;
        } catch (error) {
            if (error instanceof IncompleteCharacterRoleData) {
                return await this.handleNightActOrderNotDefined(
                    character,
                    isFirstNight,
                    strategy
                );
            }

            throw error;
        }
    }

    static async getNightActOrdering(
        characters: Iterable<CharacterToken>,
        isFirstNight: boolean,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ): Promise<NightActOrdering> {
        const ordering: NightActOrdering = {
            isFirstNight,
            acting: [],
            notActing: new Set(),
            characterToActOrder: new Map(),
        };

        const priorityQueue = new PriorityQueue<{
            character: CharacterToken;
            order: number;
        }>(
            [],
            (characterWithOrder, otherCharacterWithOrder) =>
                characterWithOrder.order - otherCharacterWithOrder.order
        );

        for (const character of characters) {
            const order = await this.getNightActOrder(
                character,
                isFirstNight,
                strategy
            );

            ordering.characterToActOrder.set(character, order);

            if (!this._willActDuringNight(order, isFirstNight)) {
                ordering.notActing.add(character);
                continue;
            }

            priorityQueue.push({
                character,
                order,
            });
        }

        while (!priorityQueue.empty()) {
            ordering.acting.push(priorityQueue.pop()!.character);
        }

        return ordering;
    }

    static async willActDuringFirstNight(
        character: CharacterToken,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ): Promise<boolean> {
        const order = await this.getNightActOrder(character, true, strategy);
        return this._willActDuringFirstNight(order);
    }

    static async willActDuringAllOtherNights(
        character: CharacterToken,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ): Promise<boolean> {
        const order = await this.getNightActOrder(character, false, strategy);
        return this._willActDuringAllOtherNights(order);
    }

    protected static _willActDuringFirstNight(nightActOrder: number): boolean {
        return this._willActDuringNight(nightActOrder, true);
    }

    protected static _willActDuringAllOtherNights(
        nightActOrder: number
    ): boolean {
        return this._willActDuringNight(nightActOrder, false);
    }

    protected static _willActDuringNight(
        nightActOrder: number,
        _isFirstNight: boolean
    ): boolean {
        return nightActOrder > 0;
    }

    protected static async handleNightActOrderNotDefined(
        character: CharacterToken,
        isFirstNight: boolean,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ): Promise<number> {
        switch (strategy || this.STRATEGY_WHEN_NIGHT_ACT_ORDER_NOT_DEFINED) {
            case NightActOrderNotDefinedHandleStrategy.NotAct:
                return 0;
            case NightActOrderNotDefinedHandleStrategy.StoryTellerDecide: {
                const reason = this.formatPromptForDecideNightActOrder(
                    character,
                    isFirstNight
                );
                return (await GAME_UI.storytellerDecide(reason, false))!;
            }
        }
    }

    protected static formatPromptForDecideNightActOrder(
        character: CharacterToken,
        isFirstNight: boolean
    ): string {
        return `choose a night act order for character ${character} during ${
            isFirstNight ? 'the first night' : 'each night except the first'
        } (0 means not acting)`;
    }

    declare firstNightActOrdering: NightActOrdering;

    declare otherNightActOrdering: NightActOrdering;

    // eslint-disable-next-line no-useless-constructor
    protected constructor(
        protected readonly characters: Array<CharacterToken>,
        readonly strategy?: NightActOrderNotDefinedHandleStrategy
    ) {}

    getNightPriority(character: CharacterToken, isFirstNight: boolean): number {
        return NightSheet.getNightPriority(
            character,
            isFirstNight
                ? this.firstNightActOrdering
                : this.otherNightActOrdering
        );
    }

    protected async init() {
        await this.initNightActOrdering();
    }

    protected async initNightActOrdering() {
        [this.firstNightActOrdering, this.otherNightActOrdering] =
            await Promise.all([
                NightSheet.getNightActOrdering(
                    this.characters,
                    true,
                    this.strategy
                ),
                NightSheet.getNightActOrdering(
                    this.characters,
                    false,
                    this.strategy
                ),
            ]);
    }
}
