/** Module to easily manage dynamic forms */
import DynamicForm from './DynamicForm.js';
import { FormConfiguration } from './FormConfigurationTypes.js';

const formCollection: Map<string, DynamicForm> = new Map();

/**
 * Instantiate a single DynamicForm
 * @param {FormConfiguration} formConfiguration the form configuration
 * @returns Single DynamicForm instance
 */
export function makeForm(formConfiguration: FormConfiguration): DynamicForm {
    let form = new DynamicForm(formConfiguration);
    formCollection.set(form.getId(), form);
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
