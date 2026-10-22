import { mergeField } from './merge-field.js';

/**
 * A select Field shown as a Choices.js Widget (https://choices-js.github.io/Choices/), created before makeForm with `new Choices(select)`.
 * - Its instance can't be reached from the <select>: pass it, and the hooks keep it in their closure.
 * - Choices dispatches a DOM `change` on the <select>, which the Standard Behaviour of io.listen hears.
 * - It doesn't notice the <option>s the library writes: after writing them, `refresh` reads them again.
 */
export function choicesField(name, choices, overrides = {}) {
    return mergeField({
        name,
        io: {
            // With no choice made, the <select> value would be its first option
            get: () => choices.getValue(true) ?? '',
            set: (_htmlElement, value) => {
                choices.setChoiceByValue(value);
            },
        },
        behavior: {
            clear: (_htmlElement, standard) => {
                standard();
                choices.refresh(false, false, true);
            },
        },
        select: {
            saveData: (_htmlElement, _options, standard) => {
                standard();
                choices.refresh(false, false, true);
            },
        },
    }, overrides);
}
