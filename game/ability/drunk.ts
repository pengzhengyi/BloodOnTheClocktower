import type { CharacterToken, TownsfolkCharacterToken } from '../character';
import type { CharacterSheet } from '../character-sheet';
import { Generator } from '../collections';
import { DrunkReason } from '../drunk-reason';
import { CompositeGamePhaseKind } from '../game-phase-kind';
import type { IPlayer } from '../player';
import type { Players } from '../players';
import { ThinkAsCharacterEffect } from '../effect/think-as';
import {
    Ability,
    AbilitySetupContext,
    AbilityUseContext,
    AbilityUseResult,
    RequireSetup,
} from './ability';
import { AbilityUseStatus } from './status';
import { Environment } from '~/interaction/environment';

class BaseDrunkAbility extends Ability<AbilityUseContext, AbilityUseResult> {
    /**
     * {@link `drunk["ability"]`}
     */
    static readonly description =
        'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.';

    protected declare thinkAsTownsfolk: TownsfolkCharacterToken;

    protected thinkAsAbility?: Ability<
        AbilityUseContext,
        AbilityUseResult,
        AbilitySetupContext
    >;

    async useWhenNormal(context: AbilityUseContext) {
        let result: AbilityUseResult | AbilityUseResult;
        if (this.thinkAsAbility === undefined) {
            result = {
                status: AbilityUseStatus.Success,
            };
        } else {
            result = await this.thinkAsAbility.useWhenMalfunction(context);
        }

        result.description = this.formatDescription(
            context,
            result.description
        );

        return result;
    }

    useWhenMalfunction = this.useWhenNormal;

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        await context.requestedPlayer.setDrunk(DrunkReason.DrunkCharacter);
        await this.setupThinkAsCharacter(context);
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected async setupThinkAsCharacter(context: AbilitySetupContext) {
        this.thinkAsTownsfolk = await this.chooseThinkAsCharacter(
            context.characterSheet,
            context.players
        );
        this.setupThinkAsCharacterEffect(
            this.thinkAsTownsfolk,
            context.requestedPlayer
        );
        this.setupThinkAsCharacterAbility(this.thinkAsTownsfolk, context);
    }

    protected async chooseThinkAsCharacter(
        characterSheet: CharacterSheet,
        players: Players
    ): Promise<TownsfolkCharacterToken> {
        const townsfolkOptions = characterSheet.townsfolk;
        const inPlayCharacters = players.map((player) =>
            player.storytellerGet('_character')
        );
        const options = Generator.exclude(townsfolkOptions, inPlayCharacters);

        return await Environment.current.gameUI.storytellerChooseOne(
            options,
            BaseDrunkAbility.description
        );
    }

    protected setupThinkAsCharacterEffect(
        character: CharacterToken,
        player: IPlayer
    ) {
        const effect = new ThinkAsCharacterEffect(character);
        player.effects.add(effect, CompositeGamePhaseKind.ALL);
    }

    protected async setupThinkAsCharacterAbility(
        character: TownsfolkCharacterToken,
        context: AbilitySetupContext
    ) {
        const CharacterAbility =
            context.abilityLoader.loadCharacterAbility(character);
        if (CharacterAbility !== undefined) {
            this.thinkAsAbility = new CharacterAbility() as Ability<
                AbilityUseContext,
                AbilityUseResult,
                AbilitySetupContext
            >;
            await this.thinkAsAbility.setup(context);
        }
    }

    protected formatDescription(
        context: AbilityUseContext,
        thinkAsAbilityUseDescription?: string
    ): string {
        const thinkAsDescription =
            thinkAsAbilityUseDescription === undefined
                ? '.'
                : `: ${thinkAsAbilityUseDescription}.`;
        return `The Drunk player ${context.requestedPlayer} thinks that they are a Townsfolk ${this.thinkAsTownsfolk}${thinkAsDescription}`;
    }
}

export interface DrunkAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DrunkAbility = RequireSetup(BaseDrunkAbility);
