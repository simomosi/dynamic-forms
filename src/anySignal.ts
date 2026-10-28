/**
 * A signal aborted when any of the given signals aborts, with its reason: AbortSignal.any, or the same by hand on
 * browsers without it (Safari < 17.4, Chrome < 116, Firefox < 124)
 * @returns the signal, and a release function that stops listening to the given signals once the signal is no longer needed
 */
export function anySignal(signals: AbortSignal[]): { signal: AbortSignal, release: () => void } {
    if (typeof AbortSignal.any === 'function') {
        return { signal: AbortSignal.any(signals), release: () => {} };
    }
    const controller = new AbortController();
    const listening = new AbortController();
    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort(signal.reason);
            break;
        }
        signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true, signal: listening.signal });
    }
    return { signal: controller.signal, release: () => listening.abort() };
}
