import { anySignal } from './anySignal';

/**
 * The newest Update of a Field. Starting an Update replaces the pending one, which is aborted.
 * A replaced Update settles with the newest one, so awaiting it ends when the Field shows the latest data.
 * The work checks its signal before writing the Field (signal.throwIfAborted()), so a replaced Update writes nothing.
 */
export class LatestUpdate {
    /** the newest Update: aborting its controller replaces it, and settled settles with the newest one */
    #latest: { controller: AbortController, settled: Promise<void> } | null = null;

    /** @param {string} fieldName the name of the Field, for the abort reasons */
    constructor(private readonly fieldName: string) {}

    /**
     * Runs the work as the newest Update of the Field, replacing the pending one
     * @param work the Update, which receives a signal aborted when the Update is replaced or the form destroyed
     * @param formSignal aborted when the form is destroyed
     */
    start(work: (signal: AbortSignal) => Promise<void>, formSignal: AbortSignal): Promise<void> {
        this.#latest?.controller.abort(new Error(`Update of "${this.fieldName}" replaced by a newer one`));
        const controller = new AbortController();
        const updateSignal = anySignal([formSignal, controller.signal]);
        const run = work(updateSignal.signal).finally(() => updateSignal.release());
        const update: { controller: AbortController, settled: Promise<void> } = { controller, settled: run };
        update.settled = run.then(
            () => this.#latest === update ? undefined : this.#latest!.settled,
            (error) => this.#latest === update ? Promise.reject(error) : this.#latest!.settled,
        );
        this.#latest = update;
        return update.settled;
    }

    /**
     * Discards the pending Update, as a Cascade Clear does: it's aborted, and it resolves once its work ends,
     * whatever the outcome, since no newer Update replaces it
     */
    discard(): void {
        const pending = this.#latest;
        if (pending) {
            this.#latest = { controller: new AbortController(), settled: Promise.resolve() };
            pending.controller.abort(new Error(`Update of "${this.fieldName}" discarded by a Cascade Clear`));
        }
    }
}
