import { v4 as uuid, validate } from 'uuid';
import type { ICustomEditionIdProvider } from './custom-edition-id-provider';
import type { EditionId } from './edition-id';

export abstract class PlainCustomEditionIdProvider
    implements ICustomEditionIdProvider
{
    createCustomEditionId(customName: string): Promise<string> {
        const editionId = CustomEditionIdFormatter.format(customName);
        return Promise.resolve(editionId);
    }

    isCustomEditionId(id: EditionId): boolean {
        return CustomEditionIdFormatter.validate(id);
    }
}

abstract class CustomEditionIdFormatter {
    protected static prefix = 'custom-edition';

    static format(customName: string, id?: string): string {
        const customId: string = id ?? uuid();

        return `${CustomEditionIdFormatter.prefix}-${customName}-${customId}`;
    }

    static validate(id: EditionId): boolean {
        return (
            id.startsWith(CustomEditionIdFormatter.prefix) &&
            validate(id.slice(-36))
        );
    }
}
