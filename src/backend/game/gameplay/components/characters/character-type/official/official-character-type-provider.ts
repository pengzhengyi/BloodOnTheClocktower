import { Generator } from '../../../../../../common/data-structures/generator';
import { LazyValue } from '../../../../../../common/utils/lazy-value';
import type { ISingleton } from '../../../../../../common/types/singleton';
import type { ICharacterType } from '../character-type';
import type { ICharacterTypeProvider } from '../character-type-provider';
import { Demon } from './demon';
import { Fabled } from './fabled';
import { Minion } from './minion';
import type { OfficialCharacterType } from './official-character-type';
import { Outsider } from './outsider';
import { Townsfolk } from './townsfolk';
import { Traveller } from './traveller';

export class OfficialCharacterTypeProvider implements ICharacterTypeProvider {
    protected static characterTypeClasses: LazyValue<
        Array<ISingleton<OfficialCharacterType>>
    > = new LazyValue(() => [
        Demon,
        Fabled,
        Minion,
        Outsider,
        Townsfolk,
        Traveller,
    ]);

    protected static characterIdToCharacterType: LazyValue<
        Map<string, OfficialCharacterType>
    > = new LazyValue(
        () =>
            new Map(
                Generator.map(
                    (characterType) => [characterType.id, characterType],
                    Generator.map(
                        (characterTypeClass) =>
                            characterTypeClass.getInstance(),
                        this.characterTypeClasses.value
                    )
                )
            )
    );

    protected static characterTypes: LazyValue<Set<OfficialCharacterType>> =
        new LazyValue(
            () => new Set(this.characterIdToCharacterType.value.values())
        );

    protected static nicknameToId: LazyValue<Map<string, string>> =
        new LazyValue(
            () =>
                new Map(
                    Generator.chainFromIterable(
                        Generator.map(
                            (characterType) =>
                                Generator.cartesianProduct(
                                    [characterType.id],
                                    characterType.acceptableNicknames
                                ),
                            this.characterTypes.value
                        )
                    )
                )
        );

    getCharacterTypes(): Promise<Set<ICharacterType>> {
        const characterTypes =
            OfficialCharacterTypeProvider.characterTypes.value;
        return Promise.resolve(characterTypes);
    }

    loadCharacterType(name: string): Promise<ICharacterType | undefined> {
        const id = OfficialCharacterTypeProvider.nicknameToId.value.get(name);

        if (id === undefined) {
            return Promise.resolve(undefined);
        }

        const characterType =
            OfficialCharacterTypeProvider.characterIdToCharacterType.value.get(
                id
            );
        return Promise.resolve(characterType);
    }
}
