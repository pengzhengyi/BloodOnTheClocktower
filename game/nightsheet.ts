import { PriorityQueue } from 'js-sdsl';
import type { CharacterToken } from './character';
import { IncompleteCharacterRoleData } from './exception';
import { GAME_UI } from '~/interaction/gameui';

export enum NightActOrderNotDefinedHandleStrategy {
    NotAct,
    StoryTellerDecide,
}

export interface NightActOrdering {
    isFirstNight: boolean;

    acting: Array<CharacterToken>;

    notActing: Set<CharacterToken>;
}

/**
 * {@link `glossary["Night sheet"]`}
 * The sheet the Storyteller uses to know which characters act in which order at night. The night sheet has one side to use on the first night and one side to use on all other nights.
 */
export abstract class NightSheet {
    static STRATEGY_WHEN_NIGHT_ACT_ORDER_NOT_DEFINED =
        NightActOrderNotDefinedHandleStrategy.StoryTellerDecide;

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
        switch (
            strategy ||
            NightSheet.STRATEGY_WHEN_NIGHT_ACT_ORDER_NOT_DEFINED
        ) {
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
}
