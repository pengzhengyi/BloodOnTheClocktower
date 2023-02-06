import type { CharacterToken } from '../character/character';
import type { ICharacterSheet } from '../character/character-sheet';
import { type CachingGenerator, Generator } from '../collections';
import type { InteractionContext } from '../effect/effect';
import {
    RegisterAsCharacterEffect,
    RegisterAsGoodAlignmentEffect,
} from '../effect/register-as';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import type { SpyInformation } from '../info/provider/spy';
import type { InformationRequestContext } from '../info/requester/requester';
import { SpyInformationRequester } from '../info/requester/spy';
import type { SpyPlayer } from '../types';
import {
    type Ability,
    type AbilitySetupContext,
    type AbilityUseContext,
    type AbilityUseResult,
    GetCharacterInformationAbility,
    RequireSetup,
} from './ability';

class SpyRegisterAsGoodAlignmentEffect extends RegisterAsGoodAlignmentEffect<SpyPlayer> {
    protected formatPromptForChoose(
        context: InteractionContext<SpyPlayer>
    ): string {
        const prompt = super.formatPromptForChoose(context);
        return `${prompt} Spy might register as good.`;
    }
}

class SpyRegisterAsGoodCharacterEffect extends RegisterAsCharacterEffect<SpyPlayer> {
    readonly recommended = undefined;

    static fromCharacterSheet(characterSheet: ICharacterSheet) {
        return this.from(characterSheet.townsfolk, characterSheet.outsider);
    }

    static from(
        townsfolks: Array<CharacterToken>,
        outsiders: Array<CharacterToken>
    ) {
        const goodCharacters = Generator.cache(
            Generator.chain(townsfolks, outsiders)
        );
        return new this(goodCharacters as CachingGenerator<CharacterToken>);
    }

    get options() {
        return this.goodCharacters;
    }

    protected readonly goodCharacters:
        | Array<CharacterToken>
        | CachingGenerator<CharacterToken>;

    protected constructor(
        goodCharacters: Array<CharacterToken> | CachingGenerator<CharacterToken>
    ) {
        super();
        this.goodCharacters = goodCharacters;
    }

    protected formatPromptForChoose(
        context: InteractionContext<SpyPlayer>
    ): string {
        const prompt = super.formatPromptForChoose(context);
        return `${prompt} Spy might appear to be an good character.`;
    }
}

class BaseSpyAbility extends GetCharacterInformationAbility<
    SpyInformation,
    SpyInformationRequester<InformationRequestContext<SpyInformation>>
> {
    /**
     * {@link `spy["ability"]`}
     */
    static readonly description =
        'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.';

    protected infoRequester = new SpyInformationRequester<
        InformationRequestContext<SpyInformation>
    >();

    protected declare registerAsAlignment: SpyRegisterAsGoodAlignmentEffect;

    protected declare registerAsCharacter: SpyRegisterAsGoodCharacterEffect;

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.registerAsAlignment = new SpyRegisterAsGoodAlignmentEffect();
        this.registerAsCharacter =
            SpyRegisterAsGoodCharacterEffect.fromCharacterSheet(
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

    protected formatDescription(context: AbilityUseContext): string {
        return `The Spy player ${context.requestedPlayer} might appear to be a good character, but is actually evil. They also see the Grimoire, so they know the characters (and status) of all players.`;
    }
}

export interface SpyAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SpyAbility = RequireSetup(BaseSpyAbility);
