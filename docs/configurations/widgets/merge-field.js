/**
 * Merges a Field Configuration with overrides section by section: in `io`, `fetch`, `behavior`, `select`
 * and `checkbox` the overrides replace only the keys they have, where a plain spread would replace the whole section.
 */
export function mergeField(field, overrides = {}) {
    const merged = { ...field, ...overrides };
    for (const section of ['io', 'fetch', 'behavior', 'select', 'checkbox']) {
        if (field[section] || overrides[section]) {
            merged[section] = { ...field[section], ...overrides[section] };
        }
    }
    return merged;
}
