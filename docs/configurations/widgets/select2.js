import { mergeField } from './merge-field.js';

/**
 * A select Field shown as a select2 Widget (https://select2.org), created before makeForm with `$(select).select2()`.
 * - select2 announces changes only through jQuery events, which addEventListener never hears: io.listen listens with jQuery.
 * - It re-reads the <option>s the library writes by itself, but shows a new Value only after a jQuery `change`.
 */
export function select2Field(name, overrides = {}) {
    return mergeField({
        name,
        io: {
            listen: (htmlElement, onChange) => {
                $(htmlElement).on('change.dynamicForms', onChange);
                return () => $(htmlElement).off('change.dynamicForms');
            },
            set: (htmlElement, value, standard) => {
                standard();
                $(htmlElement).trigger('change');
            },
        },
        behavior: {
            clear: (htmlElement, standard) => {
                standard();
                $(htmlElement).trigger('change');
            },
        },
    }, overrides);
}
