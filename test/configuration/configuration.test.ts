import { DefaultStaticGameConfiguration } from '~/game/configuration/configuration';

test.concurrent('validate recommended assignments', () => {
    const assignments =
        DefaultStaticGameConfiguration.getInstance()
            .recommendedCharacterTypeCompositions;
    for (const [numPlayers, assignment] of assignments) {
        const assignedNumPlayers = Object.values(assignment).reduce(
            (numPlayersForCharacterType, numPlayersForOtherCharacterType) =>
                numPlayersForCharacterType + numPlayersForOtherCharacterType
        );
        expect(numPlayers).toEqual(assignedNumPlayers);
    }
});
