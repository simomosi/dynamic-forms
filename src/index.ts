/** Module to easily manage dynamic forms */
import DynamicForm from './DynamicForm';
import { FieldBuilder } from './FieldBuilder';
import { FormConfiguration } from './FormConfigurationTypes';
import { resolveConfiguration } from './resolveConfiguration';

export type { DynamicForm };
export type { FormConfiguration, FormHooks, UpdateRule, InitialisationRule } from './FormConfigurationTypes';
export type { UpdateData, FieldElement, FieldConfiguration, FieldIoHooks, FieldFetchConfiguration, FieldHooks, SelectConfiguration, SelectOption, CheckboxConfiguration } from './FieldConfigurationTypes';

const formCollection: Map<string, DynamicForm> = new Map();

/**
 * Instantiate a single DynamicForm
 * @param {FormConfiguration} formConfiguration the form configuration
 * @returns Single DynamicForm instance
 */
export function makeForm(formConfiguration: FormConfiguration): DynamicForm {
    const htmlFormElement = document.forms.namedItem(formConfiguration.id) as HTMLFormElement;
    const completeFormConfiguration = resolveConfiguration(htmlFormElement, formConfiguration);
    const id = completeFormConfiguration.id;
    if (formCollection.has(id)) {
        throw new Error(`Form "${id}" already exists: call destroy() on it first`);
    }
    const fieldsMap = (new FieldBuilder()).createFieldsMap(completeFormConfiguration.fields, htmlFormElement);

    const form = new DynamicForm(htmlFormElement, completeFormConfiguration, fieldsMap, () => formCollection.delete(id));
    formCollection.set(id, form);
    return form;
}

/**
 * Method to retrieve a Dynamic Form instance.
 * @param {string} id the form id
 */
export function getForm(id: string): DynamicForm|undefined {
    return formCollection.get(id);
}

/**
 * Credits the author of Dynamic Forms, in hope to receive some love (and stars)
 */
function _author(): void {
    console.info('DynamicForms! Developed with \u2764 by simomosi - Ping me @ https://github.com/simomosi/dynamic-forms');
}

_author();
