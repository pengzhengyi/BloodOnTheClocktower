export abstract class EditionDefinitionParseException<TInput> extends Error {
    readonly input: TInput;

    constructor(input: TInput, message: string) {
        super(message);

        this.input = input;
    }
}

export class MissingRequiredEditionDefinitionKeyException<
    TInput
> extends EditionDefinitionParseException<TInput> {
    readonly missingKey: string;

    protected static getMessage(missingKey: string): string {
        return `Missing required key for edition definition: ${missingKey}`;
    }

    constructor(input: TInput, missingKey: string) {
        super(
            input,
            MissingRequiredEditionDefinitionKeyException.getMessage(missingKey)
        );

        this.missingKey = missingKey;
    }
}

export class IncorrectFormatParseEditionDefinitionException<
    TInput
> extends EditionDefinitionParseException<TInput> {
    protected static getMessage(reason: string): string {
        return `Incorrect format for edition definition: ${reason}`;
    }

    constructor(input: TInput, reason: string) {
        super(
            input,
            IncorrectFormatParseEditionDefinitionException.getMessage(reason)
        );
    }
}
