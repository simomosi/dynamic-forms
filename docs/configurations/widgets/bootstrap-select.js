import { mergeField } from './merge-field.js';

/**
 * A select Field shown as a bootstrap-select Widget (https://developer.snapappointments.com/bootstrap-select/),
 * created before makeForm with `$(select).selectpicker()`. bootstrap-select 1.13 needs jQuery 3 or older.
 * - It dispatches DOM `change` events on the <select>, which the Standard Behaviour of io.listen hears.
 * - It doesn't notice what the library writes in the <select>: after each write, `refresh` reads it again.
 */
export function bootstrapSelectField(name, overrides = {}) {
    const refresh = (htmlElement) => $(htmlElement).selectpicker('refresh');
    return mergeField({
        name,
        io: {
            set: (htmlElement, _value, standard) => {
                standard();
                refresh(htmlElement);
            },
        },
        behavior: {
            clear: (htmlElement, standard) => {
                standard();
                refresh(htmlElement);
            },
        },
        select: {
            saveData: (htmlElement, _options, standard) => {
                standard();
                refresh(htmlElement);
            },
        },
    }, overrides);
}
