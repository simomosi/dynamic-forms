/** Module to easily manage dynamic forms */
import DynamicForm from './DynamicForm';
import { Form } from './Form';
import { FieldBuilder } from './FieldBuilder';
import { FormConfiguration } from './FormConfigurationTypes';
import { resolveConfiguration } from './resolveConfiguration';

export type { Form };
export { RemoteCallError } from './RemoteCallError';
export type { FormConfiguration, FormHooks, UpdateRule, InitialisationRule } from './FormConfigurationTypes';
export type { UpdateData, FieldElement, FieldConfiguration, FieldIoHooks, FieldFetchConfiguration, FieldHooks, SelectConfiguration, SelectOption, CheckboxConfiguration } from './FieldConfigurationTypes';

const formCollection: Map<string, DynamicForm> = new Map();

/**
 * Creates the Form of an html form
 * @param {FormConfiguration} formConfiguration the form configuration
 * @returns the Form
 */
export function makeForm(formConfiguration: FormConfiguration): Form {
    const htmlFormElement = document.forms.namedItem(formConfiguration.id) as HTMLFormElement;
    const completeFormConfiguration = resolveConfiguration(htmlFormElement, formConfiguration);
    const id = completeFormConfiguration.id;
    if (formCollection.has(id)) {
        throw new Error(`Form "${id}" already exists: call destroy() on it first`);
    }
    const fieldsMap = (new FieldBuilder()).createFieldsMap(completeFormConfiguration.fields, htmlFormElement);

    const form = new DynamicForm(completeFormConfiguration, fieldsMap, () => formCollection.delete(id));
    formCollection.set(id, form);
    return form;
}

/**
 * Returns the Form with the given id, if it exists
 * @param {string} id the form id
 */
export function getForm(id: string): Form|undefined {
    return formCollection.get(id);
}

/**
 * Credits the author of Dynamic Forms, in hope to receive some love (and stars)
 */
function _author(): void {
    console.info('DynamicForms! Developed with \u2764 by simomosi - Ping me @ https://github.com/simomosi/dynamic-forms');
}

_author();
