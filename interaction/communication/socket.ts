export interface ISocket<IOptions = RequestInit> {
    send(url: string, message: string, options?: IOptions): void;

    communicate(
        url: string,
        message: string,
        options?: IOptions
    ): Promise<string>;
}
