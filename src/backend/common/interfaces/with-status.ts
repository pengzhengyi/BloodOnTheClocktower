/**
 * A simple status object that represents the completion status of an operation.
 *
 * When the operation is successful, the `ok` property is `true` and the `reason` may optionally be set to a string that describes the result.
 *
 * When the operation is unsuccessful, the `ok` property is `false`. The `error` may optionally be set to an `Error` object that describes the reason for the failure. `reason` may also optionally be set to a string that describes the failure.
 */
export interface WithStatus {
    readonly ok: boolean;

    readonly reason?: string;

    readonly error?: Error;
}
