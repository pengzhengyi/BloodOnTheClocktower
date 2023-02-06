import type { CharacterToken } from '../character/character';
import type { ICharacterSheet } from '../character/character-sheet';
import { type CachingGenerator, Generator } from '../collections';
import type { InteractionContext } from '../effect/effect';
import {
    RegisterAsCharacterEffect,
    RegisterAsEvilAlignmentEffect,
} from '../effect/register-as';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import type { ReclusePlayer } from '../types';
import {
    Ability,
    type AbilityUseContext,
    type AbilityUseResult,
    type AbilitySetupContext,
    RequireSetup,
} from './ability';
import { AbilityUseStatus } from './status';

class RecluseRegisterAsEvilAlignmentEffect extends RegisterAsEvilAlignmentEffect<ReclusePlayer> {
    protected formatPromptForChoose(
        context: InteractionContext<ReclusePlayer>
    ): string {
        const prompt = super.formatPromptForChoose(context);
        return `${prompt} Recluse might register as evil.`;
    }
}

class RecluseRegisterAsEvilCharacterEffect extends RegisterAsCharacterEffect<ReclusePlayer> {
    readonly recommended = undefined;

    static fromCharacterSheet(characterSheet: ICharacterSheet) {
        return this.from(characterSheet.minion, characterSheet.demon);
    }

    static from(minions: Array<CharacterToken>, demons: Array<CharacterToken>) {
        const evilCharacters = Generator.cache(
            Generator.chain(minions, demons)
        );
        return new this(evilCharacters as CachingGenerator<CharacterToken>);
    }

    get options() {
        return this.evilCharacters;
    }

    protected readonly evilCharacters:
        | Array<CharacterToken>
        | CachingGenerator<CharacterToken>;

    protected constructor(
        evilCharacters: Array<CharacterToken> | CachingGenerator<CharacterToken>
    ) {
        super();
        this.evilCharacters = evilCharacters;
    }

    protected formatPromptForChoose(
        context: InteractionContext<ReclusePlayer>
    ): string {
        const prompt = super.formatPromptForChoose(context);
        return `${prompt} Recluse might appear to be an evil character.`;
    }
}

class BaseRecluseAbility extends Ability<AbilityUseContext, AbilityUseResult> {
    /**
     * {@link `recluse["ability"]`}
     */
    static readonly description =
        'You might register as evil & as a Minion or Demon, even if dead.';

    protected declare registerAsAlignment: RecluseRegisterAsEvilAlignmentEffect;

    protected declare registerAsCharacter: RecluseRegisterAsEvilCharacterEffect;

    useWhenNormal(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilityUseStatus.Success,
            description: this.formatDescription(context),
        });
    }

    useWhenMalfunction = this.useWhenNormal;

    isEligible(_context: AbilityUseContext): Promise<boolean> {
        return Promise.resolve(false);
    }

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.registerAsAlignment = new RecluseRegisterAsEvilAlignmentEffect();
        this.registerAsCharacter =
            RecluseRegisterAsEvilCharacterEffect.fromCharacterSheet(
                context.characterSheet
            );

        context.requestedPlayer.effects.add(
            this.registerAsAlignment,
            CompositeGamePhaseKind.ALL
        );
        context.requestedPlayer.effects.add(
            this.registerAsCharacter,
            CompositeGamePhaseKind.ALL
        );
    }

    willMalfunction(_context: AbilityUseContext): Promise<boolean> {
        return Promise.resolve(false);
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescription(context: AbilityUseContext): string {
        return `The Recluse player ${context.requestedPlayer} might appear to be an evil character, but is actually good.`;
    }
}

export interface RecluseAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RecluseAbility = RequireSetup(BaseRecluseAbility);
