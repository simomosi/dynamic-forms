import { describe, expect, it } from 'vitest';
import { LatestUpdate } from '../src/LatestUpdate';

/** A promise resolved or rejected by hand, standing for the work of an Update (a remote call) */
function deferred() {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}

const never = () => new Promise<void>(() => {});

describe('LatestUpdate', () => {
    const formSignal = new AbortController().signal;

    it('aborts the pending Update when a newer one starts', () => {
        const updates = new LatestUpdate('city');
        let replacedSignal!: AbortSignal;
        updates.start(signal => { replacedSignal = signal; return never(); }, formSignal);

        updates.start(never, formSignal);

        expect(replacedSignal.aborted).toBe(true);
        expect(replacedSignal.reason).toEqual(new Error('Update of "city" replaced by a newer one'));
    });

    it('aborts the Update when the form is destroyed, with the reason of the form', () => {
        const destruction = new AbortController();
        const updates = new LatestUpdate('city');
        let updateSignal!: AbortSignal;
        updates.start(signal => { updateSignal = signal; return never(); }, destruction.signal);

        destruction.abort(new Error('Form "f" was destroyed'));

        expect(updateSignal.aborted).toBe(true);
        expect(updateSignal.reason).toEqual(new Error('Form "f" was destroyed'));
    });

    it('settles a replaced Update only with the newest one', async () => {
        const updates = new LatestUpdate('city');
        const italy = deferred();
        const france = deferred();
        let replacedSettled = false;
        const replaced = updates.start(() => italy.promise, formSignal).finally(() => { replacedSettled = true; });
        const newest = updates.start(() => france.promise, formSignal);

        italy.resolve();
        await new Promise(resolve => setTimeout(resolve));
        expect(replacedSettled).toBe(false);

        france.resolve();
        await expect(replaced).resolves.toBeUndefined();
        await expect(newest).resolves.toBeUndefined();
    });

    it('settles a replaced Update whose work failed with the newest one', async () => {
        const updates = new LatestUpdate('city');
        const italy = deferred();
        const france = deferred();
        const replaced = updates.start(() => italy.promise, formSignal);
        updates.start(() => france.promise, formSignal);

        italy.reject(new Error('aborted'));
        france.resolve();

        await expect(replaced).resolves.toBeUndefined();
    });

    it('rejects a replaced Update with the error of the newest one', async () => {
        const updates = new LatestUpdate('city');
        const italy = deferred();
        const france = deferred();
        const replaced = updates.start(() => italy.promise, formSignal);
        const newest = updates.start(() => france.promise, formSignal);

        italy.resolve();
        france.reject(new Error('the server failed'));

        await expect(newest).rejects.toThrow('the server failed');
        await expect(replaced).rejects.toThrow('the server failed');
    });

    it('aborts the discarded Update, which resolves once its work ends', async () => {
        const updates = new LatestUpdate('city');
        const italy = deferred();
        let discardedSignal!: AbortSignal;
        const discarded = updates.start(signal => { discardedSignal = signal; return italy.promise; }, formSignal);

        updates.discard();
        italy.reject(discardedSignal.reason);

        expect(discardedSignal.reason).toEqual(new Error('Update of "city" discarded by a Cascade Clear'));
        await expect(discarded).resolves.toBeUndefined();
    });

    it('discards nothing when no Update was started', async () => {
        const updates = new LatestUpdate('city');

        updates.discard();

        await expect(updates.start(() => Promise.resolve(), formSignal)).resolves.toBeUndefined();
    });
});
