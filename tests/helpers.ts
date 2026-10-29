import { vi } from 'vitest';
import { getForm, makeForm } from '@/index';
import type { FieldConfiguration, FormConfiguration, UpdateData } from '@/index';

/** Mounts `<form id="...">` with the given inner html into the document and returns it. */
export function mountForm(id: string, innerHtml: string): HTMLFormElement {
    document.body.innerHTML = `<form id="${id}">${innerHtml}</form>`;
    return document.forms.namedItem(id)!;
}

/** Creates the form, destroying the one left with the same id by a previous mount */
export function createForm(config: FormConfiguration) {
    getForm(config.id)?.destroy();
    return makeForm(config);
}

/** Html select with an empty option followed by the given `value: text` options. */
export function selectHtml(name: string, options: Record<string, string> = {}): string {
    const optionsHtml = Object.entries(options)
        .map(([value, text]) => `<option value="${value}">${text}</option>`)
        .join('');
    return `<select name="${name}"><option value=""></option>${optionsHtml}</select>`;
}

export function field<T extends Element = HTMLInputElement>(name: string): T {
    return document.querySelector<T>(`[name="${name}"]`)!;
}

/** Option values of a select, in order. */
export function optionValues(name: string): string[] {
    return Array.from(field<HTMLSelectElement>(name).options).map(o => o.value);
}

/**
 * Replaces the global fetch with a stub answering with the JSON registered for each url.
 * Unregistered urls answer 404.
 */
export function stubFetch(responses: Record<string, unknown> = {}) {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
        if (!(url in responses)) {
            return new Response(null, { status: 404 });
        }
        return new Response(JSON.stringify(responses[url]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

/**
 * Replaces the global fetch with a stub whose responses are released by hand, in any order,
 * also after their call was aborted (the server answers anyway)
 */
export function manualFetch() {
    const pending = new Map<string, (status: number, body: unknown) => void>();
    vi.stubGlobal('fetch', vi.fn((url: string) => new Promise<Response>(resolve => {
        pending.set(url, (status, body) => resolve(new Response(JSON.stringify(body), { status })));
    })));
    return { answer: (url: string, body: unknown, status = 200) => pending.get(url)!(status, body) };
}

/**
 * A text field which records every update it receives, to observe the data a subject sends to its observers.
 */
export function probeField(name = 'probe'): { config: FieldConfiguration, html: string, updates: Array<{ data: UpdateData, subjectName: string | null }> } {
    const updates: Array<{ data: UpdateData, subjectName: string | null }> = [];
    return {
        html: `<input type="text" name="${name}">`,
        updates,
        config: {
            name,
            behavior: {
                updateStatus: (_el, data, subjectName) => { updates.push({ data, subjectName }); },
            },
        },
    };
}

/** Rejects after `ms` milliseconds, to bound promises which may never settle. */
export function timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms));
}
