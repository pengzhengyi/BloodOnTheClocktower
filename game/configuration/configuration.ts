export interface IGameConfiguration {
    supportedEditions: Array<string>;
}

/**
 * TODO This is an initial implementation for game configuration. Should substitute with more mature configuration like JSON file based.
 */
export const DefaultStaticGameConfiguration: IGameConfiguration = class DefaultStaticGameConfiguration {
    static readonly supportedEditions: Array<string> = ['TroubleBrewing'];
};
