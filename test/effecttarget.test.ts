/* eslint-disable no-use-before-define */
import { faker } from '@faker-js/faker';
import { Effect, InteractionContext } from '~/game/effect';
import { EffectTarget } from '~/game/effecttarget';
import type { NextFunction } from '~/game/middleware';

enum Role {
    User,
    Contributor,
    Admin,
}

interface User {
    role: Role;
    name: string;
}

class PrivilegedData<T> extends EffectTarget<PrivilegedData<T>> {
    static init<T>(data: Map<Role, T>) {
        const instance = new this(data);
        return instance.getProxy();
    }

    declare readonly _data: Map<Role, T>;

    get data(): T | undefined {
        return undefined;
    }

    protected constructor(data: Map<Role, T>) {
        super(['get']);
        this._data = data;
    }

    protected initializeEffects() {
        super.initializeEffects();
        this._effects.add(new RoleCanAccess(Role.Admin));
        this._effects.add(new RoleCanAccess(Role.Contributor));
        this._effects.add(new RoleCanAccess(Role.User));
    }
}

class RoleCanAccess<T> extends Effect<PrivilegedData<T>> {
    apply(
        context: InteractionContext<PrivilegedData<T>>,
        next: NextFunction<InteractionContext<PrivilegedData<T>>>
    ): InteractionContext<PrivilegedData<T>> {
        const selectedData = context.interaction.target._data.get(this.role);
        context.result = selectedData;
        next(context);
        return context;
    }

    constructor(readonly role: Role) {
        super();
        this.role = role;
    }

    toString(): string {
        return `defines data accessible for role ${Role[this.role]}`;
    }

    isApplicable(context: InteractionContext<PrivilegedData<T>>): boolean {
        return (
            super.isApplicable(context) &&
            context.interaction.trap === 'get' &&
            context.interaction.args[0] === 'data' &&
            (context.initiator as User)?.role === this.role
        );
    }
}

describe('Test basic functionalities', () => {
    test('effect application', () => {
        const adminData = 'Highly confidential data';
        const contributorData = 'confidential data';
        const data = PrivilegedData.init<string>(
            new Map([
                [Role.Admin, adminData],
                [Role.Contributor, contributorData],
                [Role.User, 'general data'],
            ])
        );

        expect(data.data).toBeUndefined();

        const contributorName = faker.name.firstName();
        const contributorUser = {
            user: contributorName,
            role: Role.Contributor,
        };
        const dataFromContributor = data.from(contributorUser);
        expect(dataFromContributor.data).toEqual(contributorData);

        expect(
            data.from({
                user: faker.name.firstName(),
                role: Role.Admin,
            }).data
        ).toEqual(adminData);
    });
});
