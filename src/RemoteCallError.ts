/**
 * The error a form rejects with when the remote call of a select answers with a non-ok status.
 */
export class RemoteCallError extends Error {
    /** @param {Response} response - the response of the failed remote call */
    readonly response: Response;

    /**
     * @param {string} url the url of the remote call
     * @param {Response} response the response of the remote call
     */
    constructor(url: string, response: Response) {
        super(`Remote call to "${url}" failed with status ${response.status}`);
        this.name = 'RemoteCallError';
        this.response = response;
    }
}
