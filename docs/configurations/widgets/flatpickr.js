import { mergeField } from './merge-field.js';

/**
 * An input Field shown as a flatpickr Widget (https://flatpickr.js.org), created before makeForm with `flatpickr(input)`.
 * - flatpickr keeps the input value in sync and dispatches DOM `change` events: reading and listening need no hook.
 * - A value written in the input isn't shown in the calendar: writing and clearing go through its instance.
 * - Its clear() fires `change`: the library ignores the changes of a field while it writes it.
 */
export function flatpickrField(name, overrides = {}) {
    return mergeField({
        name,
        io: {
            set: (htmlElement, value) => {
                htmlElement[0]._flatpickr.setDate(value);
            },
        },
        behavior: {
            clear: (htmlElement) => {
                htmlElement[0]._flatpickr.clear();
            },
        },
    }, overrides);
}
