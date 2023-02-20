import { PriorityQueue } from 'js-sdsl';
import type { CharacterToken, ICharacter } from './character/character';
import { CharacterNotInNightActOrdering } from './exception/character-not-in-night-act-ordering';
import { IncompleteCharacterRoleData } from './exception/incomplete-character-role-data';
import { Generator } from './collections';
import { InteractionEnvironment } from '~/interaction/environment/environment';
import { iterableToString } from '~/utils/common';

export enum NightActOrderNotDefinedHandleStrategy {
    NotAct,
    StoryTellerDecide,
}

export interface NightActOrdering {
    isFirstNight: boolean;

    /**
     * The order in which characters act at night. The first character in the array acts first, the last character in the array acts last. Characters not acting at night are not included in this array.
     */
    order: Array<CharacterToken>;

    /**
     * A mapping from the characters that act at night to the sequence number of their action. For example, first character to act has a sequence number of 0. Can be used to quickly check if a character is acting at night.
     */
    acting: Map<CharacterToken, number>;

    /**
     * A set of characters that do not act at night. Can be used to quickly check if a character is not acting at night.
     */
    notActing: Set<CharacterToken>;
}

interface NightActOrderingExtended extends NightActOrdering {
    /**
     * A mapping from characters to their night act order in definition or resolved by storyteller. This is the original data used to compute the night act ordering and usually should not be used directly.
     */
    __characterToActOrder: Map<CharacterToken, number>;
}

export function nightActOrderingToString(ordering: NightActOrdering): string {
    const acting = iterableToString(
        Generator.map(
            ([i, character]) => `${i} => ${character}`,
            Generator.enumerate(ordering.order, 1)
        ),
        'Characters act'
    );
    const notActing =
        'Characters not act: ' + Array.from(ordering.notActing).join(', ');
    const header = `Night Act Order (${
        ordering.isFirstNight ? 'First Night' : 'Other Nights'
    })`;
    return `${header}\n${acting}\n\n${notActing}`;
}

/**
 * {@link `glossary["Night sheet"]`}
 * The sheet the Storyteller uses to know which characters act in which order at night. The night sheet has one side to use on the first night and one side to use on all other nights.
 */
export interface INightSheet {
    readonly characters: Array<CharacterToken>;
    readonly firstNightActOrdering: NightActOrdering;
    readonly otherNightActOrdering: NightActOrdering;

    /**
     * Essential operation to initialize the night sheet. Further queries rely on this initialization. Calling this method with different characters will update night sheet to show information about new characters.
     *
     * @param characters Characters to compute night ordering for.
     * @param strategy Strategy to use when a character's night act order is not defined.
     */
    init(
        characters: Array<CharacterToken>,
        strategy?: NightActOrderNotDefinedHandleStrategy
    ): Promise<void>;

    // query methods
    /**
     * Get the night act ordering for the given characters and night.
     * @param inPlayCharacters In-play characters to get night act ordering for. Should be a subset of the characters for which NightSheet is currently initialized. If not provided, all characters when NightSheet is initialized will be considered in-play.
     * @param isFirstNight Whether to get the night act ordering for the first night or for other nights.
     * @returns The night act ordering for the given characters and night.
     */
    getNightActOrdering(
        inPlayCharacters?: Iterable<CharacterToken>,
        isFirstNight?: boolean
    ): NightActOrdering;
    /**
     * Night act sequence number of a character tells how earlier a character acts among provided characters. The first character to act has a sequence number of 0. If the character does not act at night, it will have a sequence number of undefined.
     *
     * @param character The character to get night act sequence number of.
     * @param isFirstNight Whether to get the character's night act sequence number on the first night or on other nights.
     * @returns The sequence number of the character's night act. The first character to act has a sequence number of 0. If the character does not act at night, it will have a sequence number of undefined.
     */
    getNightActSequenceNumber(
        character: CharacterToken,
        isFirstNight: boolean
    ): number | undefined;

    /**
     * Return the priority of a character in night. The earlier the character acts, the larger the priority will be.
     *
     * More specifically:
     *
     * - if player does not act at night, it will have `NightSheet.DEFAULT_NOT_ACTING_PRIORITY`
     * - if player act at night, it will have `NightSheet.DEFAULT_ACTING_ADJUSTMENT` - act order of character
     *
     * Since each character has a priority, it allows characters, no matter whether act at night, to be sorted.
     *
     * Usually this method should not be used directly. Use {@link getNightActSequenceNumber} instead.
     *
     * @param character The character to get priority of.
     * @param isFirstNight Whether to get the character's priority on the first night or on other nights.
     * @returns The priority of the character in night. The earlier the character acts, the larger the priority will be.
     */
    getNightPriority(character: CharacterToken, isFirstNight: boolean): number;

    /**
     * Night act order of a character is the raw data used to compute the night act sequence number. It is either retrieved from a character's definition or resolved by the Storyteller when not found.
     *
     * Usually this method should not be used directly. Use {@link getNightActSequenceNumber} instead.
     *
     * @param character The character to get night act order of.
     * @param isFirstNight Whether to get the character's night act order on the first night or on other nights.
     * @returns The night act order of the character.
     */
    getNightActOrder(character: CharacterToken, isFirstNight: boolean): number;

    willActDuringFirstNight(character: CharacterToken): boolean;

    willActDuringOtherNights(character: CharacterToken): boolean;

    // utility methods
    toString(): string;
}

export class NightSheet implements INightSheet {
    static DEFAULT_ACTING_ADJUSTMENT = 1e10;

    static DEFAULT_NOT_ACTING_PRIORITY = Number.MIN_SAFE_INTEGER;

    static async getNightActOrdering(
        characters: Iterable<CharacterToken>,
        isFirstNight: boolean,
        strategy: NightActOrderNotDefinedHandleStrategy = NightActOrderNotDefinedHandleStrategy.StoryTellerDecide
    ): Promise<NightActOrderingExtended> {
        const ordering: NightActOrderingExtended = {
            isFirstNight,
            order: [],
            acting: new Map(),
            notActing: new Set(),
            __characterToActOrder: new Map(),
        };

        const priorityQueue = this.createPriorityQueueForCharacterOrder();

        for (const character of characters) {
            const order = await this.getNightActOrder(
                character,
                isFirstNight,
                strategy
            );

            ordering.__characterToActOrder.set(character, order);

            if (order === 0) {
                ordering.notActing.add(character);
                continue;
            }

            priorityQueue.push({
                character,
                order,
            });
        }

        [ordering.order, ordering.acting] =
            this.getActingOrderFromPriorityQueue(priorityQueue);

        return ordering;
    }

    static getNightActOrderingForSubset(
        subsetOfCharacters: Iterable<CharacterToken>,
        ordering: Readonly<NightActOrdering>
    ): NightActOrdering {
        const subsetOrdering: NightActOrdering = {
            isFirstNight: ordering.isFirstNight,
            order: [],
            acting: new Map(),
            notActing: new Set(),
        };

        const priorityQueue = this.createPriorityQueueForCharacterOrder();

        for (const character of subsetOfCharacters) {
            if (ordering.notActing.has(character)) {
                subsetOrdering.notActing.add(character);
                continue;
            }

            const order = ordering.acting.get(character);
            if (order === undefined) {
                throw new CharacterNotInNightActOrdering(character, ordering);
            }

            priorityQueue.push({
                character,
                order,
            });
        }

        [subsetOrdering.order, subsetOrdering.acting] =
            this.getActingOrderFromPriorityQueue(priorityQueue);

        return subsetOrdering;
    }

    protected static createPriorityQueueForCharacterOrder() {
        return new PriorityQueue<{
            character: CharacterToken;
            order: number;
        }>(
            [],
            (characterWithOrder, otherCharacterWithOrder) =>
                characterWithOrder.order - otherCharacterWithOrder.order
        );
    }

    protected static getActingOrderFromPriorityQueue(
        priorityQueue: PriorityQueue<{
            character: CharacterToken;
            order: number;
        }>
    ) {
        const order: NightActOrdering['order'] = [];
        const acting: NightActOrdering['acting'] = new Map();

        while (!priorityQueue.empty()) {
            const { character } = priorityQueue.pop()!;
            acting.set(character, order.length);
            order.push(character);
        }

        return [order, acting] as const;
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
    protected static getNightPriority(
        character: CharacterToken,
        ordering: NightActOrderingExtended,
        ACTING_ADJUSTMENT = this.DEFAULT_ACTING_ADJUSTMENT,
        NOT_ACTING_PRIORITY = this.DEFAULT_NOT_ACTING_PRIORITY
    ): number {
        const order = ordering.__characterToActOrder.get(character);

        if (order === undefined) {
            throw new CharacterNotInNightActOrdering(character, ordering);
        }

        return order === 0 ? NOT_ACTING_PRIORITY : ACTING_ADJUSTMENT - order;
    }

    protected static async getNightActOrder(
        character: CharacterToken,
        isFirstNight: boolean,
        strategy: NightActOrderNotDefinedHandleStrategy
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

    protected static async handleNightActOrderNotDefined(
        character: CharacterToken,
        isFirstNight: boolean,
        strategy: NightActOrderNotDefinedHandleStrategy
    ): Promise<number> {
        switch (strategy) {
            case NightActOrderNotDefinedHandleStrategy.NotAct:
                return 0;
            case NightActOrderNotDefinedHandleStrategy.StoryTellerDecide: {
                const reason = this.formatPromptForDecideNightActOrder(
                    character,
                    isFirstNight
                );
                const decision =
                    await InteractionEnvironment.current.gameUI.storytellerDecide<number>(
                        {},
                        { reason }
                    );
                return decision.decided;
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

    declare firstNightActOrdering: NightActOrderingExtended;

    declare otherNightActOrdering: NightActOrderingExtended;

    get characters(): Array<CharacterToken> {
        if (this._characters === undefined) {
            throw new Error('characters not initialized');
        }

        return this._characters;
    }

    protected _characters?: Array<CharacterToken>;

    async init(
        characters: Array<CharacterToken>,
        strategy: NightActOrderNotDefinedHandleStrategy = NightActOrderNotDefinedHandleStrategy.StoryTellerDecide
    ) {
        this._characters = characters;
        await this.initNightActOrdering(strategy);
    }

    getNightActOrdering(
        inPlayCharacters?: Iterable<ICharacter> | undefined,
        isFirstNight?: boolean | undefined
    ): NightActOrdering {
        const existing = isFirstNight
            ? this.firstNightActOrdering
            : this.otherNightActOrdering;

        if (inPlayCharacters === undefined) {
            return existing;
        }

        return NightSheet.getNightActOrderingForSubset(
            inPlayCharacters,
            existing
        );
    }

    getNightActSequenceNumber(
        character: CharacterToken,
        isFirstNight: boolean
    ): number | undefined {
        const ordering = isFirstNight
            ? this.firstNightActOrdering
            : this.otherNightActOrdering;
        return ordering.acting.get(character);
    }

    getNightPriority(character: CharacterToken, isFirstNight: boolean): number {
        return NightSheet.getNightPriority(
            character,
            isFirstNight
                ? this.firstNightActOrdering
                : this.otherNightActOrdering
        );
    }

    getNightActOrder(character: ICharacter, isFirstNight: boolean): number {
        const ordering = isFirstNight
            ? this.firstNightActOrdering
            : this.otherNightActOrdering;
        const order = ordering.__characterToActOrder.get(character);

        if (order === undefined) {
            throw new CharacterNotInNightActOrdering(character, ordering);
        }

        return order;
    }

    willActDuringFirstNight(character: ICharacter): boolean {
        return this.firstNightActOrdering.acting.has(character);
    }

    willActDuringOtherNights(character: ICharacter): boolean {
        return this.otherNightActOrdering.acting.has(character);
    }

    toString(): string {
        const firstNightActOrderingDescription = nightActOrderingToString(
            this.firstNightActOrdering
        );

        const otherNightActOrderingDescription = nightActOrderingToString(
            this.otherNightActOrdering
        );

        const description = `Night Sheet:\n${firstNightActOrderingDescription}\n${otherNightActOrderingDescription}`;
        return description;
    }

    protected async initNightActOrdering(
        strategy: NightActOrderNotDefinedHandleStrategy
    ) {
        [this.firstNightActOrdering, this.otherNightActOrdering] =
            await Promise.all([
                NightSheet.getNightActOrdering(this.characters, true, strategy),
                NightSheet.getNightActOrdering(
                    this.characters,
                    false,
                    strategy
                ),
            ]);
    }
}
