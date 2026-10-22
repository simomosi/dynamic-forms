import { mergeField } from './merge-field.js';

/**
 * A select Field shown as a Tom Select Widget (https://tom-select.js.org), created before makeForm with `new TomSelect(select)`.
 * - Tom Select dispatches DOM `change` events on the <select>, which the Standard Behaviour of io.listen hears.
 * - It keeps its own list of Options: they are written through its api, not as <option>s.
 * - Its writes fire `change`: the library ignores the changes of a field while it writes it.
 */
export function tomSelectField(name, overrides = {}) {
    return mergeField({
        name,
        io: {
            set: (htmlElement, value) => {
                htmlElement[0].tomselect.setValue(value);
            },
        },
        behavior: {
            clear: (htmlElement) => {
                const tomSelect = htmlElement[0].tomselect;
                tomSelect.clear();
                tomSelect.clearOptions();
            },
        },
        select: {
            saveData: (htmlElement, options) => {
                const tomSelect = htmlElement[0].tomselect;
                tomSelect.clear();
                tomSelect.clearOptions();
                tomSelect.addOptions(options); // Options are { value, text }, Tom Select's default valueField and labelField
            },
        },
    }, overrides);
}
