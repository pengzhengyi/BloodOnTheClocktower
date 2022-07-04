abstract class BaseConfirm {
    private _value?: boolean;

    get value(): boolean {
        if (this._value === undefined) {
            this._value = this.ask();
        }

        return this._value;
    }

    constructor(public prompt: string) {
        this.prompt = prompt;
    }

    abstract ask(): boolean;
}

export class Confirm extends BaseConfirm {
    ask(): boolean {
        // TODO
        throw new Error('Method not implemented.');
    }
}
