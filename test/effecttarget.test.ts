/* eslint-disable no-use-before-define */
import { faker } from '@faker-js/faker';
import { Effect, InteractionContext } from '~/game/effect';
import { EffectTarget } from '~/game/effecttarget';
import { CompositeGamePhaseKind } from '~/game/gamephase';
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
        this.effects.add(
            new RoleCanAccess(Role.Admin),
            CompositeGamePhaseKind.ALL
        );
        this.effects.add(
            new RoleCanAccess(Role.Contributor),
            CompositeGamePhaseKind.ALL
        );
        this.effects.add(
            new RoleCanAccess(Role.User),
            CompositeGamePhaseKind.ALL
        );
    }
}

class RoleCanAccess<T> extends Effect<PrivilegedData<T>> {
    apply(
        context: InteractionContext<PrivilegedData<T>>,
        next: NextFunction<InteractionContext<PrivilegedData<T>>>
    ): InteractionContext<PrivilegedData<T>> {
        const selectedData = context.interaction.target._data.get(this.role);
        context.result = selectedData;
        return next(context);
    }

    constructor(readonly role: Role) {
        super();
    }

    toString(): string {
        return `${super.toString()}(${Role[this.role]})`;
    }

    isApplicable(context: InteractionContext<PrivilegedData<T>>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'data') &&
            this.matchNotNullInitiator<User>(
                context,
                (initiator) => initiator.role === this.role
            )
        );
    }
}

describe('Test basic functionalities', () => {
    let adminData: string;
    let contributorData: string;
    let data: PrivilegedData<string>;

    beforeAll(() => {
        adminData = 'Highly confidential data';
        contributorData = 'confidential data';
        data = PrivilegedData.init<string>(
            new Map([
                [Role.Admin, adminData],
                [Role.Contributor, contributorData],
                [Role.User, 'general data'],
            ])
        );
    });

    test('effect application', () => {
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

    test('track and untrack interaction initiator', () => {
        expect(data.data).toBeUndefined();

        const contributorUser = {
            user: faker.name.firstName(),
            role: Role.Contributor,
        };
        const dataFromContributor = data.from(contributorUser);
        expect(dataFromContributor.data).toEqual(contributorData);
        expect(dataFromContributor).not.toBe(data);

        const _data = dataFromContributor.from(undefined);
        expect(_data.data).toBeUndefined();
        expect(_data).toBe(data);
    });
});
