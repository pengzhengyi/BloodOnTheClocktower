abstract class BaseConfirm {
    private _value?: boolean;

    async getValue(): Promise<boolean> {
        if (this._value === undefined) {
            this._value = await this.ask();
        }

        return this._value;
    }

    constructor(public prompt: string) {
        this.prompt = prompt;
    }

    abstract ask(): Promise<boolean>;
}

export class Confirm extends BaseConfirm {
    ask(): Promise<boolean> {
        // TODO
        throw new Error('Method not implemented.');
    }
}
